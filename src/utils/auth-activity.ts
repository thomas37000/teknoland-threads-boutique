
const ACTIVITY_STORAGE_KEY = 'user_last_activity';
const INACTIVITY_TIMEOUT = 72 * 60 * 60 * 1000; // 72 hours in milliseconds

export const updateLastActivity = () => {
  const now = new Date().getTime();
  localStorage.setItem(ACTIVITY_STORAGE_KEY, now.toString());
};

export const getLastActivity = (): number | null => {
  const stored = localStorage.getItem(ACTIVITY_STORAGE_KEY);
  return stored ? parseInt(stored, 10) : null;
};

export const hasExceededInactivityTimeout = (): boolean => {
  const lastActivity = getLastActivity();
  if (!lastActivity) return false;
  
  const now = new Date().getTime();
  return (now - lastActivity) > INACTIVITY_TIMEOUT;
};

export const clearActivity = () => {
  localStorage.removeItem(ACTIVITY_STORAGE_KEY);
};

export const setupActivityTracking = () => {
  // Track user activity on various events
  const events = ['mousedown', 'keydown', 'scroll', 'touchstart', 'click'];
  
  const handleActivity = () => {
    updateLastActivity();
  };

  events.forEach(event => {
    document.addEventListener(event, handleActivity, true);
  });

  // Return cleanup function
  return () => {
    events.forEach(event => {
      document.removeEventListener(event, handleActivity, true);
    });
  };
};
