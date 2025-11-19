I have created the following plan after thorough exploration and analysis of the codebase. Follow the below plan verbatim. Trust the files and references. Do not re-verify what's written in the plan. Explore only when absolutely necessary. First implement all the proposed file changes and then I'll review all the changes together at the end.

### Observations

The codebase is a React + TypeScript project management SaaS application using Convex for backend, Tailwind CSS for styling, and Sonner for notifications. Currently, projects are owned by individual users with no collaboration features. The app already has a "Team" tab placeholder with an "Invite Team Members" button. The authentication system uses Convex Auth with Password and Anonymous providers. Modal patterns are established using fixed overlays with centered content.


### Approach

Implement a complete team invitation system by:
1. Extending the database schema to support project members, invitations, and permissions
2. Creating backend mutations and queries for invitation management
3. Building UI components for the invite flow (modal, accept/decline interface)
4. Adding route handling for invite links with token validation
5. Updating project access control to respect permissions
6. Displaying team members in the Team tab


### Reasoning

I explored the codebase structure, examined the authentication system in `convex/auth.ts`, reviewed the project schema and operations in `convex/schema.ts` and `convex/projects.ts`, analyzed existing modal patterns in `src/components/CreateProjectModal.tsx` and `src/components/ProjectModal.tsx`, and checked the routing setup in `src/App.tsx` and `convex/router.ts` to understand how to implement the team invite functionality.


## Mermaid Diagram

sequenceDiagram
    actor Owner as Project Owner
    actor Member as Team Member
    participant UI as App UI
    participant Backend as Convex Backend
    participant DB as Database
    
    Note over Owner,DB: Invitation Flow
    Owner->>UI: Click "Invite Team Members"
    UI->>Owner: Show InviteTeamModal
    Owner->>UI: Select Project
    Owner->>UI: Choose Permission (View/Modify)
    Owner->>UI: Click "Generate Link"
    UI->>Backend: createInvitation(projectId, permission)
    Backend->>DB: Insert invitation with token
    Backend->>UI: Return invite token
    UI->>Owner: Display invite link with copy button
    Owner->>UI: Copy link
    Owner->>Member: Share link (external)
    
    Note over Member,DB: Acceptance Flow
    Member->>UI: Open invite link
    UI->>UI: Parse token from URL
    alt Not Authenticated
        UI->>Member: Show Sign In
        Member->>UI: Sign In
    end
    UI->>Backend: getInvitationDetails(token)
    Backend->>DB: Query invitation
    Backend->>UI: Return invitation details
    UI->>Member: Show AcceptInviteModal
    Member->>UI: Click "Accept"
    UI->>Backend: acceptInvitation(token)
    Backend->>DB: Insert into projectMembers
    Backend->>DB: Update invitation status
    Backend->>UI: Return success
    UI->>Member: Show success message
    UI->>Member: Navigate to Team tab
    
    Note over Member,DB: Team Access
    Member->>UI: View project
    UI->>Backend: get(projectId)
    Backend->>DB: Check projectMembers
    Backend->>UI: Return project with permission
    UI->>Member: Show project (with permission restrictions)

## Proposed File Changes

### convex\schema.ts(MODIFY)

Add three new tables to support team collaboration:

1. **projectMembers** table:
   - projectId (reference to projects)
   - userId (reference to users)
   - permission (string: "view" or "modify")
   - addedAt (number timestamp)
   - addedBy (reference to users who invited them)
   - Index by projectId and userId for efficient lookups

2. **invitations** table:
   - projectId (reference to projects)
   - invitedBy (reference to users)
   - permission (string: "view" or "modify")
   - token (unique string for the invite link)
   - expiresAt (number timestamp, e.g., 7 days from creation)
   - status (string: "pending", "accepted", "declined", "expired")
   - acceptedBy (optional reference to users)
   - acceptedAt (optional number timestamp)
   - Index by token for quick lookup
   - Index by projectId to list invitations

These tables will enable tracking of project team members with their permissions and managing invitation lifecycle.

### convex\invitations.ts(NEW)

References: 

- convex\projects.ts(MODIFY)
- convex\auth.ts

Create a new Convex module for invitation management with the following functions:

**Mutations:**
1. **createInvitation**: Generate a new invitation
   - Accept projectId and permission level
   - Verify the user owns the project (check userId in projects table)
   - Generate a unique random token (use crypto.randomUUID() or similar)
   - Set expiration to 7 days from now
   - Insert into invitations table with status "pending"
   - Return the invitation token

2. **acceptInvitation**: Accept an invitation
   - Accept invitation token
   - Get authenticated userId
   - Look up invitation by token
   - Validate: not expired, status is "pending", user is authenticated
   - Check if user is already a member (query projectMembers)
   - If not a member, insert into projectMembers table
   - Update invitation status to "accepted", set acceptedBy and acceptedAt
   - Return success with projectId

3. **declineInvitation**: Decline an invitation
   - Accept invitation token
   - Look up invitation by token
   - Update status to "declined"
   - Return success

4. **revokeInvitation**: Cancel a pending invitation (for project owners)
   - Accept invitationId
   - Verify user owns the project
   - Update status to "expired"

**Queries:**
1. **getInvitationDetails**: Get invitation info for display
   - Accept token
   - Look up invitation with project details
   - Check if expired (compare expiresAt with current time)
   - Return invitation details including project name, permission, inviter name, expiration status

2. **listProjectInvitations**: List all invitations for a project
   - Accept projectId
   - Verify user owns the project
   - Return all invitations with status and details

Use `getAuthUserId` from `@convex-dev/auth/server` for authentication checks similar to `convex/projects.ts`.

### convex\projectMembers.ts(NEW)

References: 

- convex\projects.ts(MODIFY)
- convex\auth.ts

Create a new Convex module for project member management:

**Queries:**
1. **listProjectMembers**: Get all members of a project
   - Accept projectId
   - Verify user has access to the project (is owner or member)
   - Query projectMembers table by projectId
   - For each member, fetch user details (name, email) from users table
   - Include permission level and when they were added
   - Return array of member objects with user info and permissions

2. **getUserProjects**: Get all projects where user is a member (not owner)
   - Get authenticated userId
   - Query projectMembers table by userId
   - For each membership, fetch project details with progress (similar to `convex/projects.ts` list query)
   - Return array of projects with permission level

3. **checkUserPermission**: Check if user has access to a project
   - Accept projectId and userId
   - Check if user is the owner (query projects table)
   - If not owner, check projectMembers table
   - Return permission level ("owner", "modify", "view", or null)

**Mutations:**
1. **removeMember**: Remove a team member from a project
   - Accept projectId and memberUserId
   - Verify requester is the project owner
   - Delete the projectMembers entry
   - Return success

2. **updateMemberPermission**: Change a member's permission level
   - Accept projectId, memberUserId, and new permission
   - Verify requester is the project owner
   - Update the projectMembers entry
   - Return success

Reference the authentication pattern from `convex/auth.ts` and project query patterns from `convex/projects.ts`.

### convex\projects.ts(MODIFY)

References: 

- convex\projectMembers.ts(NEW)

Update project queries to support team collaboration:

1. **Modify the `list` query**:
   - Keep existing logic for owned projects
   - Additionally query projectMembers table for projects where user is a member
   - Fetch project details for member projects
   - Combine owned and member projects
   - Add a field to indicate if user is owner or member (with permission level)
   - Return the combined list with progress calculations

2. **Modify the `get` query**:
   - Change authorization check: instead of only checking `project.userId !== userId`
   - Also check if user is a member in projectMembers table
   - If user is a member, include their permission level in the response
   - Return null only if user has no access (not owner and not member)

3. **Modify the `update` mutation**:
   - Check if user is owner OR has "modify" permission
   - Query projectMembers table to check permission level
   - Allow update if user is owner or has "modify" permission
   - Throw error if user only has "view" permission

4. **Modify the `remove` mutation**:
   - Only allow project owner to delete (keep existing check)
   - Do not allow members to delete, even with "modify" permission

Reference the new `convex/projectMembers.ts` module for permission checking. Import and use the checkUserPermission query where needed.

### src\components\InviteTeamModal.tsx(NEW)

References: 

- src\components\CreateProjectModal.tsx
- src\components\ProjectModal.tsx

Create a new React component for the team invitation modal following the pattern from `src/components/CreateProjectModal.tsx`:

**Component Structure:**
1. **Props**: onClose callback

2. **State Management**:
   - selectedProjectId (Id<"projects"> or null)
   - selectedPermission ("view" or "modify")
   - inviteLink (string or null)
   - isGenerating (boolean for loading state)
   - showCopySuccess (boolean for copy feedback)

3. **Data Fetching**:
   - Use useQuery to fetch user's projects (api.projects.list)
   - Filter to show only owned projects (where user is owner)

4. **UI Layout** (multi-step within same modal):
   - **Step 1**: Project Selection
     - Dropdown/select to choose project
     - Show project name with color indicator
   - **Step 2**: Permission Selection (shown after project selected)
     - Radio buttons or toggle for "View Only" vs "Can Modify"
     - Brief description of each permission level
   - **Step 3**: Generate & Share (shown after permission selected)
     - Button to generate invite link
     - Once generated, display the full invite link in a read-only input
     - Copy button with icon (use clipboard API)
     - Show success toast when copied using Sonner

5. **Functionality**:
   - Use useMutation for api.invitations.createInvitation
   - Generate link format: `${window.location.origin}/invite/${token}`
   - Handle copy to clipboard with navigator.clipboard.writeText
   - Show visual feedback on copy (checkmark icon, toast notification)

6. **Styling**:
   - Follow the modal pattern from `CreateProjectModal.tsx`
   - Use Tailwind classes consistent with the app theme
   - Support dark mode with dark: variants
   - Use gradient buttons for primary actions

Reference the modal styling and structure from `src/components/CreateProjectModal.tsx` and `src/components/ProjectModal.tsx`.

### src\components\AcceptInviteModal.tsx(NEW)

References: 

- src\components\CreateProjectModal.tsx
- src\components\ProjectModal.tsx

Create a new React component for accepting/declining invitations:

**Component Structure:**
1. **Props**:
   - invitationToken (string)
   - onClose callback
   - onAccept callback (to redirect to team tab)

2. **State Management**:
   - isAccepting (boolean)
   - isDeclining (boolean)
   - showSuccess (boolean)

3. **Data Fetching**:
   - Use useQuery for api.invitations.getInvitationDetails with token
   - Handle loading state while fetching
   - Handle error state (invalid/expired token)

4. **UI Layout**:
   - Display project name and color
   - Show who invited them (inviter's name)
   - Display permission level being granted ("View Only" or "Can Modify")
   - Show expiration info if close to expiring
   - Two prominent buttons: "Accept" (gradient) and "Decline" (outline)
   - If expired, show message and disable buttons

5. **Functionality**:
   - Use useMutation for api.invitations.acceptInvitation
   - Use useMutation for api.invitations.declineInvitation
   - On accept success:
     - Show success message with Sonner toast
     - Call onAccept callback to navigate to team tab
   - On decline:
     - Show confirmation toast
     - Close modal
   - Handle errors (already accepted, expired, etc.)

6. **Success State**:
   - After accepting, show a success message in the modal
   - Display checkmark icon with animation
   - Message: "You've successfully joined the team!"
   - Auto-close after 2 seconds or provide "Go to Team" button

7. **Styling**:
   - Follow modal pattern from `src/components/CreateProjectModal.tsx`
   - Use project color for visual accent
   - Support dark mode
   - Add subtle animations for state transitions

Reference modal patterns from `src/components/CreateProjectModal.tsx` and `src/components/ProjectModal.tsx`.

### src\components\TeamMembersList.tsx(NEW)

References: 

- src\components\ProjectList.tsx(MODIFY)
- src\components\ProjectCard.tsx

Create a new React component to display team members for a project:

**Component Structure:**
1. **Props**:
   - projectId (Id<"projects">)
   - isOwner (boolean)

2. **Data Fetching**:
   - Use useQuery for api.projectMembers.listProjectMembers
   - Show loading state while fetching

3. **UI Layout**:
   - List of team members with:
     - Avatar (colored circle with initial)
     - Name and email
     - Permission badge ("View Only" or "Can Modify")
     - Date added
     - If isOwner: action buttons (change permission, remove)
   - Empty state if no members yet
   - Show project owner separately at the top with "Owner" badge

4. **Functionality** (if isOwner):
   - Use useMutation for api.projectMembers.removeMember
   - Use useMutation for api.projectMembers.updateMemberPermission
   - Dropdown menu for each member with actions
   - Confirmation dialog before removing member
   - Toast notifications for actions

5. **Styling**:
   - Card-based layout for each member
   - Use Tailwind for consistent styling
   - Permission badges with color coding (blue for modify, gray for view)
   - Hover effects for interactive elements
   - Support dark mode

Reference the list patterns from `src/components/ProjectList.tsx` and card styling from `src/components/ProjectCard.tsx`.

### src\App.tsx(MODIFY)

References: 

- src\components\InviteTeamModal.tsx(NEW)
- src\components\AcceptInviteModal.tsx(NEW)
- src\components\TeamMembersList.tsx(NEW)

Update the App component to support team invitation flow:

1. **Add State Management**:
   - showInviteModal (boolean)
   - inviteToken (string or null) - for handling invite links

2. **Update Team Tab Section** (around line 285-303):
   - Replace the placeholder content with actual team management UI
   - Add button to open InviteTeamModal (connect to showInviteModal state)
   - Display list of projects with team members
   - For each project, show TeamMembersList component
   - Add section to show projects where user is a member (not owner)

3. **Add Route Handling for Invite Links**:
   - Use useEffect to check URL for invite token on mount
   - Parse URL pattern: `/invite/:token` or query param `?invite=token`
   - If invite token found in URL:
     - Check if user is authenticated
     - If authenticated: show AcceptInviteModal
     - If not authenticated: store token in sessionStorage, show sign-in, then show modal after auth
   - Clear token from URL after processing

4. **Add Modal Components**:
   - Render InviteTeamModal when showInviteModal is true
   - Render AcceptInviteModal when inviteToken is present and user is authenticated
   - Pass appropriate callbacks for closing and navigation

5. **Handle Post-Accept Navigation**:
   - After accepting invite, set activeTab to 'team'
   - Scroll to the relevant project or show success message

6. **Import New Components**:
   - Import InviteTeamModal from `./components/InviteTeamModal`
   - Import AcceptInviteModal from `./components/AcceptInviteModal`
   - Import TeamMembersList from `./components/TeamMembersList`

Reference the existing modal usage pattern for ProfilePage (lines 124-127) and the tab switching logic (lines 137, 266-346).

### src\components\ProjectList.tsx(MODIFY)

References: 

- convex\projects.ts(MODIFY)

Update ProjectList to display both owned and member projects:

1. **Update Data Fetching**:
   - The api.projects.list query will now return both owned and member projects (after backend changes)
   - Each project should include an indicator of user's role (owner/member) and permission level

2. **Update UI Display**:
   - Group projects into two sections:
     - "Your Projects" (owned projects)
     - "Shared With You" (member projects)
   - Add a small badge or indicator on project cards showing permission level for member projects
   - For member projects with "view" permission, disable edit/delete actions

3. **Update Project Actions**:
   - Check permission level before showing edit/delete buttons
   - Only show delete for owned projects
   - Show edit only for owned projects or projects with "modify" permission
   - Add visual indicator (lock icon) for view-only projects

4. **Empty States**:
   - Update empty state messages to account for both sections
   - If user has no owned projects but has member projects, show appropriate message

Reference the project card rendering and action handling in the existing ProjectList implementation.

### src\components\index.ts(MODIFY)

Add exports for the new components:

1. Export InviteTeamModal
2. Export AcceptInviteModal
3. Export TeamMembersList

Follow the existing export pattern in the file.

### convex\steps.ts(MODIFY)

References: 

- convex\projectMembers.ts(NEW)
- convex\projects.ts(MODIFY)

Update step operations to respect project permissions:

1. **Modify mutations** (create, update, remove, toggle):
   - Before performing any modification, check user's permission for the project
   - Get the project from the stepId or projectId
   - Use the checkUserPermission function from `convex/projectMembers.ts`
   - Allow modifications if user is owner or has "modify" permission
   - Throw error if user only has "view" permission or no access

2. **Queries** (listByProject, get):
   - Update to allow access if user is owner or member (any permission level)
   - Use checkUserPermission to verify access
   - Return null or empty array if user has no access

Reference the permission checking pattern that will be implemented in `convex/projects.ts`.

### convex\subtasks.ts(MODIFY)

References: 

- convex\projectMembers.ts(NEW)
- convex\steps.ts(MODIFY)
- convex\projects.ts(MODIFY)

Update subtask operations to respect project permissions:

1. **Modify mutations** (create, update, remove, toggle):
   - Get the step from stepId, then get the project from step.projectId
   - Use checkUserPermission from `convex/projectMembers.ts` to verify access
   - Allow modifications if user is owner or has "modify" permission
   - Throw error if user only has "view" permission or no access

2. **Queries** (listByStep):
   - Verify user has access to the parent project
   - Use checkUserPermission to check access
   - Return empty array if user has no access

Reference the permission checking pattern from `convex/steps.ts` and `convex/projects.ts`.