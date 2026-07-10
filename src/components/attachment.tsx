import { isImageFile } from "@/utils/is-image";
import Storage from "@/utils/storage";
import Image from "next/image";

export default function Attachment({
  fileItem,
  isEditing,
  handleViewImage,
  handleRemoveAttachment,
}: {
  fileItem: string;
  isEditing: boolean;
  handleViewImage: (fileItem: string) => void;
  handleRemoveAttachment: (fileItem: string) => void;
}) {
  const previewUrl = Storage(fileItem);
  const isImage = isImageFile(fileItem);
  const fileName = fileItem.split(/[/\\]/).pop() ?? "Attachment";

  return (
    <div className="w-full max-w-35 p-3 bg-base-100 border border-base-200 rounded-2xl shadow-sm">
      <div className="overflow-hidden rounded-2xl bg-gray-100 h-20 flex items-center justify-center">
        {isImage ? (
          <Image
            width={120}
            height={80}
            src={previewUrl}
            alt={fileName}
            className="object-cover w-full h-full"
          />
        ) : (
          <div className="text-center text-xs uppercase text-gray-500 tracking-[0.2em]">
            Document
          </div>
        )}
      </div>

      <div
        className="mt-3 text-sm font-semibold text-base-content truncate"
        title={fileName}
      >
        {fileName}
      </div>
      <div className="mt-2 text-xs text-gray-500">
        {isImage ? "Image attachment" : "Document attachment"}
      </div>

      <div className="mt-4 flex flex-wrap items-center gap-2">
        {isImage && !isEditing && (
          <button
            type="button"
            onClick={() => handleViewImage(fileItem)}
            className="flex-1 min-w-[6rem] rounded-lg bg-primary px-3 py-2 text-center text-xs font-semibold text-white hover:bg-primary-focus transition-colors"
          >
            View
          </button>
        )}

        {!isEditing && !isImage && (
          <a
            href={previewUrl}
            download
            target="_blank"
            rel="noreferrer"
            onClick={(e) => e.stopPropagation()}
            className="flex-1 min-w-[6rem] rounded-lg bg-secondary px-3 py-2 text-center text-xs font-semibold text-white hover:bg-secondary-focus transition-colors"
          >
            Download
          </a>
        )}

        {isEditing && (
          <button
            type="button"
            onClick={() => handleRemoveAttachment(fileItem)}
            className="flex-1 min-w-[6rem] rounded-lg bg-red-500 px-3 py-2 text-center text-xs font-semibold text-white hover:bg-red-600 transition-colors"
          >
            Remove
          </button>
        )}
      </div>
    </div>
  );
}
