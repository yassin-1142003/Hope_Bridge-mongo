"use client";

import { useState, useEffect, useRef } from 'react';
import { CloudinaryService } from '@/lib/services/CloudinaryService';

interface CloudinaryConfig {
  cloudName: string;
  apiKey: string;
  apiSecret: string;
  uploadPreset: string;
}

interface VerificationResult {
  isConfigured: boolean;
  missingKeys: string[];
  configPresent: Record<string, string>;
  connectionTest: boolean;
  error: string | null;
}

interface UploadResult {
  id: string;
  name: string;
  originalName: string;
  type: string;
  size: number;
  url: string;
  uploadedAt: string;
  format: string;
  resourceType: string;
  cloudinaryData: {
    publicId: string;
    version: number;
    signature: string;
    folder: string;
  };
}

export default function CloudinaryVerificationPage() {
  const [verification, setVerification] = useState<VerificationResult | null>(null);
  const [uploading, setUploading] = useState(false);
  const [uploadResults, setUploadResults] = useState<UploadResult[]>([]);
  const [error, setError] = useState<string>('');
  const [testResults, setTestResults] = useState<string[]>([]);
  const fileInputRef = useRef<HTMLInputElement>(null);

  // Environment variables check
  const [envConfig, setEnvConfig] = useState<CloudinaryConfig>({
    cloudName: '',
    apiKey: '',
    apiSecret: '',
    uploadPreset: ''
  });

  useEffect(() => {
    checkEnvironmentVariables();
    runVerificationTests();
  }, []);

  const checkEnvironmentVariables = () => {
    setEnvConfig({
      cloudName: process.env.NEXT_PUBLIC_CLOUDINARY_CLOUD_NAME || '',
      apiKey: process.env.CLOUDINARY_API_KEY || '',
      apiSecret: process.env.CLOUDINARY_API_SECRET || '',
      uploadPreset: process.env.NEXT_PUBLIC_CLOUDINARY_UPLOAD_PRESET || ''
    });
  };

  const runVerificationTests = async () => {
    const tests: string[] = [];
    
    try {
      // Test 1: Check environment variables
      tests.push('🔍 Checking environment variables...');
      const hasCloudName = !!process.env.NEXT_PUBLIC_CLOUDINARY_CLOUD_NAME;
      const hasApiKey = !!process.env.CLOUDINARY_API_KEY;
      const hasApiSecret = !!process.env.CLOUDINARY_API_SECRET;
      const hasUploadPreset = !!process.env.NEXT_PUBLIC_CLOUDINARY_UPLOAD_PRESET;
      
      tests.push(`   Cloud Name: ${hasCloudName ? '✅' : '❌'} ${process.env.NEXT_PUBLIC_CLOUDINARY_CLOUD_NAME || 'Not set'}`);
      tests.push(`   API Key: ${hasApiKey ? '✅' : '❌'} ${hasApiKey ? 'Set (length: ' + process.env.CLOUDINARY_API_KEY!.length + ')' : 'Not set'}`);
      tests.push(`   API Secret: ${hasApiSecret ? '✅' : '❌'} ${hasApiSecret ? 'Set (length: ' + process.env.CLOUDINARY_API_SECRET!.length + ')' : 'Not set'}`);
      tests.push(`   Upload Preset: ${hasUploadPreset ? '✅' : '❌'} ${process.env.NEXT_PUBLIC_CLOUDINARY_UPLOAD_PRESET || 'Not set'}`);

      // Test 2: API Configuration Check
      tests.push('🔍 Testing Cloudinary API configuration...');
      const response = await fetch('/api/upload-enhanced', { method: 'GET' });
      const data = await response.json();
      
      if (data.success) {
        setVerification(data.verification);
        tests.push(`   Configuration: ${data.verification.isConfigured ? '✅ Complete' : '❌ Incomplete'}`);
        tests.push(`   Connection Test: ${data.verification.connectionTest ? '✅ Passed' : '❌ Failed'}`);
        
        if (data.verification.missingKeys.length > 0) {
          tests.push(`   Missing Keys: ${data.verification.missingKeys.join(', ')}`);
        }
        
        if (data.verification.error) {
          tests.push(`   Error: ${data.verification.error}`);
        }
      } else {
        tests.push(`   ❌ API check failed: ${data.message}`);
      }

      // Test 3: CloudinaryService instantiation
      tests.push('🔍 Testing CloudinaryService...');
      try {
        const cloudinaryService = new CloudinaryService();
        tests.push('   ✅ CloudinaryService instantiated successfully');
        
        // Test file validation
        const testFile = new File(['test'], 'test.jpg', { type: 'image/jpeg' });
        const validation = cloudinaryService.validateFile(testFile);
        tests.push(`   File Validation: ${validation.valid ? '✅ Working' : '❌ Failed'}`);
      } catch (err) {
        tests.push(`   ❌ CloudinaryService failed: ${err}`);
      }

      setTestResults(tests);
    } catch (error) {
      tests.push(`❌ Verification failed: ${error}`);
      setTestResults(tests);
    }
  };

  const handleFileUpload = async (files: FileList | null) => {
    if (!files || files.length === 0) return;

    setUploading(true);
    setError('');
    setUploadResults([]);

    try {
      const formData = new FormData();
      Array.from(files).forEach(file => {
        formData.append('files', file);
      });
      formData.append('folder', 'hope-bridge-verification');

      const response = await fetch('/api/upload-enhanced', {
        method: 'POST',
        body: formData
      });

      const data = await response.json();

      if (data.success) {
        setUploadResults(data.uploadedFiles);
        setVerification(data.verification);
      } else {
        setError(data.message || 'Upload failed');
        if (data.verification) {
          setVerification(data.verification);
        }
      }
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

  const getStatusColor = (status: boolean) => {
    return status ? 'text-green-600' : 'text-red-600';
  };

  return (
    <div className="min-h-screen bg-gray-50 p-8">
      <div className="max-w-6xl mx-auto">
        <h1 className="text-3xl font-bold text-gray-900 mb-8">Cloudinary + Multer Verification</h1>

        {/* Environment Variables Check */}
        <div className="bg-white rounded-lg shadow border border-gray-200 p-6 mb-6">
          <h2 className="text-xl font-bold text-gray-900 mb-4">📋 Environment Variables</h2>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <span className="font-medium">Cloud Name:</span>
              <span className={`ml-2 ${getStatusColor(!!envConfig.cloudName)}`}>
                {envConfig.cloudName ? '✅ Set' : '❌ Not set'}
              </span>
              {envConfig.cloudName && <span className="text-sm text-gray-500 ml-2">({envConfig.cloudName})</span>}
            </div>
            <div>
              <span className="font-medium">API Key:</span>
              <span className={`ml-2 ${getStatusColor(!!envConfig.apiKey)}`}>
                {envConfig.apiKey ? '✅ Set' : '❌ Not set'}
              </span>
              {envConfig.apiKey && <span className="text-sm text-gray-500 ml-2">(length: {envConfig.apiKey.length})</span>}
            </div>
            <div>
              <span className="font-medium">API Secret:</span>
              <span className={`ml-2 ${getStatusColor(!!envConfig.apiSecret)}`}>
                {envConfig.apiSecret ? '✅ Set' : '❌ Not set'}
              </span>
              {envConfig.apiSecret && <span className="text-sm text-gray-500 ml-2">(length: {envConfig.apiSecret.length})</span>}
            </div>
            <div>
              <span className="font-medium">Upload Preset:</span>
              <span className={`ml-2 ${getStatusColor(!!envConfig.uploadPreset)}`}>
                {envConfig.uploadPreset ? '✅ Set' : '❌ Not set'}
              </span>
              {envConfig.uploadPreset && <span className="text-sm text-gray-500 ml-2">({envConfig.uploadPreset})</span>}
            </div>
          </div>
        </div>

        {/* Verification Results */}
        <div className="bg-white rounded-lg shadow border border-gray-200 p-6 mb-6">
          <h2 className="text-xl font-bold text-gray-900 mb-4">🔍 Verification Tests</h2>
          <div className="space-y-2">
            {testResults.map((test, index) => (
              <div key={index} className="font-mono text-sm">
                {test}
              </div>
            ))}
          </div>
          {testResults.length === 0 && (
            <p className="text-gray-500">Running verification tests...</p>
          )}
        </div>

        {/* Configuration Status */}
        {verification && (
          <div className="bg-white rounded-lg shadow border border-gray-200 p-6 mb-6">
            <h2 className="text-xl font-bold text-gray-900 mb-4">⚙️ Configuration Status</h2>
            <div className="space-y-3">
              <div className="flex items-center">
                <span className="font-medium mr-2">Overall Status:</span>
                <span className={`font-bold ${getStatusColor(verification.isConfigured)}`}>
                  {verification.isConfigured ? '✅ Configured' : '❌ Not Configured'}
                </span>
              </div>
              <div className="flex items-center">
                <span className="font-medium mr-2">Connection Test:</span>
                <span className={`font-bold ${getStatusColor(verification.connectionTest)}`}>
                  {verification.connectionTest ? '✅ Connected' : '❌ Failed'}
                </span>
              </div>
              {verification.error && (
                <div className="bg-red-50 border border-red-200 rounded p-3">
                  <span className="text-red-700">Error: {verification.error}</span>
                </div>
              )}
              {verification.missingKeys.length > 0 && (
                <div className="bg-yellow-50 border border-yellow-200 rounded p-3">
                  <span className="text-yellow-700">Missing: {verification.missingKeys.join(', ')}</span>
                </div>
              )}
            </div>
          </div>
        )}

        {/* Upload Test */}
        <div className="bg-white rounded-lg shadow border border-gray-200 p-6 mb-6">
          <h2 className="text-xl font-bold text-gray-900 mb-4">📤 Upload Test (Multer + Cloudinary)</h2>
          
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
                Test Multer + Cloudinary integration (max 100MB)
              </p>
            </div>
            <input
              ref={fileInputRef}
              type="file"
              multiple
              accept="image/*,video/*,.pdf,.doc,.docx,.txt"
              onChange={(e) => handleFileUpload(e.target.files)}
              className="hidden"
              aria-label="Select files for Multer + Cloudinary test"
              title="Select files for Multer + Cloudinary test"
            />
          </div>

          {/* Upload Status */}
          {uploading && (
            <div className="mt-6 p-4 bg-blue-50 border border-blue-200 rounded-lg">
              <p className="text-blue-700 font-medium">Uploading with Multer + Cloudinary...</p>
            </div>
          )}

          {/* Error Display */}
          {error && (
            <div className="mt-6 p-4 bg-red-50 border border-red-200 rounded-lg">
              <p className="text-red-700 font-medium">Error: {error}</p>
            </div>
          )}

          {/* Results Display */}
          {uploadResults.length > 0 && (
            <div className="mt-8">
              <h3 className="text-lg font-bold text-gray-900 mb-4">Upload Results ({uploadResults.length})</h3>
              <div className="space-y-4">
                {uploadResults.map((result, index) => (
                  <div key={index} className="bg-gray-50 p-4 rounded-lg">
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      <div>
                        <h4 className="font-medium text-gray-900">File Details</h4>
                        <p className="text-sm text-gray-600">Name: {result.name}</p>
                        <p className="text-sm text-gray-600">Size: {(result.size / 1024 / 1024).toFixed(2)} MB</p>
                        <p className="text-sm text-gray-600">Type: {result.type}</p>
                        <p className="text-sm text-gray-600">Resource: {result.resourceType}</p>
                      </div>
                      <div>
                        <h4 className="font-medium text-gray-900">Cloudinary Details</h4>
                        <p className="text-sm text-gray-600 truncate">
                          URL: <a href={result.url} target="_blank" rel="noopener noreferrer" className="text-blue-600 hover:underline">{result.url}</a>
                        </p>
                        <p className="text-sm text-gray-600">Public ID: {result.cloudinaryData.publicId}</p>
                        <p className="text-sm text-gray-600">Folder: {result.cloudinaryData.folder}</p>
                        <p className="text-sm text-gray-600">Version: {result.cloudinaryData.version}</p>
                      </div>
                    </div>
                    
                    {/* Preview */}
                    {result.resourceType === 'image' && (
                      <div className="mt-4">
                        <img 
                          src={result.url} 
                          alt={result.name}
                          className="max-w-full h-48 object-cover rounded"
                        />
                      </div>
                    )}
                    
                    {result.resourceType === 'video' && (
                      <div className="mt-4">
                        <video 
                          src={result.url} 
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
        </div>

        {/* Action Buttons */}
        <div className="flex gap-4">
          <button
            onClick={runVerificationTests}
            className="px-6 py-2 bg-blue-500 text-white rounded-lg hover:bg-blue-600 transition-colors"
          >
            🔄 Re-run Verification
          </button>
          <button
            onClick={() => window.open('https://cloudinary.com/console', '_blank')}
            className="px-6 py-2 bg-purple-500 text-white rounded-lg hover:bg-purple-600 transition-colors"
          >
            🌐 Open Cloudinary Dashboard
          </button>
        </div>
      </div>
    </div>
  );
}
