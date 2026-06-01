// Extracts a human-friendly message from an Axios error carrying the API's
// enveloped error shape: { success, message, data, errors }.
export function getApiErrorMessage(error: unknown, fallback = "Something went wrong"): string {
  const response = (error as { response?: { data?: unknown } })?.response;
  const data = response?.data as { message?: unknown; errors?: unknown } | undefined;

  if (data) {
    const fieldErrors = data.errors;
    if (fieldErrors && typeof fieldErrors === "object" && !Array.isArray(fieldErrors)) {
      const parts: string[] = [];
      for (const [key, value] of Object.entries(fieldErrors as Record<string, unknown>)) {
        const text = Array.isArray(value) ? value.join(" ") : String(value);
        parts.push(`${key}: ${text}`);
      }
      if (parts.length) return parts.join(" · ");
    }
    if (typeof data.message === "string" && data.message) return data.message;
  }

  if (error instanceof Error) return error.message;
  return fallback;
}
