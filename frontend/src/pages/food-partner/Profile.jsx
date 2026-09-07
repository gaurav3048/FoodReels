import { useEffect, useState } from 'react'
import { Link, useParams } from 'react-router-dom'
import axios from 'axios'
import { getFoodPartnerId } from '../../utils/partnerSession'
import '../../styles/profile.css'

const API_BASE_URL = import.meta.env.VITE_API_URL || 'http://localhost:3000'

const Profile = () => {
  const { id } = useParams()
  const [profile, setProfile] = useState(null)
  const [foodItems, setFoodItems] = useState([])
  const [error, setError] = useState('')
  const [actionError, setActionError] = useState('')
  const [pendingAction, setPendingAction] = useState('')
  const [editingFood, setEditingFood] = useState(null)
  const [draftName, setDraftName] = useState('')
  const [draftDescription, setDraftDescription] = useState('')
  const [foodToDelete, setFoodToDelete] = useState(null)

  const isOwner = Boolean(id && getFoodPartnerId() === id)

  useEffect(() => {
    if (!id) return undefined

    const controller = new AbortController()

    async function loadFoodPartner() {
      try {
        setError('')
        const response = await axios.get(`${API_BASE_URL}/api/food-partner/${id}`, {
          withCredentials: true,
          signal: controller.signal,
        })
        const foodPartner = response.data.foodPartner

        setProfile(foodPartner)
        setFoodItems(Array.isArray(foodPartner?.foodItems) ? foodPartner.foodItems : [])
      } catch (requestError) {
        if (requestError.code !== 'ERR_CANCELED') {
          const needsSession = requestError.response?.status === 401
          setError(needsSession
            ? 'Please sign in to view this food partner’s store.'
            : 'Unable to load this food partner right now.')
        }
      }
    }

    loadFoodPartner()
    return () => controller.abort()
  }, [id])

  const openEditor = (foodItem) => {
    setActionError('')
    setDraftName(foodItem.name || '')
    setDraftDescription(foodItem.description || '')
    setEditingFood(foodItem)
  }

  const saveFoodDetails = async (event) => {
    event.preventDefault()

    const name = draftName.trim()
    if (!name || !editingFood || pendingAction) return

    const actionKey = `edit:${editingFood._id}`
    setPendingAction(actionKey)
    setActionError('')

    try {
      const response = await axios.patch(
        `${API_BASE_URL}/api/food/${editingFood._id}`,
        { name, description: draftDescription.trim() },
        { withCredentials: true },
      )
      const updatedFood = response.data?.food

      setFoodItems((currentItems) => currentItems.map((foodItem) => (
        foodItem._id === editingFood._id
          ? { ...foodItem, ...updatedFood, name, description: draftDescription.trim() }
          : foodItem
      )))
      setEditingFood(null)
    } catch (requestError) {
      setActionError(requestError.response?.status === 401 || requestError.response?.status === 403
        ? 'Only the food partner who posted this reel can edit it.'
        : 'Unable to update this food reel. Please try again.')
    } finally {
      setPendingAction('')
    }
  }

  const deleteFood = async () => {
    if (!foodToDelete || pendingAction) return

    const actionKey = `delete:${foodToDelete._id}`
    setPendingAction(actionKey)
    setActionError('')

    try {
      await axios.delete(`${API_BASE_URL}/api/food/${foodToDelete._id}`, {
        withCredentials: true,
      })
      setFoodItems((currentItems) => currentItems.filter((foodItem) => foodItem._id !== foodToDelete._id))
      setFoodToDelete(null)
    } catch (requestError) {
      setActionError(requestError.response?.status === 401 || requestError.response?.status === 403
        ? 'Only the food partner who posted this reel can delete it.'
        : 'Unable to delete this food reel. Please try again.')
    } finally {
      setPendingAction('')
    }
  }

  if (error) return <main className="profile-state" role="alert">{error}</main>
  if (!profile) return <main className="profile-state">Loading food partner...</main>

  const storeName = profile.name || 'Food partner'
  const editingAction = editingFood ? `edit:${editingFood._id}` : ''
  const deletingAction = foodToDelete ? `delete:${foodToDelete._id}` : ''

  return (
    <main className={`profile-page${isOwner ? ' profile-page--owner' : ''}`}>
      <Link className="profile-home-link" to="/"><span aria-hidden="true">F</span> FoodReels</Link>
      <section className="profile-hero" aria-labelledby="store-name">
        <div className="profile-hero-main">
          <div className="profile-avatar" aria-hidden="true">{storeName.charAt(0).toUpperCase()}</div>
          <div className="profile-info">
            <p className="profile-eyebrow">{isOwner ? 'Partner dashboard' : 'Food partner'}</p>
            <h1 className="profile-business" id="store-name">{storeName}</h1>
            {profile.address && <p className="profile-address">{profile.address}</p>}
          </div>
        </div>

        <div className="profile-hero-side">
          <div className="profile-stat" aria-label={`${foodItems.length} food reels`}>
            <span className="profile-stat-value">{foodItems.length}</span>
            <span className="profile-stat-label">published reels</span>
          </div>
          {isOwner && (
            <Link className="profile-add-food" to="/create-food">
              <span aria-hidden="true">+</span> Add food reel
            </Link>
          )}
        </div>
      </section>

      <section className="profile-menu" aria-labelledby="uploaded-reels-title">
        <div className="profile-menu-heading">
          <div>
            <p className="profile-section-kicker">{isOwner ? 'Manage your menu' : 'Featured menu'}</p>
            <h2 id="uploaded-reels-title">Food reels</h2>
          </div>
          <span className="profile-item-count">{foodItems.length} item{foodItems.length === 1 ? '' : 's'}</span>
        </div>

        {actionError && <p className="profile-action-error" role="alert">{actionError}</p>}

        {foodItems.length ? (
          <div className="profile-grid">
            {foodItems.map((foodItem, index) => (
              <article className="profile-grid-item" key={foodItem._id}>
                <div className="profile-video-wrap">
                  <video
                    className="profile-grid-video"
                    src={foodItem.video}
                    muted
                    loop
                    playsInline
                    preload="metadata"
                    aria-label={foodItem.name ? `Video of ${foodItem.name}` : 'Food reel'}
                  />
                  <span className="profile-dish-number">{String(index + 1).padStart(2, '0')}</span>
                </div>
                <div className="profile-food-info">
                  <h3>{foodItem.name || 'Untitled food'}</h3>
                  <p>{foodItem.description || 'No description added yet.'}</p>
                  <div className="profile-card-footer">
                    <Link
                      className="profile-reel-link"
                      to={`/explore?reel=${encodeURIComponent(foodItem._id)}`}
                      aria-label={`Open ${foodItem.name || 'this food'} in reels`}
                    >
                      Watch reel <span aria-hidden="true">↗</span>
                    </Link>
                    {isOwner && (
                      <div className="profile-manage-actions" aria-label={`Manage ${foodItem.name || 'food reel'}`}>
                        <button className="profile-icon-button" type="button" onClick={() => openEditor(foodItem)} aria-label={`Edit ${foodItem.name || 'food reel'}`}>
                          <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
                            <path d="M12 20h9" /><path d="M16.5 3.5a2.12 2.12 0 0 1 3 3L7 19l-4 1 1-4Z" />
                          </svg>
                        </button>
                        <button className="profile-icon-button profile-icon-button--danger" type="button" onClick={() => setFoodToDelete(foodItem)} aria-label={`Delete ${foodItem.name || 'food reel'}`}>
                          <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
                            <path d="M3 6h18" /><path d="M8 6V4h8v2" /><path d="M19 6l-1 14H6L5 6" /><path d="M10 11v4" /><path d="M14 11v4" />
                          </svg>
                        </button>
                      </div>
                    )}
                  </div>
                </div>
              </article>
            ))}
          </div>
        ) : (
          <div className="profile-empty">
            <span aria-hidden="true">✦</span>
            <div>
              <h3>No food reels yet</h3>
              <p>{isOwner ? 'Start your menu with a dish customers can discover.' : 'This food partner has not uploaded any food reels yet.'}</p>
            </div>
            {isOwner && <Link className="profile-empty-link" to="/create-food">Add your first reel</Link>}
          </div>
        )}
      </section>

      {editingFood && (
        <div className="profile-modal-backdrop" role="presentation">
          <section className="profile-modal" role="dialog" aria-modal="true" aria-labelledby="edit-food-title">
            <div className="profile-modal-heading">
              <div>
                <p className="profile-section-kicker">Edit food reel</p>
                <h2 id="edit-food-title">Fine-tune the details</h2>
              </div>
              <button className="profile-close-button" type="button" onClick={() => setEditingFood(null)} aria-label="Close edit form">×</button>
            </div>
            <form className="profile-edit-form" onSubmit={saveFoodDetails}>
              <label htmlFor="edit-food-name">Food name</label>
              <input id="edit-food-name" value={draftName} onChange={(event) => setDraftName(event.target.value)} required />
              <label htmlFor="edit-food-description">Description</label>
              <textarea id="edit-food-description" rows="5" value={draftDescription} onChange={(event) => setDraftDescription(event.target.value)} placeholder="Tell customers what makes it special" />
              <div className="profile-modal-actions">
                <button className="profile-secondary-button" type="button" onClick={() => setEditingFood(null)}>Cancel</button>
                <button className="profile-primary-button" type="submit" disabled={pendingAction === editingAction || !draftName.trim()}>
                  {pendingAction === editingAction ? 'Saving...' : 'Save changes'}
                </button>
              </div>
            </form>
          </section>
        </div>
      )}

      {foodToDelete && (
        <div className="profile-modal-backdrop" role="presentation">
          <section className="profile-modal profile-confirm-modal" role="dialog" aria-modal="true" aria-labelledby="delete-food-title">
            <p className="profile-section-kicker">Delete food reel</p>
            <h2 id="delete-food-title">Remove “{foodToDelete.name || 'this food reel'}”?</h2>
            <p>This will permanently remove the reel and its saved and liked records.</p>
            <div className="profile-modal-actions">
              <button className="profile-secondary-button" type="button" onClick={() => setFoodToDelete(null)}>Keep reel</button>
              <button className="profile-danger-button" type="button" onClick={deleteFood} disabled={pendingAction === deletingAction}>
                {pendingAction === deletingAction ? 'Deleting...' : 'Delete reel'}
              </button>
            </div>
          </section>
        </div>
      )}
    </main>
  )
}

export default Profile
