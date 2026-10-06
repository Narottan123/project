# DevBlog — Frontend Web Application (Next.js & React 19)

Modern, responsive frontend for DevBlog built with Next.js 16 (App Router), React 19 functional components, Context API, and Socket.io client.

## Features
- **Feed & Exploration**: Responsive grid of blog cards, search bar, category filtering pills, read-time estimator.
- **Article Details**: Full article display, author bio, social share, and interactive comments.
- **Write / Edit Post**: Interactive article editor with real-time URL slug preview and image link preview.
- **My Articles**: Personal dashboard to review, edit, and delete published and draft articles.
- **Admin Panel**: Dedicated dashboard for administrators with live metric cards, user role toggling, post restoration, and audit logs.
- **Real-Time Alerts**: Socket.io live notification toasts on post publishing and discussions.

## Setup & Running
```bash
# Install dependencies
pnpm install

# Start development server
pnpm run dev
```

Runs on: `http://localhost:3000`.
See root [README.md](../README.md) for full documentation and default credentials.