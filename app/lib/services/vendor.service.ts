import { prisma } from "@/app/lib/prisma";
import { forbidden, notFound, badRequest} from "@/app/lib/auth/errors";


import {
  Prisma,
  VendorStatus,
  UserRole,
} from "@prisma/client";


export class VendorService {
  static async getVendorProfile(
    userId: string
  ) {
    return prisma.vendorProfile.findUnique({
      where: {
        userId,
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

static async updateProfile(
  vendorProfileId: string,
  data: Prisma.VendorProfileUpdateInput
) {
  return prisma.vendorProfile.update({
    where: {
      id: vendorProfileId,
    },
    data,
  });
}

static async updateStatus(
  vendorProfileId: string,
  status: VendorStatus
) {
  return prisma.vendorProfile.update({
    where: {
      id: vendorProfileId,
    },
    data: {
      status,
    },
  });
}



static async approveVendor(
  vendorProfileId: string
) {
  return this.updateStatus(
    vendorProfileId,
    VendorStatus.APPROVED
  );
}

static async rejectVendor(
  vendorProfileId: string,
  rejectionReason: string
) {
  return prisma.vendorProfile.update({
    where: {
      id: vendorProfileId,
    },
    data: {
      status: VendorStatus.REJECTED,
      rejectionReason,
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
      return prisma.$transaction(async (tx) => {
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
            accountNumber: profileData.accountNumber,
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
              profileData.storeName ||
              currentStoreName,
            slug: normalizedSlug,
          },
          create: {
            vendorProfileId: profileId,
            name:
              profileData.storeName ||
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
        userId: string
      ) {
        const [vendor, follow] = await Promise.all([
          prisma.vendorProfile.findUnique({
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
          vendor,
          isFollowing: !!follow,
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
                conversationId:
                  conversation.id,
                senderId: adminUserId,
                senderName:
                  "MARVELMARTS COMPLIANCE",
                content: `🚨 SYSTEM ACTION: Account has been ${action}.\nReason: ${
                  reason ??
                  "No reason provided"
                }`,
              },
            });
          }

          return updatedVendor;
        });

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

      for (const vendor of vendors) {
        const aggregation =
          await prisma.order.aggregate({
            where: {
              OR: [
                {
                  vendorProfileId:
                    vendor.userId,
                },
                {
                  vendorProfileId:
                    vendor.id,
                },
              ],
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

        const totalSum =
          aggregation._sum.total
            ? Number(
                aggregation._sum.total
              )
            : 0;

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
        await prisma.vendorProfile.delete({
          where: {
            id: vendorProfileId,
          },
        });

        return {
          deleted: true,
        };
      }

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
                  !currentVendor.businessDoc
                ) {
                  missingDocs.push(
                    "Business"
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

                await tx.user.update({
                  where: {
                    id: currentVendor.userId,
                  },
                  data: {
                    role: UserRole.VENDOR,
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
        instagram?: string;
        whatsapp?: string;
        twitter?: string;
        bankName?: string;
        accountNumber?: string;
        accountName?: string;
      }
    ) {
      return prisma.vendorProfile.update({
        where: {
          userId,
        },

        data: {
          logoUrl: data.logoUrl,
          coverUrl: data.coverUrl,
          bio: data.bio,
          storeName: data.storeName,

          instagram: data.instagram,
          whatsapp: data.whatsapp,
          twitter: data.twitter,

          bankName: data.bankName,
          accountNumber: data.accountNumber,
          accountName: data.accountName,

          onboarding: {
            update: {
              storeDone: !!(
                data.logoUrl &&
                data.coverUrl &&
                data.bio
              ),
            },
          },
        },
      });
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
                
}