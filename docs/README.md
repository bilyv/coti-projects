# Cotim Project Progress Tracker - Documentation

Welcome to the documentation for the Cotim Project Progress Tracker, a modern SaaS application for tracking project progress with sequential steps.

## Table of Contents

- [Overview](#overview)
- [Architecture](#architecture)
- [Frontend](#frontend)
- [Backend](#backend)
- [Authentication](#authentication)
- [Database Schema](#database-schema)
- [API Reference](#api-reference)
- [Deployment](#deployment)
- [Contributing](#contributing)

## Overview

The Cotim Project Progress Tracker is a full-stack web application that helps users organize and monitor their projects through a structured step-by-step approach. Built with React, TypeScript, and Convex, it provides a seamless serverless experience with real-time updates.

### Key Features

- **Project Management**: Create, organize, and track multiple projects
- **Sequential Steps**: Break down projects into ordered, manageable steps
- **Progress Visualization**: Visual indicators showing completion status
- **Real-time Updates**: Instant synchronization across all clients
- **Responsive Design**: Works seamlessly across all devices
- **Dark/Light Mode**: Toggle between themes based on user preference
- **Secure Authentication**: Password-based and anonymous sign-in options

## Architecture

The application follows a client-server architecture with a serverless backend:

```
┌─────────────────┐    ┌──────────────────┐    ┌─────────────────┐
│   Frontend      │    │    Backend       │    │   Database      │
│   (React)       │◄──►│   (Convex)       │◄──►│   (Convex)      │
└─────────────────┘    └──────────────────┘    └─────────────────┘
       │                        │
       ▼                        ▼
┌─────────────────┐    ┌──────────────────┐
│   Tailwind CSS  │    │ Authentication   │
│   (Styling)     │    │   (Convex Auth)  │
└─────────────────┘    └──────────────────┘
```

### Technology Stack

- **Frontend**: React 18, TypeScript, Tailwind CSS
- **Backend**: Convex (serverless functions)
- **Authentication**: Convex Auth
- **Database**: Convex Database
- **Build Tool**: Vite
- **Deployment**: Convex Hosting

## Frontend

The frontend is built with React and TypeScript, organized into reusable components.

### Project Structure

```
src/
├── components/          # Reusable UI components
│   ├── CreateProjectModal.tsx
│   ├── CreateStepForm.tsx
│   ├── ProgressCircle.tsx
│   ├── ProjectCard.tsx
│   ├── ProjectList.tsx
│   ├── ProjectModal.tsx
│   └── StepList.tsx
├── lib/                 # Utility functions
│   └── utils.ts
├── App.tsx             # Main application component
├── RegisterForm.tsx    # User registration form
├── SignInForm.tsx      # User sign-in form
├── SignOutButton.tsx   # Sign out button component
├── ProcessingPage.tsx  # Account processing page
├── ProfilePage.tsx     # User profile page
├── index.css           # Global styles
└── main.tsx            # Application entry point
```

### Component Overview

1. **App.tsx**: Main application component handling routing and global state
2. **ProjectList.tsx**: Displays all user projects in a grid layout
3. **ProjectCard.tsx**: Individual project card with progress visualization
4. **ProjectModal.tsx**: Detailed view of a project with its steps
5. **StepList.tsx**: Displays steps for a project with completion controls
6. **CreateProjectModal.tsx**: Form for creating new projects
7. **CreateStepForm.tsx**: Form for adding new steps to a project
8. **ProgressCircle.tsx**: Visual progress indicator component
9. **RegisterForm.tsx**: Multi-step user registration form
10. **SignInForm.tsx**: User sign-in form
11. **SignOutButton.tsx**: Sign out button component
12. **ProcessingPage.tsx**: Account creation processing page
13. **ProfilePage.tsx**: User profile with activity visualization

### Styling

The application uses Tailwind CSS for styling with a custom color palette and dark mode support. The design follows a clean, modern aesthetic with:

- Gradient accents
- Smooth transitions and animations
- Responsive layouts
- Dark/light mode toggle

## Backend

The backend is built with Convex, a serverless platform that handles database operations, authentication, and business logic.

### Project Structure

```
convex/
├── _generated/         # Auto-generated Convex types
├── auth.config.ts      # Authentication configuration
├── auth.ts             # Authentication functions
├── http.ts             # HTTP handlers
├── projects.ts         # Project-related functions
├── router.ts           # HTTP route definitions
├── schema.ts           # Database schema
├── steps.ts            # Step-related functions
└── tsconfig.json       # Convex TypeScript configuration
```

### Functions Overview

1. **projects.ts**: 
   - `list`: Retrieve all projects for a user
   - `create`: Create a new project
   - `remove`: Delete a project and its steps

2. **steps.ts**:
   - `listByProject`: Retrieve all steps for a project
   - `create`: Create a new step
   - `toggleComplete`: Toggle step completion status
   - `remove`: Delete a step

3. **auth.ts**:
   - Authentication setup and user management
   - Session handling

## Authentication

The application supports two authentication methods:

1. **Password Authentication**: Traditional email/password sign-up and sign-in
2. **Anonymous Authentication**: Quick access without account creation

### Implementation

Authentication is handled by Convex Auth, which provides:

- Secure session management
- Password hashing
- Email verification (when implemented)
- Anonymous session support

### User Profile

User profiles store:
- Name
- Email
- Authentication provider information

## Database Schema

The application uses Convex's built-in database with the following schema:

### Users Table

```
users: {
  name: string
  email: string (optional)
  phone: string (optional)
}
```

### Projects Table

```
projects: {
  name: string
  description: string (optional)
  userId: Id<"users">
  color: string
}
Indexes:
- by_user: ["userId"]
```

### Steps Table

```
steps: {
  projectId: Id<"projects">
  title: string
  description: string (optional)
  order: number
  isCompleted: boolean
  isUnlocked: boolean
}
Indexes:
- by_project: ["projectId"]
- by_project_and_order: ["projectId", "order"]
```

## API Reference

### Project Functions

#### list()
- **Description**: Retrieve all projects for the authenticated user
- **Parameters**: None
- **Returns**: Array of projects with progress information

#### create()
- **Description**: Create a new project
- **Parameters**: 
  - `name`: string
  - `description`: string (optional)
  - `color`: string
- **Returns**: Project ID

#### remove()
- **Description**: Delete a project and all its steps
- **Parameters**: 
  - `projectId`: Id<"projects">
- **Returns**: None

### Step Functions

#### listByProject()
- **Description**: Retrieve all steps for a project
- **Parameters**: 
  - `projectId`: Id<"projects">
- **Returns**: Array of steps ordered by sequence

#### create()
- **Description**: Create a new step
- **Parameters**: 
  - `projectId`: Id<"projects">
  - `title`: string
  - `description`: string (optional)
- **Returns**: Step ID

#### toggleComplete()
- **Description**: Toggle step completion status
- **Parameters**: 
  - `stepId`: Id<"steps">
- **Returns**: None

#### remove()
- **Description**: Delete a step
- **Parameters**: 
  - `stepId`: Id<"steps">
- **Returns**: None

## Deployment

### Convex Deployment

1. Create a Convex account at [convex.dev](https://convex.dev)
2. Install the Convex CLI: `npm install -g convex`
3. Authenticate: `npx convex login`
4. Deploy: `npx convex deploy`

### Cloudflare Pages Deployment

1. Build the frontend: `npm run build`
2. Deploy the `dist` folder to Cloudflare Pages
3. Set environment variables in Cloudflare dashboard:
   - `VITE_CONVEX_URL`: Your Convex deployment URL

### Environment Variables

- `VITE_CONVEX_URL`: Convex deployment URL
- `CONVEX_DEPLOYMENT`: Convex deployment name
- `CONVEX_SITE_URL`: Site URL for authentication callbacks

## Contributing

Contributions are welcome! Please follow these steps:

1. Fork the repository
2. Create your feature branch (`git checkout -b feature/AmazingFeature`)
3. Commit your changes (`git commit -m 'Add some AmazingFeature'`)
4. Push to the branch (`git push origin feature/AmazingFeature`)
5. Open a Pull Request

### Development Setup

1. Clone the repository
2. Install dependencies: `npm install`
3. Start development server: `npm run dev`
4. Open your browser to `http://localhost:5173`

### Code Standards

- Use TypeScript for all new code
- Follow existing code style and patterns
- Write clear, descriptive commit messages
- Test your changes before submitting a PR

## Support

For support, please open an issue in the repository or contact the maintainers.