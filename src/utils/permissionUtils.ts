/**
 * Check if server modification is allowed based on environment variable
 * @returns Boolean indicating if server modification is allowed
 */
export const isServerModificationAllowed = (): boolean => {
  return process.env.SERVER_ALLOW_MODIFICATION?.toLowerCase() === 'true';
};