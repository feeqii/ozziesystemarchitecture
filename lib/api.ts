import { NextResponse } from "next/server";

export function jsonError(message: string, status = 400) {
  return NextResponse.json({ error: message }, { status });
}

export function mapAuthError(error: unknown) {
  if (error instanceof Error) {
    if (error.message === "UNAUTHORIZED") {
      return jsonError("Unauthorized", 401);
    }
    if (error.message === "ONBOARDING_REQUIRED") {
      return jsonError("Onboarding required", 403);
    }
  }
  return null;
}
