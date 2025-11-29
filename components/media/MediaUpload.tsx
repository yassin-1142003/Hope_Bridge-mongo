'use client';

import { useState, useRef } from 'react';
import { Button } from '../ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '../ui/card';
import { Input } from '../ui/input';
import { Label } from '../ui/label';
import { Textarea } from '../ui/textarea';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '../ui/select';

interface MediaUploadProps {
  onUploadSuccess?: (media: any) => void;
}

export default function MediaUpload({ onUploadSuccess }: MediaUploadProps) {
  const [file, setFile] = useState<File | null>(null);
  const [title, setTitle] = useState('');
  const [description, setDescription] = useState('');
  const [alt, setAlt] = useState('');
  const [category, setCategory] = useState('general');
  const [uploading, setUploading] = useState(false);
  const [preview, setPreview] = useState<string | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const selectedFile = e.target.files?.[0];
    if (selectedFile) {
      setFile(selectedFile);
      setTitle(selectedFile.name.split('.')[0]);
      setAlt(selectedFile.name.split('.')[0]);
      
      // Create preview
      const reader = new FileReader();
      reader.onload = (e) => {
        setPreview(e.target?.result as string);
      };
      reader.readAsDataURL(selectedFile);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!file) return;

    setUploading(true);
    const formData = new FormData();
    formData.append('file', file);
    formData.append('title', title);
    formData.append('description', description);
    formData.append('alt', alt);
    formData.append('category', category);

    try {
      const response = await fetch('/api/media', {
        method: 'POST',
        body: formData,
      });

      const result = await response.json();

      if (result.success) {
        // Reset form
        setFile(null);
        setTitle('');
        setDescription('');
        setAlt('');
        setCategory('general');
        setPreview(null);
        if (fileInputRef.current) {
          fileInputRef.current.value = '';
        }

        onUploadSuccess?.(result.data);
        alert('Media uploaded successfully!');
      } else {
        alert(`Upload failed: ${result.error}`);
      }
    } catch (error) {
      alert('Upload failed. Please try again.');
      console.error('Upload error:', error);
    } finally {
      setUploading(false);
    }
  };

  const isVideo = file?.type.startsWith('video/');
  const isImage = file?.type.startsWith('image/');

  return (
    <Card className="w-full max-w-2xl mx-auto">
      <CardHeader>
        <CardTitle>Upload Media File</CardTitle>
      </CardHeader>
      <CardContent>
        <form onSubmit={handleSubmit} className="space-y-4">
          {/* File Upload */}
          <div>
            <Label htmlFor="file">Choose File</Label>
            <Input
              ref={fileInputRef}
              id="file"
              type="file"
              accept="image/*,video/*"
              onChange={handleFileChange}
              required
            />
            <p className="text-sm text-gray-500 mt-1">
              Supports images (JPG, PNG, GIF, WebP) and videos (MP4, WebM, MOV)
            </p>
          </div>

          {/* Preview */}
          {preview && (
            <div>
              <Label>Preview</Label>
              <div className="mt-2 border rounded-lg overflow-hidden">
                {isVideo ? (
                  <video
                    src={preview}
                    controls
                    className="w-full max-h-64 object-contain"
                  />
                ) : (
                  <img
                    src={preview}
                    alt="Preview"
                    className="w-full max-h-64 object-contain"
                  />
                )}
              </div>
            </div>
          )}

          {/* Title */}
          <div>
            <Label htmlFor="title">Title</Label>
            <Input
              id="title"
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              placeholder="Enter media title"
              required
            />
          </div>

          {/* Description */}
          <div>
            <Label htmlFor="description">Description</Label>
            <Textarea
              id="description"
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              placeholder="Enter media description"
              rows={3}
            />
          </div>

          {/* Alt Text */}
          <div>
            <Label htmlFor="alt">Alt Text (for images)</Label>
            <Input
              id="alt"
              value={alt}
              onChange={(e) => setAlt(e.target.value)}
              placeholder="Describe the image for accessibility"
            />
          </div>

          {/* Category */}
          <div>
            <Label htmlFor="category">Category</Label>
            <Select value={category} onValueChange={setCategory}>
              <SelectTrigger>
                <SelectValue placeholder="Select category" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="general">General</SelectItem>
                <SelectItem value="banner">Banner</SelectItem>
                <SelectItem value="gallery">Gallery</SelectItem>
                <SelectItem value="news">News</SelectItem>
                <SelectItem value="project">Project</SelectItem>
                <SelectItem value="team">Team</SelectItem>
                <SelectItem value="event">Event</SelectItem>
              </SelectContent>
            </Select>
          </div>

          {/* Submit Button */}
          <Button
            type="submit"
            disabled={!file || uploading}
            className="w-full"
          >
            {uploading ? 'Uploading...' : `Upload ${isVideo ? 'Video' : 'Image'}`}
          </Button>
        </form>
      </CardContent>
    </Card>
  );
}
