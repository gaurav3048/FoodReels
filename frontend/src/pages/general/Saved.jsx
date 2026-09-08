import { useEffect, useState } from 'react'
import axios from 'axios'
import '../../styles/reels.css'
import ReelFeed from '../../components/ReelFeed'

const API_BASE_URL = import.meta.env.VITE_API_URL || 'https://foodreels-a3rq.onrender.com'

const Saved = () => {
  const [videos, setVideos] = useState([])
  const [emptyMessage, setEmptyMessage] = useState('Loading saved videos...')
  const [actionError, setActionError] = useState('')
  const [pendingAction, setPendingAction] = useState('')

  useEffect(() => {
    const controller = new AbortController()

    async function loadSavedFood() {
      try {
        const response = await axios.get(`${API_BASE_URL}/api/food/save`, {
          withCredentials: true,
          signal: controller.signal,
        })
        const savedFoods = Array.isArray(response.data.savedFoods) ? response.data.savedFoods : []
        setVideos(savedFoods.map((savedFood) => savedFood.food).filter(Boolean))
        setEmptyMessage('No saved videos yet.')
      } catch (error) {
        if (error.code !== 'ERR_CANCELED') {
          setVideos([])
          setEmptyMessage(error.response?.status === 404
            ? 'No saved videos yet.'
            : 'Unable to load saved videos. Please try again.')
        }
      }
    }

    loadSavedFood()
    return () => controller.abort()
  }, [])

  const removeSaved = async (item) => {
    const actionKey = `save:${item._id}`
    if (pendingAction) return

    setPendingAction(actionKey)
    setActionError('')

    try {
      const response = await axios.post(
        `${API_BASE_URL}/api/food/save`,
        { foodId: item._id },
        { withCredentials: true },
      )

      // A saved reel is removed by the API with a 200 response.
      if (response.status === 200) {
        setVideos((currentVideos) => currentVideos.filter((video) => video._id !== item._id))
        setEmptyMessage('No saved videos yet.')
      }
    } catch (error) {
      setActionError(error.response?.status === 401
        ? 'Please sign in as a user before changing saved reels.'
        : 'Unable to update this saved reel. Please try again.')
    } finally {
      setPendingAction('')
    }
  }

  return (
    <ReelFeed
      items={videos}
      onSave={removeSaved}
      pendingAction={pendingAction}
      actionError={actionError}
      savedFoodIds={videos.map((video) => video._id)}
      emptyMessage={emptyMessage}
    />
  )
}

export default Saved
