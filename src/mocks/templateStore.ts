import { useState, useEffect } from 'react';
import { Template, TemplateStatus } from '../types/template';
import { MOCK_TEMPLATES } from './mockTemplates';
import { db } from '../services/firebase';
import { collection, onSnapshot, doc, setDoc, deleteDoc } from 'firebase/firestore';
import { logActivity } from '../services/activityLogService';

const STORAGE_KEY = 'nha_co_tiec_templates_v3';
const BROADCAST_CHANNEL_NAME = 'nha_co_tiec_templates_channel';

// In-memory cache synced with localStorage
let currentTemplates: Template[] = (() => {
  try {
    const saved = localStorage.getItem(STORAGE_KEY);
    if (saved) {
      return JSON.parse(saved);
    }
  } catch (e) {
    console.error('Failed to load templates from localStorage', e);
  }
  return MOCK_TEMPLATES;
})();

const listeners = new Set<() => void>();

// Cross-tab BroadcastChannel for 0ms multi-tab sync
let broadcastChannel: BroadcastChannel | null = null;
try {
  if (typeof window !== 'undefined' && 'BroadcastChannel' in window) {
    broadcastChannel = new BroadcastChannel(BROADCAST_CHANNEL_NAME);
    broadcastChannel.onmessage = (event) => {
      if (event.data?.type === 'TEMPLATES_UPDATED' && Array.isArray(event.data?.templates)) {
        currentTemplates = event.data.templates;
        listeners.forEach((fn) => fn());
      }
    };
  }
} catch (e) {}

// Window Storage Event listener for cross-tab sync
if (typeof window !== 'undefined') {
  window.addEventListener('storage', (event) => {
    if (event.key === STORAGE_KEY && event.newValue) {
      try {
        currentTemplates = JSON.parse(event.newValue);
        listeners.forEach((fn) => fn());
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
    onSnapshot(
      collection(db, 'templates'),
      (snapshot) => {
        if (!snapshot.empty) {
          const remoteList: Template[] = [];
          snapshot.forEach((docSnap) => {
            const data = docSnap.data() as Partial<Template>;
            if (data) {
              remoteList.push({
                name: data.name || data.title || 'Mẫu thiệp cưới',
                title: data.title || data.name || 'Mẫu thiệp cưới',
                slug: data.slug || docSnap.id,
                price: typeof data.price === 'number' ? data.price : 79000,
                status: data.status || 'published',
                isActive: data.isActive ?? true,
                thumbnailUrl: data.thumbnailUrl || 'https://images.unsplash.com/photo-1519741497674-611481863552?auto=format&fit=crop&w=600&q=80',
                ...data,
                id: docSnap.id,
              } as Template);
            }
          });

          if (remoteList.length > 0) {
            const remoteMap = new Map<string, Template>(remoteList.map((t) => [t.id, t]));
            const merged = remoteList.slice();
            currentTemplates.forEach((localTpl) => {
              if (!remoteMap.has(localTpl.id)) {
                merged.push(localTpl);
              }
            });
            currentTemplates = merged;
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
    });
  } catch (e) {}

  listeners.forEach((fn) => fn());
}

/**
 * Get all templates (for Admin - includes published, draft, hidden)
 */
export function getAllTemplates(): Template[] {
  return [...currentTemplates];
}

/**
 * Get public templates only (for Public Website - only published)
 */
export function getPublicTemplates(): Template[] {
  return currentTemplates.filter((t) => t.status === 'published' || t.isActive);
}

export function getTemplateById(id: string): Template | undefined {
  return currentTemplates.find((t) => t.id === id);
}

export function getTemplateBySlug(slug: string): Template | undefined {
  return currentTemplates.find((t) => t.slug === slug);
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
      updatedItem = {
        ...t,
        ...updates,
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
  const before = currentTemplates.length;
  currentTemplates = currentTemplates.filter((t) => t.id !== id);
  if (currentTemplates.length !== before) {
    notify();

    if (db) {
      deleteDoc(doc(db, 'templates', id)).catch((err) => {
        console.warn('Failed to delete template from Firestore:', err);
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
  return false;
}

/**
 * Admin Action: Reset to seed mock templates
 */
export function resetTemplates(): void {
  currentTemplates = [...MOCK_TEMPLATES];
  notify();
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
