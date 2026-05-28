import { useEffect, useState } from 'react'
import { apiGet } from '../../api/client'
import { getProfile, setProfile } from '../../lib/session'

// Profile data: the locally-stored style profile merged with the live values
// from the server. The server contributes `style_prefs` / `style_profile`,
// which are derived from the wardrobe by the Crusoe classifier in
// services/styleProfile.js, plus the wardrobe count.
export function useProfile() {
  const [profile,       setLocalProfile] = useState(getProfile)
  const [wardrobeCount, setWardrobeCount] = useState(null)

  useEffect(() => {
    apiGet('/wardrobe').then(items => setWardrobeCount(items.length)).catch(() => {})

    // Merge server-derived style data into the profile so the UI shows what the
    // wardrobe actually says — not just what the user picked at onboarding.
    apiGet('/profile')
      .then(data => {
        if (!data) return
        const serverPrefs = Array.isArray(data.style_prefs) ? data.style_prefs : []
        const merged = {
          ...(getProfile() || {}),
          ...(data.name       ? { name: data.name }               : {}),
          ...(data.gender     ? { gender: data.gender }           : {}),
          ...(data.body_type  ? { bodyType: data.body_type }      : {}),
          stylePrefs: serverPrefs.length > 0 ? serverPrefs : (getProfile()?.stylePrefs || []),
          styleProfile: data.style_profile || {},
        }
        setProfile(merged)
        setLocalProfile(merged)
      })
      .catch(() => {})
  }, [])

  return { profile, wardrobeCount }
}
