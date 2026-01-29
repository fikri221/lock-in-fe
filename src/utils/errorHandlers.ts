/**
 * Type guard to check if an error is an Axios error
 * @param error - The error object to check
 * @returns True if the error is an Axios error with a response property
 */
export function isAxiosError(
  error: unknown,
): error is { response?: { data?: { error?: string; message?: string } } } {
  return typeof error === "object" && error !== null && "response" in error;
}

/**
 * Extract error message from various error types
 * @param err - The error object
 * @param fallbackMessage - Default message if no specific error message is found
 * @returns The extracted error message
 */
export function getErrorMessage(
  err: unknown,
  fallbackMessage: string = "An error occurred",
): string {
  if (isAxiosError(err)) {
    return (
      err.response?.data?.error ||
      err.response?.data?.message ||
      fallbackMessage
    );
  } else if (err instanceof Error) {
    return err.message || fallbackMessage;
  }
  return fallbackMessage;
}
