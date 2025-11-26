// app/api/auth/register/route.ts


import { NextResponse } from "next/server";
import type { NextRequest } from "next/server";
import  prisma  from "@/app/lib/prisma";
import { hash } from "bcryptjs";

export async function POST(req: NextRequest) {
  try {
    const { name, email, password } = await req.json();

    if (!email || !password) {
      return NextResponse.json(
        { message: "Email and password are required" },
        { status: 400 }
      );
    }

    // Check if user already exists
    const existingUser = await prisma.user.findUnique({
      where: { email },
    });

    if (existingUser) {
      return NextResponse.json(
        { message: "User already exists" },
        { status: 409 }
      );
    }

    const saltRounds = Number(process.env.BCRYPT_SALT_ROUNDS ?? 12);
    const passwordHash = await hash(password, saltRounds);

    // Create new user
    const newUser = await prisma.user.create({
      data: {
        name,
        email,
        passwordHash,
      },
      select: {
        id: true,
        email: true,
      },
    });

    return NextResponse.json(newUser, { status: 201 });
  } catch (err) {
    console.error("POST /api/auth/register error", err);
    return NextResponse.json(
      { message: "Failed to register user" },
      { status: 500 }
    );
  }
}









// import { NextResponse } from 'next/server';
// import type { NextRequest } from 'next/server';
// import { supabase } from '@/app/_lib/supabase';
// import { hash } from 'bcryptjs';

// export async function POST(req: NextRequest) {
//   try {
//     const { name, email, password } = await req.json();

//     if (!email || !password) {
//       return NextResponse.json(
//         { message: 'Email and password are required' },
//         { status: 400 }
//       );
//     }

//     const { data: existingUsers, error: fetchError } = await supabase
//       .from('users')
//       .select('id')
//       .eq('email', email)
//       .limit(1);

//     if (fetchError) {
//       console.error('Error checking existing user:', fetchError);
//       return NextResponse.json(
//         { message: 'Error checking user' },
//         { status: 500 }
//       );
//     }

//     if (existingUsers && existingUsers.length > 0) {
//       return NextResponse.json(
//         { message: 'User already exists' },
//         { status: 409 }
//       );
//     }

//     const saltRounds = Number(process.env.BCRYPT_SALT_ROUNDS ?? 12);
//     const passwordHash = await hash(password, saltRounds);

//     const { data: newUser, error: insertError } = await supabase
//       .from('users')
//       .insert([{ name, email, passwordHash }])
//       .select('id, email')
//       .single();

//     if (insertError || !newUser) {
//       console.error('Error creating user:', insertError);
//       return NextResponse.json(
//         { message: 'Failed to register user' },
//         { status: 500 }
//       );
//     }

//     return NextResponse.json(
//       { id: newUser.id, email: newUser.email },
//       { status: 201 }
//     );
//   } catch (err) {
//     console.error('POST /api/auth/register error', err);
//     return NextResponse.json(
//       { message: 'Failed to register user' },
//       { status: 500 }
//     );
//   }
// }