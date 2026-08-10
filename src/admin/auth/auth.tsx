// Replaced by auth.ts — all auth now uses Supabase
export { ROLES, getUserRole, doSignInWithGoogle, doSignInWithEmailAndPassword, doSignOut, doCreateUserWithEmailAndPassword } from './auth';
export class UnauthorizedRoleError extends Error {
  constructor(message = "Unauthorized role") {
    super(message);
    this.name = "UnauthorizedRoleError";
  }
}
