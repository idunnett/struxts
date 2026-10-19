/* eslint-disable */
/**
 * Generated `api` utility.
 *
 * THIS CODE IS AUTOMATICALLY GENERATED.
 *
 * To regenerate, run `npx convex dev`.
 * @module
 */

import type * as auth from "../auth.js";
import type * as billing from "../billing.js";
import type * as dataFix from "../dataFix.js";
import type * as edges from "../edges.js";
import type * as files from "../files.js";
import type * as folders from "../folders.js";
import type * as http from "../http.js";
import type * as lib_auth from "../lib/auth.js";
import type * as lib_users from "../lib/users.js";
import type * as migration from "../migration.js";
import type * as migrationHelpers from "../migrationHelpers.js";
import type * as nodes from "../nodes.js";
import type * as orgStructureUsers from "../orgStructureUsers.js";
import type * as organizations from "../organizations.js";
import type * as stripe from "../stripe.js";
import type * as structures from "../structures.js";
import type * as users from "../users.js";

import type {
  ApiFromModules,
  FilterApi,
  FunctionReference,
} from "convex/server";

declare const fullApi: ApiFromModules<{
  auth: typeof auth;
  billing: typeof billing;
  dataFix: typeof dataFix;
  edges: typeof edges;
  files: typeof files;
  folders: typeof folders;
  http: typeof http;
  "lib/auth": typeof lib_auth;
  "lib/users": typeof lib_users;
  migration: typeof migration;
  migrationHelpers: typeof migrationHelpers;
  nodes: typeof nodes;
  orgStructureUsers: typeof orgStructureUsers;
  organizations: typeof organizations;
  stripe: typeof stripe;
  structures: typeof structures;
  users: typeof users;
}>;

/**
 * A utility for referencing Convex functions in your app's public API.
 *
 * Usage:
 * ```js
 * const myFunctionReference = api.myModule.myFunction;
 * ```
 */
export declare const api: FilterApi<
  typeof fullApi,
  FunctionReference<any, "public">
>;

/**
 * A utility for referencing Convex functions in your app's internal API.
 *
 * Usage:
 * ```js
 * const myFunctionReference = internal.myModule.myFunction;
 * ```
 */
export declare const internal: FilterApi<
  typeof fullApi,
  FunctionReference<any, "internal">
>;

export declare const components: {};
