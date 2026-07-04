import bcrypt from "bcrypt";
import jwt from "jsonwebtoken";
import { randomInt } from "crypto";
import {
  UserRole,
  VendorStatus,
  VerificationType,
} from "@prisma/client";
import { prisma } from "@/app/lib/prisma";

import {
  badRequest,
  notFound,
} from "@/app/lib/auth/errors";

import { sendPasswordResetEmail } from "@/app/lib/mailer";

import {
  getLatestVerification,
  validateVerification,
  cleanupVerification,
} from "@/app/lib/registration";
import { sendVerificationEmail } from "@/app/lib/mailer";

export class AuthService {
  /**
   * Authenticate a user and build the session payload.
   */
  static async login(
    email: string,
    password: string
  ) {
    if (!email || !password) {
      throw badRequest(
        "Email and password are required."
      );
    }

    const user = await prisma.user.findUnique({
      where: {
        email,
      },
    });

    if (!user || !user.passwordHash) {
      throw badRequest(
        "Invalid email or password."
      );
    }

    const passwordMatches =
      await bcrypt.compare(
        password,
        user.passwordHash
      );

    if (!passwordMatches) {
      throw badRequest(
        "Invalid email or password."
      );
    }

    let profile: {
      id: string;
    } | null = null;

    switch (user.role) {
      case UserRole.SUPER_ADMIN:
      case UserRole.ADMIN:
        profile =
          await prisma.adminProfile.findUnique({
            where: {
              userId: user.id,
            },
          });
        break;

      case UserRole.VENDOR:
        profile =
          await prisma.vendorProfile.findUnique({
            where: {
              userId: user.id,
            },
          });
        break;

      case UserRole.CUSTOMER:
        profile =
          await prisma.customerProfile.findUnique({
            where: {
              userId: user.id,
            },
          });
        break;
    }

    if (!profile) {
      throw notFound(
        "Profile not found for this user."
      );
    }

    return {
      id: user.id,
      email: user.email,
      role: user.role,
      name: user.name ?? "User",
      profileId: profile.id,
    };
  }

  /**
   * Send password reset code.
   */
  static async sendPasswordResetCode(
    email: string
  ) {
    if (
      !email ||
      !/^\S+@\S+\.\S+$/.test(email)
    ) {
      throw badRequest("Invalid email.");
    }

    const user =
      await prisma.user.findUnique({
        where: {
          email,
        },
      });

    if (!user) {
      throw notFound(
        "No account found with this email."
      );
    }

   const resetCode =
      randomInt(
        100000,
        999999
      ).toString();

    await prisma.passwordResetToken.upsert({
      where: {
        userId: user.id,
      },

      update: {
        token: resetCode,
        expiresAt: new Date(
          Date.now() +
            10 * 60 * 1000
        ),
      },

      create: {
        userId: user.id,
        token: resetCode,
        expiresAt: new Date(
          Date.now() +
            10 * 60 * 1000
        ),
      },
    });

    await sendPasswordResetEmail({
      email: user.email,
      token: resetCode,
    });

    return {
      success: true,
      message:
        "Password reset code sent successfully.",
    };
  }

  /**
 * Complete customer registration after email verification.
 */
static async registerCustomer(
  email: string,
  name: string
) {
  const existing = await prisma.user.findUnique({
    where: {
      email,
    },
  });

  if (existing) {
    throw badRequest(
      "Email already registered."
    );
  }

  const verification =
    await getLatestVerification(
      email,
      VerificationType.CUSTOMER_REGISTRATION
    );

  const check =
    validateVerification(verification);

  if (!check.valid) {
    throw badRequest(
      check.error ??
      "Verification failed."
    );
  }

  if (!verification?.hashedPassword) {
    throw badRequest(
      "Password missing from verification record."
    );
  }

  const user =
    await prisma.user.create({
      data: {
        name,
        email,
        passwordHash:
          verification.hashedPassword,

        role: UserRole.CUSTOMER,

        IsVerified: true,

        customerProfile: {
          create: {},
        },
      },

      select: {
        id: true,
        email: true,
        role: true,
      },
    });

  await cleanupVerification(
    email,
    VerificationType.CUSTOMER_REGISTRATION
  );

  return {
    success: true,
    user,
  };
}

/**
 * Start customer registration by sending a verification code.
 */
static async sendCustomerRegistrationCode(
  name: string,
  email: string,
  password: string
) {
  if (!name || !email || !password) {
    throw badRequest(
      "Name, email, and password are required."
    );
  }

  const normalizedEmail = email
    .trim()
    .toLowerCase();

  const existingUser =
    await prisma.user.findUnique({
      where: {
        email: normalizedEmail,
      },
    });

  if (existingUser) {
    throw badRequest(
      "Email already registered."
    );
  }

  const hashedPassword =
    await bcrypt.hash(password, 12);

  const code = Math.floor(
    100000 + Math.random() * 900000
  ).toString();

  const verification =
    await prisma.verificationCode.create({
      data: {
        email: normalizedEmail,
        name,
        hashedPassword,
        code,
        type:
          VerificationType.CUSTOMER_REGISTRATION,
        expiresAt: new Date(
          Date.now() + 15 * 60 * 1000
        ),
        used: false,
      },
    });

  await sendVerificationEmail({
    email: normalizedEmail,
    code,
    uid: verification.id,
    name,
    type: "CUSTOMER",
  });

  return {
    success: true,
    verificationId: verification.id,
    email: normalizedEmail,

    ...(process.env.NODE_ENV ===
    "development"
      ? {
          debugCode: code,
        }
      : {}),
  };
}

/**
 * Resend customer registration verification code.
 */
static async resendCustomerVerificationCode(
  uid: string
) {
  if (!uid) {
    throw badRequest(
      "Verification ID is required."
    );
  }

  const verification =
    await prisma.verificationCode.findUnique({
      where: {
        id: uid,
      },
    });

  if (!verification) {
    throw notFound(
      "Verification record not found."
    );
  }

  if (verification.used) {
    throw badRequest(
      "This account is already verified."
    );
  }

  const code = Math.floor(
    100000 + Math.random() * 900000
  ).toString();

  const expiresAt = new Date(
    Date.now() + 15 * 60 * 1000
  );

  await prisma.verificationCode.update({
    where: {
      id: uid,
    },

    data: {
      code,
      expiresAt,
    },
  });

  await sendVerificationEmail({
    email: verification.email,
    code,
    uid: verification.id,
    name: verification.name ?? "Customer",
    type: "CUSTOMER",
  });

  return {
    success: true,
    message:
      "New code sent successfully.",

    ...(process.env.NODE_ENV ===
    "development"
      ? {
          debugCode: code,
        }
      : {}),
  };
}

/**
 * Verify customer registration code and create account.
 */
static async verifyCustomerRegistration(
  uid: string,
  code: string
) {
  const normalizedCode = String(code ?? "").trim();

  if (!uid || !normalizedCode) {
    throw badRequest(
      "Verification ID and code are required."
    );
  }

  if (!process.env.NEXTAUTH_SECRET) {
    throw new Error(
      "Server configuration error."
    );
  }

  const verification =
    await prisma.verificationCode.findUnique({
      where: {
        id: uid,
      },
    });

  if (!verification || verification.used) {
    throw badRequest(
      "Invalid or expired link."
    );
  }

  if (verification.code !== normalizedCode) {
    throw badRequest(
      "Incorrect verification code."
    );
  }

  if (new Date() > verification.expiresAt) {
    throw badRequest(
      "Code has expired."
    );
  }

  const user =
    await prisma.$transaction(async (tx) => {
      const createdUser =
        await tx.user.create({
          data: {
            name: verification.name,
            email: verification.email,
            passwordHash:
              verification.hashedPassword,
            IsVerified: true,
            role: UserRole.CUSTOMER,

            customerProfile: {
              create: {},
            },
          },
        });

      await tx.verificationCode.update({
        where: {
          id: uid,
        },
        data: {
          used: true,
        },
      });

      return createdUser;
    });

  const autoLoginToken = jwt.sign(
    {
      purpose: "verified-login",
      uid,
      userId: user.id,
      email: user.email,
    },
    process.env.NEXTAUTH_SECRET,
    {
      expiresIn: "10m",
    }
  );

  return {
    success: true,
    message: "Account verified!",
    autoLoginToken,
    redirectTo: "/checkout",
  };
}

/**
 * Register or upgrade a vendor account.
 */
static async registerVendor(data: {
  email: string;
  password: string;
  firstName: string;
  lastName: string;
  phoneNumber: string;
  storeName: string;
  storePhone: string;
  storeAddress: string;
  state: string;
  country: string;
  isReapplication?: boolean;
}) {
  const {
    email,
    password,
    firstName,
    lastName,
    phoneNumber,
    storeName,
    storePhone,
    storeAddress,
    state,
    country,
    isReapplication,
  } = data;

  const existingUser =
    await prisma.user.findUnique({
      where: {
        email,
      },
      include: {
        vendorProfile: true,
      },
    });

  if (
    existingUser?.vendorProfile &&
    !isReapplication
  ) {
    throw badRequest(
      "This email is already registered as a Vendor."
    );
  }

  if (
    !isReapplication &&
    !existingUser
  ) {
    const verification =
      await getLatestVerification(
        email,
        VerificationType.VENDOR_REGISTRATION
      );

    if (!verification) {
      throw badRequest(
        "Email not verified. Please verify your email first."
      );
    }
  }

  const passwordHash =
    await bcrypt.hash(password, 12);

  const user =
    await prisma.$transaction(
      async (tx) => {
        return tx.user.upsert({
          where: {
            email,
          },

          update: {
            name: `${firstName} ${lastName}`,
            passwordHash,
            IsVerified: true,
            role: UserRole.VENDOR,

            vendorProfile: {
              upsert: {
                create: {
                  firstName,
                  lastName,
                  phoneNumber,
                  storePhone,
                  storeName,
                  storeAddress,
                  state,
                  country,
                  isVerified: false,
                  status:
                    VendorStatus.AWAITING_DOCUMENTS,
                },

                update: {
                  firstName,
                  lastName,
                  phoneNumber,
                  storePhone,
                  storeName,
                  storeAddress,
                  state,
                  country,
                  status:
                    VendorStatus.AWAITING_DOCUMENTS,
                  rejectionReason: null,
                },
              },
            },
          },

          create: {
            name: `${firstName} ${lastName}`,
            email,
            passwordHash,
            role: UserRole.VENDOR,
            IsVerified: true,

            vendorProfile: {
              create: {
                firstName,
                lastName,
                phoneNumber,
                storePhone,
                storeName,
                storeAddress,
                state,
                country,
                isVerified: false,
                status:
                  VendorStatus.AWAITING_DOCUMENTS,
              },
            },
          },

          select: {
            id: true,
            email: true,
            role: true,
          },
        });
      }
    );

  if (
    !isReapplication &&
    !existingUser
  ) {
    await cleanupVerification(
      email,
      VerificationType.VENDOR_REGISTRATION
    );
  }

  return {
    success: true,

    message: isReapplication
      ? "Application updated successfully"
      : existingUser
      ? "Account upgraded to Vendor successfully"
      : "Store created successfully",

    user,
  };
}

/**
 * Send vendor registration verification code.
 */
static async sendVendorRegistrationCode(
  email: string,
  firstName?: string,
  lastName?: string
) {
  if (!email) {
    throw badRequest(
      "Email is required."
    );
  }

  const normalizedEmail =
    email.trim().toLowerCase();

  const existingUser =
    await prisma.user.findUnique({
      where: {
        email: normalizedEmail,
      },
      include: {
        vendorProfile: true,
      },
    });

  if (existingUser?.vendorProfile) {
    throw badRequest(
      "This email is already registered as a Vendor."
    );
  }

  const code = Math.floor(
  100000 + Math.random() * 900000
  ).toString();

  const verification =
    await prisma.verificationCode.create({
      data: {
        email: normalizedEmail,
        code,
        type:
          VerificationType.VENDOR_REGISTRATION,
        expiresAt: new Date(
          Date.now() + 15 * 60 * 1000
        ),
      },
    });

  await sendVerificationEmail({
    email: normalizedEmail,
    code,
    uid: verification.id,
    name:
      firstName ||
      lastName
        ? `${firstName ?? ""} ${lastName ?? ""}`.trim()
        : "Valued Merchant",
    type: "VENDOR",
  });

  return {
    success: true,
    verificationId: verification.id,

    ...(process.env.NODE_ENV ===
    "development"
      ? {
          debugCode: code,
        }
      : {}),
  };
}

/**
 * Verify vendor registration email.
 */
static async verifyVendorRegistration(
  uid: string,
  code: string
) {
  if (!uid || !code) {
    throw badRequest(
      "Verification ID and code are required."
    );
  }

  const verification =
    await prisma.verificationCode.findFirst({
      where: {
        id: uid,
        code: code.toUpperCase(),
        type:
          VerificationType.VENDOR_REGISTRATION,
      },
    });

  if (!verification) {
    throw badRequest(
      "Invalid or incorrect code."
    );
  }

  if (
    verification.expiresAt <
    new Date()
  ) {
    throw badRequest(
      "This code has expired."
    );
  }

  await prisma.verificationCode.update({
    where: {
      id: uid,
    },
    data: {
      used: true,
    },
  });

  return {
    success: true,
    message:
      "Email verified successfully.",
  };
}

}