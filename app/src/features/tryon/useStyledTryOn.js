import { useEffect, useState } from 'react'
import { useLocation } from 'react-router-dom'
import { apiGet, apiPost } from '../../api/client'
import { getLastResult, getProfile } from '../../lib/session'
import { getCategoriesForGender } from '../../lib/categories'

const MAX_ITEMS = 3

// "Build your own look" logic: resolve the active try-on result, load the
// wardrobe, track the user's selection, and render the new item chained with
// the chosen wardrobe pieces via /api/tryon/combine.
export function useStyledTryOn() {
  const location = useLocation()
  const result = location.state?.result ?? getLastResult()

  // Scarves can't be paired in a composite — the clothes layer regenerates the
  // torso and erases them — so they're excluded from the picker here.
  const categories = getCategoriesForGender((getProfile() || {}).gender).filter(c => c !== 'Scarf')

  const [wardrobe,    setWardrobe]    = useState([])
  const [filter,      setFilter]      = useState('All')
  const [selectedIds, setSelectedIds] = useState([])
  const [rendering,   setRendering]   = useState(false)
  const [manualRender, setManualRender] = useState(null)
  const [manualError,  setManualError]  = useState('')

  useEffect(() => {
    apiGet('/wardrobe').then(setWardrobe).catch(() => {})
  }, [])

  function toggleItem(id) {
    setManualError('')
    setSelectedIds(prev => {
      if (prev.includes(id)) return prev.filter(x => x !== id)
      if (prev.length >= MAX_ITEMS) return prev
      return [...prev, id]
    })
  }

  async function combine() {
    if (!result || selectedIds.length === 0) return
    setRendering(true)
    setManualError('')
    setManualRender(null)
    try {
      const data = await apiPost('/tryon/combine', {
        new_item_image_url: result.new_item_image_url,
        garment_category: result.detected_category || result.category,
        wardrobe_item_ids: selectedIds,
        gender: (getProfile() || {}).gender || '',
      })
      setManualRender(data)
    } catch (err) {
      setManualError(err.message || 'Render failed. Please try again.')
    } finally {
      setRendering(false)
    }
  }

  const selectable = wardrobe.filter(i => i.category !== 'Scarf')
  const visible = filter === 'All' ? selectable : selectable.filter(i => i.category === filter)
  const atMax = selectedIds.length >= MAX_ITEMS

  return {
    result, categories, filter, setFilter, visible,
    selectedIds, toggleItem, atMax, maxItems: MAX_ITEMS,
    rendering, manualRender, manualError, combine,
  }
}
