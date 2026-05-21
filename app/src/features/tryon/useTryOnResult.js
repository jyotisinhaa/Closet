import { useState } from 'react'
import { useLocation } from 'react-router-dom'
import { apiPost } from '../../api/client'
import { getLastResult } from '../../lib/session'

// Result-page logic: resolve the active result (from navigation state, falling
// back to the last persisted result) and handle saving it to the wishlist.
export function useTryOnResult() {
  const location = useLocation()
  const [saving, setSaving] = useState(false)
  const [saved,  setSaved]  = useState(false)

  const result  = location.state?.result ?? getLastResult()
  const preview = location.state?.preview

  async function saveToWishlist() {
    if (!result) return
    const { new_item_image_url, category, price, store, solo_render_url, combinations, honest_assessment } = result
    setSaving(true)
    try {
      await apiPost('/wishlist', {
        new_item_image_url, category, price, store,
        solo_render_url, combinations, honest_assessment,
        description: category,
      })
      setSaved(true)
    } finally {
      setSaving(false)
    }
  }

  return { result, preview, saving, saved, saveToWishlist }
}
