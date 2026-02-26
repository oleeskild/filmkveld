import { useState, useEffect } from 'react'
import { useNavigate, Link } from 'react-router-dom'
import { supabase } from '../supabaseClient'

function generateCode() {
  const chars = 'ABCDEFGHJKLMNPQRSTUVWXYZ23456789'
  let code = ''
  for (let i = 0; i < 6; i++) code += chars[Math.floor(Math.random() * chars.length)]
  return code
}

function getRecentCodes() {
  const codes = []
  for (let i = 0; i < localStorage.length; i++) {
    const key = localStorage.key(i)
    if (key.startsWith('filmkveld-nick-')) {
      codes.push(key.replace('filmkveld-nick-', ''))
    }
  }
  return codes
}

export default function Home() {
  const [name, setName] = useState('')
  const [loading, setLoading] = useState(false)
  const [recentRooms, setRecentRooms] = useState([])
  const navigate = useNavigate()

  useEffect(() => {
    const codes = getRecentCodes()
    if (codes.length === 0) return

    supabase
      .from('rooms')
      .select('code, name, created_at')
      .in('code', codes)
      .order('created_at', { ascending: false })
      .then(({ data }) => {
        if (data) setRecentRooms(data)
      })
  }, [])

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

        {recentRooms.length > 0 && (
          <div className="recent-rooms">
            <h3>Nylige rom</h3>
            <ul className="recent-rooms-list">
              {recentRooms.map((room) => (
                <li key={room.code}>
                  <Link to={`/rom/${room.code}`} className="recent-room-link">
                    <span className="recent-room-name">{room.name}</span>
                    <span className="recent-room-code">{room.code}</span>
                  </Link>
                </li>
              ))}
            </ul>
          </div>
        )}

        <div className="home-footer">
          <div className="film-strip">
            <span>🎥</span><span>🎞️</span><span>🍕</span><span>🎬</span><span>🍿</span>
          </div>
        </div>
      </div>
    </div>
  )
}
