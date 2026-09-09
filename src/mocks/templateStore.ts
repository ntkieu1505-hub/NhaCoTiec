import { useState, useEffect } from 'react';
import { Template, TemplateStatus } from '../types/template';
import { MOCK_TEMPLATES } from './mockTemplates';

const STORAGE_KEY = 'nha_co_tiec_templates_v2';

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

function notify() {
  try {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(currentTemplates));
  } catch (e) {
    console.error('Failed to save templates to localStorage', e);
  }
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
