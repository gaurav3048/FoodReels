import { useEffect, useState } from 'react'
import axios from 'axios'
import { useSearchParams } from 'react-router-dom'
import '../../styles/reels.css'
import ReelFeed from '../../components/ReelFeed'

const API_BASE_URL = import.meta.env.VITE_API_URL || 'https://foodreels-a3rq.onrender.com'

const getCount = (value) => {
  const count = Number(value)
  return Number.isFinite(count) ? Math.max(0, count) : 0
}

const Home = () => {
  const [searchParams] = useSearchParams()
  const [videos, setVideos] = useState([])
  const [feedError, setFeedError] = useState('')
  const [actionError, setActionError] = useState('')
  const [pendingAction, setPendingAction] = useState('')
  const [likedFoodIds, setLikedFoodIds] = useState([])
  const [savedFoodIds, setSavedFoodIds] = useState([])

  useEffect(() => {
    const controller = new AbortController()

    async function loadFood() {
      try {
        setFeedError('')
        const response = await axios.get(`${API_BASE_URL}/api/food`, {
          withCredentials: true,
          signal: controller.signal,
        })
        setVideos(Array.isArray(response.data.foodItems) ? response.data.foodItems : [])
      } catch (error) {
        if (error.code !== 'ERR_CANCELED') {
          setFeedError(error.response?.status === 401
            ? 'Please sign in as a user to like and save food reels.'
            : 'Unable to load food reels. Please try again.')
        }
      }
    }

    loadFood()
    return () => controller.abort()
  }, [])

  const updateCount = (foodId, field, change) => {
    setVideos((currentVideos) => currentVideos.map((video) => (
      video._id === foodId
        ? { ...video, [field]: Math.max(0, getCount(video[field]) + change) }
        : video
    )))
  }

  const toggleFoodAction = async (item, action) => {
    const actionKey = `${action}:${item._id}`
    if (pendingAction) return

    setPendingAction(actionKey)
    setActionError('')

    try {
      const response = await axios.post(
        `${API_BASE_URL}/api/food/${action}`,
        { foodId: item._id },
        { withCredentials: true },
      )

      // The API returns 201 when it creates a like/save and 200 when it removes one.
      const countField = action === 'like' ? 'likeCount' : 'savesCount'
      updateCount(item._id, countField, response.status === 201 ? 1 : -1)

      const setActiveIds = action === 'like' ? setLikedFoodIds : setSavedFoodIds
      setActiveIds((currentIds) => (
        response.status === 201
          ? [...new Set([...currentIds, item._id])]
          : currentIds.filter((foodId) => foodId !== item._id)
      ))
    } catch (error) {
      const needsUserSession = error.response?.status === 401 || error.response?.status === 500
      setActionError(needsUserSession
        ? 'Please sign in as a user before liking or saving a reel.'
        : `Unable to ${action} this reel. Please try again.`)
    } finally {
      setPendingAction('')
    }
  }

  return (
    <ReelFeed
      items={videos}
      onLike={(item) => toggleFoodAction(item, 'like')}
      onSave={(item) => toggleFoodAction(item, 'save')}
      selectedReelId={searchParams.get('reel') || ''}
      pendingAction={pendingAction}
      actionError={actionError}
      likedFoodIds={likedFoodIds}
      savedFoodIds={savedFoodIds}
      emptyMessage={feedError || 'No videos available.'}
    />
  )
}

export default Home
