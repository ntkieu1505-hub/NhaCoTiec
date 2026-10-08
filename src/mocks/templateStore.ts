import { useState, useEffect } from 'react';
import { Template, TemplateStatus } from '../types/template';
import { MOCK_TEMPLATES } from './mockTemplates';
import { db } from '../services/firebase';
import { collection, onSnapshot, doc, setDoc, deleteDoc } from 'firebase/firestore';
import { logActivity } from '../services/activityLogService';
import { getCmsContent, updateFeaturedTemplates } from './cmsStore';

const STORAGE_KEY = 'nha_co_tiec_templates_v4';
const DELETED_STORAGE_KEY = 'nha_co_tiec_deleted_template_ids_v2';
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
        if (Array.isArray(arr)) {
          // Bảo vệ các mẫu thiệp mặc định không bị dính blacklist do lỗi phiên bản cũ
          const standardMockIds = new Set(MOCK_TEMPLATES.map((m) => m.id));
          return arr.filter((id) => !standardMockIds.has(id));
        }
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

/**
 * Recursively cleans an object for Firestore by converting undefined fields to null
 * or stripping them, as Firestore throws on undefined values.
 */
export function sanitizeForFirestore<T>(data: T): any {
  if (data === undefined) return null;
  if (data === null || typeof data !== 'object') return data;
  if (data instanceof Date) return data.toISOString();
  if (Array.isArray(data)) {
    return data.map((item) => sanitizeForFirestore(item));
  }
  const clean: Record<string, any> = {};
  for (const [key, value] of Object.entries(data)) {
    if (value !== undefined) {
      clean[key] = sanitizeForFirestore(value);
    }
  }
  return clean;
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
            const standardMockIds = new Set(MOCK_TEMPLATES.map((m) => m.id));
            data.deletedTemplateIds.forEach((id: string) => {
              if (!standardMockIds.has(id) && !deletedTemplateIds.has(id)) {
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

          snapshot.forEach((docSnap) => {
            const data = docSnap.data() as Partial<Template>;
            if (!data) return;

            // Bỏ qua các mục đã bị đánh dấu xóa
            if (data.isDeleted === true || data.status === 'deleted') {
              return;
            }

            remoteList.push({
              name: data.name || data.title || 'Mẫu thiệp cưới',
              title: data.title || data.name || 'Mẫu thiệp cưới',
              slug: data.slug || docSnap.id,
              price: typeof data.price === 'number' ? data.price : 79000,
              status: data.status || 'published',
              isActive: data.isActive ?? (data.status === 'published'),
              isPinned:
                data.isPinned !== undefined
                  ? data.isPinned
                  : (MOCK_TEMPLATES.find((m) => m.id === docSnap.id)?.isPinned ?? false),
              thumbnailUrl:
                data.thumbnailUrl ||
                'https://images.unsplash.com/photo-1519741497674-611481863552?auto=format&fit=crop&w=600&q=80',
              ...data,
              isDeleted: false,
              id: docSnap.id,
            } as Template);
          });

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

/**
 * Admin Action: Force sync all active local templates to Cloud Firestore
 * Ensures visitors on all devices receive the latest data immediately.
 */
export async function syncAllTemplatesToFirestore(): Promise<{ success: boolean; count: number; error?: string }> {
  if (!db) {
    return { success: false, count: 0, error: 'Chưa kết nối Cloud Firestore' };
  }
  try {
    const templatesToSync = currentTemplates.filter((t) => !deletedTemplateIds.has(t.id) && !isPurgedTemplate(t));
    let count = 0;
    for (const tpl of templatesToSync) {
      const sanitized = sanitizeForFirestore(tpl);
      await setDoc(doc(db, 'templates', tpl.id), sanitized, { merge: true });
      count++;
    }

    // Sync deleted metadata
    await setDoc(
      doc(db, 'settings', 'templates_meta'),
      sanitizeForFirestore({
        deletedTemplateIds: Array.from(deletedTemplateIds),
        updatedAt: new Date().toISOString(),
      }),
      { merge: true }
    );

    // Sync CMS featured templates if any pinned
    try {
      const cms = getCmsContent();
      const pinnedIds = templatesToSync.filter((t) => t.isPinned).map((t) => t.id);
      if (pinnedIds.length > 0) {
        updateFeaturedTemplates({
          featuredTemplateIds: Array.from(new Set([...(cms.featuredTemplates?.featuredTemplateIds || []), ...pinnedIds])),
        });
      }
    } catch (e) {}

    return { success: true, count };
  } catch (err: any) {
    console.error('Failed to sync templates to Firestore:', err);
    return { success: false, count: 0, error: err?.message || String(err) };
  }
}

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
 * Detects whether a thumbnail string is a legacy placeholder/mock URL
 * that was deleted or superseded by user-uploaded thumbnails.
 */
export function isOldOrMockThumbnail(url?: string | null): boolean {
  if (!url || typeof url !== 'string') return true;
  const s = url.trim();
  if (!s) return true;
  if (s.includes('lh3.googleusercontent.com')) return true;
  if (s.includes('aida-public')) return true;
  if (s.includes('AB6AXu')) return true;
  if (s.includes('photo-1607190074257-dd4b7af0309f')) return true;
  if (s.includes('photo-1519741497674-611481863552')) return true;
  return false;
}

/**
 * Resolves the true, current thumbnail for an order.
 * If the matched template exists and has an active thumbnail, and the order's saved thumbnail
 * is missing or is an old deleted mock URL, or if the template has an updated custom thumbnail,
 * it returns the template's active thumbnail.
 */
export function resolveOrderThumbnail(
  template?: Template,
  orderSavedThumbnail?: string
): string {
  if (template?.thumbnailUrl) {
    if (!orderSavedThumbnail || isOldOrMockThumbnail(orderSavedThumbnail)) {
      return template.thumbnailUrl;
    }
    if (template.thumbnailUrl.startsWith('data:image')) {
      return template.thumbnailUrl;
    }
  }
  if (orderSavedThumbnail && !isOldOrMockThumbnail(orderSavedThumbnail)) {
    return orderSavedThumbnail;
  }
  return template?.thumbnailUrl || '';
}

/**
 * Safely and accurately resolves the correct Template for any given Order,
 * matching by templateId, slug, extracted name from "Thiệp cưới ... (Template Name)",
 * or substring matching.
 */
export function resolveTemplateForOrder(
  templateId?: string,
  templateName?: string,
  customList?: Template[]
): Template | undefined {
  const all = (customList && customList.length > 0) ? customList : getAllTemplates();
  if (!all || all.length === 0) return undefined;

  // 1. Direct match by ID
  if (templateId) {
    const byId = all.find(
      (t) => (t.id === templateId || t.slug === templateId) && !deletedTemplateIds.has(t.id) && !isPurgedTemplate(t)
    );
    if (byId) return byId;
  }

  // 2. Match by templateName
  if (templateName) {
    const raw = templateName.trim();

    // 2A. Extract parenthesized template name e.g. "Thiệp cưới i & i (Classic Red)" -> "Classic Red"
    const parenMatch = raw.match(/\(([^)]+)\)$/);
    if (parenMatch && parenMatch[1]) {
      const extracted = parenMatch[1].trim().toLowerCase();
      const byParen = all.find((t) => {
        if (deletedTemplateIds.has(t.id) || isPurgedTemplate(t)) return false;
        const tName = t.name.trim().toLowerCase();
        const tSlug = t.slug.trim().toLowerCase();
        return tName === extracted || tSlug === extracted || tName.includes(extracted) || extracted.includes(tName);
      });
      if (byParen) return byParen;
    }

    // 2B. Exact name match
    const lower = raw.toLowerCase();
    const byExact = all.find((t) => {
      if (deletedTemplateIds.has(t.id) || isPurgedTemplate(t)) return false;
      return t.name.trim().toLowerCase() === lower || t.slug.trim().toLowerCase() === lower;
    });
    if (byExact) return byExact;

    // 2C. Substring match
    const bySub = all.find((t) => {
      if (deletedTemplateIds.has(t.id) || isPurgedTemplate(t)) return false;
      const tName = t.name.trim().toLowerCase();
      return lower.includes(tName) || tName.includes(lower);
    });
    if (bySub) return bySub;
  }

  // 3. Fallback specifically for Classic Red keywords
  if (
    (templateName && /classic\s*red/i.test(templateName)) ||
    (templateId && /classic\s*red/i.test(templateId))
  ) {
    const redTpl = all.find((t) => /classic\s*red/i.test(t.name) || /classic\s*red/i.test(t.slug));
    if (redTpl) return redTpl;
  }

  return undefined;
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
    isDeleted: false,
    isPinned: Boolean(data.isPinned),
    createdAt: now,
    updatedAt: now,
    isActive: data.status === 'published',
  };

  if (deletedTemplateIds.has(id)) {
    deletedTemplateIds.delete(id);
    saveDeletedIds();
  }

  currentTemplates = [newTemplate, ...currentTemplates];
  notify();

  // Sync to Firestore
  if (db) {
    const cleanDoc = sanitizeForFirestore(newTemplate);
    setDoc(doc(db, 'templates', id), cleanDoc, { merge: true }).catch((err) => {
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

  // Sync featuredTemplateIds in CMS if created as pinned
  if (newTemplate.isPinned) {
    try {
      const cms = getCmsContent();
      const curFeatured = Array.isArray(cms.featuredTemplates?.featuredTemplateIds)
        ? cms.featuredTemplates.featuredTemplateIds
        : [];
      if (!curFeatured.includes(id)) {
        updateFeaturedTemplates({
          featuredTemplateIds: [...curFeatured, id],
        });
      }
    } catch (e) {}
  }

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

  // Nếu ID này từng bị đánh dấu trong deletedTemplateIds, gỡ bỏ ngay lập tức
  if (deletedTemplateIds.has(id)) {
    deletedTemplateIds.delete(id);
    saveDeletedIds();
    if (db) {
      setDoc(
        doc(db, 'settings', 'templates_meta'),
        sanitizeForFirestore({
          deletedTemplateIds: Array.from(deletedTemplateIds),
          updatedAt: new Date().toISOString(),
        }),
        { merge: true }
      ).catch(() => {});
    }
  }

  let found = false;
  currentTemplates = currentTemplates.map((t) => {
    if (t.id === id) {
      found = true;
      const newName = updates.name ? updates.name.trim() : t.name;
      const newTitle = updates.title ? updates.title.trim() : (updates.name ? updates.name.trim() : (t.title || t.name));
      updatedItem = {
        ...t,
        ...updates,
        isDeleted: false,
        name: newName,
        title: newTitle,
        updatedAt: now,
        isActive: updates.status ? updates.status === 'published' : t.isActive,
        isPinned: updates.isPinned !== undefined ? updates.isPinned : (t.isPinned ?? false),
      };
      return updatedItem;
    }
    return t;
  });

  // Nếu không tìm thấy trong currentTemplates (ví dụ bị ẩn hoặc lọc mất trước đó), tái tạo lại
  if (!found) {
    const baseMock = MOCK_TEMPLATES.find((m) => m.id === id);
    const newName = updates.name ? updates.name.trim() : (baseMock?.name || 'Mẫu thiệp cưới');
    const newTitle = updates.title ? updates.title.trim() : (updates.name ? updates.name.trim() : (baseMock?.title || newName));
    updatedItem = {
      ...(baseMock || {}),
      ...updates,
      id,
      isDeleted: false,
      name: newName,
      title: newTitle,
      createdAt: baseMock?.createdAt || now,
      updatedAt: now,
      isActive: updates.status ? updates.status === 'published' : true,
      isPinned: updates.isPinned !== undefined ? updates.isPinned : (baseMock?.isPinned ?? false),
    } as Template;
    currentTemplates = [updatedItem, ...currentTemplates.filter((t) => t.id !== id)];
  }

  notify();

  if (updatedItem && db) {
    const cleanDoc = sanitizeForFirestore(updatedItem);
    setDoc(doc(db, 'templates', id), cleanDoc, { merge: true })
      .then(() => {
        console.info(`[Firestore] Đã đồng bộ mẫu thiệp #${id} lên Firestore thành công.`);
      })
      .catch((err) => {
        console.warn('Failed to update template in Firestore:', err);
      });
    logActivity({
      type: 'admin_setting_changed',
      actorName: 'Admin',
      actorRole: 'admin',
      title: 'Cập nhật mẫu thiệp',
      description: `Admin đã chỉnh sửa mẫu thiệp "${updatedItem.title}" (#${updatedItem.id})`,
      details: { templateId: updatedItem.id, updates: sanitizeForFirestore(updates) },
    }).catch(() => {});
  }

  // Sync featuredTemplateIds in CMS store whenever isPinned is changed
  if (updates.isPinned !== undefined) {
    try {
      const cms = getCmsContent();
      const curFeatured = Array.isArray(cms.featuredTemplates?.featuredTemplateIds)
        ? cms.featuredTemplates.featuredTemplateIds
        : [];
      const nextFeatured = updates.isPinned
        ? Array.from(new Set([...curFeatured, id]))
        : curFeatured.filter((tplId) => tplId !== id);

      if (JSON.stringify(curFeatured) !== JSON.stringify(nextFeatured)) {
        updateFeaturedTemplates({
          featuredTemplateIds: nextFeatured,
        });
      }
    } catch (e) {
      console.warn('Failed to sync CMS featuredTemplateIds:', e);
    }
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
 * Admin Action: Quick toggle pinned to homepage
 */
export function togglePinTemplate(id: string): Template | undefined {
  const tpl = currentTemplates.find((t) => t.id === id);
  if (!tpl) return undefined;
  return updateTemplate(id, { isPinned: !tpl.isPinned });
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

  // Sync CMS featuredTemplateIds
  try {
    const cms = getCmsContent();
    const curFeatured = Array.isArray(cms.featuredTemplates?.featuredTemplateIds)
      ? cms.featuredTemplates.featuredTemplateIds
      : [];
    if (curFeatured.includes(id)) {
      updateFeaturedTemplates({
        featuredTemplateIds: curFeatured.filter((tplId) => tplId !== id),
      });
    }
  } catch (e) {}

  return true;
}

/**
 * Admin Action: Purge all corrupted, deleted or test templates
 */
export function purgeCorruptedTemplates(): number {
  let count = 0;
  const standardMockIds = new Set(MOCK_TEMPLATES.map((m) => m.id));

  // Gỡ bỏ các mẫu mặc định khỏi danh sách xóa nếu vô tình bị đưa vào trước đó
  standardMockIds.forEach((id) => {
    if (deletedTemplateIds.has(id)) {
      deletedTemplateIds.delete(id);
      count++;
    }
  });

  currentTemplates.forEach((t) => {
    if (isPurgedTemplate(t) && !standardMockIds.has(t.id)) {
      deletedTemplateIds.add(t.id);
      count++;
    }
  });

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

    // Đồng bộ toàn bộ 6 mẫu chuẩn lên Firestore để mọi máy khách đều nhận đủ
    MOCK_TEMPLATES.forEach((tpl) => {
      setDoc(
        doc(db, 'templates', tpl.id),
        {
          ...tpl,
          name: tpl.name || tpl.title,
          title: tpl.title || tpl.name,
          isDeleted: false,
          status: tpl.status || 'published',
          isActive: tpl.status === 'published' || tpl.isActive === true,
          updatedAt: new Date().toISOString(),
        },
        { merge: true }
      ).catch(() => {});
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
