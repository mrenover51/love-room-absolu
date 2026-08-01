import type { Role } from "./auth-provider";
export interface AdminProvider { hasRole(userId:string,role:Role):Promise<boolean> }
