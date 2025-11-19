# Deployment Guide

This guide provides instructions for deploying the Coti Project Progress Tracker application.

## Table of Contents

- [Prerequisites](#prerequisites)
- [Local Development](#local-development)
- [Convex Deployment](#convex-deployment)
- [Frontend Deployment](#frontend-deployment)
- [Environment Variables](#environment-variables)
- [CI/CD Setup](#ci-cd-setup)

## Prerequisites

Before deploying, ensure you have:

1. Node.js (version 18 or higher)
2. npm or yarn package manager
3. A Convex account (free tier available)
4. Git installed

## Local Development

### Setup

1. Clone the repository:
   ```bash
   git clone https://github.com/bilyv/coti-projects.git
   cd coti-projects
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

### Running the Development Server

1. Start the development server:
   ```bash
   npm run dev
   ```

2. Open your browser to `http://localhost:5173` to view the application.

### Available Scripts

- `npm run dev` - Starts both frontend and backend development servers
- `npm run build` - Builds the frontend for production
- `npm run lint` - Runs TypeScript type checking
- `npx convex dev` - Starts the Convex development server
- `npx convex deploy` - Deploys the application to Convex

## Convex Deployment

### Initial Setup

1. Create a Convex account at [convex.dev](https://convex.dev)
2. Install the Convex CLI globally:
   ```bash
   npm install -g convex
   ```

3. Authenticate with Convex:
   ```bash
   npx convex login
   ```

### Deploying the Backend

1. Deploy the Convex functions:
   ```bash
   npx convex deploy
   ```

2. The deployment will output your Convex URL which you'll need for frontend deployment.

### Managing Deployments

- View your deployments: `npx convex dashboard`
- Switch between deployments: `npx convex switch`
- Delete a deployment: `npx convex delete`

## Frontend Deployment

### Building the Application

1. Build the frontend:
   ```bash
   npm run build
   ```

2. The build output will be in the `dist` directory.

### Deploying to Convex Hosting

1. Ensure you have the Convex CLI installed and authenticated
2. Deploy with the build command:
   ```bash
   npx convex deploy --cmd "vite build" --cmd-url-env-var-name "VITE_CONVEX_URL"
   ```

### Deploying to Cloudflare Pages

1. Build the frontend:
   ```bash
   npm run build
   ```

2. Deploy the `dist` folder to Cloudflare Pages through the dashboard or using Wrangler:
   ```bash
   npm install -g wrangler
   wrangler pages deploy dist
   ```

3. Set the following environment variables in Cloudflare:
   - `VITE_CONVEX_URL`: Your Convex deployment URL

### Deploying to Other Platforms

The application can be deployed to any static hosting platform that supports SPA routing:

1. Build the application: `npm run build`
2. Upload the contents of the `dist` folder
3. Configure routing to serve `index.html` for all routes (SPA fallback)

## Environment Variables

### Required Variables

- `VITE_CONVEX_URL`: The URL of your Convex deployment

### Setting Up Environment Variables

For production deployment, you should create a `.env.production` file with your actual Convex URL:

1. Copy the example file:
   ```bash
   cp .env.production.example .env.production
   ```

2. Update the `.env.production` file with your actual Convex deployment URL:
   ```bash
   # .env.production
   VITE_CONVEX_URL=https://your-actual-app-123.convex.cloud
   ```

**Important Security Note**: The `.env.production` file is excluded from version control via `.gitignore` to prevent accidental exposure of your deployment URLs. Never commit actual environment files containing sensitive information to your repository.

### Platform-Specific Environment Variable Setup

#### Convex Hosting
When using `npx convex deploy`, Convex automatically sets the required environment variables.

#### Cloudflare Pages
Set environment variables in the Cloudflare Pages dashboard under your project settings:
- Variable name: `VITE_CONVEX_URL`
- Value: Your actual Convex deployment URL (e.g., https://your-app-123.convex.cloud)

#### Other Platforms
For other hosting platforms, set environment variables according to their documentation. The application expects the `VITE_CONVEX_URL` environment variable to be available at build time.

## CI/CD Setup

### GitHub Actions Example

Create `.github/workflows/deploy.yml`:

```yaml
name: Deploy to Convex

on:
  push:
    branches: [main]

jobs:
  deploy:
    runs-on: ubuntu-latest
    
    steps:
    - uses: actions/checkout@v3
    
    - name: Setup Node.js
      uses: actions/setup-node@v3
      with:
        node-version: '18'
        cache: 'npm'
    
    - name: Install dependencies
      run: npm ci
    
    - name: Deploy to Convex
      run: npx convex deploy
      env:
        CONVEX_DEPLOY_KEY: ${{ secrets.CONVEX_DEPLOY_KEY }}
```

### Environment Secrets

Set the following secrets in your GitHub repository:

- `CONVEX_DEPLOY_KEY`: Your Convex deployment key

## Monitoring and Maintenance

### Logging

Convex provides built-in logging for all functions. View logs with:

```bash
npx convex logs
```

### Performance Monitoring

- Monitor function execution times in the Convex dashboard
- Set up alerts for error rates
- Use Convex's built-in performance metrics

### Backup and Recovery

- Convex automatically backs up your data
- Export data using: `npx convex export`
- Import data using: `npx convex import`

## Troubleshooting

### Common Issues

1. **Deployment fails with authentication errors**
   - Ensure you're logged into Convex: `npx convex login`
   - Check your deployment key permissions

2. **Frontend can't connect to backend**
   - Verify `VITE_CONVEX_URL` is set correctly
   - Check that the Convex deployment is running

3. **Build fails**
   - Ensure all dependencies are installed: `npm install`
   - Check for TypeScript errors: `npm run lint`

### Getting Help

- Check the [Convex documentation](https://docs.convex.dev)
- Open an issue in the repository
- Contact Convex support