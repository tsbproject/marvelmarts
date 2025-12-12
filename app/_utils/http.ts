// app/api/_utils/http.ts
import { NextResponse } from "next/server";

export interface ApiSuccess<T = unknown> {
  success: true;
  data: T;
}

export interface ApiError {
  success: false;
  error: string;
}

export function ok<T>(data: T, status = 200) {
  return NextResponse.json<ApiSuccess<T>>({ success: true, data }, { status });
}

export function badRequest(message: string) {
  return NextResponse.json<ApiError>({ success: false, error: message }, { status: 400 });
}

export function notFound(message: string) {
  return NextResponse.json<ApiError>({ success: false, error: message }, { status: 404 });
}

export function tooMany(message: string) {
  return NextResponse.json<ApiError>({ success: false, error: message }, { status: 429 });
}

export function serverError(message = "Internal server error") {
  return NextResponse.json<ApiError>({ success: false, error: message }, { status: 500 });
}
