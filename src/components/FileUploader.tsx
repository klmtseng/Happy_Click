import { useRef, useState, type ChangeEvent } from 'react';

export function FileUploader({ onFileSelect }: { onFileSelect: (file: File) => void }) {
  const fileInputRef = useRef<HTMLInputElement>(null);
  const [fileName, setFileName] = useState<string | null>(null);

  const handleFileChange = (e: ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      setFileName(file.name);
      onFileSelect(file);
    }
  };

  return (
    <div className="fixed bottom-4 right-4 z-50 flex flex-col items-end gap-2">
      <input
        type="file"
        ref={fileInputRef}
        onChange={handleFileChange}
        accept="audio/*,video/*"
        className="hidden"
      />
      <button
        onClick={() => fileInputRef.current?.click()}
        className="font-tech text-[10px] text-gray-500 hover:text-white border border-gray-700 px-2 py-1 rounded bg-black/50 backdrop-blur"
      >
        {fileName ? `LOADED: ${fileName.slice(0, 15)}...` : 'UPLOAD "67" SFX'}
      </button>
    </div>
  );
}
