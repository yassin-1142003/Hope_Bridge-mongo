# Summary of Changes for MongoDB Compass ID -1 Sorting

## Changes Made

### 1. Charity Express Backend (JavaScript)

- **File**: `charity-express-backend/src/modules/projects/project.service.js`
  - Added `id: -1` to project creation in `createProject` function
  - Updated returned project object to include `id: -1`

- **File**: `charity-express-backend/src/seed.js`
  - Added `id: -1` to seed project creation
  - Updated returned project object to include `id: -1`

- **File**: `charity-express-backend/src/modules/admin/admin.controller.js`
  - Added `id: -1` to admin charity creation in `createCharity` function
  - Updated returned charity object to include `id: -1`

### 2. TypeScript Backend (Mongoose)

- **File**: `backend/database/mongoose/models.ts`
  - Added `customId?: number` field to `Project` interface
  - Added `customId?: number` field to `ProjectDoc` interface
  - Added `customId: { type: Number, default: -1 }` to project schema
  - Added index for `customId` field: `projectSchema.index({ customId: 1 })`
  - Updated `toProject` function to include `customId: doc.customId ?? -1`

- **File**: `backend/database/mongoose/repos/ProjectRepo.ts`
  - Modified `saveOne` method to add `customId: -1` to new projects

## Result

All newly created projects will now have:

- `id: -1` (in the Express backend collections)
- `customId: -1` (in the Mongoose TypeScript backend)

This ensures that when you view the collections in MongoDB Compass and sort by the `id` or `customId` field, the newest projects will appear first with the `-1` value.

## Testing

A test script `test-project-id-simple.js` was created and successfully verified that:

1. Projects are created with `id: -1`
2. The field is correctly stored in MongoDB
3. Sorting by `id` shows `-1` values first (when sorted descending)

## Usage in MongoDB Compass

1. Open MongoDB Compass
2. Navigate to the `projects` collection
3. Click on the `id` column header to sort
4. Projects with `id: -1` will appear at the top when sorted descending
