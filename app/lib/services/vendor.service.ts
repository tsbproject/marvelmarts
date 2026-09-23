import { prisma } from "@/app/lib/prisma";
import { forbidden, notFound, badRequest} from "@/app/lib/auth/errors";
import {
  Prisma,
  VendorStatus,
  UserRole,
} from "@prisma/client";
import {
  sendVendorReviewEmail,
  sendVendorActionEmail,
   sendVendorSetupCompleteEmail,
} from "@/app/lib/mailer";
import type { VerificationStatus } from "@/types/vendor";

import {
  startOfDay,
  startOfMonth,
  subDays,
} from "date-fns";
import { AuditService } from "@/app/lib/services/logging/audit.service";



export class VendorService {
  
  
 static async getVendorProfile(
  userId: string
) {
  return prisma.vendorProfile.findUnique({
    where: {
      userId,
    },

    include: {
      boost: true,
      onboarding: true,
      store: true,
      score: true,
    },
  });
}

  static async getVendorProfileOrThrow(
    userId: string
  ) {
    const vendor =
      await this.getVendorProfile(userId);

    if (!vendor) {
      throw notFound(
        "Vendor profile not found."
      );
    }

    return vendor;
  }

  static async getActiveVendor(
    userId: string,
    role?: string
  ) {
    const vendor =
      await this.getVendorProfileOrThrow(
        userId
      );

    const isAdmin =
      role === "ADMIN" ||
      role === "SUPER_ADMIN";

    if (
      vendor.isSuspended &&
      !isAdmin
    ) {
      throw forbidden(
        "Vendor account is suspended."
      );
    }

    return vendor;
  }

  static async updateOnboarding(
    vendorProfileId: string,
    data: object
  ) {
    return prisma.vendorOnboarding.updateMany({
      where: {
        vendorProfileId,
      },
      data,
    });
  }

  static async getVendorById(
  vendorProfileId: string
) {
  return prisma.vendorProfile.findUnique({
    where: {
      id: vendorProfileId,
    },
  });
}

static async getVendorByIdOrThrow(
  vendorProfileId: string
) {
  const vendor =
    await this.getVendorById(
      vendorProfileId
    );

  if (!vendor) {
    throw notFound(
      "Vendor not found."
    );
  }

  return vendor;
}

static async suspendVendor(
  vendorProfileId: string
) {
  return prisma.vendorProfile.update({
    where: {
      id: vendorProfileId,
    },
    data: {
      isSuspended: true,
    },
  });
}

static async activateVendor(
  vendorProfileId: string
) {
  return prisma.vendorProfile.update({
    where: {
      id: vendorProfileId,
    },
    data: {
      isSuspended: false,
    },
  });
}







static async listVendors() {
  return prisma.vendorProfile.findMany({
    include: {
      user: {
        select: {
          id: true,
          name: true,
          email: true,
        },
      },
      onboarding: true,
    },
    orderBy: {
      createdAt: "desc",
    },
  });
}

static async updateStoreSetup(
  userId: string,
  data: {
    storeName: string;
    storePhone?: string;
    storeAddress?: string;
    logoUrl?: string;
    coverUrl?: string;
  }
) {
  return prisma.$transaction(async (tx) => {
    const profile =
      await tx.vendorProfile.update({
        where: {
          userId,
        },
        data,
      });

    await tx.vendorOnboarding.update({
      where: {
        vendorProfileId: profile.id,
      },
      data: {
        storeDone: true,
      },
    });

    return profile;
  });
}

static async getVendorProfileWithStore(
  userId: string
) {
  const profile =
    await prisma.vendorProfile.findUnique({
      where: {
        userId,
      },
      include: {
        store: true,
        onboarding: true,
        _count: {
          select: {
            products: true,
          },
        },
      },
    });

  if (!profile) {
    throw notFound(
      "Vendor profile not found."
    );
  }

  return profile;
}

  static makeSlug(value: string) {
    return value
      .trim()
      .toLowerCase()
      .replace(/[^a-z0-9\s-]/g, "")
      .replace(/\s+/g, "-")
      .replace(/-+/g, "-")
      .replace(/^-|-$/g, "");
  }

  static async ensureStoreSlugAvailable(
      slug: string,
      vendorProfileId: string
    ) {
      const existingStore =
        await prisma.vendorStore.findFirst({
          where: {
            slug,
            vendorProfileId: {
              not: vendorProfileId,
            },
          },
        });

      if (existingStore) {
        throw badRequest(
          "Store URL is already in use."
        );
      }
    }

    static async updateVendorProfile(
      userId: string,
      profileId: string,
      normalizedSlug: string,
      currentStoreName: string,
      profileData: any,
      hasBranding: boolean,
      hasBankDetails: boolean
    ) {

        const existingProfile =
        await prisma.vendorProfile.findUnique({
          where: {
            id: profileId,
          },
          select: {
            id: true,
            storeName: true,
            bio: true,
            logoUrl: true,
            coverUrl: true,
            instagram: true,
            whatsapp: true,
            facebook: true,
            bankName: true,
            accountName: true,
            accountNumber: true,
          },
        });

      if (!existingProfile) {
        throw notFound(
          "Vendor profile not found."
        );
      }

      const updatedProfile =
        await prisma.$transaction(async (tx) => {
          await tx.vendorProfile.update({
            where: {
              id: profileId,
            },
            data: {
              storeName: profileData.storeName,
              bio: profileData.bio,
              logoUrl: profileData.logoUrl,
              coverUrl: profileData.coverUrl,
              instagram: profileData.instagram,
              whatsapp: profileData.whatsapp,
              facebook: profileData.facebook,
              bankName: profileData.bankName,
              accountName: profileData.accountName,
              accountNumber:
                profileData.accountNumber,
              storeDone: hasBranding,
              payoutsDone: hasBankDetails,
            },
          });

          await tx.vendorStore.upsert({
            where: {
              vendorProfileId: profileId,
            },
            update: {
              name:
                profileData.storeName ??
                currentStoreName,
              slug: normalizedSlug,
            },
            create: {
              vendorProfileId: profileId,
              name:
                profileData.storeName ??
                currentStoreName,
              slug: normalizedSlug,
            },
          });

          return tx.vendorProfile.findUnique({
            where: {
              id: profileId,
            },
            include: {
              store: true,
              _count: {
                select: {
                  products: true,
                },
              },
            },
          });
        });

    await AuditService.vendorUpdated({
        actorId: userId,
        entityId: profileId,
        oldValues: existingProfile,
        newValues: {
          storeName: updatedProfile?.storeName,
          bio: updatedProfile?.bio,
          logoUrl: updatedProfile?.logoUrl,
          coverUrl: updatedProfile?.coverUrl,
          instagram: updatedProfile?.instagram,
          whatsapp: updatedProfile?.whatsapp,
          facebook: updatedProfile?.facebook,
          bankName: updatedProfile?.bankName,
          accountName: updatedProfile?.accountName,
          accountNumber:
            updatedProfile?.accountNumber,
        },
      });

      return updatedProfile;

          }

    

static async getVendorProfileWithStoreOnly(
        userId: string
      ) {
        const vendor =
          await prisma.vendorProfile.findUnique({
            where: {
              userId,
            },
            include: {
              store: true,
            },
          });

          if (!vendor) {
            throw notFound(
              "Vendor profile not found."
            );
          }

          return vendor;
      }

      static async getVendorPublicStats(
        vendorId: string,
        userId?: string
      ) {
        const vendor = await prisma.vendorProfile.findUnique({
          where: {
            id: vendorId,
          },
          select: {
            id: true,
            followerCount: true,
            shippingScore: true,
            qualityScore: true,
            avgRating: true,
            cancellationRate: true,
          },
        });

        let isFollowing = false;

        if (userId) {
          const follow = await prisma.vendorFollow.findUnique({
            where: {
              userId_vendorProfileId: {
                userId,
                vendorProfileId: vendorId,
              },
            },
          });

          isFollowing = !!follow;
        }

        return {
          vendor,
          isFollowing,
        };
      }

   static async updateVendorFollow(
      vendorId: string,
      userId: string,
      action: "follow" | "unfollow"
    ) {
      const vendor = await prisma.vendorProfile.findUnique({
        where: {
          id: vendorId,
        },
        select: {
          id: true,
        },
      });

      if (!vendor) {
        return {
          vendorExists: false,
        };
      }

      const existingFollow =
        await prisma.vendorFollow.findUnique({
          where: {
            userId_vendorProfileId: {
              userId,
              vendorProfileId: vendorId,
            },
          },
        });

      if (
        action === "follow" &&
        !existingFollow
      ) {
        await prisma.$transaction([
          prisma.vendorFollow.create({
            data: {
              userId,
              vendorProfileId: vendorId,
            },
          }),

          prisma.vendorProfile.update({
            where: {
              id: vendorId,
            },
            data: {
              followerCount: {
                increment: 1,
              },
            },
          }),
        ]);
      }

      if (
        action === "unfollow" &&
        existingFollow
      ) {
        await prisma.$transaction([
          prisma.vendorFollow.delete({
            where: {
              userId_vendorProfileId: {
                userId,
                vendorProfileId: vendorId,
              },
            },
          }),

          prisma.vendorProfile.update({
            where: {
              id: vendorId,
            },
            data: {
              followerCount: {
                decrement: 1,
              },
            },
          }),
        ]);
      }

     const [updatedVendor, follow] =
        await Promise.all([
          prisma.vendorProfile.findUnique({
            where: {
              id: vendorId,
            },
            select: {
              followerCount: true,
            },
          }),

          prisma.vendorFollow.findUnique({
            where: {
              userId_vendorProfileId: {
                userId,
                vendorProfileId: vendorId,
              },
            },
          }),
        ]);

      return {
        vendorExists: true,
        followerCount:
          updatedVendor?.followerCount ?? 0,
        isFollowing: !!follow,
      };
          }


      static async performVendorAction(
      vendorProfileId: string,
      action: "SUSPEND" | "FLAG" | "RESTORE" | "REJECT" | "APPROVE",
      reason: string | undefined,
      adminUserId: string
    ) {
      const existingVendor =
        await prisma.vendorProfile.findUnique({
          where: {
            id: vendorProfileId,
          },
          include: {
            user: {
              select: {
                id: true,
                email: true,
                name: true,
              },
            },
          },
        });

      if (!existingVendor) {
        throw notFound("Vendor not found.");
      }

      let updateData: Prisma.VendorProfileUpdateInput =
        {};

      switch (action) {
        case "SUSPEND":
          updateData = {
            isSuspended: true,
          };
          break;

        case "FLAG":
          updateData = {
            status: "PENDING",
          };
          break;

        case "RESTORE":
          updateData = {
            isSuspended: false,
          };
          break;

        case "REJECT":
          updateData = {
            status: "REJECTED",
            isSuspended: false,
            rejectionReason: reason ?? null,
          };
          break;

        case "APPROVE":
          updateData = {
            status: "APPROVED",
            isSuspended: false,
            rejectionReason: null,
          };
          break;
      }

      const vendor =
        await prisma.$transaction(async (tx) => {
          const updatedVendor =
            await tx.vendorProfile.update({
              where: {
                id: vendorProfileId,
              },
              data: updateData,
              include: {
                user: {
                  select: {
                    id: true,
                    email: true,
                    name: true,
                  },
                },
              },
            });

          const conversation =
            await tx.conversation.findFirst({
              where: {
                participantIds: {
                  has: updatedVendor.userId,
                },
                type: "VENDOR_ADMIN",
              },
            });

          if (conversation) {
            await tx.message.create({
              data: {
                conversationId: conversation.id,
                senderId: adminUserId,
                senderName:
                  "MARVELMARTS COMPLIANCE",
                content: `🚨 SYSTEM ACTION: ${action}\nReason: ${
                  reason ?? "No reason provided"
                }`,
              },
            });
          }

          return updatedVendor;
        });

      switch (action) {
        case "APPROVE":
          await AuditService.vendorApproved({
            actorId: adminUserId,
            entityId: vendor.id,
            oldValues: {
              status: existingVendor.status,
            },
            newValues: {
              status: vendor.status,
            },
          });
          break;

        case "REJECT":
          await AuditService.vendorRejected({
            actorId: adminUserId,
            entityId: vendor.id,
            oldValues: {
              status: existingVendor.status,
            },
            newValues: {
              status: vendor.status,
              rejectionReason: reason,
            },
          });
          break;

        case "SUSPEND":
          await AuditService.vendorSuspended({
            actorId: adminUserId,
            entityId: vendor.id,
            oldValues: {
              isSuspended:
                existingVendor.isSuspended,
            },
            newValues: {
              isSuspended: true,
              reason,
            },
          });
          break;

        case "RESTORE":
          await AuditService.vendorUnsuspended({
            actorId: adminUserId,
            entityId: vendor.id,
            oldValues: {
              isSuspended:
                existingVendor.isSuspended,
            },
            newValues: {
              isSuspended: false,
            },
          });
          break;

        case "FLAG":
          // No dedicated audit method yet.
          break;
            }

      if (
        action === "RESTORE" &&
        existingVendor.isSuspended &&
        !vendor.isSuspended
      ) {
        try {
          await sendVendorActionEmail({
            email: vendor.user.email,
            name: vendor.user.name ?? "Vendor",
            action: "RESTORE",
            reason:
              reason ??
              "Your vendor account suspension has been lifted.",
          });
        } catch (error) {
          console.error(
            "[VendorService.performVendorAction] RESTORE email failed:",
            error
          );
        }
      }

      return vendor;
    }
    
    
      static async getVendorProfileForAdmin(
      vendorProfileId: string
    ) {
      const vendorProfile =
        await prisma.vendorProfile.findUnique({
          where: {
            id: vendorProfileId,
          },
          include: {
            user: {
              select: {
                name: true,
                email: true,
              },
            },
            _count: {
              select: {
                products: true,
              },
            },
          },
        });

      if (!vendorProfile) {
        throw notFound(
          "Vendor profile not found."
        );
      }

      return vendorProfile;
    }

    static async syncVendorBalances() {
      const vendors =
        await prisma.vendorProfile.findMany();

      const results: {
        store: string;
        calculatedBalance: number;
      }[] = [];

      const balances =
        await prisma.order.groupBy({
          by: [
            "vendorProfileId",
          ],

          where: {
            status: {
              in: [
                "DELIVERED",
                "delivered",
                "APPROVED",
                "approved",
              ],
            },
          },

          _sum: {
            total: true,
          },
        });

      const balanceMap =
        new Map(
          balances.map(
            (balance) => [
              balance.vendorProfileId,
              Number(
                balance._sum.total ?? 0
              ),
            ]
          )
        );

      for (const vendor of vendors) {
        const totalSum =
          balanceMap.get(
            vendor.id
          ) ??

          balanceMap.get(
            vendor.userId
          ) ??

          0;

        await prisma.vendorProfile.update({
          where: {
            id: vendor.id,
          },

          data: {
            balance:
              new Prisma.Decimal(
                totalSum
              ),

            lastSyncedAt:
              new Date(),
          },
        });

        results.push({
          store:
            vendor.storeName ??
            "Unknown",

          calculatedBalance:
            totalSum,
        });
      }

      return {
        syncedCount:
          vendors.length,
        details: results,
      };
    }


    static async handleVendorEnforcementAction(
      vendorProfileId: string,
      action: "SUSPEND" | "RESTORE",
      reason: string | undefined,
      adminUserId: string
    ) {
      if (
        action !== "SUSPEND" &&
        action !== "RESTORE"
      ) {
        throw badRequest(
          "Invalid action."
        );
      }

      const vendor =
        await prisma.vendorProfile.findUnique({
          where: {
            id: vendorProfileId,
          },
          include: {
            user: {
              select: {
                id: true,
                name: true,
                email: true,
              },
            },
          },
        });

      if (!vendor) {
        throw notFound(
          "Vendor not found."
        );
      }

      const updatedVendor =
        await prisma.vendorProfile.update({
          where: {
            id: vendorProfileId,
          },
          data: {
            isSuspended:
              action === "SUSPEND",

            status:
              action === "SUSPEND"
                ? VendorStatus.REJECTED
                : VendorStatus.APPROVED,

            rejectionReason:
              reason ?? null,
          },
          include: {
            user: {
              select: {
                id: true,
                name: true,
                email: true,
              },
            },
          },
        });

      const conversation =
        await prisma.conversation.findFirst({
          where: {
            participantIds: {
              has: updatedVendor.user.id,
            },
            type: "VENDOR_ADMIN",
          },
        });

      let logMessage = null;

      if (conversation) {
        logMessage =
          await prisma.message.create({
            data: {
              conversationId:
                conversation.id,

              senderId:
                adminUserId,

              senderName:
                "SYSTEM_ENFORCEMENT",

              content:
                `🚨 ADMIN ACTION: ${action}\nReason: ${
                  reason ??
                  "No reason provided"
                }`,
            },
          });
      }

      await (action === "SUSPEND"
        ? AuditService.vendorSuspended({
            actorId: adminUserId,
            entityId: updatedVendor.id,
            oldValues: {
              status: vendor.status,
              isSuspended:
                vendor.isSuspended,
            },
            newValues: {
              status:
                updatedVendor.status,
              isSuspended:
                updatedVendor.isSuspended,
              reason,
            },
          })
        : AuditService.vendorUnsuspended({
            actorId: adminUserId,
            entityId: updatedVendor.id,
            oldValues: {
              status: vendor.status,
              isSuspended:
                vendor.isSuspended,
            },
            newValues: {
              status:
                updatedVendor.status,
              isSuspended:
                updatedVendor.isSuspended,
            },
                }));

      if (
        action === "RESTORE" &&
        vendor.isSuspended &&
        !updatedVendor.isSuspended
      ) {
        try {
          await sendVendorActionEmail({
            email: updatedVendor.user.email,
            name: updatedVendor.user.name ?? "Vendor",
            action: "RESTORE",
            reason:
              reason ??
              "Your vendor account suspension has been lifted.",
          });
        } catch (error) {
          console.error(
            "[VendorService.handleVendorEnforcementAction] RESTORE email failed:",
            error
          );
        }
      }

      return {
        vendor: updatedVendor,
        conversation,
        logMessage,
      };

    
    }


    static async syncVendorStores() {
      const profiles =
        await prisma.vendorProfile.findMany({
          include: {
            store: true,
          },
        });

      const results =
        await prisma.$transaction(
          profiles.map((profile) => {
            if (!profile.store) {
              return prisma.vendorStore.create({
                data: {
                  vendorProfileId:
                    profile.id,

                  slug:
                    profile.storeName
                      .toLowerCase()
                      .replace(/\s+/g, "-"),

                  name:
                    profile.storeName,

                  description:
                    profile.bio,

                  logo:
                    profile.logoUrl,

                  banner:
                    profile.coverUrl,
                },
              });
            }

            return prisma.vendorStore.update({
              where: {
                id: profile.store.id,
              },
              data: {
                name:
                  profile.storeName,

                description:
                  profile.bio,

                logo:
                  profile.logoUrl,

                banner:
                  profile.coverUrl,
              },
            });
          })
        );

      return results.length;
    }


    static async getAdminVendors() {
      return prisma.vendorProfile.findMany({
        include: {
          user: {
            select: {
              id: true,
              email: true,
              name: true,
              image: true,
            },
          },

          onboarding: true,
          store: true,
          score: true,
        },

        orderBy: {
          createdAt: "desc",
        },
      });
    }


    static async processVendorVerification(
      vendorProfileId: string,
      action:
        | "APPROVE"
        | "REJECT"
        | "SUSPEND"
        | "UNSUSPEND"
        | "DELETE",
      reason?: string
    ) {
      if (!vendorProfileId) {
        throw badRequest(
          "Vendor ID is required."
        );
      }

      if (action === "DELETE") {
        const vendor =
          await prisma.vendorProfile.findUnique({
            where: {
              id: vendorProfileId,
            },
            select: {
              id: true,
              _count: {
                select: {
                  orders: true,
                  disputes: true,
                  payouts: true,
                  withdrawal: true,
                  marketplaceTransactions: true,
                  products: true,
                },
              },
            },
          });

        if (!vendor) {
          throw notFound(
            "Vendor not found."
          );
        }

        const blockingRelations: string[] =
          [];

        if (vendor._count.orders > 0) {
          blockingRelations.push(
            "orders"
          );
        }

        if (
          vendor._count.disputes > 0
        ) {
          blockingRelations.push(
            "disputes"
          );
        }

        if (
          vendor._count.payouts > 0
        ) {
          blockingRelations.push(
            "payouts"
          );
        }

        if (
          vendor._count.withdrawal > 0
        ) {
          blockingRelations.push(
            "withdrawals"
          );
        }

        if (
          vendor._count.marketplaceTransactions >
          0
        ) {
          blockingRelations.push(
            "transactions"
          );
        }

        if (
          blockingRelations.length
        ) {
          throw badRequest(
            `Cannot delete vendor with existing ${blockingRelations.join(
              ", "
            )}. Suspend the vendor instead.`
          );
        }

        await prisma.$transaction(
          async (tx) => {
            await tx.vendorScore.deleteMany({
              where: {
                vendorProfileId,
              },
            });

            await tx.vendorProfile.delete({
              where: {
                id: vendorProfileId,
              },
            });
          }
        );

        return {
          deleted: true,
        };
      }

      let wasSuspended = false;

      const updated =
        await prisma.$transaction(
          async (tx) => {
            const currentVendor =
              await tx.vendorProfile.findUnique({
                where: {
                  id: vendorProfileId,
                },
                include: {
                  user: true,
                },
              });

            if (!currentVendor) {
              throw notFound(
                "Vendor not found."
              );
            }


            wasSuspended = 
            currentVendor.isSuspended;

            let dataUpdate = {};
            let onboardingUpdate = {};

            switch (action) {
              case "APPROVE": {
                const missingDocs: string[] =
                  [];

                if (
                  !currentVendor.identityDoc
                ) {
                  missingDocs.push(
                    "Identity"
                  );
                }

                if (
                  !currentVendor.locationDoc
                ) {
                  missingDocs.push(
                    "Location"
                  );
                }

                if (
                  missingDocs.length
                ) {
                  throw badRequest(
                    `Cannot approve: Missing documents (${missingDocs.join(
                      ", "
                    )}).`
                  );
                }

                dataUpdate = {
                  status:
                    VendorStatus.APPROVED,
                  isVerified: true,
                  isSuspended: false,
                  rejectionReason: null,
                };

                onboardingUpdate = {
                  completed: true,
                  profileDone: true,
                  storeDone: false,
                  productDone: false,
                };

                const currentUserRoles =
                  currentVendor.user.roles ?? [];

                const updatedUserRoles =
                  currentUserRoles.includes(
                    UserRole.VENDOR
                  )
                    ? currentUserRoles
                    : [
                        ...currentUserRoles,
                        UserRole.VENDOR,
                      ];

                await tx.user.update({
                  where: {
                    id: currentVendor.userId,
                  },
                  data: {
                    role: UserRole.VENDOR,
                    roles: {
                      set: updatedUserRoles,
                    },
                  },
                });

                break;
              }

              case "REJECT":
                dataUpdate = {
                  status:
                    VendorStatus.REJECTED,
                  isVerified: false,
                  isSuspended: false,
                  rejectionReason:
                    reason ||
                    "Your documents could not be verified. Please re-upload clear copies.",
                  identityDoc: null,
                  businessDoc: null,
                  locationDoc: null,
                };

                onboardingUpdate = {
                  completed: false,
                  profileDone: true,
                  storeDone: false,
                };

                break;

              case "SUSPEND":
                dataUpdate = {
                  isSuspended: true,
                };
                break;

              case "UNSUSPEND":
                dataUpdate = {
                  isSuspended: false,
                };
                break;

              default:
                throw badRequest(
                  "Invalid action provided."
                );
            }

            return tx.vendorProfile.update({
              where: {
                id: vendorProfileId,
              },

              include: {
                user: true,
              },

              data: {
                ...dataUpdate,

                onboarding:
                  Object.keys(
                    onboardingUpdate
                  ).length
                    ? {
                        upsert: {
                          create:
                            onboardingUpdate,
                          update:
                            onboardingUpdate,
                        },
                      }
                    : undefined,
              },
            });
          }
        );

   

    if (
      action === "SUSPEND" &&
      !wasSuspended &&
      updated.isSuspended
    ) {
      try {
        await sendVendorActionEmail({
          email: updated.user.email,
          name:
            updated.user.name ??
            "Vendor",
          action: "SUSPEND",
          reason:
            reason ??
            "Your vendor account has been suspended.",
        });
      } catch (error) {
        console.error(
          "[VendorService.processVendorVerification] SUSPEND email failed:",
          error
        );
      }
    }

if (
  action === "UNSUSPEND" &&
  wasSuspended &&
  !updated.isSuspended
) {
  try {
    await sendVendorActionEmail({
      email: updated.user.email,
      name:
        updated.user.name ??
        "Vendor",
      action: "RESTORE",
      reason:
        reason ??
        "Your vendor account suspension has been lifted.",
    });
  } catch (error) {
    console.info(
      "[VendorService.processVendorVerification] RESTORE email failed:",
      error
    );
  }
}

    return {
      type: "updated",
      vendor: updated,
    };
        }



   static async updateVendorSettings(
  userId: string,
  data: {
    logoUrl?: string;
    coverUrl?: string;
    bio?: string;
    storeName?: string;
    slug?: string;
    instagram?: string;
    whatsapp?: string;
    twitter?: string;
    facebook?: string;
    bankName?: string;
    accountNumber?: string;
    accountName?: string;
  }
) {
  const existingProfile =
    await prisma.vendorProfile.findUnique({
      where: {
        userId,
      },
      select: {
        id: true,

        logoUrl: true,
        coverUrl: true,
        bio: true,
        storeName: true,

        instagram: true,
        whatsapp: true,
        twitter: true,
        facebook: true,

        bankName: true,
        accountNumber: true,
        accountName: true,

        storeDone: true,
        payoutsDone: true,

        onboarding: {
          select: {
            setupEmailSent: true,
          },
        },

        user: {
          select: {
            email: true,
            name: true,
          },
        },

        store: {
          select: {
            slug: true,
          },
        },
      },
    });

  if (!existingProfile) {
    throw notFound(
      "Vendor profile not found."
    );
  }

  /* ------------------------------------------------------------------ */
  /* MERGED FINAL VALUES                                                */
  /* ------------------------------------------------------------------ */
  /*
   * A PATCH may contain only some fields.
   * Always calculate onboarding completion from the final
   * persisted values rather than only from the incoming payload.
   */

  const finalLogoUrl =
    data.logoUrl ??
    existingProfile.logoUrl;

  const finalCoverUrl =
    data.coverUrl ??
    existingProfile.coverUrl;

  const finalStoreName =
    data.storeName ??
    existingProfile.storeName;

  const finalBankName =
    data.bankName ??
    existingProfile.bankName;

  const finalAccountNumber =
    data.accountNumber ??
    existingProfile.accountNumber;

  const finalAccountName =
    data.accountName ??
    existingProfile.accountName;

  const finalSlug =
    data.slug ??
    existingProfile.store?.slug ??
    "";

  /* ------------------------------------------------------------------ */
  /* SLUG VALIDATION                                                    */
  /* ------------------------------------------------------------------ */

  if (
    data.slug &&
    data.slug !== existingProfile.store?.slug
  ) {
    await this.ensureStoreSlugAvailable(
      data.slug,
      existingProfile.id
    );
  }

  /* ------------------------------------------------------------------ */
  /* ONBOARDING COMPLETION                                              */
  /* ------------------------------------------------------------------ */

  /*
   * Store Branding is complete when the required
   * store identity and branding fields exist.
   */
  const storeDone = !!(
    finalLogoUrl &&
    finalCoverUrl &&
    finalStoreName &&
    finalSlug
  );

  /*
   * Payout Setup is complete when all required
   * bank information exists and the account number
   * meets the minimum length requirement.
   */
  const payoutsDone = !!(
    finalBankName &&
    finalAccountNumber &&
    finalAccountNumber.length >= 10 &&
    finalAccountName
  );





    /* ------------------------------------------------------------------ */
  /* STORE SETUP COMPLETION                                             */
  /* ------------------------------------------------------------------ */

      const setupComplete =
        storeDone && payoutsDone;

  /* ------------------------------------------------------------------ */
  /* DATABASE UPDATE                                                     */
  /* ------------------------------------------------------------------ */

  const updatedProfile =
    await prisma.$transaction(
      async (tx) => {
        const profile =
          await tx.vendorProfile.update({
            where: {
              userId,
            },

            data: {
              /* ------------------------------------------------------ */
              /* Vendor Profile fields                                 */
              /* ------------------------------------------------------ */

              ...(data.logoUrl !== undefined && {
                logoUrl: data.logoUrl,
              }),

              ...(data.coverUrl !== undefined && {
                coverUrl: data.coverUrl,
              }),

              ...(data.bio !== undefined && {
                bio: data.bio,
              }),

              ...(data.storeName !== undefined && {
                storeName: data.storeName,
              }),

              ...(data.instagram !== undefined && {
                instagram: data.instagram,
              }),

              ...(data.whatsapp !== undefined && {
                whatsapp: data.whatsapp,
              }),

              ...(data.twitter !== undefined && {
                twitter: data.twitter,
              }),

              ...(data.facebook !== undefined && {
                facebook: data.facebook,
              }),

              ...(data.bankName !== undefined && {
                bankName: data.bankName,
              }),

              ...(data.accountNumber !== undefined && {
                accountNumber:
                  data.accountNumber,
              }),

              ...(data.accountName !== undefined && {
                accountName:
                  data.accountName,
              }),

              /* ------------------------------------------------------ */
              /* Canonical VendorProfile onboarding flags               */
              /* ------------------------------------------------------ */

              storeDone,
              payoutsDone,

              /* ------------------------------------------------------ */
              /* Keep VendorOnboarding synchronized                     */
              /* ------------------------------------------------------ */

             onboarding: {
                upsert: {
                  create: {
                    storeDone,
                  },

                  update: {
                    storeDone,
                  },
                },
              },
            },
          });

        /* ------------------------------------------------------------ */
        /* Keep public VendorStore synchronized                         */
        /* ------------------------------------------------------------ */

        await tx.vendorStore.upsert({
          where: {
            vendorProfileId: profile.id,
          },

          create: {
            vendorProfileId: profile.id,
            name: finalStoreName,
            slug: finalSlug,
            description: data.bio ?? existingProfile.bio ?? null,
            logo: data.logoUrl ?? existingProfile.logoUrl ?? null,
            banner: data.coverUrl ?? existingProfile.coverUrl ?? null,
          },

          update: {
            ...(data.storeName !== undefined && {
              name: data.storeName,
            }),

            ...(data.slug !== undefined && {
              slug: finalSlug,
            }),

            ...(data.bio !== undefined && {
              description: data.bio,
            }),

            ...(data.logoUrl !== undefined && {
              logo: data.logoUrl,
            }),

            ...(data.coverUrl !== undefined && {
              banner: data.coverUrl,
            }),
          },
        });

        return profile;
      }
    );

  /* ------------------------------------------------------------------ */
  /* AUDIT LOG                                                          */
  /* ------------------------------------------------------------------ */

  await AuditService.vendorUpdated({
    actorId: userId,
    entityId: existingProfile.id,

    oldValues: {
      logoUrl:
        existingProfile.logoUrl,

      coverUrl:
        existingProfile.coverUrl,

      bio:
        existingProfile.bio,

      storeName:
        existingProfile.storeName,

      instagram:
        existingProfile.instagram,

      whatsapp:
        existingProfile.whatsapp,

      twitter:
        existingProfile.twitter,

      facebook:
        existingProfile.facebook,

      bankName:
        existingProfile.bankName,

      accountNumber:
        existingProfile.accountNumber,

      accountName:
        existingProfile.accountName,

      storeDone:
        existingProfile.storeDone,

      payoutsDone:
        existingProfile.payoutsDone,

      slug:
        existingProfile.store?.slug ??
        null,
    },

    newValues: {
      logoUrl:
        updatedProfile.logoUrl,

      coverUrl:
        updatedProfile.coverUrl,

      bio:
        updatedProfile.bio,

      storeName:
        updatedProfile.storeName,

      instagram:
        updatedProfile.instagram,

      whatsapp:
        updatedProfile.whatsapp,

      twitter:
        updatedProfile.twitter,

      facebook:
        updatedProfile.facebook,

      bankName:
        updatedProfile.bankName,

      accountNumber:
        updatedProfile.accountNumber,

      accountName:
        updatedProfile.accountName,

      storeDone,

      payoutsDone,

      slug:
        finalSlug || null,
    },
  });


   /* ------------------------------------------------------------------ */
  /* VENDOR SETUP COMPLETE EMAIL                                       */
  /* ------------------------------------------------------------------ */

  if (
    setupComplete &&
    !existingProfile.onboarding?.setupEmailSent
  ) {
    try {
      await sendVendorSetupCompleteEmail({
        email:
          existingProfile.user.email,

        firstName:
          existingProfile.user.name
            ?.split(" ")[0] ??
          "Merchant",

        storeName:
          updatedProfile.storeName ??
          "Your Store",
      });

      await prisma.vendorOnboarding.update({
        where: {
          vendorProfileId:
            updatedProfile.id,
        },

        data: {
          setupEmailSent: true,
        },
      });
    } catch (error) {
      console.info(
        "[VendorService] Vendor setup complete email failed:",
        error
      );
    }
  }
    
return updatedProfile;
  }
      
  
  static async getBankAccount(
        userId: string
      ) {
        return prisma.bankAccount.findUnique({
          where: {
            userId,
          },
        });
      }

      static async saveBankAccount(
        userId: string,
        data: {
          bankName: string;
          accountNumber: string;
          accountName: string;
        }
      ) {
        const {
          bankName,
          accountNumber,
          accountName,
        } = data;

        if (
          !bankName ||
          !accountNumber ||
          !accountName
        ) {
          throw badRequest(
            "Bank name, account number and account name are required."
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

        return prisma.bankAccount.upsert({
          where: {
            userId,
          },
          update: {
            bankName,
            accountNumber,
            accountName,
          },
          create: {
            userId,
            bankName,
            accountNumber,
            accountName,
          },
        });
    }



  static async reviewVendorAccount(
  vendorProfileId: string,
  action: "APPROVE" | "REJECT",
  reason: string | undefined,
  actor: {
    id: string;
    email: string | null;
    role: UserRole;
  }
) {
  // Permission checks specific to the business domain can go here if needed.

  if (action === "APPROVE") {
    await prisma.vendorProfile.update({
      where: { id: vendorProfileId },
      data: {
        status: "APPROVED",
        isVerified: true,
        user: {
          update: {
            role: "VENDOR",
            roles: ["CUSTOMER", "VENDOR"],
          },
        },
      },
    });
  } else {
    await prisma.vendorProfile.update({
      where: { id: vendorProfileId },
      data: {
        status: "REJECTED",
        rejectionReason: reason,
        isVerified: false,
      },
    });
  }

  return { success: true };
}


static async submitVerificationDocuments(
  vendorProfileId: string,
  url: string,
  step: "IDENTITY" | "BUSINESS" | "LOCATION",
  actor: {
    id: string;
    email: string | null;
    role: UserRole;
  }
): Promise<
  | {
      success: true;
      allDocsSubmitted: boolean;
      status: VendorStatus;
      verificationStatus: VerificationStatus;
      emailSent: boolean;
    }
  | {
      success: false;
      error: string;
    }
> {
  const fieldMap = {
    IDENTITY: "identityDoc",
    BUSINESS: "businessDoc",
    LOCATION: "locationDoc",
  } as const;

  const field = fieldMap[step];

  if (!field) {
    throw new Error(
      "Invalid verification step"
    );
  }

  const existingVendor =
    await prisma.vendorProfile.findFirst({
      where: {
        id: vendorProfileId,
        userId: actor.id,
      },
      select: {
        id: true,
        userId: true,
        status: true,
        identityDoc: true,
        businessDoc: true,
        locationDoc: true,
      },
    });

  if (!existingVendor) {
    throw notFound(
      "Vendor profile not found."
    );
  }

  const vendor =
    await prisma.$transaction(
      async (tx) => {
        await tx.vendorProfile.update({
          where: {
            id: vendorProfileId,
          },
          data: {
            [field]: url,
          },
        });

        const vendor =
          await tx.vendorProfile.findUnique({
            where: {
              id: vendorProfileId,
            },
            include: {
              user: true,
            },
          });

        if (!vendor) {
          throw notFound(
            "Vendor profile not found."
          );
        }

        // Business registration is optional. A vendor can proceed to review
        // once identity and business-location documents are provided.
        const hasRequiredDocs = Boolean(
          vendor.identityDoc && vendor.locationDoc
        );

        let finalStatus =
          vendor.status;

        if (
          hasRequiredDocs &&
          (
            vendor.status ===
              VendorStatus.AWAITING_DOCUMENTS ||
            vendor.status ===
              VendorStatus.REJECTED
          )
        ) {
          const updatedVendor =
            await tx.vendorProfile.update({
              where: {
                id: vendorProfileId,
              },
              data: {
                status:
                  VendorStatus.PENDING_REVIEW,
                rejectionReason: null,
              },
            });

          finalStatus =
            updatedVendor.status;

          return {
            vendor,
            hasRequiredDocs,
            finalStatus,
            shouldSendEmail: true,
          };
        }

        return {
          vendor,
          hasRequiredDocs,
          finalStatus,
          shouldSendEmail: false,
        };
      }
    );

  let emailSent = false;

  if (vendor.shouldSendEmail) {
    try {
      await sendVendorReviewEmail({
        email:
          vendor.vendor.user.email,
        firstName:
          vendor.vendor.user.name ??
          "Vendor",
        storeName:
          vendor.vendor.storeName ??
          "Your Store",
      });

      emailSent = true;
    } catch (error) {
      console.error(
        "[VendorService.submitVerificationDocuments]",
        error
      );
    }
  }

  let verificationStatus: VerificationStatus =
    "NOT_STARTED";

  if (
    !vendor.vendor.identityDoc &&
    !vendor.vendor.locationDoc
  ) {
    verificationStatus =
      "NOT_STARTED";
  } else if (
    vendor.finalStatus ===
    VendorStatus.PENDING_REVIEW
  ) {
    verificationStatus =
      "PENDING_REVIEW";
  } else if (
    vendor.finalStatus ===
    VendorStatus.REJECTED
  ) {
    verificationStatus =
      "REJECTED";
  } else if (
    vendor.finalStatus ===
    VendorStatus.APPROVED
  ) {
    verificationStatus =
      "APPROVED";
  } else {
    verificationStatus =
      "AWAITING_DOCUMENTS";
  }

  await AuditService.vendorUpdated({
    actorId: actor.id,
    entityId: vendorProfileId,
    oldValues: {
      status:
        existingVendor.status,
      identityDoc:
        existingVendor.identityDoc,
      businessDoc:
        existingVendor.businessDoc,
      locationDoc:
        existingVendor.locationDoc,
    },
    newValues: {
      submittedDocument: step,
      status:
        vendor.finalStatus,
      verificationStatus,
      requiredDocumentsSubmitted:
        vendor.hasRequiredDocs,
    },
  });

  return {
    success: true,
    allDocsSubmitted:
      vendor.hasRequiredDocs,
    status:
      vendor.finalStatus,
    verificationStatus,
    emailSent,
  };
}

static async completeStoreSetup(
  vendorProfileId: string,
  formData: FormData
) {
  const name = formData.get("name") as string;
  const slug = formData.get("slug") as string;
  const bio = formData.get("bio") as string;

  const formattedSlug = slug
    .toLowerCase()
    .trim()
    .replace(/\s+/g, "-");

  try {
    await prisma.$transaction([
      prisma.vendorStore.update({
        where: { vendorProfileId },
        data: {
          name,
          slug: formattedSlug,
          description: bio,
        },
      }),

      prisma.vendorOnboarding.update({
        where: { vendorProfileId },
        data: {
          storeDone: true,
        },
      }),
    ]);

    return {
      success: true,
    };
  } catch (error: any) {
    if (error.code === "P2002") {
      return {
        success: false,
        error: "This store slug is already taken.",
      };
    }

    return {
      success: false,
      error: "Something went wrong. Please try again.",
    };
  }
}

  

/* -------------------------------------------------------------------------- */
/*                          PUBLIC STORE QUERIES                              */
/* -------------------------------------------------------------------------- */
static async getPublicStoreBySlug(slug: string) {
  return prisma.vendorStore.findFirst({
    where: {
      OR: [
        {
          slug,
        },
        {
          id: slug,
        },
        {
          vendorProfileId: slug,
        },
      ],
    },

    include: {
      vendorProfile: {
        include: {
          products: {
            where: {
              isPublished: true,
              status: "ACTIVE",
            },

            orderBy: {
              createdAt: "desc",
            },

            include: {
              category: {
                select: {
                  name: true,
                },
              },

              images: true,

              vendorProfile: {
                include: {
                  store: true,
                },
              },
            },
          },

          score: true,
        },
      },
    },
  });
}


/*-------------------------------------------------------------------------------*/
/*                    VENDOR DASHBOARD PROFILE FRONTEND EXTRACTION                 */                                      
/*---------------------------------------------------------------------------------*/

static async getVendorDashboardProfile(userId: string) {
  return prisma.vendorProfile.findUnique({
    where: {
      userId,
    },

    include: {
      onboarding: true,
      store: true,
      score: true,
      boost: true,

      products: {
        take: 3,
        orderBy: {
          salesCount: "desc",
        },

        include: {
          images: true,
        },
      },
    },
  });
}


/*-------------------------------------------------------------------------------*/
/*                         VENDOR SCORE FRONTEND                                  */                                      
/*---------------------------------------------------------------------------------*/

static async ensureVendorScore(
  vendorProfileId: string
) {
  const existing =
    await prisma.vendorScore.findUnique({
      where: {
        vendorProfileId,
      },
    });

  if (existing) {
    return existing;
  }

  return prisma.vendorScore.create({
    data: {
      vendorProfileId,
      commissionRate: 0.1,
      tier: "BRONZE",
      rating: 0,
      fulfillmentRate: 100,
      reviewsCount: 0,
    },
  });
}



/*-------------------------------------------------------------------------------*/
/*                         VENDOR STATS FRONTEND                                  */                                      
/*---------------------------------------------------------------------------------*/

static async getVendorDashboardStats(
  vendorProfileId: string,
  userId: string
) {
  const [
    liveProductsCount,
    newOrdersCount,
    unreadCount,
  ] = await Promise.all([
    prisma.product.count({
      where: {
        vendorProfileId,
        isPublished: true,
      },
    }),

    prisma.order.count({
      where: {
        vendorProfileId,
        status: "PENDING",
      },
    }),

    prisma.message.count({
      where: {
        conversation: {
          participantIds: {
            has: userId,
          },
        },
        isRead: false,
        senderId: {
          not: userId,
        },
      },
    }),
  ]);

  return {
    liveProductsCount,
    newOrdersCount,
    unreadCount,
  };
}


/*-------------------------------------------------------------------------------*/
/*                         VENDOR ONBOARDING FRONTEND                              */                                      
/*---------------------------------------------------------------------------------*/

static async getVendorDashboardData(userId: string) {
  const vendor = await prisma.vendorProfile.findUnique({
    where: {
      userId,
    },
    include: {
      onboarding: true,
      store: true,
      score: true,
      boost: true,
      products: {
        take: 3,
        orderBy: {
          salesCount: "desc",
        },
        include: {
          images: true,
        },
      },
    },
  });

  if (!vendor) {
    throw notFound("Vendor profile not found.");
  }

  return vendor;
}


/*-------------------------------------------------------------------------------*/
/*                         VENDOR PROFILE SETTINGS FRONTEND                        */                                      
/*---------------------------------------------------------------------------------*/
static async getVendorSettingsProfile(
  userId: string
) {
  const vendor =
    await prisma.vendorProfile.findUnique({
      where: {
        userId,
      },
      include: {
        store: true,
      },
    });

  if (!vendor) {
    throw notFound(
      "Vendor profile not found."
    );
  }

  return vendor;
}


/*-------------------------------------------------------------------------------*/
/*                        VENDOR VERIFICATION PROFILE FRONTEND                   */                                      
/*---------------------------------------------------------------------------------*/
static async getVendorVerificationProfile(
  userId: string
) {
  const vendor =
    await prisma.vendorProfile.findUnique({
      where: {
        userId,
      },
      select: {
        id: true,
        status: true,
        identityDoc: true,
        businessDoc: true,
        locationDoc: true,
      },
    });

  if (!vendor) {
    throw notFound(
      "Vendor profile not found."
    );
  }

  return vendor;
}

/*-------------------------------------------------------------------------------*/
/*                        VENDOR ANALYTICS DASHBOARD FRONTEND                      */                                      
/*---------------------------------------------------------------------------------*/
static async getVendorAnalyticsDashboard(
  vendorProfileId: string
) {
  const today = startOfDay(new Date());
  const monthStart = startOfMonth(new Date());
  const thirtyDaysAgo = subDays(today, 30);

  const revenueStatuses = [
    "DELIVERED",
    "COMPLETED",
    "SUCCESS",
    "PAID",
  ];

  return Promise.all([
    prisma.vendorOrder.aggregate({
      where: {
        vendorProfileId,
        status: { in: revenueStatuses },
        createdAt: { gte: today },
      },
      _sum: { merchandiseSubtotal: true },
    }),

    prisma.vendorOrder.aggregate({
      where: {
        vendorProfileId,
        status: { in: revenueStatuses },
        createdAt: { gte: monthStart },
      },
      _sum: { merchandiseSubtotal: true },
    }),

    prisma.vendorOrder.findMany({
      where: {
        vendorProfileId,
        status: { in: revenueStatuses },
        createdAt: { gte: thirtyDaysAgo },
      },
      select: {
        merchandiseSubtotal: true,
        createdAt: true,
      },
      orderBy: {
        createdAt: "asc",
      },
    }),

    prisma.product.count({
      where: {
        vendorProfileId,
        isPublished: true,
      },
    }),

    prisma.vendorOrder.count({
      where: {
        vendorProfileId,
        status: { in: revenueStatuses },
      },
    }),

    prisma.vendorOrder.findMany({
      where: {
        vendorProfileId,
        status: { in: revenueStatuses },
      },
      select: {
        order: {
          select: {
            userId: true,
            createdAt: true,
          },
        },
      },
    }),

    prisma.vendorOrder.findMany({
      where: {
        vendorProfileId,
        status: { in: revenueStatuses },
      },
      select: {
        order: {
          select: {
            userId: true,
          },
        },
      },
    }),

    prisma.marketplaceTransaction.findMany({
      where: {
        vendorProfileId,
        status: "SUCCESS",
        createdAt: {
          gte: monthStart,
        },
      },
      select: {
        grossAmount: true,
        platformFee: true,
        netAmount: true,
        commissionRate: true,
      },
    }),
  ]);
}

/*-------------------------------------------------------------------------------*/
/*                        VENDOR ANALYTICS PROFILE FRONTEND                      */                                      
/*---------------------------------------------------------------------------------*/
static async getVendorAnalyticsProfile(
  userId: string
) {
  const vendor =
    await prisma.vendorProfile.findUnique({
      where: {
        userId,
      },
      include: {
        score: true,
        boost: true,
        products: {
          include: {
            images: true,
          },
        },
      },
    });

  if (!vendor) {
    throw notFound(
      "Vendor profile not found."
    );
  }

  return vendor;
}



                
}
