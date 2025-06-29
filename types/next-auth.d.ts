import { UserRole } from '@prisma/client';
import NextAuth, { DefaultSession, DefaultUser } from 'next-auth';

declare module 'next-auth' {
  /**
   * Returned by `useSession`, `getSession` and received as a prop on the `SessionProvider` React Context
   */
  interface Session {
    user: {
      id: string;
      role: UserRole;
      emailVerified: boolean | null;
      /** The user's postal address. */
      address: string;
    } & DefaultSession['user'];
  }
  interface User extends DefaultUser {
    role: UserRole;
  }
}
