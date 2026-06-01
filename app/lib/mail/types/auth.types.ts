export type UserType =
  | "CUSTOMER"
  | "VENDOR";

export interface VerificationTemplateData {
  name: string;
  code: string;
  uid: string;
  type: UserType;
}

export interface PasswordResetTemplateData {
  token: string;
}

export interface VerificationEmailRequest
  extends VerificationTemplateData {
  email: string;
}

export interface PasswordResetEmailRequest {
  email: string;
  token: string;
}