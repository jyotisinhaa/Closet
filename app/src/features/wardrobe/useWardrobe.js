import { useEffect, useState } from 'react'
import { apiGet, apiUpload, apiDelete } from '../../api/client'
import { getProfile } from '../../lib/session'
import { getCategoriesForGender } from '../../lib/categories'

// Wardrobe data + operations: load items, add (with photo upload), delete, and
// derive the filtered view and per-category counts.
export function useWardrobe() {
  const profile    = getProfile() || {}
  const categories = getCategoriesForGender(profile.gender)

  const [items,   setItems]   = useState([])
  const [loading, setLoading] = useState(true)
  const [filter,  setFilter]  = useState('All')

  useEffect(() => {
    apiGet('/wardrobe').then(setItems).catch(console.error)
      .finally(() => setLoading(false))
  }, [])

  async function addItem({ file, category, description }) {
    const fd = new FormData()
    fd.append('photo', file)
    fd.append('category', category)
    fd.append('description', description)
    const item = await apiUpload('/wardrobe', fd)
    setItems(prev => [item, ...prev])
    return item
  }

  async function deleteItem(id) {
    await apiDelete(`/wardrobe/${id}`)
    setItems(prev => prev.filter(i => i.id !== id))
  }

  const visible = filter === 'All' ? items : items.filter(i => i.category === filter)
  const counts  = items.reduce((acc, i) => { acc[i.category] = (acc[i.category] || 0) + 1; return acc }, {})

  return { items, loading, filter, setFilter, categories, visible, counts, addItem, deleteItem }
}
