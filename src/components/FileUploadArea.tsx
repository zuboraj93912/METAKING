import React, { useCallback, useState } from 'react';
import { Upload, FileImage } from 'lucide-react';
import { useApp } from '../context/AppContext';

export const FileUploadArea: React.FC = () => {
  const { addFiles, addToast } = useApp();
  const [isDragOver, setIsDragOver] = useState(false);

  const handleFiles = useCallback((files: FileList) => {
    const validFiles: File[] = [];
    const allowedTypes = ['.jpg', '.jpeg', '.png'];
    
    Array.from(files).forEach(file => {
      const extension = '.' + file.name.split('.').pop()?.toLowerCase();
      if (allowedTypes.includes(extension)) {
        validFiles.push(file);
      }
    });

    if (validFiles.length === 0) {
      addToast('error', 'No valid files selected. Please upload JPG or PNG files only.');
      return;
    }

    if (validFiles.length !== files.length) {
      addToast('warning', `${files.length - validFiles.length} files were skipped (only JPG and PNG files are supported).`);
    }

    addFiles(validFiles);
    addToast('success', `Successfully added ${validFiles.length} file(s).`);
  }, [addFiles, addToast]);

  const handleDrop = useCallback((e: React.DragEvent) => {
    e.preventDefault();
    setIsDragOver(false);
    handleFiles(e.dataTransfer.files);
  }, [handleFiles]);

  const handleDragOver = useCallback((e: React.DragEvent) => {
    e.preventDefault();
    setIsDragOver(true);
  }, []);

  const handleDragLeave = useCallback((e: React.DragEvent) => {
    e.preventDefault();
    setIsDragOver(false);
  }, []);

  const handleFileInput = useCallback((e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files) {
      handleFiles(e.target.files);
    }
  }, [handleFiles]);

  return (
    <div className="mb-6">
      <div className="bg-component rounded-xl p-8 shadow-lg border border-gray-200">
        <div
          onDrop={handleDrop}
          onDragOver={handleDragOver}
          onDragLeave={handleDragLeave}
          className={`relative border-2 border-dashed rounded-xl p-12 text-center transition-all duration-200 ${
            isDragOver
              ? 'border-primary-500 bg-primary-500/10'
              : 'border-gray-300 hover:border-primary-400'
          }`}
        >
          <input
            type="file"
            multiple
            accept=".jpg,.jpeg,.png"
            onChange={handleFileInput}
            className="absolute inset-0 w-full h-full opacity-0 cursor-pointer"
          />
          
          <div className="flex flex-col items-center gap-6">
            <div className="flex items-center gap-4">
              <Upload size={40} className="text-primary-500" />
              <FileImage size={36} className="text-gray-400" />
            </div>
            
            <div>
              <h3 className="text-2xl font-bold text-component-text mb-3">
                Upload JPG or PNG Files Only
              </h3>
              <p className="text-lg text-component-text/70">
                Generate tailored metadata for Adobe Stock, Shutterstock, and Freepik.
              </p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};