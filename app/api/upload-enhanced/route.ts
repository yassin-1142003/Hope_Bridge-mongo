import { v2 as cloudinary } from 'cloudinary';
import { NextRequest, NextResponse } from 'next/server';
import multer from 'multer';
import { beautifulLog } from '@/lib/beautifulResponse';

// Configure Cloudinary
cloudinary.config({
  cloud_name: process.env.CLOUDINARY_CLOUD_NAME || process.env.NEXT_PUBLIC_CLOUDINARY_CLOUD_NAME,
  api_key: process.env.CLOUDINARY_API_KEY,
  api_secret: process.env.CLOUDINARY_API_SECRET,
  secure: true,
});

// Multer configuration for memory storage
const storage = multer.memoryStorage();
const upload = multer({ 
  storage: storage,
  limits: {
    fileSize: 100 * 1024 * 1024, // 100MB limit
  },
  fileFilter: (req, file, cb) => {
    // Allowed file types
    const allowedTypes = [
      // Images
      'image/jpeg', 'image/jpg', 'image/png', 'image/gif', 'image/webp', 'image/svg+xml',
      // Videos
      'video/mp4', 'video/avi', 'video/mov', 'video/wmv', 'video/flv', 'video/webm',
      // Documents
      'application/pdf', 'application/msword', 'application/vnd.openxmlformats-officedocument.wordprocessingml.document',
      'application/vnd.ms-excel', 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet',
      'application/vnd.ms-powerpoint', 'application/vnd.openxmlformats-officedocument.presentationml.presentation',
      'text/plain', 'text/csv',
    ];

    if (allowedTypes.includes(file.mimetype)) {
      cb(null, true);
    } else {
      cb(new Error(`File type ${file.mimetype} not allowed`));
    }
  }
});

// Cloudinary configuration verification
export async function verifyCloudinaryConfig() {
  const config = {
    cloudName: process.env.CLOUDINARY_CLOUD_NAME || process.env.NEXT_PUBLIC_CLOUDINARY_CLOUD_NAME,
    apiKey: process.env.CLOUDINARY_API_KEY,
    apiSecret: process.env.CLOUDINARY_API_SECRET,
    uploadPreset: process.env.NEXT_PUBLIC_CLOUDINARY_UPLOAD_PRESET,
  };

  const verification = {
    isConfigured: false,
    missingKeys: [] as string[],
    configPresent: {} as Record<string, string>,
    connectionTest: false,
    error: null as string | null,
  };

  // Check configuration
  Object.entries(config).forEach(([key, value]) => {
    if (value) {
      verification.configPresent[key] = '✅ Present';
    } else {
      verification.missingKeys.push(key);
      verification.configPresent[key] = '❌ Missing';
    }
  });

  verification.isConfigured = verification.missingKeys.length === 0;

  // Test connection if configured
  if (verification.isConfigured) {
    try {
      // Test by trying to access the API
      const result = await cloudinary.api.resources({ max_results: 1 });
      verification.connectionTest = true;
      beautifulLog.success('✅ Cloudinary connection test successful');
    } catch (error) {
      verification.error = error instanceof Error ? error.message : 'Connection test failed';
      beautifulLog.error('❌ Cloudinary connection test failed:', error);
    }
  }

  return verification;
}

// Enhanced upload function with Multer
export async function uploadToCloudinary(file: Buffer, filename: string, mimeType: string, folder: string = 'hope-bridge') {
  return new Promise((resolve, reject) => {
    // Determine resource type
    let resourceType = 'auto';
    if (mimeType.startsWith('image/')) {
      resourceType = 'image';
    } else if (mimeType.startsWith('video/')) {
      resourceType = 'video';
    } else if (mimeType.startsWith('application/')) {
      resourceType = 'raw';
    }

    const uploadOptions: any = {
      resource_type: resourceType,
      folder: folder,
      public_id: `${folder}_${Date.now()}_${filename.replace(/[^a-zA-Z0-9]/g, '_')}`,
      overwrite: true,
    };

    // Use upload preset for unsigned uploads or signed upload for better security
    if (process.env.NEXT_PUBLIC_CLOUDINARY_UPLOAD_PRESET) {
      uploadOptions.upload_preset = process.env.NEXT_PUBLIC_CLOUDINARY_UPLOAD_PRESET;
    }

    cloudinary.uploader.upload_stream(
      uploadOptions,
      (error, result) => {
        if (error) {
          beautifulLog.error('❌ Cloudinary upload failed:', error);
          reject(error);
        } else {
          beautifulLog.success(`✅ File uploaded successfully: ${filename}`);
          resolve(result);
        }
      }
    ).end(file);
  });
}

// Main upload handler
export async function POST(request: NextRequest) {
  const startTime = Date.now();
  
  try {
    beautifulLog.info('📤 Enhanced file upload request received (Multer + Cloudinary)');
    
    // Verify Cloudinary configuration first
    const configVerification = await verifyCloudinaryConfig();
    
    if (!configVerification.isConfigured) {
      beautifulLog.error('❌ Cloudinary not properly configured');
      return NextResponse.json({
        success: false,
        message: 'Cloudinary configuration incomplete',
        verification: configVerification,
        suggestions: [
          'Check your .env.local file',
          'Ensure all Cloudinary credentials are set',
          'Verify your Cloudinary account is active'
        ]
      }, { status: 500 });
    }

    if (!configVerification.connectionTest) {
      beautifulLog.error('❌ Cloudinary connection test failed');
      return NextResponse.json({
        success: false,
        message: 'Cloudinary connection failed',
        verification: configVerification,
        error: configVerification.error
      }, { status: 500 });
    }

    // Parse form data
    const formData = await request.formData();
    const files = formData.getAll('files') as File[];
    const folder = (formData.get('folder') as string) || 'hope-bridge/tasks';
    
    if (!files || files.length === 0) {
      beautifulLog.warning('No files provided in upload request');
      return NextResponse.json({
        success: false,
        message: 'No files provided',
        verification: configVerification
      }, { status: 400 });
    }

    const uploadResults = [];
    const errors = [];

    for (const file of files) {
      try {
        beautifulLog.info(`Processing file: ${file.name} (${file.type}, ${(file.size / 1024 / 1024).toFixed(2)}MB)`);
        
        // Convert file to buffer
        const bytes = await file.arrayBuffer();
        const buffer = Buffer.from(bytes);
        
        // Upload to Cloudinary
        const result = await uploadToCloudinary(buffer, file.name, file.type, folder);
        
        uploadResults.push({
          id: (result as any).public_id,
          name: file.name,
          originalName: (result as any).original_filename || file.name,
          type: file.type,
          size: file.size,
          url: (result as any).secure_url,
          uploadedAt: new Date().toISOString(),
          format: (result as any).format,
          resourceType: (result as any).resource_type,
          cloudinaryData: {
            publicId: (result as any).public_id,
            version: (result as any).version,
            signature: (result as any).signature,
            folder: (result as any).folder
          }
        });

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
      return NextResponse.json({
        success: false,
        message: 'All file uploads failed',
        verification: configVerification,
        errors: errors
      }, { status: 400 });
    }

    const response = {
      success: true,
      message: 'Files uploaded successfully to Cloudinary',
      verification: configVerification,
      uploadedFiles: uploadResults,
      errors: errors.length > 0 ? errors : undefined,
      summary: {
        total: files.length,
        successful: uploadResults.length,
        failed: errors.length,
        processingTime: `${processingTime}ms`,
        cloudinaryFolder: folder
      }
    };

    beautifulLog.success(`✅ Upload completed: ${uploadResults.length}/${files.length} files successful`);
    
    return NextResponse.json(response);

  } catch (error) {
    beautifulLog.error('❌ Enhanced upload error:', error);
    return NextResponse.json({
      success: false,
      message: 'Internal server error during file upload',
      error: error instanceof Error ? error.message : 'Unknown error'
    }, { status: 500 });
  }
}

// Configuration check endpoint
export async function GET() {
  try {
    beautifulLog.info('🔍 Cloudinary configuration check requested');
    
    const verification = await verifyCloudinaryConfig();
    
    return NextResponse.json({
      success: true,
      message: 'Cloudinary configuration check completed',
      verification: verification,
      timestamp: new Date().toISOString()
    });

  } catch (error) {
    beautifulLog.error('❌ Configuration check error:', error);
    return NextResponse.json({
      success: false,
      message: 'Failed to check Cloudinary configuration',
      error: error instanceof Error ? error.message : 'Unknown error'
    }, { status: 500 });
  }
}
