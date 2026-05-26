import { useEffect, useState } from 'react'
import { apiGet } from '../../api/client'
import { getProfile } from '../../lib/session'

// Home dashboard data: the stored profile, live wardrobe item count, and total closet value.
export function useHome() {
  const [profile]                       = useState(getProfile)
  const [itemCount, setItemCount]       = useState(null)
  const [closetValue, setClosetValue]   = useState(null)

  useEffect(() => {
    apiGet('/wardrobe').then(items => {
      setItemCount(items.length)
      const total = items.reduce((s, i) => s + (parseFloat(i.price) || 0), 0)
      if (total > 0) setClosetValue(total)
    }).catch(() => {})
  }, [])

  return { profile, itemCount, closetValue }
}
