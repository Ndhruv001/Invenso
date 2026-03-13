import { X, QrCode } from "lucide-react";
import useTheme from "@/hooks/useTheme";

function QRModal({ isOpen, onClose, message, imageUrl, imageAlt = "QR Code", isLoading = false }) {
  const { theme } = useTheme();

  if (!isOpen) return null;

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center p-4"
      style={{ backgroundColor: "rgba(0,0,0,0.45)" }}
      onClick={onClose}
    >
      <div
        className={`relative w-full max-w-xs rounded-2xl shadow-lg ${theme.card} ${theme.border} border`}
        onClick={e => e.stopPropagation()}
      >
        {/* Close button */}
        <button
          onClick={onClose}
          className={`absolute top-3 right-3 p-1 rounded-full transition-colors ${theme.hover} ${theme.text.muted}`}
          aria-label="Close modal"
        >
          <X size={18} />
        </button>

        {/* Content */}
        <div className="p-6 pt-10">
          <div className="flex justify-center mb-4">
            {isLoading ? (
              // Skeleton placeholder — same size as the QR image
              <div
                className={`w-40 h-40 rounded-lg flex flex-col items-center justify-center gap-2 border ${theme.border} ${theme.hover}`}
              >
                <QrCode size={32} className={`${theme.text.muted} opacity-30`} />
                <svg
                  className={`animate-spin w-5 h-5 ${theme.text.muted}`}
                  fill="none"
                  viewBox="0 0 24 24"
                >
                  <circle
                    className="opacity-20"
                    cx="12"
                    cy="12"
                    r="10"
                    stroke="currentColor"
                    strokeWidth="3"
                  />
                  <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8v8H4z" />
                </svg>
              </div>
            ) : imageUrl ? (
              <img src={imageUrl} alt={imageAlt} className="w-40 h-40 object-contain rounded-lg" />
            ) : null}
          </div>

          {message && (
            <p
              className={`text-sm text-center leading-relaxed ${isLoading ? theme.text.muted : theme.text.secondary}`}
            >
              {isLoading ? "Generating QR code..." : message}
            </p>
          )}
        </div>
      </div>
    </div>
  );
}

export default QRModal;
export { QRModal };
