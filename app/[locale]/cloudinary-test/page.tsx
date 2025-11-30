"use client";

import { useState, useRef } from 'react';
import { CloudinaryService } from '@/lib/services/CloudinaryService';

export default function CloudinaryTestPage() {
  const [uploading, setUploading] = useState(false);
  const [results, setResults] = useState<any[]>([]);
  const [error, setError] = useState<string>('');
  const fileInputRef = useRef<HTMLInputElement>(null);

  const handleFileUpload = async (files: FileList | null) => {
    if (!files || files.length === 0) return;

    setUploading(true);
    setError('');
    setResults([]);

    try {
      const cloudinaryService = new CloudinaryService();
      const uploadPromises = Array.from(files).map(file => 
        cloudinaryService.uploadFile(file, 'hope-bridge-test')
      );

      const uploadResults = await Promise.all(uploadPromises);
      setResults(uploadResults);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Upload failed');
    } finally {
      setUploading(false);
    }
  };

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    handleFileUpload(e.dataTransfer.files);
  };

  const handleDragOver = (e: React.DragEvent) => {
    e.preventDefault();
  };

  return (
    <div className="min-h-screen bg-gray-50 p-8">
      <div className="max-w-4xl mx-auto">
        <h1 className="text-3xl font-bold text-gray-900 mb-8">Cloudinary Integration Test</h1>

        {/* Upload Area */}
        <div
          onDrop={handleDrop}
          onDragOver={handleDragOver}
          className="border-2 border-dashed border-gray-300 rounded-lg p-8 text-center hover:border-gray-400 transition-colors cursor-pointer"
          onClick={() => fileInputRef.current?.click()}
        >
          <div className="space-y-4">
            <div className="text-4xl">☁️</div>
            <p className="text-lg font-medium text-gray-700">
              Drag & drop files here or click to select
            </p>
            <p className="text-sm text-gray-500">
              Supports images, videos, and documents (max 100MB)
            </p>
          </div>
          <input
            ref={fileInputRef}
            type="file"
            multiple
            accept="image/*,video/*,.pdf,.doc,.docx,.txt"
            onChange={(e) => handleFileUpload(e.target.files)}
            className="hidden"
            aria-label="Select files for Cloudinary upload"
            title="Select files for Cloudinary upload"
          />
        </div>

        {/* Upload Status */}
        {uploading && (
          <div className="mt-6 p-4 bg-blue-50 border border-blue-200 rounded-lg">
            <p className="text-blue-700 font-medium">Uploading files to Cloudinary...</p>
          </div>
        )}

        {/* Error Display */}
        {error && (
          <div className="mt-6 p-4 bg-red-50 border border-red-200 rounded-lg">
            <p className="text-red-700 font-medium">Error: {error}</p>
          </div>
        )}

        {/* Results Display */}
        {results.length > 0 && (
          <div className="mt-8">
            <h2 className="text-xl font-bold text-gray-900 mb-4">Upload Results ({results.length})</h2>
            <div className="space-y-4">
              {results.map((result, index) => (
                <div key={index} className="bg-white p-4 rounded-lg shadow border border-gray-200">
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div>
                      <h3 className="font-medium text-gray-900">File Details</h3>
                      <p className="text-sm text-gray-600">Name: {result.original_filename}</p>
                      <p className="text-sm text-gray-600">Size: {(result.bytes / 1024 / 1024).toFixed(2)} MB</p>
                      <p className="text-sm text-gray-600">Type: {result.resource_type}</p>
                      <p className="text-sm text-gray-600">Format: {result.format}</p>
                    </div>
                    <div>
                      <h3 className="font-medium text-gray-900">Cloudinary URLs</h3>
                      <p className="text-sm text-gray-600 truncate">
                        URL: <a href={result.secure_url} target="_blank" rel="noopener noreferrer" className="text-blue-600 hover:underline">{result.secure_url}</a>
                      </p>
                      <p className="text-sm text-gray-600">Public ID: {result.public_id}</p>
                    </div>
                  </div>
                  
                  {/* Preview */}
                  {result.resource_type === 'image' && (
                    <div className="mt-4">
                      <img 
                        src={result.secure_url} 
                        alt={result.original_filename}
                        className="max-w-full h-48 object-cover rounded"
                      />
                    </div>
                  )}
                  
                  {result.resource_type === 'video' && (
                    <div className="mt-4">
                      <video 
                        src={result.secure_url} 
                        controls
                        className="max-w-full h-48 rounded"
                      >
                        Your browser does not support the video tag.
                      </video>
                    </div>
                  )}
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Configuration Check */}
        <div className="mt-8 p-4 bg-gray-100 rounded-lg">
          <h3 className="font-medium text-gray-900 mb-2">Configuration Check</h3>
          <div className="space-y-1 text-sm text-gray-600">
            <p>Cloud Name: {process.env.NEXT_PUBLIC_CLOUDINARY_CLOUD_NAME || 'Not configured'}</p>
            <p>API Key: {process.env.CLOUDINARY_API_KEY ? '✅ Configured' : '❌ Not configured'}</p>
            <p>API Secret: {process.env.CLOUDINARY_API_SECRET ? '✅ Configured' : '❌ Not configured'}</p>
            <p>Upload Preset: {process.env.NEXT_PUBLIC_CLOUDINARY_UPLOAD_PRESET || 'Not configured'}</p>
          </div>
        </div>
      </div>
    </div>
  );
}
