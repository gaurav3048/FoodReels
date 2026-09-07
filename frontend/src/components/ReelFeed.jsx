import React, { useEffect, useRef } from 'react'
import { Link } from 'react-router-dom'

// Reusable feed for vertical reels
// Props:
// - items: Array of video items { _id, video, description, likeCount, savesCount, foodPartner }
// - onLike: (item) => void | Promise<void>
// - onSave: (item) => void | Promise<void>
// - emptyMessage: string
const ReelFeed = ({
  items = [],
  onLike,
  onSave,
  selectedReelId = '',
  pendingAction = '',
  actionError = '',
  emptyMessage = 'No videos yet.',
  likedFoodIds = [],
  savedFoodIds = [],
}) => {
  const videoRefs = useRef(new Map())
  const scrolledReelId = useRef('')

  useEffect(() => {
    if (!selectedReelId) return
    if (scrolledReelId.current === selectedReelId) return

    const selectedVideo = videoRefs.current.get(selectedReelId)
    if (!selectedVideo) return

    selectedVideo.closest('.reel')?.scrollIntoView({ block: 'start' })
    scrolledReelId.current = selectedReelId
  }, [items, selectedReelId])

  useEffect(() => {
    const observer = new IntersectionObserver(
      (entries) => {
        entries.forEach((entry) => {
          const video = entry.target
          if (!(video instanceof HTMLVideoElement)) return
          if (entry.isIntersecting && entry.intersectionRatio >= 0.6) {
            video.play().catch(() => { /* ignore autoplay errors */ })
          } else {
            video.pause()
          }
        })
      },
      { threshold: [0, 0.25, 0.6, 0.9, 1] }
    )

    videoRefs.current.forEach((vid) => observer.observe(vid))
    return () => observer.disconnect()
  }, [items])

  const setVideoRef = (id) => (el) => {
    if (!el) { videoRefs.current.delete(id); return }
    videoRefs.current.set(id, el)
  }

  return (
    <div className="reels-page">
      <div className="reels-feed" role="list">
        {items.length === 0 && (
          <div className="empty-state">
            <p>{emptyMessage}</p>
          </div>
        )}

        {actionError && <p className="reel-action-error" role="alert">{actionError}</p>}

        {items.map((item) => {
          const isLiked = likedFoodIds.includes(item._id)
          const isSaved = savedFoodIds.includes(item._id)

          return (
          <section key={item._id} className="reel" role="listitem" aria-label={`${item.name || 'Food'} reel`}>
            <video
              ref={setVideoRef(item._id)}
              className="reel-video"
              src={item.video}
              muted
              playsInline
              loop
              preload="metadata"
            />

            <div className="reel-overlay">
              <div className="reel-overlay-gradient" aria-hidden="true" />
              <div className="reel-actions">
                <div className="reel-action-group">
                  <button
                    type="button"
                    onClick={onLike ? () => onLike(item) : undefined}
                    className={`reel-action${isLiked ? ' reel-action--liked' : ''}`}
                    aria-label={isLiked ? 'Unlike' : 'Like'}
                    aria-pressed={isLiked}
                    disabled={pendingAction === `like:${item._id}`}
                  >
                    <svg width="22" height="22" viewBox="0 0 24 24" fill={isLiked ? 'currentColor' : 'none'} stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                      <path d="M20.8 4.6a5.5 5.5 0 0 0-7.8 0L12 5.6l-1-1a5.5 5.5 0 0 0-7.8 7.8l1 1L12 22l7.8-8.6 1-1a5.5 5.5 0 0 0 0-7.8z" />
                    </svg>
                  </button>
                  <div className="reel-action__count">{item.likeCount ?? item.likesCount ?? item.likes ?? 0}</div>
                </div>

                <div className="reel-action-group">
                  <button
                    type="button"
                    className={`reel-action${isSaved ? ' reel-action--saved' : ''}`}
                    onClick={onSave ? () => onSave(item) : undefined}
                    aria-label={isSaved ? 'Remove bookmark' : 'Bookmark'}
                    aria-pressed={isSaved}
                    disabled={pendingAction === `save:${item._id}`}
                  >
                    <svg width="22" height="22" viewBox="0 0 24 24" fill={isSaved ? 'currentColor' : 'none'} stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                      <path d="M6 3h12a1 1 0 0 1 1 1v17l-7-4-7 4V4a1 1 0 0 1 1-1z" />
                    </svg>
                  </button>
                  <div className="reel-action__count">{item.savesCount ?? item.bookmarks ?? item.saves ?? 0}</div>
                </div>

              </div>

              <div className="reel-content">
                <span className="reel-category">Food reel</span>
                <h1 className="reel-title">{item.name || 'Untitled food'}</h1>
                {item.description && <p className="reel-description" title={item.description}>{item.description}</p>}
                {item.foodPartner && (() => {
                  const foodPartnerId = typeof item.foodPartner === 'object'
                    ? item.foodPartner._id
                    : item.foodPartner

                  return foodPartnerId ? (
                    <Link className="reel-btn" to={`/food-partner/${foodPartnerId}`} aria-label={`Visit the store for ${item.name || 'this food'}`}>
                      Visit store
                    </Link>
                  ) : null
                })()}
              </div>
            </div>
          </section>
          )
        })}
      </div>
    </div>
  )
}

export default ReelFeed
