import { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { supabase } from '../supabaseClient'

function generateCode() {
  const chars = 'ABCDEFGHJKLMNPQRSTUVWXYZ23456789'
  let code = ''
  for (let i = 0; i < 6; i++) code += chars[Math.floor(Math.random() * chars.length)]
  return code
}

export default function Home() {
  const [name, setName] = useState('')
  const [loading, setLoading] = useState(false)
  const navigate = useNavigate()

  async function handleCreate(e) {
    e.preventDefault()
    if (!name.trim()) return

    setLoading(true)
    const code = generateCode()

    const { error } = await supabase
      .from('rooms')
      .insert({ code, name: name.trim() })

    if (error) {
      console.error('Failed to create room:', error)
      setLoading(false)
      return
    }

    navigate(`/rom/${code}`)
  }

  return (
    <div className="home">
      <div className="home-content">
        <div className="home-hero">
          <div className="popcorn-icon">🍿</div>
          <h1 className="home-title">Filmkveld</h1>
          <p className="home-subtitle">Stem på film og middag med vennegjengen!</p>
        </div>

        <form className="home-form" onSubmit={handleCreate}>
          <label htmlFor="room-name">Gi kvelden et navn</label>
          <input
            id="room-name"
            type="text"
            placeholder="F.eks. Fredag hos Ole..."
            value={name}
            onChange={(e) => setName(e.target.value)}
            maxLength={60}
            autoFocus
          />
          <button type="submit" disabled={loading || !name.trim()}>
            {loading ? 'Lager rom...' : '🎬 Start filmkveld!'}
          </button>
        </form>

        <div className="home-footer">
          <div className="film-strip">
            <span>🎥</span><span>🎞️</span><span>🍕</span><span>🎬</span><span>🍿</span>
          </div>
        </div>
      </div>
    </div>
  )
}
