'use client';

import { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '../ui/card';
import { Button } from '../ui/button';
import { Badge } from '../ui/badge';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '../ui/select';
import { Input } from '../ui/input';
import { Search, Trash2, Edit, Eye } from 'lucide-react';

interface MediaItem {
  id: string;
  title: string;
  description: string;
  alt: string;
  filename: string;
  originalName: string;
  mimeType: string;
  size: number;
  type: 'image' | 'video';
  category: string;
  url: string;
  createdAt: string;
  updatedAt: string;
}

export default function MediaGallery() {
  const [mediaItems, setMediaItems] = useState<MediaItem[]>([]);
  const [filteredItems, setFilteredItems] = useState<MediaItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [filterType, setFilterType] = useState<'all' | 'image' | 'video'>('all');
  const [filterCategory, setFilterCategory] = useState<string>('all');

  useEffect(() => {
    fetchMedia();
  }, []);

  useEffect(() => {
    filterMedia();
  }, [mediaItems, searchTerm, filterType, filterCategory]);

  const fetchMedia = async () => {
    try {
      const response = await fetch('/api/media');
      const result = await response.json();
      
      if (result.success) {
        setMediaItems(result.data);
      }
    } catch (error) {
      console.error('Error fetching media:', error);
    } finally {
      setLoading(false);
    }
  };

  const filterMedia = () => {
    let filtered = mediaItems;

    // Filter by search term
    if (searchTerm) {
      filtered = filtered.filter(item =>
        item.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
        item.description.toLowerCase().includes(searchTerm.toLowerCase()) ||
        item.category.toLowerCase().includes(searchTerm.toLowerCase())
      );
    }

    // Filter by type
    if (filterType !== 'all') {
      filtered = filtered.filter(item => item.type === filterType);
    }

    // Filter by category
    if (filterCategory !== 'all') {
      filtered = filtered.filter(item => item.category === filterCategory);
    }

    setFilteredItems(filtered);
  };

  const formatFileSize = (bytes: number) => {
    if (bytes === 0) return '0 Bytes';
    const k = 1024;
    const sizes = ['Bytes', 'KB', 'MB', 'GB'];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i];
  };

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString();
  };

  const getCategoryColor = (category: string) => {
    const colors: Record<string, string> = {
      general: 'bg-gray-100 text-gray-800',
      banner: 'bg-blue-100 text-blue-800',
      gallery: 'bg-green-100 text-green-800',
      news: 'bg-red-100 text-red-800',
      project: 'bg-purple-100 text-purple-800',
      team: 'bg-yellow-100 text-yellow-800',
      event: 'bg-pink-100 text-pink-800',
    };
    return colors[category] || colors.general;
  };

  if (loading) {
    return <div className="text-center py-8">Loading media...</div>;
  }

  return (
    <div className="space-y-6">
      {/* Filters */}
      <Card>
        <CardHeader>
          <CardTitle>Media Library</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="flex flex-col sm:flex-row gap-4">
            {/* Search */}
            <div className="flex-1">
              <div className="relative">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 h-4 w-4" />
                <Input
                  placeholder="Search media..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="pl-10"
                />
              </div>
            </div>

            {/* Type Filter */}
            <Select value={filterType} onValueChange={(value: any) => setFilterType(value)}>
              <SelectTrigger className="w-32">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Types</SelectItem>
                <SelectItem value="image">Images</SelectItem>
                <SelectItem value="video">Videos</SelectItem>
              </SelectContent>
            </Select>

            {/* Category Filter */}
            <Select value={filterCategory} onValueChange={setFilterCategory}>
              <SelectTrigger className="w-40">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Categories</SelectItem>
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
        </CardContent>
      </Card>

      {/* Media Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
        {filteredItems.map((item) => (
          <Card key={item.id} className="overflow-hidden">
            {/* Media Preview */}
            <div className="aspect-video bg-gray-100 relative">
              {item.type === 'video' ? (
                <video
                  src={item.url}
                  className="w-full h-full object-cover"
                  muted
                  controls
                />
              ) : (
                <img
                  src={item.url}
                  alt={item.alt}
                  className="w-full h-full object-cover"
                />
              )}
              
              {/* Type Badge */}
              <Badge
                className={`absolute top-2 right-2 ${
                  item.type === 'video' ? 'bg-red-500' : 'bg-blue-500'
                }`}
              >
                {item.type === 'video' ? 'Video' : 'Image'}
              </Badge>
            </div>

            {/* Media Info */}
            <CardContent className="p-4">
              <h3 className="font-semibold text-sm mb-1 truncate">{item.title}</h3>
              <p className="text-xs text-gray-500 mb-2 line-clamp-2">{item.description}</p>
              
              {/* Category Badge */}
              <Badge className={`mb-3 ${getCategoryColor(item.category)}`}>
                {item.category}
              </Badge>

              {/* Metadata */}
              <div className="text-xs text-gray-500 space-y-1">
                <div>Size: {formatFileSize(item.size)}</div>
                <div>Added: {formatDate(item.createdAt)}</div>
                <div className="truncate">File: {item.originalName}</div>
              </div>

              {/* Actions */}
              <div className="flex gap-2 mt-3">
                <Button size="sm" variant="outline" className="flex-1">
                  <Eye className="h-3 w-3 mr-1" />
                  View
                </Button>
                <Button size="sm" variant="outline">
                  <Edit className="h-3 w-3" />
                </Button>
                <Button size="sm" variant="outline">
                  <Trash2 className="h-3 w-3" />
                </Button>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>

      {/* Empty State */}
      {filteredItems.length === 0 && (
        <Card>
          <CardContent className="text-center py-8">
            <p className="text-gray-500">
              {searchTerm || filterType !== 'all' || filterCategory !== 'all'
                ? 'No media found matching your filters.'
                : 'No media uploaded yet.'}
            </p>
          </CardContent>
        </Card>
      )}

      {/* Stats */}
      <Card>
        <CardContent className="p-4">
          <div className="flex justify-between text-sm">
            <span>Total Media: {mediaItems.length}</span>
            <span>Images: {mediaItems.filter(item => item.type === 'image').length}</span>
            <span>Videos: {mediaItems.filter(item => item.type === 'video').length}</span>
            <span>Filtered: {filteredItems.length}</span>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
