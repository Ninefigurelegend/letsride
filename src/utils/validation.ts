/**
 * Validate handle format
 * Rules:
 * - Must be 3-15 characters
 * - Lowercase alphanumeric and underscores only
 * - Must start with a letter
 * - Cannot end with underscore
 */
export function validateHandleFormat(handle: string): {
  isValid: boolean;
  error?: string;
} {
  if (!handle || handle.length === 0) {
    return { isValid: false, error: 'Handle is required' };
  }

  if (handle.length < 3) {
    return { isValid: false, error: 'Handle must be at least 3 characters' };
  }

  if (handle.length > 15) {
    return { isValid: false, error: 'Handle must be 15 characters or less' };
  }

  if (!/^[a-z]/.test(handle)) {
    return { isValid: false, error: 'Handle must start with a letter' };
  }

  if (!/^[a-z][a-z0-9_]*$/.test(handle)) {
    return {
      isValid: false,
      error: 'Handle can only contain lowercase letters, numbers, and underscores',
    };
  }

  if (handle.endsWith('_')) {
    return { isValid: false, error: 'Handle cannot end with an underscore' };
  }

  // Check for consecutive underscores
  if (/__/.test(handle)) {
    return { isValid: false, error: 'Handle cannot have consecutive underscores' };
  }

  return { isValid: true };
}

/**
 * Sanitize handle input by removing invalid characters
 */
export function sanitizeHandle(input: string): string {
  return input
    .toLowerCase()
    .replace(/[^a-z0-9_]/g, '') // Remove invalid characters
    .replace(/__+/g, '_') // Replace multiple underscores with single
    .substring(0, 15); // Enforce max length
}

/**
 * Generate handle suggestions from a name
 */
export function generateHandleSuggestions(name: string): string[] {
  const base = name
    .toLowerCase()
    .replace(/\s+/g, '')
    .replace(/[^a-z0-9]/g, '')
    .substring(0, 12);

  if (!base || !/^[a-z]/.test(base)) {
    return ['rider123', 'biker456', 'moto789'];
  }

  const suggestions: string[] = [base];

  // Add variations with numbers
  suggestions.push(`${base}${Math.floor(Math.random() * 100)}`);
  suggestions.push(`${base}${Math.floor(Math.random() * 1000)}`);

  // Add variations with common suffixes
  if (base.length <= 11) {
    suggestions.push(`${base}_moto`);
    suggestions.push(`${base}_ride`);
  }

  return suggestions.slice(0, 5);
}

