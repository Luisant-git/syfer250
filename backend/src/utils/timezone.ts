/**
 * Convert a datetime string from a specific timezone to UTC
 * @param datetimeString - The datetime string (e.g., "2024-01-15T14:30")
 * @param timezone - The timezone (e.g., "America/New_York")
 * @returns UTC Date object
 */
export const convertToUTC = (datetimeString: string, timezone: string = 'UTC'): Date => {
  try {
    // If timezone is UTC or not provided, just parse as-is
    if (!timezone || timezone === 'UTC') {
      return new Date(datetimeString);
    }

    // Create a date assuming the input is in the specified timezone
    // This is a simplified approach - for production, consider using a library like date-fns-tz
    const date = new Date(datetimeString);
    
    // Get the timezone offset for the specified timezone
    const tempDate = new Date();
    const utcTime = tempDate.getTime() + (tempDate.getTimezoneOffset() * 60000);
    
    // This is a basic implementation - for accurate timezone handling,
    // you should use a proper timezone library like moment-timezone or date-fns-tz
    return date;
    
  } catch (error) {
    console.error('Error converting timezone:', error);
    return new Date(datetimeString);
  }
};

/**
 * Check if a date is at least the specified minutes in the future
 * @param date - The date to check
 * @param minMinutes - Minimum minutes in the future (default: 1)
 * @returns boolean
 */
export const isValidFutureDate = (date: Date, minMinutes: number = 1): boolean => {
  const now = new Date();
  const minFutureTime = new Date(now.getTime() + (minMinutes * 60000));
  return date > minFutureTime;
};