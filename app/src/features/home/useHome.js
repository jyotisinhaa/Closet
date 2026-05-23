import { useEffect, useState } from 'react'
import { apiGet } from '../../api/client'
import { getProfile } from '../../lib/session'

// Home dashboard data: the stored profile and the live wardrobe item count.
export function useHome() {
  const [profile]                 = useState(getProfile)
  const [itemCount, setItemCount] = useState(null)

  useEffect(() => {
    apiGet('/wardrobe').then(d => setItemCount(d.length)).catch(() => {})
  }, [])

  return { profile, itemCount }
}
