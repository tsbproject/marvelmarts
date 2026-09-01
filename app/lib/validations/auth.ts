import { z } from "zod";

const emailSchema = z
  .string()
  .trim()
  .email("Valid email required")
  .max(254);

const verificationCodeSchema = z
  .string()
  .trim()
  .regex(
    /^\d{6}$/,
    "Verification code must be 6 digits"
  );

const uidSchema = z
  .string()
  .trim()
  .min(1)
  .max(128);

const passwordSchema = z
  .string()
  .min(
    8,
    "Password must be at least 8 characters"
  )
  .max(
    128,
    "Password must not exceed 128 characters"
  );

const nameSchema = z
  .string()
  .trim()
  .min(1, "Name is required")
  .max(100);

const phoneSchema = z
  .string()
  .trim()
  .min(10, "Valid phone number required")
  .max(20);

export const forgotPasswordSchema = z.object({
  email: emailSchema,
});

export const resetPasswordSchema = z.object({
  email: emailSchema,
  code: verificationCodeSchema,
  newPassword: passwordSchema,
});

export const verifyRegistrationSchema = z.object({
  uid: uidSchema,
  code: verificationCodeSchema,
});

export const customerRegisterSchema = z.object({
  email: emailSchema,
  name: nameSchema,
});

export const customerSendCodeSchema = z.object({
  name: nameSchema,
  email: emailSchema,
  password: passwordSchema,
});

export const customerResendCodeSchema = z.object({
  uid: uidSchema,
});

export const vendorRegisterSchema = z.object({
  email: emailSchema,

  password: passwordSchema,

  firstName: nameSchema,

  lastName: nameSchema,

  phoneNumber: phoneSchema,

  storeName: z
    .string()
    .trim()
    .min(1, "Store name is required")
    .max(150),

  storePhone: phoneSchema,

  storeAddress: z
    .string()
    .trim()
    .min(5, "Store address is required")
    .max(500),

  state: z
    .string()
    .trim()
    .min(1)
    .max(100),

  country: z
    .string()
    .trim()
    .min(1)
    .max(100)
    .default("Nigeria"),

  isReapplication:
    z.boolean().optional(),
});

export const vendorSendCodeSchema = z.object({
  email: emailSchema,

  firstName: nameSchema,

  lastName: nameSchema,
});