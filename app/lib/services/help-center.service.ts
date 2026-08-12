import { prisma } from "@/app/lib/prisma";

import { badRequest, notFound  } from "@/app/lib/auth/errors";

import {
  sendSupportProgressEmail,
  sendSupportResolvedEmail,
} from "@/app/lib/mailer";


import {
  ConversationType,
} from "@prisma/client";



interface HelpArticleData {
  title: string;
  slug?: string;
  excerpt?: string;
  content: string;
  category: string;
  keywords?: string[];
}

export class HelpCenterService {
  private static generateSlug(
    title: string
  ) {
    return title
      .toLowerCase()
      .trim()
      .replace(/\s+/g, "-")
      .replace(/[^\w-]/g, "");
  }

  static async createArticle(
    data: HelpArticleData
  ) {
    if (
      !data.title ||
      !data.content ||
      !data.category
    ) {
      throw badRequest(
        "Title, content and category are required."
      );
    }

    const slug =
      data.slug?.trim() ||
      this.generateSlug(data.title);

    return prisma.helpArticle.create({
      data: {
        title: data.title.trim(),
        slug,
        excerpt:
          data.excerpt?.trim() ?? "",
        content: data.content,
        category: data.category,
        keywords: Array.isArray(
          data.keywords
        )
          ? data.keywords
          : [],
      },
    });
  }

  static async updateArticle(
    id: string,
    data: HelpArticleData
  ) {
    return prisma.helpArticle.update({
      where: {
        id,
      },
      data: {
        title: data.title?.trim(),
        excerpt:
          data.excerpt?.trim(),
        content: data.content,
        category: data.category,
        keywords: Array.isArray(
          data.keywords
        )
          ? data.keywords
          : [],
      },
    });
  }

  static async deleteArticle(
    id: string
  ) {
    await prisma.helpArticle.delete({
      where: {
        id,
      },
    });
  }

  static async searchArticles(
    query: string
    ) {
    if (
        !query ||
        query.trim().length < 2
    ) {
        return [];
    }

    return prisma.helpArticle.findMany({
        where: {
        OR: [
            {
            title: {
                contains: query,
                mode: "insensitive",
            },
            },
            {
            content: {
                contains: query,
                mode: "insensitive",
            },
            },
            {
            keywords: {
                has: query.toLowerCase(),
            },
            },
        ],
        },
        take: 5,
        orderBy: {
        title: "asc",
        },
    });
    }


    //SUPPORT ARTICLE VOTE ROUTE

     static async voteArticle(
  id: string,
  type: "helpful" | "notHelpful"
) {
  if (!id) {
    throw badRequest(
      "Article ID is required."
    );
  }

  if (
    type !== "helpful" &&
    type !== "notHelpful"
  ) {
    throw badRequest(
      "Invalid vote type."
    );
  }

  const updated =
    await prisma.helpArticle.update({
      where: {
        id,
      },
      data: {
        [type]: {
          increment: 1,
        },
      },
    });

  return updated[type];
}

//SUPPORT LANDING DATA ROUTE

   static async getHelpCenterHome() {
  const [categoryData, featuredArticles] =
    await Promise.all([
      prisma.helpArticle.groupBy({
        by: ["category"],
        _count: {
          _all: true,
        },
      }),

      prisma.helpArticle.findMany({
        take: 4,
        select: {
          id: true,
          title: true,
          slug: true,
          excerpt: true,
          category: true,
        },
        orderBy: {
          updatedAt: "desc",
        },
      }),
    ]);

  return {
    categoryData,
    featuredArticles,
  };
}



static async replyToTicket({
  ticketId,
  message,
  status,
}: {
  ticketId: string;
  message: string;
  status: string;
}) {
  const ticket =
    await prisma.ticket.findUnique({
      where: {
        id: ticketId,
      },
    });

  if (!ticket) {
    throw notFound("Ticket not found.");
  }

  await prisma.$transaction(async (tx) => {
    await tx.ticketReply.create({
      data: {
        ticketId,
        senderType: "ADMIN",
        message,
      },
    });

    await tx.ticket.update({
      where: {
        id: ticketId,
      },
      data: {
        status,
      },
    });
  });

  if (status === "RESOLVED") {
    await sendSupportResolvedEmail({
      to: ticket.userEmail,
      ticketId: ticket.id,
      subject: ticket.subject,
      message,
    });
  } else {
    await sendSupportProgressEmail({
      to: ticket.userEmail,
      ticketId: ticket.id,
      subject: ticket.subject,
      status,
      message,
    });
  }

  return {
    success: true,
  };
}


static async sendTicketReply({
    ticketId,
    message,
    status,
  }: {
    ticketId: string;
    message: string;
    status: string;
  }) {
    const ticket =
      await prisma.ticket.findUnique({
        where: {
          id: ticketId,
        },
      });

    if (!ticket) {
      throw notFound("Ticket not found.");
    }

    await prisma.$transaction(async (tx) => {
      await tx.ticketReply.create({
        data: {
          ticketId,
          senderType: "ADMIN",
          message,
        },
      });

      await tx.ticket.update({
        where: {
          id: ticketId,
        },
        data: {
          status,
        },
      });
    });

    if (status === "RESOLVED") {
      await sendSupportResolvedEmail({
        to: ticket.userEmail,
        ticketId: ticket.id,
        subject: ticket.subject,
        message,
      });
    } else {
      await sendSupportProgressEmail({
        to: ticket.userEmail,
        ticketId: ticket.id,
        subject: ticket.subject,
        status,
        message,
      });
    }

    return {
      success: true,
    };
  }






  /* -------------------------------------------------------------------------- */
  /*                          HELP ARTICLE QUERIES                              */
  /* -------------------------------------------------------------------------- */

  static async getHelpArticles() {
    return prisma.helpArticle.findMany({
      orderBy: {
        updatedAt: "desc",
      },
    });
  }

  static async getHelpArticleById(
    id: string
  ) {
    return prisma.helpArticle.findUnique({
      where: {
        id,
      },
    });
  }



/* -------------------------------------------------------------------------- */
/*                         SUPPORT TICKET QUERIES                             */
/* -------------------------------------------------------------------------- */

static async getTickets() {
  return prisma.ticket.findMany({
    orderBy: {
      createdAt: "desc",
    },
  });
}

static async getTicketById(
  id: string
) {
  return prisma.ticket.findUnique({
    where: {
      id,
    },
    include: {
      replies: {
        orderBy: {
          createdAt: "asc",
        },
      },
    },
  });
}

static async getTicketArticle(
  articleId: string
) {
  return prisma.helpArticle.findUnique({
    where: {
      id: articleId,
    },
  });
}


/* -------------------------------------------------------------------------- */
/*                        ADMIN CONVERSATION QUERIES                           */
/* -------------------------------------------------------------------------- */

static async getAdminConversations(
  type: ConversationType,
  currentUserId?: string
) {
  return prisma.conversation.findMany({
    where: {
      type,

      ...(currentUserId
        ? {
            NOT: {
              deletedByParticipantIds: {
                has: currentUserId,
              },
            },
          }
        : {}),
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


/* -------------------------------------------------------------------------- */
/*                      PUBLIC HELP CENTER QUERIES                            */
/* -------------------------------------------------------------------------- */

static async getPublicArticleBySlug(
  slug: string
) {
  return prisma.helpArticle.findUnique({
    where: {
      slug,
    },
  });
}

static async getRelatedArticles(
  category: string,
  articleId: string
) {
  return prisma.helpArticle.findMany({
    where: {
      category,

      NOT: {
        id: articleId,
      },
    },

    take: 5,
  });
}

static async getArticleSlugs() {
  return prisma.helpArticle.findMany({
    select: {
      slug: true,
    },
  });
}



/* -------------------------------------------------------------------------- */
/*                          PUBLIC ARTICLES SECTION                           */
/* -------------------------------------------------------------------------- */

static async getPublishedArticles() {
  return prisma.helpArticle.findMany({
    orderBy: {
      updatedAt: "desc",
    },
  });
}



/* -------------------------------------------------------------------------- */
/*                    PUBLIC CATEGORY ARTICLES SECTION                         */
/* -------------------------------------------------------------------------- */

static async getArticlesByCategory(
  category: string
) {
  return prisma.helpArticle.findMany({
    where: {
      category: {
        equals: category,
        mode: "insensitive",
      },
    },
    orderBy: {
      createdAt: "desc",
    },
  });
}


/* -------------------------------------------------------------------------- */
/*                           GET VENDOR TICKET                                  */
/* -------------------------------------------------------------------------- */

static async getUserTickets(
  email: string
) {
  return prisma.ticket.findMany({
    where: {
      userEmail: email,
    },
    orderBy: {
      createdAt: "desc",
    },
  });
}



static async getUserTicket(
  ticketId: string,
  email: string
) {
  return prisma.ticket.findFirst({
    where: {
      id: ticketId,
      userEmail: email,
    },
    include: {
      replies: {
        orderBy: {
          createdAt: "asc",
        },
      },
    },
  });
}

}