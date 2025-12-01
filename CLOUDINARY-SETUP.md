# Cloudinary Setup Guide for Hope Bridge

## 📋 Prerequisites

- Cloudinary account (free tier available)
- Your Cloudinary credentials

## 🔧 Step 1: Get Your Cloudinary Credentials

1. Sign up/login to [Cloudinary Dashboard](https://cloudinary.com/console)
2. Go to **Dashboard** → **Account Details**
3. Copy these values:
   - **Cloud name**
   - **API Key**
   - **API Secret**

## 🔧 Step 2: Create an Upload Preset

1. In Cloudinary Dashboard, go to **Settings** → **Upload**
2. Scroll down to **Upload presets**
3. Click **Add upload preset**
4. Configure:
   - **Name**: `hope-bridge-upload`
   - **Signing mode**: **Unsigned**
   - **Allowed formats**: All formats (or specify: jpg,jpeg,png,gif,webp,mp4,avi,mov,pdf,doc,docx,txt)
   - **Folder**: `hope-bridge`
5. Click **Save**

## 🔧 Step 3: Update Environment Variables

Update your `.env.local` file with your Cloudinary credentials:

```env
# ── Cloudinary Configuration ───────────────────────────────────────────────
NEXT_PUBLIC_CLOUDINARY_CLOUD_NAME=your-actual-cloud-name
CLOUDINARY_API_KEY=your-actual-api-key
CLOUDINARY_API_SECRET=your-actual-api-secret
NEXT_PUBLIC_CLOUDINARY_UPLOAD_PRESET=hope-bridge-upload
```

Replace the placeholder values with your actual credentials.

## 🔧 Step 4: Restart Development Server

After updating the environment variables, restart your development server:

```bash
npm run dev
```

## 🎯 What's Now Available

### Enhanced Task Form Features

1. **Start Date & End Date**: DateTime pickers for task scheduling
2. **File Upload**: Drag & drop support for:
   - 📸 Images (jpg, jpeg, png, gif, webp, svg)
   - 🎥 Videos (mp4, avi, mov, wmv, flv, webm)
   - 📄 Documents (pdf, doc, docx, xls, xlsx, ppt, pptx, txt, csv)
3. **Cloud Storage**: All files uploaded to Cloudinary CDN
4. **File Management**: Preview, remove, and organize attachments

### File Upload Features

- **Drag & Drop**: Simply drag files onto the upload area
- **Click to Select**: Click to browse and select files
- **File Validation**: Automatic validation for file type and size (max 100MB)
- **Progress Tracking**: See upload progress and status
- **Preview**: Image previews for uploaded files
- **CDN URLs**: Files get permanent Cloudinary URLs

### Task Management

- **Date Validation**: Ensures start date is before end date
- **Alert System**: Optional alerts before due dates
- **Priority Levels**: Low, Medium, High, Urgent
- **Status Tracking**: Pending, In Progress, Completed, Cancelled
- **Assignment**: Assign tasks to team members

## 🧪 Testing the Integration

1. Navigate to `/en/dashboard/tasks` (or your preferred locale)
2. Click "Add New Task"
3. Fill in the task details including start/end dates
4. Drag and drop some files (images, videos, documents)
5. Click "Send Task"
6. Check the task list to see the uploaded files with Cloudinary URLs

## 🔍 File Storage Structure

Files are organized in Cloudinary as:

```
hope-bridge/
├── tasks/
│   ├── [task-id]/
│   │   ├── image1.jpg
│   │   ├── video1.mp4
│   │   └── document1.pdf
│   └── [task-id]/
│       └── ...
└── [other-folders]/
```

## 🌟 Benefits of Cloudinary Integration

- **Global CDN**: Fast file delivery worldwide
- **Automatic Optimization**: Images and videos optimized automatically
- **Format Conversion**: Automatic format conversion for better compatibility
- **Security**: Secure file storage with access controls
- **Scalability**: Handles unlimited files and traffic
- **Analytics**: Track file usage and performance

## 🚨 Important Notes

- Keep your API secret secure and never expose it in client-side code
- The upload preset should be configured for unsigned uploads in development
- Consider enabling signed uploads for production environments
- Monitor your Cloudinary usage to stay within free tier limits

## 📞 Support

If you encounter any issues:

1. Check the browser console for error messages
2. Verify your Cloudinary credentials are correct
3. Ensure your upload preset is properly configured
4. Check that your environment variables are loaded correctly

---

**Ready to go!** Your Hope Bridge application now has powerful file upload capabilities with Cloudinary integration. 🎉
