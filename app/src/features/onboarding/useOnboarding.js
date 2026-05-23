import { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { apiUpload } from '../../api/client'
import { getProfile, setProfile, clearProfile } from '../../lib/session'

// Downscale large images client-side before upload to keep payloads small.
function compressPhoto(file) {
  return new Promise((resolve) => {
    const reader = new FileReader()
    reader.onload = (e) => {
      const img = new Image()
      img.onload = () => {
        const MAX = 1600
        let { width, height } = img
        if (width > MAX || height > MAX) {
          if (width > height) { height = Math.round(height * MAX / width); width = MAX }
          else { width = Math.round(width * MAX / height); height = MAX }
        }
        const canvas = document.createElement('canvas')
        canvas.width = width; canvas.height = height
        canvas.getContext('2d').drawImage(img, 0, 0, width, height)
        canvas.toBlob((blob) => resolve(new File([blob], 'photo.jpg', { type: 'image/jpeg' })), 'image/jpeg', 0.85)
      }
      img.src = e.target.result
    }
    reader.readAsDataURL(file)
  })
}

// Onboarding logic: validate selections, compress + upload the profile photo,
// persist the profile, and route into the wardrobe.
export function useOnboarding() {
  const navigate = useNavigate()
  const savedProfile = getProfile() || {}
  const isComplete   = !!(savedProfile.gender && savedProfile.bodyType && savedProfile.profilePhotoUrl)

  const [uploading, setUploading] = useState(false)
  const [error,     setError]     = useState('')

  async function submit({ photo, gender, bodyType }) {
    if (!photo)    { setError('Please add a photo to continue.'); return }
    if (!gender)   { setError('Please select your gender.'); return }
    if (!bodyType) { setError('Please select your body type.'); return }

    setUploading(true); setError('')
    try {
      const compressed = await compressPhoto(photo.file)
      const fd = new FormData()
      fd.append('photo', compressed)
      const json = await apiUpload('/profile/photo', fd)
      setProfile({ gender, bodyType, profilePhotoUrl: json.profile_photo_url })
      navigate('/wardrobe')
    } catch (err) {
      setError(err.message || 'Upload failed. Please try again.')
    } finally {
      setUploading(false)
    }
  }

  function resetProfile() {
    clearProfile()
    window.location.reload()
  }

  return { savedProfile, isComplete, uploading, error, setError, submit, resetProfile }
}
