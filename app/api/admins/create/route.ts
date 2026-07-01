import { NextResponse } from "next/server";
import bcrypt from "bcryptjs";

import { prisma } from "@/app/lib/prisma";

import { requireSuperAdmin } from "@/app/lib/auth/guards";
import { handleApiError } from "@/app/lib/auth/api";
import { permissionsToAdminProfile } from "@/app/lib/auth/admin-permissions";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

const ALLOWED_PERMISSIONS = [
  "manageAdmins",
  "manageUsers",
  "manageBlogs",
  "manageProducts",
  "manageOrders",
  "manageMessages",
  "manageSettings",
  "manageCategories",
  "manageVendors",
  "manageVerifications",
  "manageSubscribers",
  "manageReviews",
  "manageActivity",
  "manageTrending",
  "manageSupport",
  "managePayout",
] as const;

export async function POST(req: Request) {
  try {
    /**
     * ----------------------------------------------------------------
     * SECURITY
     * ----------------------------------------------------------------
     */

    const session = await requireSuperAdmin();

    /**
     * ----------------------------------------------------------------
     * REQUEST
     * ----------------------------------------------------------------
     */

    const body = await req.json();

    const {
      name,
      email,
      password,
      permissions,
    } = body;

    /**
     * ----------------------------------------------------------------
     * VALIDATION
     * ----------------------------------------------------------------
     */

    if (!name || !email || !password) {
      return NextResponse.json(
        {
          success: false,
          error:
            "Missing required fields: name, email and password.",
        },
        {
          status: 400,
        }
      );
    }

    const normalizedEmail = email
      .toLowerCase()
      .trim();

    if (
      !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(
        normalizedEmail
      )
    ) {
      return NextResponse.json(
        {
          success: false,
          error: "Invalid email format.",
        },
        {
          status: 400,
        }
      );
    }

    if (password.length < 8) {
      return NextResponse.json(
        {
          success: false,
          error:
            "Password must be at least 8 characters.",
        },
        {
          status: 400,
        }
      );
    }

    /**
     * ----------------------------------------------------------------
     * PERMISSIONS
     * ----------------------------------------------------------------
     */

    const safePermissions: Partial<
      Record<
        (typeof ALLOWED_PERMISSIONS)[number],
        boolean
      >
    > = {};

    if (
      permissions &&
      typeof permissions === "object"
    ) {
      for (const key of ALLOWED_PERMISSIONS) {
        const value = permissions[key];

        if (typeof value === "boolean") {
          safePermissions[key] = value;
        }
      }
    }

    /**
     * ----------------------------------------------------------------
     * DUPLICATE EMAIL
     * ----------------------------------------------------------------
     */

    const existingUser =
      await prisma.user.findUnique({
        where: {
          email: normalizedEmail,
        },
      });

    if (existingUser) {
      return NextResponse.json(
        {
          success: false,
          error: "Email already exists.",
        },
        {
          status: 400,
        }
      );
    }

    /**
     * ----------------------------------------------------------------
     * CREATE ADMIN
     * ----------------------------------------------------------------
     */

    const passwordHash =
      await bcrypt.hash(password, 10);

    const newAdmin =
      await prisma.user.create({
        data: {
          name,

          email: normalizedEmail,

          passwordHash,

          role: "ADMIN",

          roles: ["ADMIN"],

          IsVerified: true,

          adminProfile: {
            create: {
              ...permissionsToAdminProfile(
                safePermissions
              ),
            },
          },
        },

        include: {
          adminProfile: true,
        },
      });

    /**
     * ----------------------------------------------------------------
     * AUDIT (Temporary)
     * ----------------------------------------------------------------
     */

    console.log(
      `[Admin Created] By: ${session.user.email} → ${newAdmin.email}`
    );

    /**
     * ----------------------------------------------------------------
     * RESPONSE
     * ----------------------------------------------------------------
     */

    const {
      passwordHash: _passwordHash,
      ...safeUser
    } = newAdmin;

    return NextResponse.json(
      {
        success: true,
        message:
          "Administrator created successfully.",
        user: safeUser,
      },
      {
        status: 201,
      }
    );
  } catch (error) {
    return handleApiError(error);
  }
}