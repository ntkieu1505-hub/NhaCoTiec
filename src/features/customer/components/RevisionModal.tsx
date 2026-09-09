import React, { useState } from 'react';
import { Icon } from '../../../components/common/Icon';
import { REVISION_TOPICS } from '../../../utils/constants';

interface RevisionModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSubmitRevision: (data: { topics: string[]; content: string; referenceUrl?: string }) => void;
}

export const RevisionModal: React.FC<RevisionModalProps> = ({
  isOpen,
  onClose,
  onSubmitRevision
}) => {
  const [selectedTopics, setSelectedTopics] = useState<string[]>(['📷 Đổi ảnh / Album']);
  const [content, setContent] = useState(
    'Thay ảnh đầu tiên bằng ảnh số 5 trong album gửi qua Zalo, đổi lại ngày tiệc nhà gái thành 11h00.'
  );
  const [driveUrl, setDriveUrl] = useState('');

  if (!isOpen) return null;

  const toggleTopic = (topic: string) => {
    if (selectedTopics.includes(topic)) {
      setSelectedTopics(selectedTopics.filter((t) => t !== topic));
    } else {
      setSelectedTopics([...selectedTopics, topic]);
    }
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!content.trim()) return;
    onSubmitRevision({
      topics: selectedTopics,
      content,
      referenceUrl: driveUrl
    });
    onClose();
  };

  return (
    <div className="fixed inset-0 bg-deep-espresso/60 backdrop-blur-xs z-50 flex items-center justify-center p-4">
      <div className="w-full max-w-md bg-surface-card rounded-2xl shadow-2xl flex flex-col max-h-[90vh] overflow-hidden border border-border-delicate animate-in fade-in zoom-in-95">
        {/* Header */}
        <div className="flex items-start justify-between p-5 border-b border-border-delicate">
          <div className="flex flex-col">
            <div className="flex items-center gap-1.5">
              <Icon name="rate_review" className="text-[22px] text-burgundy-wine" />
              <h2 className="font-serif text-lg font-bold text-deep-espresso">
                Yêu cầu chỉnh sửa
              </h2>
            </div>
            <p className="text-xs text-text-muted mt-0.5">
              Bạn muốn thay đổi nội dung nào trên website thiệp cưới?
            </p>
          </div>
          <button
            onClick={onClose}
            className="p-1 text-text-muted hover:text-deep-espresso rounded-full transition-colors"
          >
            <Icon name="close" className="text-[22px]" />
          </button>
        </div>

        {/* Body */}
        <form onSubmit={handleSubmit} className="flex-1 overflow-y-auto p-5 flex flex-col gap-4">
          {/* Quick topic pills */}
          <div className="flex flex-col gap-1.5">
            <span className="text-[11px] font-label-caps uppercase text-gold-foil font-bold tracking-wider">
              Chọn nhanh chủ đề chỉnh sửa
            </span>
            <div className="flex flex-wrap gap-1.5">
              {REVISION_TOPICS.map((topic) => {
                const isSelected = selectedTopics.includes(topic);
                return (
                  <button
                    key={topic}
                    type="button"
                    onClick={() => toggleTopic(topic)}
                    className={`px-2.5 py-1 rounded-full text-xs font-sans transition-all border ${
                      isSelected
                        ? 'bg-burgundy-wine text-white border-burgundy-wine font-medium shadow-xs'
                        : 'bg-surface-subtle text-deep-espresso border-border-delicate hover:bg-surface-cream'
                    }`}
                  >
                    {topic}
                  </button>
                );
              })}
            </div>
          </div>

          {/* Textarea */}
          <div className="flex flex-col gap-1.5">
            <div className="flex items-center justify-between text-xs">
              <label className="font-semibold text-deep-espresso">
                Nội dung cần chỉnh sửa <span className="text-burgundy-wine">*</span>
              </label>
              <span className="text-[11px] text-text-muted">{content.length} / 1000 ký tự</span>
            </div>
            <textarea
              required
              rows={4}
              value={content}
              onChange={(e) => setContent(e.target.value)}
              placeholder="Ví dụ: Mong muốn thay ảnh bìa cô dâu chú rể ở phần đầu thiệp, chỉnh lại địa chỉ hoặc thay đổi giờ tiệc..."
              className="w-full p-3 rounded-xl border border-border-delicate bg-surface text-xs text-deep-espresso focus:outline-none focus:border-burgundy-wine leading-relaxed resize-none"
            />
          </div>

          {/* Attachments box */}
          <div className="flex flex-col gap-2 bg-surface-subtle/50 p-3 rounded-xl border border-border-delicate">
            <div className="flex items-start gap-2">
              <Icon name="add_photo_alternate" className="text-[18px] text-gold-foil mt-0.5" />
              <div className="flex flex-col">
                <span className="text-xs font-semibold text-deep-espresso">
                  Ảnh tham khảo (không bắt buộc)
                </span>
                <p className="text-[11px] text-text-muted mt-0.5 leading-tight">
                  Bạn có thể đính kèm ảnh hoặc dán link Google Drive/Dropbox để Designer nắm rõ ý.
                </p>
              </div>
            </div>

            <div className="flex items-center gap-2 mt-1">
              <input
                type="text"
                value={driveUrl}
                onChange={(e) => setDriveUrl(e.target.value)}
                placeholder="Dán link Google Drive / Dropbox ảnh mới..."
                className="flex-1 px-3 py-2 rounded-lg border border-border-delicate bg-surface-card text-xs text-deep-espresso focus:outline-none focus:border-burgundy-wine"
              />
            </div>
          </div>

          {/* Footer Actions */}
          <div className="pt-2 grid grid-cols-2 gap-2 border-t border-border-delicate mt-auto">
            <button
              type="button"
              onClick={onClose}
              className="w-full h-11 flex items-center justify-center rounded-full bg-surface-subtle text-deep-espresso text-xs font-semibold border border-border-delicate hover:bg-surface-container-high transition-colors"
            >
              Hủy
            </button>
            <button
              type="submit"
              className="w-full h-11 flex items-center justify-center gap-1.5 rounded-full bg-burgundy-wine text-white text-xs font-semibold shadow-md hover:bg-[#851622] active:scale-95 transition-all"
            >
              <Icon name="send" className="text-[18px]" />
              <span>Gửi yêu cầu</span>
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};
