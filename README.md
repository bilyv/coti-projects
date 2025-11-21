# Cotim Project Progress Tracker

![Project Screenshot](images/cotim%20dashboard.jpg)
![Steps Screenshot](images/cotim%20steps.jpg)

A modern, full-stack web application for tracking project progress with sequential steps. Built with React, TypeScript, and Convex for a seamless serverless experience.

## 🌟 Project Overview

The Cotim Project Progress Tracker is a sophisticated task management application that helps users organize and monitor their projects through a structured step-by-step approach. With features like real-time progress tracking, dark/light mode toggle, and secure authentication, it provides an intuitive interface for managing complex workflows.

Key features include:
- **Project Management**: Create, organize, and track multiple projects
- **Sequential Steps**: Break down projects into ordered, manageable steps
- **AI-Powered Step Generation**: Automatically generate project steps and subtasks using Gemini AI
- **Progress Visualization**: Visual indicators showing completion status
- **Responsive Design**: Works seamlessly across all devices
- **Dark/Light Mode**: Toggle between themes based on user preference
- **Secure Authentication**: Password-based and anonymous sign-in options

## 📚 Documentation

Comprehensive documentation is available in the `docs` directory:

- [Full Documentation](docs/README.md) - Complete technical documentation
- [API Reference](docs/API.md) - Detailed API endpoints and functions
- [Deployment Guide](docs/DEPLOYMENT.md) - Instructions for deploying the application
- [User Guide](docs/USER_GUIDE.md) - Instructions for using the application
- [Gemini AI Setup](docs/GEMINI_AI_SETUP.md) - Instructions for setting up the AI feature

## 🏗️ Project Structure

```
cotim-projects/
├── src/                    # Frontend source code
│   ├── components/         # Reusable UI components
│   │   ├── CreateProjectModal.tsx
│   │   ├── CreateStepForm.tsx
│   │   ├── ProgressCircle.tsx
│   │   ├── ProjectCard.tsx
│   │   ├── ProjectList.tsx
│   │   ├── ProjectModal.tsx
│   │   └── StepList.tsx
│   ├── lib/                # Utility functions
│   │   ├── aiService.ts      # AI service for Gemini integration
│   │   └── utils.ts
│   ├── App.tsx             # Main application component
│   ├── RegisterForm.tsx    # User registration form
│   ├── SignInForm.tsx      # User sign-in form
│   ├── SignOutButton.tsx   # Sign out button component
│   ├── ProcessingPage.tsx  # Account processing page
│   ├── ProfilePage.tsx     # User profile page
│   ├── index.css           # Global styles
│   ├── main.tsx            # Application entry point
│   └── vite-env.d.ts       # Vite environment types
├── convex/                 # Backend source code
│   ├── _generated/         # Auto-generated Convex types
│   ├── auth.config.ts      # Authentication configuration
│   ├── auth.ts             # Authentication functions
│   ├── http.ts             # HTTP handlers
│   ├── projects.ts         # Project-related functions
│   ├── router.ts           # HTTP route definitions
│   ├── schema.ts           # Database schema
│   ├── steps.ts            # Step-related functions
│   └── tsconfig.json       # Convex TypeScript configuration
├── docs/                   # Documentation
│   ├── README.md           # Technical documentation
│   ├── API.md              # API reference
│   ├── DEPLOYMENT.md       # Deployment guide
│   └── USER_GUIDE.md       # User guide
├── public/                 # Static assets
├── .env.local              # Local environment variables
├── .env.production         # Production environment variables
├── index.html              # HTML entry point
├── package.json            # Project dependencies and scripts
├── tailwind.config.js      # Tailwind CSS configuration
├── tsconfig.json           # TypeScript configuration
├── vite.config.ts          # Vite build configuration
└── convex.json             # Convex deployment configuration
```

## 🚀 Getting Started

### Prerequisites

- Node.js (version 18 or higher)
- npm or yarn package manager
- A Convex account (free tier available)

### Installation

1. Clone the repository:
   ```bash
   git clone https://github.com/bilyv/cotim-projects.git
   cd cotim-projects
   ```

2. Install dependencies:
   ```bash
   npm install
   ```

3. Set up environment variables:
   ```bash
   cp .env.local.example .env.local
   # Update the .env.local file with your Convex deployment URL
   ```

4. Start the development server:
   ```bash
   npm run dev
   ```

5. Open your browser to `http://localhost:5173` to view the application.

## 🛠️ Development

### Available Scripts

- `npm run dev` - Starts both frontend and backend development servers
- `npm run build` - Builds the frontend for production
- `npm run lint` - Runs TypeScript type checking
- `npx convex dev` - Starts the Convex development server
- `npx convex deploy` - Deploys the application to Convex

### Project Features

#### Authentication
The application supports two authentication methods:
- **Password Authentication**: Traditional email/password sign-up and sign-in
- **Anonymous Authentication**: Quick access without account creation

#### Theme Support
- Toggle between light and dark modes
- Theme preference saved in localStorage
- Automatic detection of system preference

#### Data Management
- Real-time project and step updates
- Progress tracking with visual indicators
- CRUD operations for projects and steps

## 🌐 Deployment

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

## 👥 People Behind the Project

### Core Contributors

- **Ntwari K. Brian** - Lead Developer & Architect
- **Bilyv** - Project Maintainer & Backend Specialist

### Special Thanks

- The Convex team for providing an excellent serverless platform
- The React and Vite communities for outstanding development tools
- All open-source contributors whose work made this project possible

## 🤝 Contributing

Contributions are welcome! Please feel free to submit a Pull Request.

1. Fork the repository
2. Create your feature branch (`git checkout -b feature/AmazingFeature`)
3. Commit your changes (`git commit -m 'Add some AmazingFeature'`)
4. Push to the branch (`git push origin feature/AmazingFeature`)
5. Open a Pull Request

## 📄 License

This project is licensed under the MIT License - see the [LICENSE](LICENSE) file for details.

## 📞 Support

For support, email is ntwaribrian262@gmail.com or open an issue in the repository.