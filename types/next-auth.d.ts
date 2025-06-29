import { Enum_RoleName } from '@prisma/client';
import NextAuth, { DefaultSession, DefaultUser } from 'next-auth';

declare module 'next-auth' {
  /**
   * Returned by `useSession`, `getSession` and received as a prop on the `SessionProvider` React Context
   */
  interface Session {
    user: {
      id: string;
      role: Enum_RoleName;
      emailVerified: boolean | null;
    } & DefaultSession['user'];
  }
  interface User extends DefaultUser {
    role: Enum_RoleName;
  }
}
