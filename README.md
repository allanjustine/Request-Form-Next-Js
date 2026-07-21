# Request Form - Next.js Client

A modern, responsive web application for submitting, tracking, and managing enterprise request forms with multi-level approval workflows.

## System Flow

### Client User Journey

```
┌─────────────────────────────────────────────────────────────────┐
│                     USER AUTHENTICATION                         │
│  Register → Login → JWT Token Stored → Access Protected Pages   │
└─────────────────────────────────────────────────────────────────┘
                              ↓
┌─────────────────────────────────────────────────────────────────┐
│                    USER DASHBOARD (Home)                         │
│  - View Quick Stats (My Requests, Pending Approvals)             │
│  - Recent Activity Feed                                          │
│  - Quick Actions (Create Request, View Requests)                 │
└─────────────────────────────────────────────────────────────────┘
                              ↓
        ┌─────────────────────┴─────────────────────┐
        ↓                                           ↓
   ┌──────────────────┐              ┌──────────────────┐
   │ CREATE REQUEST   │              │  VIEW REQUESTS   │
   ├──────────────────┤              ├──────────────────┤
   │ 1. Select Type   │              │ 1. View All      │
   │    (Stock,       │              │ 2. Filter/Search │
   │     Cash Adv,    │              │ 3. View Details  │
   │     Purchase,    │              │ 4. Track Status  │
   │     Check, etc)  │              │ 5. View Feedback │
   │                  │              │ 6. Print Form    │
   │ 2. Fill Form     │              │ 7. Share Request │
   │ 3. Upload        │              └──────────────────┘
   │    Attachments   │
   │ 4. Set Approvers │
   │ 5. Submit        │
   └──────────────────┘
          ↓
    ┌──────────────────┐
    │ REQUEST SENT     │
    │ to Backend API   │
    └──────────────────┘
          ↓
    ┌──────────────────────────────────────┐
    │ REAL-TIME STATUS TRACKING            │
    │ - Draft/Submitted/Pending/Approved   │
    │ - Push Notifications                 │
    │ - Email Notifications                │
    └──────────────────────────────────────┘
          ↓
    ┌──────────────────────────────────────┐
    │ APPROVAL WORKFLOW (Approvers View)   │
    │ - Pending Approvals Dashboard        │
    │ - View Request Details               │
    │ - Add Comments/Feedback              │
    │ - Approve/Reject                     │
    └──────────────────────────────────────┘
          ↓
    ┌──────────────────────────────────────┐
    │ FINAL STATUS UPDATE                  │
    │ - Requester Notified                 │
    │ - Form Locked/Archived               │
    │ - Audit Trail Created                │
    └──────────────────────────────────────┘
```

## User Roles & Access

| Role            | Access                                        | Actions                                                 |
| --------------- | --------------------------------------------- | ------------------------------------------------------- |
| **Requester**   | Dashboard, Create Requests, View Own Requests | Submit requests, upload attachments, view feedback      |
| **Approver**    | Approval Dashboard, Pending Requests          | Approve/Reject, add comments, view request details      |
| **Branch Head** | Branch Management, User Management            | Manage branch data, approve branch-level requests       |
| **Admin**       | Full System Access                            | User management, configure approvers, view all requests |

## Overview

This Next.js client provides users with a comprehensive interface to:

- **Submit Request Forms** - Create and submit various request types (stock, cash advance, purchase, check issuance, cash disbursement, discount)
- **Track Requests** - View submission status, approval progress, and feedback in real-time
- **Upload Attachments** - Attach supporting documents and images for verification
- **View Approvals** - Monitor which approvers have reviewed and commented on requests
- **Manage Profile** - Update user information, signature, and account settings
- **Receive Notifications** - Get real-time updates on request status changes and approvals
- **Approval Dashboard** - Approvers can view pending requests and process approvals
- **Reports & Analytics** - View request history and status reports
- **Share Requests** - Share request access with other users
- **Print Requests** - Generate printable request forms

## Main Features

### 🔐 Authentication & Authorization

- User registration and email verification
- Sanctum API token-based authentication
- Password reset via email
- Role-based access control (RBAC)
- Persistent session management

### 📝 Request Form Management

- Multiple request types with custom workflows
- Dynamic form fields based on request type
- Save as draft functionality
- Real-time form validation
- Auto-population of user information
- Custom approval routing

### 📎 Attachment Handling

- Multiple file uploads per request
- Image preview functionality
- Document file support
- Secure file storage and retrieval
- Download capability

### ✅ Approval Workflow

- Multi-step approval chain
- Real-time approval tracking
- Approver comments and feedback
- Conditional approvals (amount-based)
- Audit trail of all approvals
- Approval status notifications

### 🔔 Real-Time Notifications

- Browser push notifications
- WebSocket-based updates
- Email notifications
- In-app notification center
- Unread notification counter
- Mark as read functionality

### 📊 Dashboard & Reports

- Requester dashboard with quick stats
- Approver dashboard with pending items
- Request history and filtering
- Advanced search functionality
- Print request forms
- Share requests with team members

### 👥 User Management

- Profile management
- Digital signature upload
- Profile picture updates
- Password management
- User role assignments

## Tech Stack

- **Styling**: Tailwind CSS + DaisyUI
- **State Management**: React Context
- **HTTP Client**: Axios
- **Form Handling**: React Hook Form
- **Icons**: FontAwesome
- **Image Optimization**: Next.js Image Component

## Getting Started

### Prerequisites

- Node.js 18+ installed
- Backend API running (see server/README.md)
- `.env.local` configured with API URLs

### Installation

```bash
cd next-client

# Install dependencies
pnpm install
# or
npm install
```

### Environment Setup

Create `.env.local`:

```env
NEXT_PUBLIC_API_URL=http://localhost:8000/api
NEXT_PUBLIC_API_STORAGE_URL=http://localhost:8000/storage
```

### Development Server

```bash
pnpm dev
# or
npm run dev
```

Open [http://localhost:3000](http://localhost:3000) to view the application.

## Key Features

### 🔐 Authentication

- User login/registration
- JWT-based session management
- Password reset functionality
- Role-based access control

### 📋 Request Forms

- Multiple request types (Stock, Cash Advance, Purchase, Check Issuance, Cash Disbursement, etc.)
- Dynamic form validation
- Attachment uploads
- Draft saving capability

### ✅ Approval Workflow

- Real-time approval status tracking
- Approver comments and feedback
- Multi-step approval chain
- Audit trail of all approvals

### 📱 Responsive Design

- Mobile-first approach
- Fully responsive on all devices
- Accessible UI components

## Project Structure

```
src/
├── app/                    # Next.js pages & layouts
│   ├── (views)/           # Route groups
│   │   ├── request/       # Request form pages
│   │   ├── admin/         # Admin dashboard
│   │   └── approver/      # Approver workflows
│   └── _components/       # Root layout components
├── components/
│   ├── basic-modals/      # Modal dialogs for CRUD operations
│   ├── layouts/           # Layout components (navbar, sidebar)
│   └── ui/                # Reusable UI components
├── context/               # React Context for state
├── hooks/                 # Custom React hooks
├── lib/                   # Utilities and helpers
├── types/                 # TypeScript type definitions
└── utils/                 # Helper functions
```

## Building & Deployment

```bash
# Production build
pnpm build

# Start production server
pnpm start
```

Deploy to Vercel:

```bash
vercel deploy
```

## Learn More

- [Next.js Documentation](https://nextjs.org/docs)
- [Tailwind CSS](https://tailwindcss.com)
- [DaisyUI Components](https://daisyui.com)
- [TypeScript Handbook](https://www.typescriptlang.org/docs/)

## Support

For issues and questions, please check the backend API documentation or contact the development team.
