import { useState, useRef, useCallback } from 'react';
import { motion, AnimatePresence } from 'framer-motion';

export default function FileUpload({ onUpload, isLoading }) {
  const [isDragging, setIsDragging] = useState(false);
  const [preview, setPreview] = useState(null);
  const fileInputRef = useRef(null);

  const handleFile = useCallback((file) => {
    if (!file || !file.type.startsWith('image/')) return;
    const reader = new FileReader();
    reader.onload = (e) => setPreview(e.target.result);
    reader.readAsDataURL(file);
    if (onUpload) onUpload(file);
  }, [onUpload]);

  const handleDrop = useCallback((e) => {
    e.preventDefault();
    setIsDragging(false);
    handleFile(e.dataTransfer.files[0]);
  }, [handleFile]);

  const clearPreview = () => {
    setPreview(null);
    if (fileInputRef.current) fileInputRef.current.value = '';
  };

  return (
    <div className="w-full">
      <input ref={fileInputRef} type="file" accept="image/*" onChange={(e) => handleFile(e.target.files[0])} className="hidden" id="file-upload-input" aria-label="Upload an image" />
      <AnimatePresence mode="wait">
        {preview ? (
          <motion.div key="preview" initial={{ opacity: 0, scale: 0.95 }} animate={{ opacity: 1, scale: 1 }} exit={{ opacity: 0, scale: 0.95 }} className="relative glass rounded-2xl overflow-hidden">
            <img src={preview} alt="Uploaded preview" className="w-full max-h-64 object-contain bg-black/20 rounded-t-2xl" />
            <div className="p-3 flex items-center justify-between">
              <span className="text-sm text-surface-200">{isLoading ? 'Analyzing...' : 'Image uploaded'}</span>
              <button onClick={clearPreview} className="text-xs text-danger-400 hover:text-danger-300 px-3 py-1 rounded-lg hover:bg-danger-500/10 transition-colors" disabled={isLoading} aria-label="Remove uploaded image">Remove</button>
            </div>
            {isLoading && <div className="absolute inset-0 bg-surface-950/50 flex items-center justify-center"><div className="w-8 h-8 border-3 border-primary-400/30 border-t-primary-400 rounded-full animate-spin" /></div>}
          </motion.div>
        ) : (
          <motion.button key="dropzone" onClick={() => fileInputRef.current?.click()} onDrop={handleDrop} onDragOver={(e) => { e.preventDefault(); setIsDragging(true); }} onDragLeave={() => setIsDragging(false)} initial={{ opacity: 0 }} animate={{ opacity: 1 }} className={`w-full py-12 px-6 rounded-2xl border-2 border-dashed transition-all cursor-pointer flex flex-col items-center gap-3 ${isDragging ? 'border-primary-400 bg-primary-500/10' : 'border-surface-700 hover:border-primary-500/50 hover:bg-white/[0.02]'}`} type="button" aria-label="Click or drag to upload an image" id="file-dropzone">
            <div className="w-14 h-14 rounded-2xl bg-primary-500/10 flex items-center justify-center text-2xl">📸</div>
            <p className="text-sm font-medium text-surface-50">Drop an image here or click to upload</p>
            <p className="text-xs text-surface-200">Voter slip, election notice, WhatsApp screenshot, etc.</p>
          </motion.button>
        )}
      </AnimatePresence>
    </div>
  );
}
