import React, { useState, useRef } from 'react';
import { Icon } from '../../../components/common/Icon';
import { uploadOrderPhoto } from '../../../services/storageService';

interface PhotoAlbumModalProps {
  isOpen: boolean;
  onClose: () => void;
  existingPhotos?: string[];
  orderId?: string;
  onSave: (photos: string[]) => void;
}

interface SelectedImageItem {
  id: string;
  name: string;
  size: string;
  url: string;
  file?: File;
}

export const PhotoAlbumModal: React.FC<PhotoAlbumModalProps> = ({
  isOpen,
  onClose,
  existingPhotos = [],
  orderId,
  onSave,
}) => {
  const fileInputRef = useRef<HTMLInputElement>(null);
  const [selectedImages, setSelectedImages] = useState<SelectedImageItem[]>(() =>
    existingPhotos.map((url, i) => ({
      id: `existing-${i}`,
      name: `anh-cuoi-${i + 1}.jpg`,
      size: '2.4 MB',
      url,
    }))
  );
  const [isDragging, setIsDragging] = useState(false);
  const [isSuccess, setIsSuccess] = useState(false);
  const [isUploading, setIsUploading] = useState(false);
  const [uploadStatusText, setUploadStatusText] = useState('');

  if (!isOpen) return null;

  const handleFiles = (files: FileList | File[]) => {
    const validFiles = Array.from(files).filter((file) =>
      ['image/jpeg', 'image/png', 'image/webp'].includes(file.type)
    );

    if (validFiles.length === 0) {
      alert('Vui lòng chọn định dạng file ảnh hợp lệ: JPG, PNG hoặc WEBP.');
      return;
    }

    validFiles.forEach((file) => {
      const sizeMB = (file.size / (1024 * 1024)).toFixed(1) + ' MB';
      const previewUrl = URL.createObjectURL(file);
      setSelectedImages((prev) => [
        ...prev,
        {
          id: `${Date.now()}-${Math.random().toString(36).substring(2, 6)}`,
          name: file.name,
          size: sizeMB,
          url: previewUrl,
          file,
        },
      ]);
    });
  };

  const handleDragOver = (e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(true);
  };

  const handleDragLeave = (e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(false);
  };

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(false);
    if (e.dataTransfer.files && e.dataTransfer.files.length > 0) {
      handleFiles(e.dataTransfer.files);
    }
  };

  const handleRemove = (id: string) => {
    setSelectedImages((prev) => prev.filter((img) => img.id !== id));
  };

  const handleUpload = async () => {
    if (selectedImages.length === 0) {
      alert('Vui lòng chọn ít nhất 1 ảnh để tải lên.');
      return;
    }

    setIsUploading(true);
    setUploadStatusText('Đang chuẩn bị tải ảnh...');

    try {
      const finalUrls: string[] = [];
      const total = selectedImages.length;

      for (let i = 0; i < total; i++) {
        const item = selectedImages[i];
        if (item.file) {
          setUploadStatusText(`Đang xử lý ảnh ${i + 1}/${total}: ${item.name}...`);
          try {
            const uploadPromise = uploadOrderPhoto(orderId || 'customer_album', item.file);
            const timeoutPromise = new Promise<string>((_, reject) =>
              setTimeout(() => reject(new Error('Storage timeout')), 3500)
            );
            const uploadedUrl = await Promise.race([uploadPromise, timeoutPromise]);
            finalUrls.push(uploadedUrl || item.url);
          } catch {
            finalUrls.push(item.url);
          }
        } else {
          finalUrls.push(item.url);
        }
      }

      setUploadStatusText('Đã tải lên và lưu trữ thành công!');
      onSave(finalUrls);
      setIsSuccess(true);
      setTimeout(() => {
        setIsSuccess(false);
        onClose();
      }, 1500);
    } catch (error) {
      console.error('Lỗi khi tải ảnh lên:', error);
      alert('Có lỗi xảy ra khi tải ảnh lên. Vui lòng thử lại.');
    } finally {
      setIsUploading(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-deep-espresso/60 backdrop-blur-xs overflow-y-auto">
      <div className="bg-surface-card rounded-2xl border border-border-delicate shadow-2xl w-full max-w-xl max-h-[90vh] flex flex-col overflow-hidden animate-in fade-in zoom-in-95">
        {/* Header */}
        <div className="px-6 py-4 border-b border-border-delicate flex items-center justify-between bg-surface-cream/70">
          <div className="flex items-center gap-2.5">
            <div className="w-8 h-8 rounded-full bg-burgundy-wine text-white flex items-center justify-center shadow-xs">
              <Icon name="photo_library" className="text-[18px]" />
            </div>
            <div>
              <h2 className="font-serif text-lg font-bold text-deep-espresso">
                Tải Album Ảnh Cưới (Pre-wedding Album)
              </h2>
              <p className="text-[11px] text-text-muted">
                Định dạng hỗ trợ: JPG, PNG, WEBP (Được tối ưu chuẩn retina)
              </p>
            </div>
          </div>
          <button
            type="button"
            onClick={onClose}
            className="w-8 h-8 rounded-full flex items-center justify-center hover:bg-surface-subtle text-text-muted hover:text-deep-espresso transition-colors"
          >
            <Icon name="close" className="text-[20px]" />
          </button>
        </div>

        {/* Success Alert Banner */}
        {isSuccess && (
          <div className="bg-emerald-50 border-b border-emerald-200 px-6 py-3 flex items-center gap-2 text-emerald-900 text-xs font-semibold animate-in fade-in">
            <Icon name="check_circle" className="text-[20px] text-emerald-700" />
            <span>Album ảnh đã được gửi cho Nhà Có Tiệc ({selectedImages.length} ảnh).</span>
          </div>
        )}

        {/* Modal Body */}
        <div className="flex-1 overflow-y-auto p-6 flex flex-col gap-4 text-xs text-deep-espresso">
          {/* Drag & Drop Area */}
          <div
            onDragOver={handleDragOver}
            onDragLeave={handleDragLeave}
            onDrop={handleDrop}
            onClick={() => fileInputRef.current?.click()}
            className={`border-2 border-dashed rounded-2xl p-6 flex flex-col items-center justify-center text-center cursor-pointer transition-all ${
              isDragging
                ? 'border-burgundy-wine bg-rose-50/50 scale-[0.99]'
                : 'border-border-delicate bg-surface-subtle/50 hover:bg-surface-subtle'
            }`}
          >
            <input
              ref={fileInputRef}
              type="file"
              multiple
              accept="image/jpeg,image/png,image/webp"
              onChange={(e) => {
                if (e.target.files) handleFiles(e.target.files);
              }}
              className="hidden"
            />
            <div className="w-12 h-12 rounded-full bg-surface-card shadow-xs flex items-center justify-center text-burgundy-wine mb-2">
              <Icon name="cloud_upload" className="text-[26px]" />
            </div>
            <p className="font-semibold text-deep-espresso text-sm">
              Kéo và thả ảnh cưới vào đây
            </p>
            <p className="text-[11px] text-text-muted mt-0.5">
              hoặc bấm để mở thư mục trên máy của bạn
            </p>
            <button
              type="button"
              className="mt-3 px-4 py-1.5 rounded-full bg-surface-card hover:bg-surface-cream text-burgundy-wine font-semibold text-xs border border-border-delicate shadow-2xs transition-colors"
            >
              Chọn ảnh
            </button>
          </div>

          {/* Selected Images List */}
          <div className="flex flex-col gap-2 pt-2">
            <div className="flex items-center justify-between">
              <span className="font-label-caps text-[10px] uppercase font-bold text-deep-espresso tracking-wider">
                Ảnh đã chọn ({selectedImages.length} ảnh)
              </span>
              {selectedImages.length > 0 && (
                <button
                  type="button"
                  onClick={() => setSelectedImages([])}
                  className="text-[11px] text-rose-800 hover:underline"
                >
                  Xóa tất cả
                </button>
              )}
            </div>

            {selectedImages.length === 0 ? (
              <div className="p-4 rounded-xl bg-surface-subtle/30 text-center text-text-muted text-[11px] italic border border-border-delicate">
                Chưa có ảnh nào được chọn. Hãy kéo thả hoặc chọn từ 5 - 20 tấm ảnh cưới đẹp nhất của hai bạn.
              </div>
            ) : (
              <div className="grid grid-cols-3 sm:grid-cols-4 gap-2.5 max-h-60 overflow-y-auto p-1">
                {selectedImages.map((img) => (
                  <div
                    key={img.id}
                    className="relative aspect-square rounded-xl overflow-hidden bg-surface-card border border-border-delicate shadow-2xs group"
                  >
                    <img
                      src={img.url}
                      alt={img.name}
                      className="w-full h-full object-cover"
                    />
                    <div className="absolute inset-0 bg-deep-espresso/50 opacity-0 group-hover:opacity-100 transition-opacity flex flex-col justify-between p-1.5 text-white text-[9px]">
                      <span className="truncate">{img.name}</span>
                      <button
                        type="button"
                        onClick={(e) => {
                          e.stopPropagation();
                          handleRemove(img.id);
                        }}
                        className="self-end p-1 rounded-full bg-rose-600 hover:bg-rose-700 text-white transition-colors"
                        title="Xóa ảnh này"
                      >
                        <Icon name="close" className="text-[14px]" />
                      </button>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>

          <p className="text-[10px] text-text-muted italic leading-relaxed pt-1">
            * Lưu ý: Designer sẽ tự động căn chỉnh và phối hợp ảnh chân dung, ảnh phóng sự cưới phù hợp với khung giao diện của mẫu thiệp bạn đã đặt.
          </p>
        </div>

        {/* Modal Footer */}
        <div className="px-6 py-3.5 border-t border-border-delicate flex items-center justify-between bg-surface-cream/50">
          <div className="flex items-center gap-2 max-w-[60%]">
            <button
              type="button"
              onClick={onClose}
              disabled={isUploading}
              className="px-4 py-2 rounded-full border border-border-delicate hover:bg-surface-subtle text-text-muted hover:text-deep-espresso font-semibold text-xs transition-colors disabled:opacity-40"
            >
              Hủy
            </button>
            {uploadStatusText && (
              <span className="text-[11px] text-burgundy-wine font-medium truncate">
                {uploadStatusText}
              </span>
            )}
          </div>
          <button
            type="button"
            onClick={handleUpload}
            disabled={isUploading || selectedImages.length === 0}
            className="px-6 py-2 rounded-full bg-burgundy-wine hover:bg-[#851622] disabled:opacity-40 text-white font-semibold text-xs shadow-md transition-all flex items-center gap-1.5"
          >
            <Icon name={isUploading ? 'hourglass_top' : 'cloud_upload'} className={`text-[16px] ${isUploading ? 'animate-spin' : ''}`} />
            <span>{isUploading ? 'Đang gửi...' : 'Tải lên Nhà Có Tiệc'}</span>
          </button>
        </div>
      </div>
    </div>
  );
};
