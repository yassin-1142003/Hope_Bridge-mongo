'use client';

import { useState } from 'react';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '../../../../components/ui/tabs';
import MediaUpload from '../../../../components/media/MediaUpload';
import MediaGallery from '../../../../components/media/MediaGallery';
import { Card, CardContent, CardHeader, CardTitle } from '../../../../components/ui/card';

export default function MediaManagementPage() {
  const [refreshKey, setRefreshKey] = useState(0);

  const handleUploadSuccess = (newMedia: any) => {
    // Refresh the gallery when a new file is uploaded
    setRefreshKey(prev => prev + 1);
  };

  return (
    <div className="container mx-auto py-6 space-y-6">
      <div className="flex justify-between items-center">
        <h1 className="text-3xl font-bold">Media Management</h1>
      </div>

      <Tabs defaultValue="gallery" className="w-full">
        <TabsList className="grid w-full grid-cols-2">
          <TabsTrigger value="gallery">Media Gallery</TabsTrigger>
          <TabsTrigger value="upload">Upload New</TabsTrigger>
        </TabsList>

        <TabsContent value="gallery" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle>Your Media Library</CardTitle>
            </CardHeader>
            <CardContent>
              <MediaGallery key={refreshKey} />
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="upload" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle>Upload Individual Media File</CardTitle>
            </CardHeader>
            <CardContent>
              <MediaUpload onUploadSuccess={handleUploadSuccess} />
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
}
