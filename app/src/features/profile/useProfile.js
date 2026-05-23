import { useEffect, useState } from 'react'
import { apiGet } from '../../api/client'
import { getProfile } from '../../lib/session'

// Profile data: the locally-stored style profile plus the live wardrobe count.
export function useProfile() {
  const [profile]                         = useState(getProfile)
  const [wardrobeCount, setWardrobeCount] = useState(null)

  useEffect(() => {
    apiGet('/wardrobe').then(items => setWardrobeCount(items.length)).catch(() => {})
  }, [])

  return { profile, wardrobeCount }
}
