import { useEffect, useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { apiUpload } from '../../api/client'
import { getProfile, setLastResult } from '../../lib/session'
import { getCategoriesForGender } from '../../lib/categories'

const GENERATE_STATUSES = [
  'Uploading photo…',
  'Analysing your wardrobe…',
  'Rendering your look…',
  'Creating outfit pairings…',
  'Almost there…',
]

// Try-on logic: pick the category list for the user's profile, run the render
// request, rotate status messages while generating, then route to the result.
export function useTryOn() {
  const navigate = useNavigate()

  // Category list comes from the stored profile, available synchronously.
  const profileCats = getCategoriesForGender((getProfile() || {}).gender)
  const [categories]              = useState(profileCats)
  const [category,   setCategory] = useState(profileCats[0])
  const [generating, setGenerating] = useState(false)
  const [genStatus,  setGenStatus]  = useState('')
  const [genError,   setGenError]   = useState('')

  // Rotate the status messages while a render is in flight.
  useEffect(() => {
    if (!generating) return
    let i = 0
    const id = setInterval(() => {
      i = (i + 1) % GENERATE_STATUSES.length
      setGenStatus(GENERATE_STATUSES[i])
    }, 5000)
    return () => clearInterval(id)
  }, [generating])

  async function generate({ photo, price, store, color }) {
    if (!photo) return
    setGenerating(true)
    setGenStatus(GENERATE_STATUSES[0])
    setGenError('')
    try {
      const formData = new FormData()
      formData.append('photo', photo.file)
      formData.append('price', price)
      formData.append('category', category)
      formData.append('store', store)
      formData.append('color', color)

      const result = await apiUpload('/tryon', formData)
      setLastResult(result)
      navigate('/tryon/result', { state: { result, preview: photo.preview } })
    } catch (err) {
      setGenError(err.message)
    } finally {
      setGenerating(false)
      setGenStatus('')
    }
  }

  return { categories, category, setCategory, generating, genStatus, genError, generate }
}
