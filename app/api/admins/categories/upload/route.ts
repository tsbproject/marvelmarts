import { NextRequest, NextResponse } from "next/server";

import {
  handleApiError,
  requireManageCategories,
} from "@/app/lib/auth/api";

import { verifyOrigin } from "@/app/lib/auth/csrf";
import { withApiLogging } from "@/app/lib/logging/with-api-logging";
import { CloudinaryService } from "@/app/lib/services/cloudinary.service";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

const MAX_CATEGORY_IMAGE_SIZE = 2 * 1024 * 1024; // 2 MB

const ALLOWED_IMAGE_TYPES = new Set([
  "image/jpeg",
  "image/png",
  "image/webp",
]);

export const POST = withApiLogging(
  async (request: NextRequest) => {
    try {
      verifyOrigin(request);

      await requireManageCategories();

      const formData =
        await request.formData();

      const file =
        formData.get("file");

      if (!(file instanceof File)) {
        return NextResponse.json(
          {
            success: false,
            error:
              "A valid category image is required.",
          },
          {
            status: 400,
          }
        );
      }

      if (file.size <= 0) {
        return NextResponse.json(
          {
            success: false,
            error:
              "Uploaded file is empty.",
          },
          {
            status: 400,
          }
        );
      }

      if (
        file.size >
        MAX_CATEGORY_IMAGE_SIZE
      ) {
        return NextResponse.json(
          {
            success: false,
            error:
              "Category image must not exceed 2 MB.",
          },
          {
            status: 400,
          }
        );
      }

      if (
        !ALLOWED_IMAGE_TYPES.has(
          file.type
        )
      ) {
        return NextResponse.json(
          {
            success: false,
            error:
              "Only JPEG, PNG, and WebP images are allowed.",
          },
          {
            status: 400,
          }
        );
      }

      const secureUrl =
        await CloudinaryService.upload(
          file,
          "categories"
        );

      return NextResponse.json(
        {
          success: true,
          url: secureUrl,
        },
        {
          status: 200,
        }
      );
    } catch (error) {
      return handleApiError(error);
    }
  }
);