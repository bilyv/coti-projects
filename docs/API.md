# API Documentation

This document provides detailed information about the Cotim Project Progress Tracker API endpoints and functions.

## Table of Contents

- [Overview](#overview)
- [Authentication](#authentication)
- [Projects API](#projects-api)
- [Steps API](#steps-api)
- [User API](#user-api)

## Overview

The API is built using Convex functions which provide real-time capabilities and automatic type safety. All functions are strongly typed and can be called directly from the frontend.

## Authentication

Authentication is handled by Convex Auth. All protected functions require a valid session.

### Session Management

- Sessions are automatically managed by the Convex Auth library
- Anonymous sessions are supported for guest access
- Password-based authentication for registered users

## Projects API

### list()

**Description**: Retrieve all projects for the authenticated user

**Function Type**: Query

**Parameters**: None

**Returns**: 
```typescript
Array<{
  _id: Id<"projects">,
  name: string,
  description?: string,
  userId: Id<"users">,
  color: string,
  totalSteps: number,
  completedSteps: number,
  progress: number
}>
```

**Example Usage**:
```typescript
const projects = useQuery(api.projects.list);
```

### create()

**Description**: Create a new project

**Function Type**: Mutation

**Parameters**:
```typescript
{
  name: string,
  description?: string,
  color: string
}
```

**Returns**: `Id<"projects">`

**Example Usage**:
```typescript
const createProject = useMutation(api.projects.create);
await createProject({
  name: "New Project",
  description: "Project description",
  color: "#3b82f6"
});
```

### remove()

**Description**: Delete a project and all its steps

**Function Type**: Mutation

**Parameters**:
```typescript
{
  projectId: Id<"projects">
}
```

**Returns**: None

**Example Usage**:
```typescript
const removeProject = useMutation(api.projects.remove);
await removeProject({ projectId: "project-id" });
```

## Steps API

### listByProject()

**Description**: Retrieve all steps for a project ordered by sequence

**Function Type**: Query

**Parameters**:
```typescript
{
  projectId: Id<"projects">
}
```

**Returns**: 
```typescript
Array<{
  _id: Id<"steps">,
  projectId: Id<"projects">,
  title: string,
  description?: string,
  order: number,
  isCompleted: boolean,
  isUnlocked: boolean
}>
```

**Example Usage**:
```typescript
const steps = useQuery(api.steps.listByProject, { projectId: "project-id" });
```

### create()

**Description**: Create a new step

**Function Type**: Mutation

**Parameters**:
```typescript
{
  projectId: Id<"projects">,
  title: string,
  description?: string
}
```

**Returns**: `Id<"steps">`

**Example Usage**:
```typescript
const createStep = useMutation(api.steps.create);
await createStep({
  projectId: "project-id",
  title: "New Step",
  description: "Step description"
});
```

### toggleComplete()

**Description**: Toggle step completion status

**Function Type**: Mutation

**Parameters**:
```typescript
{
  stepId: Id<"steps">
}
```

**Returns**: None

**Example Usage**:
```typescript
const toggleComplete = useMutation(api.steps.toggleComplete);
await toggleComplete({ stepId: "step-id" });
```

### remove()

**Description**: Delete a step

**Function Type**: Mutation

**Parameters**:
```typescript
{
  stepId: Id<"steps">
}
```

**Returns**: None

**Example Usage**:
```typescript
const removeStep = useMutation(api.steps.remove);
await removeStep({ stepId: "step-id" });
```

## User API

### loggedInUser()

**Description**: Retrieve the currently authenticated user

**Function Type**: Query

**Parameters**: None

**Returns**: 
```typescript
{
  _id: Id<"users">,
  name?: string,
  email?: string,
  phone?: string
} | null
```

**Example Usage**:
```typescript
const user = useQuery(api.auth.loggedInUser);
```

### updateUserProfile()

**Description**: Update the user's profile information

**Function Type**: Mutation

**Parameters**:
```typescript
{
  name: string
}
```

**Returns**: `Id<"users">`

**Example Usage**:
```typescript
const updateUserProfile = useMutation(api.auth.updateUserProfile);
await updateUserProfile({ name: "John Doe" });
```