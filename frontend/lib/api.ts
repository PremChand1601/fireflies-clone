export const API_URL = process.env.NEXT_PUBLIC_API_URL ?? "http://localhost:8000";
export function formatApiError(error: unknown): string {
  if (error instanceof Error) {
    return error.message;
  }

  if (typeof error === "string") {
    return error;
  }

  return "Something went wrong. Please try again.";
}