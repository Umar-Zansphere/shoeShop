/**
 * Session Manager for Guest User Support
 * Handles session ID generation, storage, and management
 */

const SESSION_KEY = 'guest_session_id';

/**
 * Generate a random session ID
 * @returns {string} Session ID
 */
function generateSessionId() {
    return `sess_${Date.now()}_${Math.random().toString(36).substring(2, 15)}`;
}

/**
 * Get existing session ID or create a new one
 * @returns {string} Session ID
 */
export function getSessionId() {
    if (typeof window === 'undefined') return null;

    let sessionId = localStorage.getItem(SESSION_KEY);

    if (!sessionId) {
        sessionId = generateSessionId();
        localStorage.setItem(SESSION_KEY, sessionId);
    }

    return sessionId;
}

/**
 * Set a new session ID
 * @param {string} sessionId - Session ID to set
 */
export function setSessionId(sessionId) {
    if (typeof window === 'undefined') return;
    localStorage.setItem(SESSION_KEY, sessionId);
}

/**
 * Clear the current session
 */
export function clearSession() {
    if (typeof window === 'undefined') return;
    localStorage.removeItem(SESSION_KEY);
}

/**
 * Migrate session data to user account (called after login)
 * @param {string} userId - User ID to migrate to
 * @returns {Promise<Object>} Migration result
 */
export async function migrateSession(userId) {
    const sessionId = getSessionId();

    if (!sessionId) {
        return { success: false, message: 'No session to migrate' };
    }

    try {
        const response = await fetch('/api/session/migrate', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
                'x-session-id': sessionId,
            },
            body: JSON.stringify({ userId }),
        });

        const data = await response.json();

        if (data.success) {
            // Clear session after successful migration
            clearSession();
        }

        return data;
    } catch (error) {
        console.error('Session migration error:', error);
        return { success: false, message: 'Failed to migrate session' };
    }
}

/**
 * Initialize session on app load
 */
export function initializeSession() {
    return getSessionId();
}
