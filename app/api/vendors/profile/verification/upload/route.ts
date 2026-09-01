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

const MAX_VERIFICATION_FILE_SIZE = 5 * 1024 * 1024; // 5 MB

const ALLOWED_DOCUMENT_TYPES = new Set([
  "image/jpeg",
  "image/png",
  "image/webp",
  "application/pdf",
]);

const ALLOWED_STEPS = new Set([
  "IDENTITY",
  "BUSINESS",
  "LOCATION",
]);

export const POST = withApiLogging(
  async (request: NextRequest) => {
    try {
      verifyOrigin(request);

      const { vendor } =
        await requireVendorProfile();

      const formData =
        await request.formData();

      const step = formData.get("step");
      const file = formData.get("file");

      /* ------------------------------------------------------------------ */
      /* Validate verification step                                         */
      /* ------------------------------------------------------------------ */

      if (
        typeof step !== "string" ||
        !ALLOWED_STEPS.has(step)
      ) {
        return NextResponse.json(
          {
            success: false,
            error:
              "Invalid verification document type.",
          },
          {
            status: 400,
          }
        );
      }

      /* ------------------------------------------------------------------ */
      /* Validate uploaded file                                             */
      /* ------------------------------------------------------------------ */

      if (!(file instanceof File)) {
        return NextResponse.json(
          {
            success: false,
            error:
              "A valid verification document is required.",
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
        MAX_VERIFICATION_FILE_SIZE
      ) {
        return NextResponse.json(
          {
            success: false,
            error:
              "Verification document must not exceed 5 MB.",
          },
          {
            status: 400,
          }
        );
      }

      if (
        !ALLOWED_DOCUMENT_TYPES.has(
          file.type
        )
      ) {
        return NextResponse.json(
          {
            success: false,
            error:
              "Only JPEG, PNG, WebP, and PDF documents are allowed.",
          },
          {
            status: 400,
          }
        );
      }

      /* ------------------------------------------------------------------ */
      /* Server-side Cloudinary upload                                      */
      /* ------------------------------------------------------------------ */

      const folder =
        `vendors/${vendor.id}/verification`;

      const secureUrl =
        await CloudinaryService.upload(
          file,
          folder
        );

      return NextResponse.json(
        {
          success: true,
          url: secureUrl,
          step,
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