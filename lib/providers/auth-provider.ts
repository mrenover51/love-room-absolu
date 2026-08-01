export type Role="admin";
export interface AuthProvider { getUser():Promise<{id:string;email?:string}|null>; signOut():Promise<void> }
