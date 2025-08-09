import React from 'react';
import { FileCard } from './FileCard';
import { useApp } from '../context/AppContext';
import { Upload, FileImage } from 'lucide-react';

export const FileGrid: React.FC = () => {
  const { files } = useApp();

  if (files.length === 0) {
    return (
      <div className="text-center py-16">
        <div className="flex justify-center gap-3 mb-6">
          <Upload size={40} className="text-gray-400" />
          <FileImage size={36} className="text-gray-400" />
        </div>
        <h3 className="text-2xl font-bold text-page-text mb-3">
          No files uploaded yet
        </h3>
        <p className="text-lg text-page-text/70">
          Upload your JPG or PNG files to get started with metadata generation.
        </p>
      </div>
    );
  }

  return (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6" style={{ minWidth: '270px' }}>
      {files.map((file) => (
        <FileCard key={file.id} file={file} />
      ))}
    </div>
  );
};