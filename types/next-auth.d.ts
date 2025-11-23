// // types/next-auth.d.ts
// import NextAuth from "next-auth";

// declare module "next-auth" {
//   interface Session {
//     user: {
//       id: string;
//       name?: string | null;
//       email?: string | null;
//       image?: string | null;
//       role?: string;
//     };
//   }

//   interface User {
//     id: string;
//     name?: string | null;
//     email?: string | null;
//     image?: string | null;
//     role?: string;
//   }
// }

// declare module "next-auth/jwt" {
//   interface JWT {
//     id?: string;
//     role?: string;
//   }
// }


// types/next-auth.d.ts
import NextAuth, { DefaultSession } from "next-auth";

declare module "next-auth" {
  interface Session {
    user: {
      id: string; // ✅ always a string
      name?: string | null;
      email?: string | null;
      image?: string | null;
      role?: string;
    };
  }

  interface User {
    id: string;
    name?: string | null;
    email?: string | null;
    image?: string | null;
    role?: string;
  }
}

declare module "next-auth/jwt" {
  interface JWT {
    id?: string;
    role?: string;
  }
}
