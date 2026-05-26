import { useState } from 'react'
import { useLocation } from 'react-router-dom'
import { apiPost } from '../../api/client'
import { getLastResult } from '../../lib/session'

// Result-page logic: resolve the active result (from navigation state, falling
// back to the last persisted result) and handle saving it to the wishlist or
// adding it straight to the wardrobe (for pieces the user actually bought).
export function useTryOnResult() {
  const location = useLocation()
  const [saving,    setSaving]    = useState(false)
  const [adding,    setAdding]    = useState(false)
  const [addError,  setAddError]  = useState('')

  const result  = location.state?.result ?? getLastResult()
  const preview = location.state?.preview

  // Per-image sessionStorage keys so the button states survive a re-render
  // (e.g. when the result page is reached via a back-nav from styled view).
  const savedKey = result?.new_item_image_url ? `wl_saved_${result.new_item_image_url}` : null
  const addedKey = result?.new_item_image_url ? `wd_added_${result.new_item_image_url}` : null
  const [saved, setSaved] = useState(() => !!(savedKey && sessionStorage.getItem(savedKey)))
  const [added, setAdded] = useState(() => !!(addedKey && sessionStorage.getItem(addedKey)))

  async function saveToWishlist() {
    if (!result || saved) return
    const { new_item_image_url, category, price, store, solo_render_url, combinations, honest_assessment } = result
    setSaving(true)
    try {
      await apiPost('/wishlist', {
        new_item_image_url, category, price, store,
        solo_render_url, combinations, honest_assessment,
        description: category,
      })
      if (savedKey) sessionStorage.setItem(savedKey, '1')
      setSaved(true)
    } finally {
      setSaving(false)
    }
  }

  async function addToWardrobe() {
    if (!result || added) return
    const { new_item_image_url, category, detected_category, color, item_name } = result
    setAdding(true)
    setAddError('')
    try {
      // The wardrobe accepts a remote URL — Crusoe will classify the style in
      // the background via styleProfile.classifyAndRollup, so the user's style
      // profile updates without any extra work here.
      await apiPost('/wardrobe/from-url', {
        image_url: new_item_image_url,
        category: detected_category || category || 'Uncategorized',
        description: item_name || detected_category || category || '',
        color: color || '',
      })
      if (addedKey) sessionStorage.setItem(addedKey, '1')
      setAdded(true)
    } catch (err) {
      setAddError(err.message || 'Could not add to wardrobe.')
    } finally {
      setAdding(false)
    }
  }

  return {
    result, preview,
    saving, saved, saveToWishlist,
    adding, added, addError, addToWardrobe,
  }
}
