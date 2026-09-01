import { NextRequest, NextResponse } from "next/server";

import {
  handleApiError,
  requireVendorProfile,
} from "@/app/lib/auth/api";

import { verifyOrigin } from "@/app/lib/auth/csrf";
import { withApiLogging } from "@/app/lib/logging/with-api-logging";
import { CloudinaryService } from "@/app/lib/services/cloudinary.service";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

const MAX_BRANDING_FILE_SIZE = 5 * 1024 * 1024; // 5 MB

const ALLOWED_IMAGE_TYPES = new Set([
  "image/jpeg",
  "image/png",
  "image/webp",
]);

export const POST = withApiLogging(
  async (request: NextRequest) => {
    try {
      verifyOrigin(request);

      const { vendor } =
        await requireVendorProfile();

      const formData =
        await request.formData();

      const type = formData.get("type");
      const file = formData.get("file");

      if (
        type !== "logo" &&
        type !== "cover"
      ) {
        return NextResponse.json(
          {
            success: false,
            error:
              "Invalid branding upload type.",
          },
          {
            status: 400,
          }
        );
      }

      if (!(file instanceof File)) {
        return NextResponse.json(
          {
            success: false,
            error:
              "A valid image file is required.",
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
        MAX_BRANDING_FILE_SIZE
      ) {
        return NextResponse.json(
          {
            success: false,
            error:
              "Branding image must not exceed 5 MB.",
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

      const folder =
        `vendors/${vendor.id}/branding`;

      const secureUrl =
        await CloudinaryService.upload(
          file,
          folder
        );

      return NextResponse.json(
        {
          success: true,
          url: secureUrl,
          type,
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