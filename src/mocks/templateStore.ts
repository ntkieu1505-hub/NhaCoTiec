import { useState, useEffect } from 'react';
import { Template, TemplateStatus } from '../types/template';
import { MOCK_TEMPLATES } from './mockTemplates';
import { db } from '../services/firebase';
import { collection, onSnapshot, doc, setDoc, deleteDoc } from 'firebase/firestore';
import { logActivity } from '../services/activityLogService';

const STORAGE_KEY = 'nha_co_tiec_templates_v3';
const DELETED_STORAGE_KEY = 'nha_co_tiec_deleted_template_ids_v1';
const BROADCAST_CHANNEL_NAME = 'nha_co_tiec_templates_channel';

// Helper to identify test, corrupted or soft-deleted templates
export function isPurgedTemplate(t: Partial<Template>): boolean {
  if (!t) return true;
  if (t.isDeleted === true || t.status === 'deleted') return true;
  return false;
}

// Persistent set of deleted template IDs (synced with localStorage & Firestore)
const deletedTemplateIds = new Set<string>(
  (() => {
    try {
      const saved = localStorage.getItem(DELETED_STORAGE_KEY);
      if (saved) {
        const arr = JSON.parse(saved);
        if (Array.isArray(arr)) return arr;
      }
    } catch (e) {}
    return [];
  })()
);

function saveDeletedIds() {
  try {
    localStorage.setItem(DELETED_STORAGE_KEY, JSON.stringify(Array.from(deletedTemplateIds)));
  } catch (e) {}
}

// In-memory cache synced with localStorage, merging baseline mock templates
let currentTemplates: Template[] = (() => {
  try {
    const saved = localStorage.getItem(STORAGE_KEY);
    if (saved) {
      const list: Template[] = JSON.parse(saved);
      if (Array.isArray(list) && list.length > 0) {
        const localMap = new Map<string, Template>(list.map((t) => [t.id, t]));
        const merged: Template[] = [...list];
        // Merge in any default seed templates that are missing and not deleted
        MOCK_TEMPLATES.forEach((mockTpl) => {
          if (!localMap.has(mockTpl.id) && !deletedTemplateIds.has(mockTpl.id) && !isPurgedTemplate(mockTpl)) {
            merged.push(mockTpl);
          }
        });
        return merged.filter((t) => !deletedTemplateIds.has(t.id) && !isPurgedTemplate(t));
      }
    }
  } catch (e) {
    console.error('Failed to load templates from localStorage', e);
  }
  return MOCK_TEMPLATES.filter((t) => !deletedTemplateIds.has(t.id) && !isPurgedTemplate(t));
})();

const listeners = new Set<() => void>();

// Cross-tab BroadcastChannel for 0ms multi-tab sync
let broadcastChannel: BroadcastChannel | null = null;
try {
  if (typeof window !== 'undefined' && 'BroadcastChannel' in window) {
    broadcastChannel = new BroadcastChannel(BROADCAST_CHANNEL_NAME);
    broadcastChannel.onmessage = (event) => {
      if (event.data?.type === 'TEMPLATES_UPDATED' && Array.isArray(event.data?.templates)) {
        if (Array.isArray(event.data?.deletedIds)) {
          event.data.deletedIds.forEach((id: string) => deletedTemplateIds.add(id));
          saveDeletedIds();
        }
        currentTemplates = event.data.templates.filter((t: Template) => !deletedTemplateIds.has(t.id));
        listeners.forEach((fn) => fn());
      }
    };
  }
} catch (e) {}

// Window Storage Event listener for cross-tab sync
if (typeof window !== 'undefined') {
  window.addEventListener('storage', (event) => {
    if (event.key === DELETED_STORAGE_KEY && event.newValue) {
      try {
        const arr = JSON.parse(event.newValue);
        if (Array.isArray(arr)) {
          arr.forEach((id: string) => deletedTemplateIds.add(id));
          currentTemplates = currentTemplates.filter((t) => !deletedTemplateIds.has(t.id));
          listeners.forEach((fn) => fn());
        }
      } catch (e) {}
    }
    if (event.key === STORAGE_KEY && event.newValue) {
      try {
        const parsed = JSON.parse(event.newValue);
        if (Array.isArray(parsed)) {
          currentTemplates = parsed.filter((t: Template) => !deletedTemplateIds.has(t.id));
          listeners.forEach((fn) => fn());
        }
      } catch (e) {}
    }
  });
}

// Firestore Real-time Sync (for multi-browser / incognito / cross-device)
let isFirestoreTemplatesListening = false;
function initFirestoreTemplatesSync() {
  if (isFirestoreTemplatesListening || !db) return;
  try {
    isFirestoreTemplatesListening = true;

    // 1. Sync deleted templates metadata from Firestore settings/templates_meta
    onSnapshot(
      doc(db, 'settings', 'templates_meta'),
      (docSnap) => {
        if (docSnap.exists()) {
          const data = docSnap.data();
          if (data && Array.isArray(data.deletedTemplateIds)) {
            let changed = false;
            data.deletedTemplateIds.forEach((id: string) => {
              if (!deletedTemplateIds.has(id)) {
                deletedTemplateIds.add(id);
                changed = true;
              }
            });
            if (changed) {
              saveDeletedIds();
              currentTemplates = currentTemplates.filter((t) => !deletedTemplateIds.has(t.id));
              try {
                localStorage.setItem(STORAGE_KEY, JSON.stringify(currentTemplates));
              } catch (e) {}
              listeners.forEach((fn) => fn());
            }
          }
        }
      },
      (err) => {
        console.info('Firestore templates meta sync fallback:', err.message);
      }
    );

    // 2. Sync templates collection
    onSnapshot(
      collection(db, 'templates'),
      (snapshot) => {
        if (!snapshot.empty) {
          const remoteList: Template[] = [];
          let hadPurgedItem = false;

          snapshot.forEach((docSnap) => {
            const data = docSnap.data() as Partial<Template>;
            if (!data) return;

            // Check if document is purged (test 'elegant', soft-deleted, or in deleted IDs)
            if (isPurgedTemplate(data) || deletedTemplateIds.has(docSnap.id)) {
              if (!deletedTemplateIds.has(docSnap.id)) {
                deletedTemplateIds.add(docSnap.id);
                hadPurgedItem = true;
              }
              // Soft delete + Hard delete in Firestore to guarantee removal across all devices
              if (!data.isDeleted || data.status !== 'deleted') {
                setDoc(
                  doc(db, 'templates', docSnap.id),
                  { isDeleted: true, status: 'deleted', updatedAt: new Date().toISOString() },
                  { merge: true }
                ).catch(() => {});
              }
              deleteDoc(doc(db, 'templates', docSnap.id)).catch(() => {});
              return;
            }

            remoteList.push({
              name: data.name || data.title || 'Mẫu thiệp cưới',
              title: data.title || data.name || 'Mẫu thiệp cưới',
              slug: data.slug || docSnap.id,
              price: typeof data.price === 'number' ? data.price : 79000,
              status: data.status || 'published',
              isActive: data.isActive ?? (data.status === 'published'),
              thumbnailUrl:
                data.thumbnailUrl ||
                'https://images.unsplash.com/photo-1519741497674-611481863552?auto=format&fit=crop&w=600&q=80',
              ...data,
              id: docSnap.id,
            } as Template);
          });

          if (hadPurgedItem) {
            saveDeletedIds();
          }

          if (remoteList.length > 0) {
            const remoteMap = new Map<string, Template>(remoteList.map((t) => [t.id, t]));
            const merged: Template[] = [...remoteList];

            // Giữ lại các mẫu mặc định (seed) nếu chưa có trên Firestore và chưa bị xóa
            MOCK_TEMPLATES.forEach((mockTpl) => {
              if (
                !remoteMap.has(mockTpl.id) &&
                !deletedTemplateIds.has(mockTpl.id) &&
                !isPurgedTemplate(mockTpl)
              ) {
                merged.push(mockTpl);
              }
            });

            // Giữ lại các mẫu mới tạo ở phía client nếu chưa kịp đồng bộ lên Firestore
            currentTemplates.forEach((localTpl) => {
              if (
                !remoteMap.has(localTpl.id) &&
                !deletedTemplateIds.has(localTpl.id) &&
                !isPurgedTemplate(localTpl) &&
                !merged.some((m) => m.id === localTpl.id)
              ) {
                merged.push(localTpl);
              }
            });

            currentTemplates = merged.filter(
              (t) => !deletedTemplateIds.has(t.id) && !isPurgedTemplate(t)
            );
            try {
              localStorage.setItem(STORAGE_KEY, JSON.stringify(currentTemplates));
            } catch (e) {}
            listeners.forEach((fn) => fn());
          }
        }
      },
      (err) => {
        console.info('Firestore templates live sync fallback to local storage:', err.message);
      }
    );
  } catch (e) {
    console.warn('Firestore templates sync setup error:', e);
  }
}

initFirestoreTemplatesSync();

function notify() {
  try {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(currentTemplates));
  } catch (e) {
    console.error('Failed to save templates to localStorage', e);
  }

  try {
    broadcastChannel?.postMessage({
      type: 'TEMPLATES_UPDATED',
      templates: currentTemplates,
      deletedIds: Array.from(deletedTemplateIds),
    });
  } catch (e) {}

  listeners.forEach((fn) => fn());
}

/**
 * Get all templates (for Admin - includes published, draft, hidden)
 */
export function getAllTemplates(): Template[] {
  return currentTemplates.filter((t) => !deletedTemplateIds.has(t.id) && !isPurgedTemplate(t));
}

/**
 * Get public templates only (for Public Website - only published & active)
 */
export function getPublicTemplates(): Template[] {
  return currentTemplates.filter(
    (t) =>
      !deletedTemplateIds.has(t.id) &&
      !isPurgedTemplate(t) &&
      (t.status === 'published' || (t.isActive && t.status !== 'draft' && t.status !== 'hidden'))
  );
}

export function getTemplateById(id: string): Template | undefined {
  if (deletedTemplateIds.has(id)) return undefined;
  return currentTemplates.find(
    (t) => t.id === id && !deletedTemplateIds.has(t.id) && !isPurgedTemplate(t)
  );
}

export function getTemplateBySlug(slug: string): Template | undefined {
  return currentTemplates.find(
    (t) => t.slug === slug && !deletedTemplateIds.has(t.id) && !isPurgedTemplate(t)
  );
}

/**
 * Admin Action: Create New Template
 * Compatible with Firestore collection 'templates'
 */
export function createTemplate(
  data: Omit<Template, 'id' | 'createdAt' | 'updatedAt'>
): Template {
  const now = new Date().toISOString();
  const id = `tpl-${Date.now()}`;
  const newTemplate: Template = {
    ...data,
    name: data.name ? data.name.trim() : 'Mẫu thiệp cưới',
    title: data.title ? data.title.trim() : (data.name ? data.name.trim() : 'Mẫu thiệp cưới'),
    id,
    createdAt: now,
    updatedAt: now,
    isActive: data.status === 'published',
  };

  currentTemplates = [newTemplate, ...currentTemplates];
  notify();

  // Sync to Firestore
  if (db) {
    setDoc(doc(db, 'templates', id), newTemplate, { merge: true }).catch((err) => {
      console.warn('Failed to save template to Firestore:', err);
    });
  }

  // Log activity
  logActivity({
    type: 'admin_setting_changed',
    actorName: 'Admin',
    actorRole: 'admin',
    title: 'Thêm mẫu thiệp mới',
    description: `Admin đã tạo mẫu thiệp "${newTemplate.title}" (#${newTemplate.id})`,
    details: { templateId: newTemplate.id, name: newTemplate.title },
  }).catch(() => {});

  return newTemplate;
}

/**
 * Admin Action: Update Existing Template
 */
export function updateTemplate(
  id: string,
  updates: Partial<Omit<Template, 'id' | 'createdAt'>>
): Template | undefined {
  const now = new Date().toISOString();
  let updatedItem: Template | undefined;

  currentTemplates = currentTemplates.map((t) => {
    if (t.id === id) {
      const newName = updates.name ? updates.name.trim() : t.name;
      const newTitle = updates.title ? updates.title.trim() : (updates.name ? updates.name.trim() : (t.title || t.name));
      updatedItem = {
        ...t,
        ...updates,
        name: newName,
        title: newTitle,
        updatedAt: now,
        isActive: updates.status ? updates.status === 'published' : t.isActive,
      };
      return updatedItem;
    }
    return t;
  });

  notify();

  if (updatedItem && db) {
    setDoc(doc(db, 'templates', id), updatedItem, { merge: true }).catch((err) => {
      console.warn('Failed to update template in Firestore:', err);
    });
    logActivity({
      type: 'admin_setting_changed',
      actorName: 'Admin',
      actorRole: 'admin',
      title: 'Cập nhật mẫu thiệp',
      description: `Admin đã chỉnh sửa mẫu thiệp "${updatedItem.title}" (#${updatedItem.id})`,
      details: { templateId: updatedItem.id, updates },
    }).catch(() => {});
  }

  return updatedItem;
}

/**
 * Admin Action: Quick change status
 */
export function changeTemplateStatus(id: string, status: TemplateStatus): Template | undefined {
  return updateTemplate(id, { status });
}

/**
 * Admin Action: Delete Template
 */
export function deleteTemplate(id: string): boolean {
  deletedTemplateIds.add(id);
  saveDeletedIds();

  currentTemplates = currentTemplates.filter((t) => t.id !== id);

  notify();

  if (db) {
    // 1. Soft-delete immediately in Firestore (marks inactive/deleted so other clients ignore it immediately)
    setDoc(
      doc(db, 'templates', id),
      {
        status: 'deleted',
        isDeleted: true,
        isActive: false,
        updatedAt: new Date().toISOString(),
      },
      { merge: true }
    ).catch((err) => {
      console.warn('Failed to soft delete template in Firestore:', err);
    });

    // 2. Hard-delete from Firestore
    deleteDoc(doc(db, 'templates', id)).catch((err) => {
      console.warn('Failed to delete template from Firestore:', err);
    });

    // 3. Sync deletedTemplateIds to Firestore settings/templates_meta
    setDoc(
      doc(db, 'settings', 'templates_meta'),
      {
        deletedTemplateIds: Array.from(deletedTemplateIds),
        updatedAt: new Date().toISOString(),
      },
      { merge: true }
    ).catch((err) => {
      console.warn('Failed to sync deletedTemplateIds to Firestore:', err);
    });
  }

  logActivity({
    type: 'admin_setting_changed',
    actorName: 'Admin',
    actorRole: 'admin',
    title: 'Xóa mẫu thiệp',
    description: `Admin đã xóa mẫu thiệp ID: ${id}`,
    details: { templateId: id },
  }).catch(() => {});

  return true;
}

/**
 * Admin Action: Purge all corrupted, deleted or test templates
 */
export function purgeCorruptedTemplates(): number {
  let count = 0;
  currentTemplates.forEach((t) => {
    if (isPurgedTemplate(t)) {
      deletedTemplateIds.add(t.id);
      count++;
    }
  });

  if (count > 0 || deletedTemplateIds.size > 0) {
    saveDeletedIds();
    currentTemplates = currentTemplates.filter(
      (t) => !deletedTemplateIds.has(t.id) && !isPurgedTemplate(t)
    );
    notify();

    if (db) {
      setDoc(
        doc(db, 'settings', 'templates_meta'),
        {
          deletedTemplateIds: Array.from(deletedTemplateIds),
          updatedAt: new Date().toISOString(),
        },
        { merge: true }
      ).catch(() => {});
    }
  }

  return count;
}

/**
 * Admin Action: Reset to seed mock templates
 */
export function resetTemplates(): void {
  deletedTemplateIds.clear();
  saveDeletedIds();
  currentTemplates = [...MOCK_TEMPLATES];
  notify();

  if (db) {
    setDoc(
      doc(db, 'settings', 'templates_meta'),
      {
        deletedTemplateIds: [],
        updatedAt: new Date().toISOString(),
      },
      { merge: true }
    ).catch((err) => {
      console.warn('Failed to clear deletedTemplateIds in Firestore:', err);
    });
  }
}

/**
 * Custom React Hook for Admin: Listens to all templates
 */
export function useTemplates(): Template[] {
  const [templates, setTemplates] = useState<Template[]>(getAllTemplates);

  useEffect(() => {
    const handleUpdate = () => {
      setTemplates(getAllTemplates());
    };
    listeners.add(handleUpdate);
    return () => {
      listeners.delete(handleUpdate);
    };
  }, []);

  return templates;
}

/**
 * Custom React Hook for Public Website: Only returns published templates
 */
export function usePublicTemplates(): Template[] {
  const [templates, setTemplates] = useState<Template[]>(getPublicTemplates);

  useEffect(() => {
    const handleUpdate = () => {
      setTemplates(getPublicTemplates());
    };
    listeners.add(handleUpdate);
    return () => {
      listeners.delete(handleUpdate);
    };
  }, []);

  return templates;
}
