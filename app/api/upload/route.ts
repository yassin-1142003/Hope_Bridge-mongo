import { NextRequest, NextResponse } from 'next/server';
import { CloudinaryService } from '@/lib/services/CloudinaryService';
import { beautifulLog, createSuccessResponse, createErrorResponse } from '@/lib/beautifulResponse';

export async function POST(request: NextRequest) {
  const startTime = Date.now();
  
  try {
    beautifulLog.info('📤 File upload request received');
    
    const formData = await request.formData();
    const files = formData.getAll('files') as File[];
    const folder = (formData.get('folder') as string) || 'hope-bridge';
    
    if (!files || files.length === 0) {
      beautifulLog.warning('No files provided in upload request');
      return NextResponse.json(
        createErrorResponse('No files provided'),
        { status: 400 }
      );
    }

    const cloudinaryService = new CloudinaryService();
    const uploadResults = [];
    const errors = [];

    for (const file of files) {
      try {
        // Validate file
        const validation = cloudinaryService.validateFile(file);
        if (!validation.valid) {
          errors.push({
            filename: file.name,
            error: validation.error
          });
          continue;
        }

        beautifulLog.info(`Uploading file: ${file.name} (${file.type})`);
        
        const result = await cloudinaryService.uploadFile(file, folder);
        
        uploadResults.push({
          id: result.public_id,
          name: file.name,
          originalName: result.original_filename,
          type: cloudinaryService.getFileTypeFromUrl(result.secure_url),
          url: result.secure_url,
          size: result.bytes,
          uploadedAt: result.created_at,
          format: result.format,
          resourceType: result.resource_type
        });

        beautifulLog.success(`✅ File uploaded successfully: ${file.name}`);
        
      } catch (error) {
        beautifulLog.error(`❌ Failed to upload file ${file.name}:`, error);
        errors.push({
          filename: file.name,
          error: error instanceof Error ? error.message : 'Unknown error'
        });
      }
    }

    const processingTime = Date.now() - startTime;
    
    if (uploadResults.length === 0) {
      beautifulLog.error('❌ All file uploads failed');
      return NextResponse.json(
        createErrorResponse('All file uploads failed', { errors }),
        { status: 400 }
      );
    }

    const response = createSuccessResponse({
      uploadedFiles: uploadResults,
      errors: errors.length > 0 ? errors : undefined,
      summary: {
        total: files.length,
        successful: uploadResults.length,
        failed: errors.length,
        processingTime: `${processingTime}ms`
      }
    }, 'Files uploaded successfully');

    beautifulLog.success(`✅ Upload completed: ${uploadResults.length}/${files.length} files successful`);
    
    return NextResponse.json(response);

  } catch (error) {
    beautifulLog.error('❌ File upload error:', error);
    return NextResponse.json(
      createErrorResponse('Internal server error during file upload'),
      { status: 500 }
    );
  }
}

export async function DELETE(request: NextRequest) {
  try {
    beautifulLog.info('🗑️ File deletion request received');
    
    const { searchParams } = new URL(request.url);
    const publicId = searchParams.get('publicId');
    const resourceType = searchParams.get('resourceType') || 'auto';
    
    if (!publicId) {
      return NextResponse.json(
        createErrorResponse('Public ID is required'),
        { status: 400 }
      );
    }

    const cloudinaryService = new CloudinaryService();
    const success = await cloudinaryService.deleteFile(publicId, resourceType);
    
    if (success) {
      beautifulLog.success(`✅ File deleted successfully: ${publicId}`);
      return NextResponse.json(
        createSuccessResponse('File deleted successfully')
      );
    } else {
      beautifulLog.error(`❌ Failed to delete file: ${publicId}`);
      return NextResponse.json(
        createErrorResponse('Failed to delete file'),
        { status: 500 }
      );
    }

  } catch (error) {
    beautifulLog.error('❌ File deletion error:', error);
    return NextResponse.json(
      createErrorResponse('Internal server error during file deletion'),
      { status: 500 }
    );
  }
}
