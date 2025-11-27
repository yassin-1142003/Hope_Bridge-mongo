'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { useAuth } from '@/hooks/useAuth';

interface PostFormData {
  title: string;
  slug: string;
  category: string;
  status: 'draft' | 'published';
  contents: Array<{
    type: 'text';
    data: string;
    order: number;
  }>;
  images: string[];
  videos: string[];
}

interface Post {
  _id: string;
  category: string;
  contents: Array<{
    language_code: string;
    name: string;
    description: string;
    content: string;
  }>;
  images: string[];
  videos: string[];
  status: string;
  slug?: string;
  createdAt: string;
  updatedAt: string;
}

export default function AdminEditPost() {
  const router = useRouter();
  const { user, token } = useAuth();
  const [loading, setLoading] = useState(false);
  const [fetchLoading, setFetchLoading] = useState(true);
  const [post, setPost] = useState<Post | null>(null);
  const [formData, setFormData] = useState<PostFormData>({
    title: '',
    slug: '',
    category: 'general',
    status: 'draft',
    contents: [],
    images: [],
    videos: []
  });

  useEffect(() => {
    if (!user || user.role !== 'ADMIN') {
      router.push('/login');
      return;
    }

    const postId = window.location.pathname.split('/')[3];
    if (postId) {
      fetchPost(postId);
    }
  }, [user, router]);

  const fetchPost = async (postId: string) => {
    try {
      const response = await fetch(`/api/posts/${postId}`, {
        headers: {
          'Authorization': `Bearer ${token}`
        }
      });
      
      if (response.ok) {
        const data = await response.json();
        const postData = data.data;
        setPost(postData);
        
        // Extract English content or first available content
        const englishContent = postData.contents.find((c: any) => c.language_code === 'en') || postData.contents[0];
        
        if (englishContent) {
          setFormData({
            title: englishContent.name || '',
            slug: postData.slug || '',
            category: postData.category || 'general',
            status: postData.status || 'draft',
            contents: [{
              type: 'text',
              data: englishContent.content || '',
              order: 0
            }],
            images: postData.images || [],
            videos: postData.videos || []
          });
        }
      } else {
        alert('Failed to fetch post');
        router.push('/admin/posts');
      }
    } catch (error) {
      console.error('Failed to fetch post:', error);
      alert('Failed to fetch post');
      router.push('/admin/posts');
    } finally {
      setFetchLoading(false);
    }
  };

  const generateSlug = (title: string) => {
    return title
      .toLowerCase()
      .replace(/[^a-z0-9 -]/g, '')
      .replace(/\s+/g, '-')
      .replace(/-+/g, '-')
      .trim();
  };

  const handleTitleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const title = e.target.value;
    setFormData(prev => ({
      ...prev,
      title,
      slug: generateSlug(title)
    }));
  };

  const addContent = (type: 'text') => {
    const newContent = {
      type,
      data: '',
      order: formData.contents.length
    };
    setFormData(prev => ({
      ...prev,
      contents: [...prev.contents, newContent]
    }));
  };

  const addImage = () => {
    const imageUrl = prompt('Enter image URL:');
    if (imageUrl) {
      setFormData(prev => ({
        ...prev,
        images: [...prev.images, imageUrl]
      }));
    }
  };

  const addVideo = () => {
    const videoUrl = prompt('Enter video URL:');
    if (videoUrl) {
      setFormData(prev => ({
        ...prev,
        videos: [...prev.videos, videoUrl]
      }));
    }
  };

  const updateContent = (index: number, data: string) => {
    setFormData(prev => ({
      ...prev,
      contents: prev.contents.map((content, i) => 
        i === index ? { ...content, data } : content
      )
    }));
  };

  const removeContent = (index: number) => {
    setFormData(prev => ({
      ...prev,
      contents: prev.contents.filter((_, i) => i !== index)
    }));
  };

  const removeImage = (index: number) => {
    setFormData(prev => ({
      ...prev,
      images: prev.images.filter((_, i) => i !== index)
    }));
  };

  const removeVideo = (index: number) => {
    setFormData(prev => ({
      ...prev,
      videos: prev.videos.filter((_, i) => i !== index)
    }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!formData.title.trim()) {
      alert('Please enter a title');
      return;
    }

    if (!post) return;

    setLoading(true);

    try {
      const postId = post._id;
      
      // Prepare post data for backend
      const postData = {
        category: formData.category,
        contents: [{
          language_code: 'en',
          name: formData.title,
          description: '',
          content: formData.contents.map(c => c.data).join('\n\n')
        }],
        images: formData.images,
        videos: formData.videos,
        status: formData.status,
        slug: formData.slug
      };

      const response = await fetch(`/api/posts/${postId}`, {
        method: 'PATCH',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify(postData)
      });

      if (response.ok) {
        router.push('/admin/posts');
      } else {
        const error = await response.json();
        alert(error.error || 'Failed to update post');
      }
    } catch (error) {
      console.error('Failed to update post:', error);
      alert('Failed to update post');
    } finally {
      setLoading(false);
    }
  };

  if (fetchLoading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="animate-spin rounded-full h-32 w-32 border-b-2 border-blue-600"></div>
      </div>
    );
  }

  if (!post) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <h2 className="text-2xl font-bold text-gray-900 mb-4">Post Not Found</h2>
          <button
            onClick={() => router.push('/admin/posts')}
            className="bg-blue-600 text-white px-4 py-2 rounded-md hover:bg-blue-700"
          >
            Back to Posts
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <header className="bg-white shadow-sm border-b">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center h-16">
            <div className="flex items-center">
              <button
                onClick={() => router.push('/admin/posts')}
                className="mr-4 text-gray-500 hover:text-gray-700"
              >
                ← Back to Posts
              </button>
              <h1 className="text-2xl font-bold text-gray-900">Edit Post</h1>
            </div>
          </div>
        </div>
      </header>

      {/* Main Content */}
      <main className="max-w-4xl mx-auto py-6 sm:px-6 lg:px-8">
        <form onSubmit={handleSubmit} className="space-y-6">
          {/* Basic Information */}
          <div className="bg-white shadow rounded-lg p-6">
            <h2 className="text-lg font-medium text-gray-900 mb-4">Basic Information</h2>
            
            <div className="grid grid-cols-1 gap-6">
              <div>
                <label htmlFor="title" className="block text-sm font-medium text-gray-700">
                  Title *
                </label>
                <input
                  type="text"
                  id="title"
                  value={formData.title}
                  onChange={handleTitleChange}
                  className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-blue-500 focus:border-blue-500"
                  placeholder="Enter post title"
                  required
                />
              </div>

              <div>
                <label htmlFor="slug" className="block text-sm font-medium text-gray-700">
                  Slug
                </label>
                <input
                  type="text"
                  id="slug"
                  value={formData.slug}
                  onChange={(e) => setFormData(prev => ({ ...prev, slug: e.target.value }))}
                  className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-blue-500 focus:border-blue-500"
                  placeholder="post-url-slug"
                />
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label htmlFor="category" className="block text-sm font-medium text-gray-700">
                    Category
                  </label>
                  <select
                    id="category"
                    value={formData.category}
                    onChange={(e) => setFormData(prev => ({ ...prev, category: e.target.value }))}
                    className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-blue-500 focus:border-blue-500"
                  >
                    <option value="general">General</option>
                    <option value="announcement">Announcement</option>
                    <option value="project-update">Project Update</option>
                    <option value="success-story">Success Story</option>
                    <option value="impact-report">Impact Report</option>
                    <option value="event">Event</option>
                  </select>
                </div>

                <div>
                  <label htmlFor="status" className="block text-sm font-medium text-gray-700">
                    Status
                  </label>
                  <select
                    id="status"
                    value={formData.status}
                    onChange={(e) => setFormData(prev => ({ ...prev, status: e.target.value as 'draft' | 'published' }))}
                    className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-blue-500 focus:border-blue-500"
                  >
                    <option value="draft">Draft</option>
                    <option value="published">Published</option>
                  </select>
                </div>
              </div>
            </div>
          </div>

          {/* Content */}
          <div className="bg-white shadow rounded-lg p-6">
            <div className="flex justify-between items-center mb-4">
              <h2 className="text-lg font-medium text-gray-900">Content</h2>
              <button
                type="button"
                onClick={() => addContent('text')}
                className="px-3 py-1 text-sm bg-gray-200 text-gray-700 rounded hover:bg-gray-300"
              >
                + Add Text Section
              </button>
            </div>

            <div className="space-y-4 mb-6">
              {formData.contents.map((content, index) => (
                <div key={index} className="border rounded-lg p-4">
                  <div className="flex justify-between items-center mb-2">
                    <span className="text-sm font-medium text-gray-700">
                      Text Content {index + 1}
                    </span>
                    <button
                      type="button"
                      onClick={() => removeContent(index)}
                      className="text-red-600 hover:text-red-800 text-sm"
                    >
                      Remove
                    </button>
                  </div>
                  
                  <textarea
                    value={content.data}
                    onChange={(e) => updateContent(index, e.target.value)}
                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-blue-500 focus:border-blue-500"
                    rows={4}
                    placeholder="Enter text content..."
                  />
                </div>
              ))}

              {formData.contents.length === 0 && (
                <div className="text-center py-8 text-gray-500">
                  No text content added yet. Click the button above to add text sections.
                </div>
              )}
            </div>

            {/* Images Section */}
            <div className="border-t pt-6">
              <div className="flex justify-between items-center mb-4">
                <h3 className="text-lg font-medium text-gray-900">Images</h3>
                <button
                  type="button"
                  onClick={addImage}
                  className="px-3 py-1 text-sm bg-blue-200 text-blue-700 rounded hover:bg-blue-300"
                >
                  + Add Image
                </button>
              </div>

              <div className="space-y-4">
                {formData.images.map((imageUrl, index) => (
                  <div key={index} className="border rounded-lg p-4">
                    <div className="flex justify-between items-center mb-2">
                      <span className="text-sm font-medium text-gray-700">
                        Image {index + 1}
                      </span>
                      <button
                        type="button"
                        onClick={() => removeImage(index)}
                        className="text-red-600 hover:text-red-800 text-sm"
                      >
                        Remove
                      </button>
                    </div>
                    <input
                      type="url"
                      value={imageUrl}
                      onChange={(e) => {
                        const newImages = [...formData.images];
                        newImages[index] = e.target.value;
                        setFormData(prev => ({ ...prev, images: newImages }));
                      }}
                      className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-blue-500 focus:border-blue-500"
                      placeholder="Enter image URL..."
                    />
                    {imageUrl && (
                      <div className="mt-2">
                        <img
                          src={imageUrl}
                          alt={`Image ${index + 1} preview`}
                          className="h-24 w-auto rounded-md"
                          onError={(e) => {
                            e.currentTarget.style.display = 'none';
                          }}
                        />
                      </div>
                    )}
                  </div>
                ))}

                {formData.images.length === 0 && (
                  <div className="text-center py-8 text-gray-500">
                    No images added yet. Click the button above to add images.
                  </div>
                )}
              </div>
            </div>

            {/* Videos Section */}
            <div className="border-t pt-6">
              <div className="flex justify-between items-center mb-4">
                <h3 className="text-lg font-medium text-gray-900">Videos</h3>
                <button
                  type="button"
                  onClick={addVideo}
                  className="px-3 py-1 text-sm bg-purple-200 text-purple-700 rounded hover:bg-purple-300"
                >
                  + Add Video
                </button>
              </div>

              <div className="space-y-4">
                {formData.videos.map((videoUrl, index) => (
                  <div key={index} className="border rounded-lg p-4">
                    <div className="flex justify-between items-center mb-2">
                      <span className="text-sm font-medium text-gray-700">
                        Video {index + 1}
                      </span>
                      <button
                        type="button"
                        onClick={() => removeVideo(index)}
                        className="text-red-600 hover:text-red-800 text-sm"
                      >
                        Remove
                      </button>
                    </div>
                    <input
                      type="url"
                      value={videoUrl}
                      onChange={(e) => {
                        const newVideos = [...formData.videos];
                        newVideos[index] = e.target.value;
                        setFormData(prev => ({ ...prev, videos: newVideos }));
                      }}
                      className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-blue-500 focus:border-blue-500"
                      placeholder="Enter video URL..."
                    />
                    {videoUrl && (
                      <div className="mt-2">
                        <video
                          src={videoUrl}
                          className="h-24 w-auto rounded-md"
                          controls={false}
                          onError={(e) => {
                            e.currentTarget.style.display = 'none';
                          }}
                        />
                      </div>
                    )}
                  </div>
                ))}

                {formData.videos.length === 0 && (
                  <div className="text-center py-8 text-gray-500">
                    No videos added yet. Click the button above to add videos.
                  </div>
                )}
              </div>
            </div>
          </div>

          {/* Actions */}
          <div className="flex justify-end gap-4">
            <button
              type="button"
              onClick={() => router.push('/admin/posts')}
              className="px-4 py-2 border border-gray-300 rounded-md shadow-sm text-sm font-medium text-gray-700 bg-white hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={loading}
              className="px-4 py-2 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-blue-600 hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 disabled:opacity-50"
            >
              {loading ? 'Updating...' : 'Update Post'}
            </button>
          </div>
        </form>
      </main>
    </div>
  );
}
