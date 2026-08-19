import bcrypt from "bcrypt";
import jwt from "jsonwebtoken";
import { randomInt } from "crypto";
import {
  UserRole,
  VendorStatus,
  VerificationType,
} from "@prisma/client";
import { prisma } from "@/app/lib/prisma";

import { sendPasswordResetEmail } from "@/app/lib/mailer";


import { sendVerificationEmail } from "@/app/lib/mailer";
import { Prisma, } from "@prisma/client";
import type { AdminPermissions, } from "@/app/lib/auth/types";
import type { VerificationCode } from "@prisma/client";

import {
  PERMISSION_KEYS,
  defaultAdminPermissions,
  permissionsToAdminProfile,
  serializeAdminPermissions,
} from "@/app/lib/auth/admin-permissions";

import {
  badRequest,
  forbidden,
  notFound,
} from "@/app/lib/auth/errors";





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
  this.validateVerification(
    await this.getLatestVerification(
      email,
      VerificationType.CUSTOMER_REGISTRATION
    )
  );

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

  await this.cleanupVerification(
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
          this.validateVerification(
            await this.getLatestVerification(
              email,
              VerificationType.CUSTOMER_REGISTRATION
            )
          );
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
                  status: VendorStatus.AWAITING_DOCUMENTS,

                  boost: {
                    create: {},
                  },
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
                status: VendorStatus.AWAITING_DOCUMENTS,

                boost: {
                  create: {},
                },
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
    await this.cleanupVerification(
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

    static async updateUser(
        userId: string,
        data: {
          isSuspended?: boolean;
          role?: UserRole;
          name?: string;
          email?: string;
        }
      ) {
      return prisma.user.update({
        where: {
          id: userId,
        },
        data: {
          ...(data.isSuspended !== undefined && {
            isSuspended: data.isSuspended,
          }),

          ...(data.role && {
            role: data.role,
          }),

          ...(data.name && {
            name: data.name,
          }),

          ...(data.email && {
            email: data.email,
          }),
        },
      });
    }

    static async deleteUser(
      userId: string
    ) {
      return prisma.user.delete({
        where: {
          id: userId,
        },
      });
    }

    static async getAdministratorById(
    id: string
  ) {
    const user =
      await prisma.user.findUnique({
        where: {
          id,
        },
        include: {
          adminProfile: true,
        },
      });

    if (!user) {
      throw notFound(
        "Administrator not found."
      );
    }

    if (
      user.role !== UserRole.ADMIN &&
      user.role !== UserRole.SUPER_ADMIN
    ) {
      throw badRequest(
        "User is not an administrator."
      );
    }

    return {
      ...user,
      adminProfile: user.adminProfile
        ? {
            ...user.adminProfile,
            permissions:
              serializeAdminPermissions(
                user.adminProfile
              ),
          }
        : {
            permissions:
              defaultAdminPermissions,
          },
    };
  }


      static async updateAdministrator(
      id: string,
      body: {
        name?: string;
        email?: string;
        password?: string;
        role?: UserRole;
        permissions?: Partial<AdminPermissions>;
      },
      sessionUser: {
        id: string;
        email: string | null;
        role: UserRole;
      }
    ) {
      const target =
        await prisma.user.findUnique({
          where: {
            id,
          },
        });

      if (!target) {
        throw notFound(
          "Administrator not found."
        );
      }

      if (
        target.role ===
          UserRole.SUPER_ADMIN &&
        sessionUser.role !==
          UserRole.SUPER_ADMIN
      ) {
        throw forbidden(
          "Only Super Administrators can modify another Super Administrator."
        );
      }

      const updateData: Prisma.UserUpdateInput =
        {};

      if (body.name) {
        updateData.name =
          body.name.trim();
      }

      if (body.email) {
        updateData.email =
          body.email
            .toLowerCase()
            .trim();
      }

      if (
        body.role &&
        sessionUser.role ===
          UserRole.SUPER_ADMIN
      ) {
        updateData.role =
          body.role;

        updateData.roles = [
          body.role,
        ];
      }

      if (body.password) {
        updateData.passwordHash =
          await bcrypt.hash(
            body.password,
            10
          );
      }

      const result =
        await prisma.$transaction(
          async (tx) => {
            const user =
              await tx.user.update({
                where: {
                  id,
                },
                data: updateData,
              });

            if (
              body.permissions
            ) {
              await tx.adminProfile.upsert({
                where: {
                  userId: id,
                },
                update:
                  permissionsToAdminProfile(
                    body.permissions
                  ),
                create: {
                  userId: id,
                  ...permissionsToAdminProfile(
                    body.permissions
                  ),
                },
              });
            }

            return user;
          }
        );

      console.log(
        `[Admin Updated] By: ${sessionUser.email} → ${result.email}`
      );

      return result;
    }

    static async deleteAdministrator(
  id: string,
  sessionUser: {
    id: string;
    email: string | null;
  }
) {
  // Prevent self-deletion
  if (sessionUser.id === id) {
    throw badRequest(
      "You cannot delete your own administrator account."
    );
  }

  const target = await prisma.user.findUnique({
    where: { id },
    select: {
      id: true,
      email: true,
      role: true,
    },
  });

  if (!target) {
    throw notFound("Administrator not found.");
  }

  // Ensure only administrator accounts can be deleted
  if (
    target.role !== UserRole.ADMIN &&
    target.role !== UserRole.SUPER_ADMIN
  ) {
    throw forbidden(
      "Only administrator accounts can be deleted."
    );
  }

  // Super Admin accounts are protected
  if (target.role === UserRole.SUPER_ADMIN) {
    throw forbidden(
      "Super Administrators cannot be deleted."
    );
  }

  await prisma.$transaction(async (tx) => {
    // Preserve order history by detaching the deleted user
    await tx.order.updateMany({
      where: {
        userId: id,
      },
      data: {
        userId: null,
      },
    });

    await tx.account.deleteMany({
      where: {
        userId: id,
      },
    });

    await tx.address.deleteMany({
      where: {
        userId: id,
      },
    });

    await tx.review.deleteMany({
      where: {
        userId: id,
      },
    });

    await tx.adminProfile.deleteMany({
      where: {
        userId: id,
      },
    });

    await tx.vendorProfile.deleteMany({
      where: {
        userId: id,
      },
    });

    await tx.user.delete({
      where: {
        id,
      },
    });
  });

  // TODO:
  // Replace with AuditLogService when audit logging is implemented.
  console.info(
    `[Admin Deleted] Actor: ${sessionUser.email ?? sessionUser.id} | Target: ${target.email ?? target.id}`
  );

  return {
    success: true,
  };
}
      static async resetUserPassword(
      userId: string,
      newPassword: string
    ) {
      if (
        !newPassword ||
        newPassword.length < 8
      ) {
        throw badRequest(
          "Password must be at least 8 characters."
        );
      }

      const user =
        await prisma.user.findUnique({
          where: {
            id: userId,
          },
          select: {
            id: true,
          },
        });

      if (!user) {
        throw notFound(
          "User not found."
        );
      }

      const passwordHash =
        await bcrypt.hash(
          newPassword,
          10
        );

      await prisma.user.update({
        where: {
          id: userId,
        },
        data: {
          passwordHash,
        },
      });
    }


    static async createAdministrator(
      body: {
        name: string;
        email: string;
        password: string;
        permissions?: Record<string, boolean>;
      },
      sessionUser: {
        email: string | null;
      }
    ) {
      const {
        name,
        email,
        password,
        permissions,
      } = body;

      if (!name || !email || !password) {
        throw badRequest(
          "Missing required fields: name, email and password."
        );
      }

      const normalizedEmail =
        email.toLowerCase().trim();

      if (
        !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(
          normalizedEmail
        )
      ) {
        throw badRequest(
          "Invalid email format."
        );
      }

      if (password.length < 8) {
        throw badRequest(
          "Password must be at least 8 characters."
        );
      }

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
          const value =
            permissions[key];

          if (
            typeof value === "boolean"
          ) {
            safePermissions[key] =
              value;
          }
        }
      }

      const existingUser =
        await prisma.user.findUnique({
          where: {
            email: normalizedEmail,
          },
        });

      if (existingUser) {
        throw badRequest(
          "Email already exists."
        );
      }

      const passwordHash =
        await bcrypt.hash(
          password,
          10
        );

      const newAdmin =
        await prisma.user.create({
          data: {
            name,
            email:
              normalizedEmail,
            passwordHash,
            role: "ADMIN",
            roles: ["ADMIN"],
            IsVerified: true,
            adminProfile: {
              create:
                permissionsToAdminProfile(
                  safePermissions
                ),
            },
          },
          include: {
            adminProfile: true,
          },
        });

      console.log(
        `[Admin Created] By: ${sessionUser.email} → ${newAdmin.email}`
      );

      const {
        passwordHash: _passwordHash,
        ...safeUser
      } = newAdmin;

      return safeUser;
    }


    static async updateAdministratorPermissions(
      adminId: string,
      currentUser: {
        id: string;
        email: string | null;
      },
      permissions: Partial<AdminPermissions>
    ) {
      if (!adminId) {
        throw badRequest(
          "Invalid administrator id."
        );
      }

      if (adminId === currentUser.id) {
        throw badRequest(
          "You cannot modify your own administrator permissions."
        );
      }

      const targetUser =
        await prisma.user.findUnique({
          where: {
            id: adminId,
          },
          select: {
            id: true,
            name: true,
            email: true,
            role: true,
          },
        });

      if (!targetUser) {
        throw notFound(
          "Administrator not found."
        );
      }

      if (
        targetUser.role !== UserRole.ADMIN &&
        targetUser.role !== UserRole.SUPER_ADMIN
      ) {
        throw badRequest(
          "Permissions may only be assigned to administrators."
        );
      }

      const sanitizedPermissions: AdminPermissions =
        {
          ...defaultAdminPermissions,
        };

      for (const key of PERMISSION_KEYS) {
        const value =
          permissions[key];

        if (
          typeof value ===
          "boolean"
        ) {
          sanitizedPermissions[
            key
          ] = value;
        }
      }

      const result =
        await prisma.$transaction(
          async (tx) => {
            const profile =
              await tx.adminProfile.upsert({
                where: {
                  userId: adminId,
                },

                update: {
                  ...sanitizedPermissions,
                },

                create: {
                  userId: adminId,
                  ...sanitizedPermissions,
                },
              });

            const user =
              await tx.user.findUnique({
                where: {
                  id: adminId,
                },
                select: {
                  id: true,
                  name: true,
                  email: true,
                  role: true,
                },
              });

            if (!user) {
              throw notFound(
                "Administrator not found."
              );
            }

            return {
              user,
              profile,
            };
          }
        );

      console.log(
        `[Admin Permissions Updated] By: ${currentUser.email} → ${result.user.email}`
      );

      return {
        id: result.user.id,
        name: result.user.name,
        email: result.user.email,
        role: result.user.role,
        permissions:
          serializeAdminPermissions(
            result.profile
          ),
      };
    }


    static async getAdministratorsForSuperAdmin(
  currentUserId: string
) {
  const admins = await prisma.user.findMany({
    where: {
      roles: {
        hasSome: [
          UserRole.ADMIN,
          UserRole.SUPER_ADMIN,
        ],
      },
    },

    select: {
      id: true,
      name: true,
      email: true,
      roles: true,
      createdAt: true,
      updatedAt: true,

      adminProfile: {
        select: {
          manageAdmins: true,
          manageUsers: true,
          manageBlogs: true,
          manageProducts: true,
          manageOrders: true,
          manageMessages: true,
          manageSettings: true,
          manageCategories: true,
          manageVendors: true,
          manageVerifications: true,
          manageSubscribers: true,
          manageReviews: true,
          manageActivity: true,
          manageTrending: true,
          manageSupport: true,
          managePayout: true,
        },
      },
    },

    orderBy: {
      createdAt: "desc",
    },
  });

  return admins.filter(
    (admin) =>
      admin.id !== currentUserId
  );
}


/**
 * Get all users for admin user management.
 *
 * Get all non-administrator users for admin user management.
 *
 * Accounts with ADMIN or SUPER_ADMIN authority are excluded
 * because they are managed through the dedicated Admins domain.
 */
static async getUsersForAdmin({
  page = 1,
  pageSize = 20,
  search = "",
  filter = "ALL",
}: {
  page?: number;
  pageSize?: number;
  search?: string;
  filter?: string;
} = {}) {
  const safePage = Math.max(1, page);

  const safePageSize = Math.min(
    Math.max(1, pageSize),
    100
  );

  const normalizedSearch =
    search.trim();

  const where: Prisma.UserWhereInput = {
    // Admin accounts belong on the dedicated Admin page.
    NOT: {
      roles: {
        hasSome: [
          UserRole.ADMIN,
          UserRole.SUPER_ADMIN,
        ],
      },
    },

    ...(normalizedSearch && {
      OR: [
        {
          name: {
            contains: normalizedSearch,
            mode: "insensitive",
          },
        },
        {
          email: {
            contains: normalizedSearch,
            mode: "insensitive",
          },
        },
      ],
    }),

    ...(filter === "CUSTOMER" && {
      role: UserRole.CUSTOMER,
    }),

    ...(filter === "VENDOR" && {
      role: UserRole.VENDOR,
    }),

    ...(filter === "SUSPENDED" && {
      isSuspended: true,
    }),
  };

  const [users, total] =
    await Promise.all([
      prisma.user.findMany({
        where,

        select: {
          id: true,
          name: true,
          email: true,
          role: true,
          image: true,
          createdAt: true,
          IsVerified: true,
          isSuspended: true,

          vendorProfile: {
            select: {
              storeName: true,
            },
          },
        },

        orderBy: {
          createdAt: "desc",
        },

        skip:
          (safePage - 1) *
          safePageSize,

        take: safePageSize,
      }),

      prisma.user.count({
        where,
      }),
    ]);

  const totalPages = Math.max(
    1,
    Math.ceil(
      total / safePageSize
    )
  );

  return {
    users,

    pagination: {
      page: safePage,
      pageSize: safePageSize,
      total,
      totalPages,
    },
  };
}

/**
 * Get a single user for admin editing.
 */
static async getUserForAdminEdit(
  userId: string
) {
  return prisma.user.findUnique({
    where: {
      id: userId,
    },

    include: {
      vendorProfile: true,
    },
  });
}


private static async getLatestVerification(
  email: string,
  type: VerificationType
) {
  return prisma.verificationCode.findFirst({
    where: {
      email,
      type,
      used: true,
    },
    orderBy: {
      createdAt: "desc",
    },
  });
}

private static validateVerification(
  verification: VerificationCode | null
): VerificationCode {
  if (!verification) {
    throw badRequest("Email not verified.");
  }

  if (verification.expiresAt < new Date()) {
    throw badRequest("Verification expired.");
  }

  if (!verification.hashedPassword) {
    throw badRequest(
      "Password missing from verification record."
    );
  }

  return verification;
}

private static async cleanupVerification(
  email: string,
  type: VerificationType
) {
  await prisma.verificationCode.deleteMany({
    where: {
      email,
      type,
    },
  });
}

}