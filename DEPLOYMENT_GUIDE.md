# Deployment Guide - Hope Bridge

## Environment Configuration

The application is designed to work on any server by using environment variables.

### Development Setup

1. **Copy the environment file:**

   ```bash
   cp .env.example .env.local
   ```

2. **Update your local environment:**

   ```env
   # For local development
   NEXT_PUBLIC_BASE_URL=http://localhost:3000
   APP_BASE_URL=http://localhost:3000
   ```

### Production Setup

1. **Set your production domain:**

   ```env
   # Production environment
   NEXT_PUBLIC_BASE_URL=https://your-domain.com
   APP_BASE_URL=https://your-domain.com
   ```

2. **Deploy to any platform:**

   - Vercel: Set environment variables in dashboard
   - Netlify: Set environment variables in site settings
   - Docker: Pass environment variables at runtime
   - VPS: Set in .env file or system environment

### Environment Variables Priority

The application checks for base URLs in this order:

1. `NEXT_PUBLIC_BASE_URL` (client and server)
2. `APP_BASE_URL` (server only)
3. `http://localhost:3000` (fallback)

### Server-Side Rendering (SSR)

The `NEXT_PUBLIC_BASE_URL` works for both:

- ✅ Client-side requests
- ✅ Server-side requests (SSR)
- ✅ API routes
- ✅ Static generation

### Example Configurations

#### Local Development

```env
NEXT_PUBLIC_BASE_URL=http://localhost:3000
```

#### Staging

```env
NEXT_PUBLIC_BASE_URL=https://staging.your-domain.com
```

#### Production

```env
NEXT_PUBLIC_BASE_URL=https://your-domain.com
```

#### Docker/Container

```bash
docker run -e NEXT_PUBLIC_BASE_URL=https://your-domain.com hope-bridge
```

### Testing

To verify your configuration works:

1. **Check environment variables:**

   ```bash
   npm run dev
   # Check console for base URL logging
   ```

2. **Test API endpoints:**

   ```bash
   curl http://localhost:3000/api/projects
   ```

3. **Verify frontend loads:**

   - Open browser to your configured URL
   - Check Network tab for API calls
   - Verify projects load correctly

### Common Issues

❌ **If API calls fail:**

- Check `NEXT_PUBLIC_BASE_URL` is set correctly
- Verify the API server is running on the same domain
- Check CORS settings if using different domains

❌ **If images don't load:**

- Ensure image paths start with `/` for relative URLs
- Check that public folder contains the images
- Verify `NEXT_PUBLIC_BASE_URL` is accessible

### Port Configuration

The application automatically detects the correct port:

- Development: Uses `NEXT_PUBLIC_BASE_URL` or defaults to port 3000
- Production: Uses your configured domain
- Docker: Uses environment variable or container port

This setup ensures your Hope Bridge application works seamlessly across any deployment environment!
