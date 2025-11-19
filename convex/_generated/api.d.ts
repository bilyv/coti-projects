/* eslint-disable */
/**
 * Generated `api` utility.
 *
 * THIS CODE IS AUTOMATICALLY GENERATED.
 *
 * To regenerate, run `npx convex dev`.
 * @module
 */

import type {
  ApiFromModules,
  FilterApi,
  FunctionReference,
} from "convex/server";
import type * as auth from "../auth.js";
import type * as http from "../http.js";
import type * as invitations from "../invitations.js";
import type * as projectMembers from "../projectMembers.js";
import type * as projects from "../projects.js";
import type * as router from "../router.js";
import type * as steps from "../steps.js";
import type * as subtasks from "../subtasks.js";

/**
 * A utility for referencing Convex functions in your app's API.
 *
 * Usage:
 * ```js
 * const myFunctionReference = api.myModule.myFunction;
 * ```
 */
declare const fullApi: ApiFromModules<{
  auth: typeof auth;
  http: typeof http;
  invitations: typeof invitations;
  projectMembers: typeof projectMembers;
  projects: typeof projects;
  router: typeof router;
  steps: typeof steps;
  subtasks: typeof subtasks;
}>;
export declare const api: FilterApi<
  typeof fullApi,
  FunctionReference<any, "public">
>;
export declare const internal: FilterApi<
  typeof fullApi,
  FunctionReference<any, "internal">
>;
