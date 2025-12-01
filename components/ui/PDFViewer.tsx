'use client';

import React, { useState, useEffect } from 'react';
import { 
  FileText, 
  Download, 
  Eye, 
  EyeOff, 
  Maximize2, 
  Minimize2, 
  RotateCw, 
  ZoomIn, 
  ZoomOut,
  X,
  Loader2
} from 'lucide-react';
import '../../styles/pdf-viewer.css';

interface PDFViewerProps {
  url: string;
  title: string;
  className?: string;
  showControls?: boolean;
  allowDownload?: boolean;
}

const PDFViewer: React.FC<PDFViewerProps> = ({
  url,
  title,
  className = '',
  showControls = true,
  allowDownload = true
}) => {
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [isFullscreen, setIsFullscreen] = useState(false);
  const [zoom, setZoom] = useState(100);
  const [rotation, setRotation] = useState(0);

  useEffect(() => {
    setIsLoading(true);
    setError(null);
  }, [url]);

  const handleLoad = () => {
    setIsLoading(false);
  };

  const handleError = () => {
    setIsLoading(false);
    setError('Failed to load PDF');
  };

  const handleZoomIn = () => {
    setZoom(prev => Math.min(prev + 25, 200));
  };

  const handleZoomOut = () => {
    setZoom(prev => Math.max(prev - 25, 50));
  };

  const handleRotate = () => {
    setRotation(prev => (prev + 90) % 360);
  };

  const handleDownload = async () => {
    try {
      const response = await fetch(url);
      const blob = await response.blob();
      const downloadUrl = window.URL.createObjectURL(blob);
      const link = document.createElement('a');
      link.href = downloadUrl;
      link.download = title;
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
      window.URL.revokeObjectURL(downloadUrl);
    } catch (err) {
      console.error('Download failed:', err);
      setError('Failed to download PDF');
    }
  };

  const toggleFullscreen = () => {
    setIsFullscreen(!isFullscreen);
  };

  return (
    <div className={`relative bg-gray-50 rounded-lg border border-gray-200 ${className}`}>
      {/* Header */}
      <div className="pdf-header flex items-center justify-between p-4">
        <div className="pdf-title-container">
          <FileText className="w-5 h-5 text-gray-600" />
          <h3 className="pdf-title">{title}</h3>
        </div>
        
        {showControls && (
          <div className="pdf-controls">
            {/* Zoom Controls */}
            <div className="pdf-zoom-controls">
              <button
                onClick={handleZoomOut}
                className="pdf-control-button"
                title="Zoom out"
                aria-label="Zoom out"
              >
                <ZoomOut className="w-4 h-4 text-gray-600" />
              </button>
              <span className="pdf-zoom-display">
                {zoom}%
              </span>
              <button
                onClick={handleZoomIn}
                className="pdf-control-button"
                title="Zoom in"
                aria-label="Zoom in"
              >
                <ZoomIn className="w-4 h-4 text-gray-600" />
              </button>
            </div>

            {/* Rotation */}
            <button
              onClick={handleRotate}
              className="pdf-control-button"
              title="Rotate PDF"
              aria-label="Rotate PDF"
            >
              <RotateCw className="w-4 h-4 text-gray-600" />
            </button>

            {/* Fullscreen */}
            <button
              onClick={toggleFullscreen}
              className="pdf-control-button"
              title={isFullscreen ? "Exit fullscreen" : "Enter fullscreen"}
              aria-label={isFullscreen ? "Exit fullscreen" : "Enter fullscreen"}
            >
              {isFullscreen ? (
                <Minimize2 className="w-4 h-4 text-gray-600" />
              ) : (
                <Maximize2 className="w-4 h-4 text-gray-600" />
              )}
            </button>

            {/* Download */}
            {allowDownload && (
              <button
                onClick={handleDownload}
                className="pdf-control-button"
                title="Download PDF"
                aria-label="Download PDF"
              >
                <Download className="w-4 h-4 text-gray-600" />
              </button>
            )}
          </div>
        )}
      </div>

      {/* PDF Content */}
      <div 
        className={`pdf-content overflow-auto bg-gray-100 ${
          isFullscreen ? 'pdf-content-fullscreen' : 'pdf-content-default'
        }`}
      >
        {isLoading && (
          <div className="pdf-loading">
            <div className="flex flex-col items-center gap-3">
              <Loader2 className="w-8 h-8 text-blue-600 animate-spin" />
              <p className="text-sm text-gray-600">Loading PDF...</p>
            </div>
          </div>
        )}

        {error && (
          <div className="pdf-error">
            <div className="flex flex-col items-center gap-3 text-center p-6">
              <FileText className="w-12 h-12 text-gray-400" />
              <div>
                <p className="text-sm font-medium text-gray-900">Failed to load PDF</p>
                <p className="text-xs text-gray-600 mt-1">{error}</p>
              </div>
              <button
                onClick={() => window.location.reload()}
                className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors text-sm"
              >
                Try Again
              </button>
            </div>
          </div>
        )}

        {/* PDF Iframe */}
        <iframe
          src={url}
          title={title}
          className="w-full h-full border-0 pdf-container"
          onLoad={handleLoad}
          onError={handleError}
        />

        {/* Fullscreen Close Button */}
        {isFullscreen && (
          <button
            onClick={toggleFullscreen}
            className="pdf-fullscreen-close"
            title="Exit fullscreen"
            aria-label="Exit fullscreen"
          >
            <X className="w-5 h-5 text-gray-600" />
          </button>
        )}
      </div>
    </div>
  );
};

export default PDFViewer;
