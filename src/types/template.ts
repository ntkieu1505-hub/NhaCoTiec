export type TemplateCategory = 'basic' | 'premium';
export type TemplateStatus = 'published' | 'draft' | 'hidden' | 'deleted';

export interface Template {
  id: string;
  slug: string;
  name: string; // e.g. "Mẫu Elegant", "Minh Anh Editorial"
  style: string; // e.g. "Thanh lịch", "Editorial Vintage", "Cổ điển Romance", "Tối giản Minimalist"
  description: string; // e.g. "Phong cách tối giản, sang trọng, thanh lịch"
  price: number; // numeric value: 59000 or 79000
  thumbnailUrl: string;
  thumbnailPosition?: string; // CSS object-position, e.g. "center 30%", "center top", "center center"
  previewUrl: string; // Dedicated demo URL, e.g. "https://nhacotiec.vn/demo/minh-anh"
  status: TemplateStatus; // 'published' | 'draft' | 'hidden' | 'deleted'
  createdAt: string;
  updatedAt: string;
  isDeleted?: boolean;

  // Optional and legacy compatibility fields
  title?: string;
  category?: TemplateCategory;
  rating?: number;
  reviewCount?: number;
  features?: string[];
  musicTitle?: string;
  musicArtist?: string;
  badgeText?: string;
  isPopular?: boolean;
  isPinned?: boolean; // Pinned to homepage featured templates section
  isActive?: boolean; // Legacy alias for status === 'published'
}

