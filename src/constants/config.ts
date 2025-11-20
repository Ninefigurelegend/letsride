/**
 * App configuration constants
 */

export const APP_CONFIG = {
  // App Info
  APP_NAME: 'LetsRide',
  APP_VERSION: '1.0.0',
  
  // Pagination
  EVENTS_PER_PAGE: 20,
  MESSAGES_PER_PAGE: 50,
  FRIENDS_PER_PAGE: 30,
  
  // Limits
  MAX_MESSAGE_LENGTH: 2000,
  MAX_BIO_LENGTH: 200,
  MAX_EVENT_DESCRIPTION_LENGTH: 1000,
  MAX_HANDLE_LENGTH: 20,
  MAX_NAME_LENGTH: 50,
  
  // Media
  MAX_IMAGE_SIZE_MB: 10,
  MAX_VIDEO_SIZE_MB: 100,
  
  // Timeouts
  TYPING_INDICATOR_TIMEOUT: 3000, // 3 seconds
  PRESENCE_UPDATE_INTERVAL: 60000, // 1 minute
  
  // Cache
  CACHE_EXPIRY_HOURS: 24,
} as const;

