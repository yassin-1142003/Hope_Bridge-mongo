# Charity Express Backend

Simple Node.js + Express backend for a charity site:

- Users subscribe with email (no login).
- Admin creates charity projects.
- All subscribers get an email when a new project is added.

## Tech Stack

- Node.js + Express (ES modules)
- MongoDB Atlas (official `mongodb` driver)
- Nodemailer (SMTP)
- Zod (validation)
- dotenv, CORS, morgan

## Routes

Base URL: `http://localhost:4000`

### Health

- `GET /api/health` – basic health check

### Subscribers

- `POST /api/subscribers/notify/subscribe`
  - Body: `{ "email": "user@example.com" }`
  - Creates a subscriber if not already subscribed.

### Projects (charities)

- `POST /api/projects`
  - Body: `{ "title", "description", "link?", "image?" }`
  - Saves project to `projects` collection.
  - Persists a notification document to `notifications`.
  - Sends email to **all** subscribers.

- `GET /api/projects`
  - Returns all projects (latest first).

- `GET /api/projects/:id`
  - Returns single project by MongoDB ObjectId.

### Updates

- `GET /api/updates`
  - Returns all notification documents from `notifications`, newest first.

### Admin (protected by `x-admin-key`)

All admin routes are under `/api/admin` and require header:

`x-admin-key: YOUR_ADMIN_API_KEY`

- `GET /api/admin/stats` – summary counts for projects, subscribers, notifications, admin logs.
- `POST /api/admin/charities` – create a charity (same shape as `POST /api/projects`).
- `PATCH /api/admin/charities/:id` – update charity fields.
- `DELETE /api/admin/charities/:id` – hard delete charity.
- `PATCH /api/admin/charities/:id/freeze` – soft-disable charity (`status: "frozen"`).
- `GET /api/admin/subscribers` – list all subscribers.
- `GET /api/admin/notifications` – list all notifications.
- `POST /api/admin/announcements` – create an announcement notification and send emails to subscribers.
- `GET /api/admin/logs` – list admin actions from `AdminLogs`.

## Environment variables

Create a `.env` file in `charity-express-backend/`:

```env
PORT=4000
MONGO_URI=mongodb+srv://USER:PASSWORD@cluster0.xxx.mongodb.net/charity
SMTP_EMAIL=your_smtp_email@example.com
SMTP_PASSWORD=your_smtp_password
SMTP_HOST=smtp.gmail.com
SMTP_PORT=587
```

## Install & Run

```bash
cd charity-express-backend
npm install
npm run dev       # or: npm start
```

The server will listen on `http://localhost:4000`.

Use any REST client (Postman, Thunder Client, etc.) or your frontend to call the endpoints.

## Seeding

A simple seed script is provided to populate demo data:

```bash
cd charity-express-backend
npm run seed
```

This will create:

- Demo subscribers
- A seed project with `image` pointing to `/mnt/data/9d6267be-4dc7-400a-8ee3-c952a7db1931.png`
- A seed notification referencing that project
- A seed admin log entry (`action: "seedInitialData"`)

You can then inspect collections `subscribers`, `projects`, `notifications`, and `AdminLogs` in MongoDB.
