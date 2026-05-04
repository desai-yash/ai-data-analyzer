import { useRef, useState } from 'react';
import { FileSpreadsheet, UploadCloud } from 'lucide-react';

function FileUpload({ onUpload, loading, disabled = false }) {
  const inputRef = useRef(null);
  const [dragging, setDragging] = useState(false);
  const [selectedFile, setSelectedFile] = useState(null);

  const chooseFile = (file) => {
    if (!file || disabled) return;
    setSelectedFile(file);
  };

  const submit = () => {
    if (disabled || !selectedFile || !onUpload) return;
    onUpload(selectedFile);
  };

  return (
    <section className="rounded-lg border border-dashed border-stone-300 bg-white p-6 shadow-sm">
      <div
        className={`flex min-h-56 flex-col items-center justify-center rounded-md px-4 py-8 text-center transition ${
          dragging ? 'bg-teal-50 ring-2 ring-ocean' : 'bg-stone-50'
        }`}
        onDragOver={(event) => {
          event.preventDefault();
          if (!disabled) setDragging(true);
        }}
        onDragLeave={() => setDragging(false)}
        onDrop={(event) => {
          event.preventDefault();
          setDragging(false);
          chooseFile(event.dataTransfer.files?.[0]);
        }}
      >
        <FileSpreadsheet className="mb-4 text-ocean" size={42} aria-hidden="true" />
        <h2 className="text-2xl font-semibold text-ink">Upload a CSV or Excel file</h2>
        <p className="mt-2 max-w-xl text-sm text-stone-600">
          Drop a dataset here, then generate AI-powered insights and chart suggestions.
        </p>
        <div className="mt-6 flex flex-wrap items-center justify-center gap-3">
          <button
            type="button"
            className="inline-flex items-center gap-2 rounded-md border border-stone-300 bg-white px-4 py-2 text-sm font-medium text-ink hover:bg-stone-100 disabled:cursor-not-allowed disabled:bg-stone-200"
            onClick={() => (disabled ? null : inputRef.current?.click())}
            disabled={disabled}
          >
            <UploadCloud size={16} aria-hidden="true" />
            Browse
          </button>
          <button
            type="button"
            className="rounded-md bg-ocean px-4 py-2 text-sm font-semibold text-white disabled:cursor-not-allowed disabled:bg-stone-300"
            disabled={disabled || !selectedFile || loading}
            onClick={submit}
          >
            {loading ? 'Uploading...' : 'Analyze'}
          </button>
        </div>
        {selectedFile && (
          <p className="mt-4 text-sm font-medium text-stone-700">{selectedFile.name}</p>
        )}
        <input
          ref={inputRef}
          type="file"
          accept=".csv,.xls,.xlsx"
          className="hidden"
          onChange={(event) => chooseFile(event.target.files?.[0])}
        />
      </div>
    </section>
  );
}

export default FileUpload;
