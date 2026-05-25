// Single source of truth for browser-persisted session state. Wraps the four
// closet_* localStorage keys so nothing else touches localStorage directly.
const TOKEN       = 'closet_token'
const USER        = 'closet_user'
const PROFILE     = 'closet_profile'
const LAST_RESULT = 'closet_last_result'

function readJSON(key) {
  try { return JSON.parse(localStorage.getItem(key) || 'null') } catch { return null }
}

// Token is stored as a raw string, the rest as JSON.
export const getToken   = () => localStorage.getItem(TOKEN)
export const setToken   = (t) => localStorage.setItem(TOKEN, t)
export const clearToken = () => localStorage.removeItem(TOKEN)

export const getUser = () => readJSON(USER)
export const setUser = (u) => localStorage.setItem(USER, JSON.stringify(u))

export const getProfile   = () => readJSON(PROFILE)
export const setProfile   = (p) => localStorage.setItem(PROFILE, JSON.stringify(p))
export const clearProfile = () => localStorage.removeItem(PROFILE)

export const getLastResult = () => readJSON(LAST_RESULT)
export const setLastResult = (r) => localStorage.setItem(LAST_RESULT, JSON.stringify(r))

export const clearAll = () => [TOKEN, USER, PROFILE, LAST_RESULT].forEach(k => localStorage.removeItem(k))
