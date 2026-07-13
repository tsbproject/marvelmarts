import { ConversationType } from "@prisma/client";
import { prisma } from "@/app/lib/prisma";

export class MessageService {
  static async markConversationAsRead(
    conversationId: string,
    currentUserId: string
  ) {
    return prisma.message.updateMany({
      where: {
        conversationId,
        senderId: {
          not: currentUserId,
        },
        isRead: false,
      },
      data: {
        isRead: true,
      },
    });
  }

  static async getUserConversations(
    userId: string
    ) {
    return prisma.conversation.findMany({
        where: {
        participantIds: {
            has: userId,
        },
        },
        include: {
        messages: {
            orderBy: {
            createdAt: "desc",
            },
            take: 1,
        },
        },
        orderBy: {
        updatedAt: "desc",
        },
    });
    }

       static async closeConversation(
        conversationId: string,
        endedById: string,
        endedByRole: "ADMIN" | "VENDOR"
        ) {
        return prisma.conversation.update({
            where: {
            id: conversationId,
            },
            data: {
            status: "CLOSED",
            endedAt: new Date(),
            endedById,
            endedByRole,
            },
            select: {
            id: true,
            status: true,
            endedAt: true,
            endedByRole: true,
            },
        });
        }

          static async getConversations(
            userId: string,
            type?: string | null
          ) {
            return prisma.conversation.findMany({
              where: {
                participantIds: {
                  has: userId,
                },
                NOT: {
                  deletedByParticipantIds: {
                    has: userId,
                  },
                },
                ...(type && {
                  type: type as any,
                }),
              },
              include: {
                participants: {
                  select: {
                    id: true,
                    name: true,
                    role: true,
                    vendorProfile: {
                      select: {
                        id: true,
                      },
                    },
                  },
                },
                messages: {
                  orderBy: {
                    createdAt: "desc",
                  },
                  take: 1,
                },
              },
              orderBy: {
                updatedAt: "desc",
              },
            });
          }
        
      static async initiateSupportConversation(
          email: string,
          name: string,
          isVendor: boolean
        ) {
          const user = await prisma.user.findUnique({
            where: {
              email,
            },
            include: {
              vendorProfile: true,
            },
          });

          if (!user) {
            return {
              userExists: false,
            };
          }

          const type = isVendor
            ? ConversationType.VENDOR_ADMIN
            : ConversationType.CUSTOMER_ADMIN;

          let conversation =
            await prisma.conversation.findFirst({
              where: {
                type,
                participantIds: {
                  has: user.id,
                },
              },
              include: {
                messages: {
                  orderBy: {
                    createdAt: "desc",
                  },
                  take: 1,
                },
                participants: {
                  select: {
                    id: true,
                    name: true,
                    role: true,
                  },
                },
              },
            });

          const admin =
            await prisma.user.findFirst({
              where: {
                role: {
                  in: [
                    "ADMIN",
                    "SUPER_ADMIN",
                  ],
                },
                isSuspended: false,
              },
            });

          if (!conversation) {
            if (!admin) {
              return {
                userExists: true,
                adminAvailable: false,
              };
            }

            conversation =
              await prisma.conversation.create({
                data: {
                  type,
                  subject: isVendor
                    ? `Vendor Support: ${name}`
                    : `Customer Support: ${name}`,
                  participantIds: [
                    user.id,
                    admin.id,
                  ],
                },
                include: {
                  participants: {
                    select: {
                      id: true,
                      name: true,
                      role: true,
                    },
                  },
                  messages: true,
                },
              });

            const welcomeMessage =
              await prisma.message.create({
                data: {
                  conversationId:
                    conversation.id,
                  senderId: "SYSTEM",
                  senderName:
                    "MarvelMarts Support",
                  content: `Hello ${name}, thank you for reaching out. A member of our team will be with you shortly.`,
                },
              });

            return {
              userExists: true,
              adminAvailable: true,
              created: true,
              conversation,
              welcomeMessage,
            };
          }

          return {
            userExists: true,
            adminAvailable: true,
            created: false,
            conversation,
          };
        }

        static async getSupportDashboardStats() {
        const openTickets =
          await prisma.conversation.count({
            where: {
              updatedAt: {
                gte: new Date(
                  Date.now() -
                    24 * 60 * 60 * 1000
                ),
              },
            },
          });

        return {
          openTickets,
        };
      }
      
  }