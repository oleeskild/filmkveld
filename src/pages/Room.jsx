import { useState, useEffect, useCallback } from 'react'
import { useParams } from 'react-router-dom'
import { supabase } from '../supabaseClient'
import NicknameModal from '../components/NicknameModal'
import CategorySection from '../components/CategorySection'
import PopcornPoll from '../components/PopcornPoll'

export default function Room() {
  const { code } = useParams()
  const [room, setRoom] = useState(null)
  const [suggestions, setSuggestions] = useState([])
  const [votes, setVotes] = useState([])
  const [popcornVotes, setPopcornVotes] = useState([])
  const [nickname, setNickname] = useState(() =>
    localStorage.getItem(`filmkveld-nick-${code}`)
  )
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState(null)
  const [copied, setCopied] = useState(false)

  const fetchRoom = useCallback(async () => {
    const { data, error } = await supabase
      .from('rooms')
      .select('*')
      .eq('code', code)
      .single()

    if (error || !data) {
      setError('Fant ikke rommet. Sjekk at lenken er riktig!')
      setLoading(false)
      return
    }
    setRoom(data)
    setLoading(false)
  }, [code])

  const fetchSuggestions = useCallback(async () => {
    if (!room) return
    const { data } = await supabase
      .from('suggestions')
      .select('*')
      .eq('room_id', room.id)
      .order('created_at', { ascending: true })
    if (data) setSuggestions(data)
  }, [room])

  const fetchVotes = useCallback(async () => {
    if (!room) return
    const { data } = await supabase
      .from('votes')
      .select('*')
      .eq('room_id', room.id)
    if (data) setVotes(data)
  }, [room])

  const fetchPopcornVotes = useCallback(async () => {
    if (!room) return
    const { data } = await supabase
      .from('popcorn_votes')
      .select('*')
      .eq('room_id', room.id)
    if (data) setPopcornVotes(data)
  }, [room])

  useEffect(() => {
    fetchRoom()
  }, [fetchRoom])

  useEffect(() => {
    if (!room) return
    document.title = `${room.name} – Filmkveld`
    fetchSuggestions()
    fetchVotes()
    fetchPopcornVotes()
  }, [room, fetchSuggestions, fetchVotes, fetchPopcornVotes])

  // Real-time subscriptions
  useEffect(() => {
    if (!room) return

    const channel = supabase
      .channel(`room-${room.id}`)
      .on(
        'postgres_changes',
        { event: '*', schema: 'public', table: 'suggestions', filter: `room_id=eq.${room.id}` },
        () => fetchSuggestions()
      )
      .on(
        'postgres_changes',
        { event: '*', schema: 'public', table: 'votes', filter: `room_id=eq.${room.id}` },
        () => fetchVotes()
      )
      .on(
        'postgres_changes',
        { event: '*', schema: 'public', table: 'popcorn_votes', filter: `room_id=eq.${room.id}` },
        () => fetchPopcornVotes()
      )
      .subscribe()

    return () => supabase.removeChannel(channel)
  }, [room, fetchSuggestions, fetchVotes, fetchPopcornVotes])

  function handleNickname(name) {
    localStorage.setItem(`filmkveld-nick-${code}`, name)
    setNickname(name)
  }

  async function handleAddSuggestion(category, titleOrMovie) {
    if (typeof titleOrMovie === 'object') {
      await supabase.from('suggestions').insert({
        room_id: room.id,
        category,
        title: titleOrMovie.title.trim(),
        poster_path: titleOrMovie.posterPath || null,
        release_year: titleOrMovie.year || null,
        added_by: nickname,
      })
    } else {
      await supabase.from('suggestions').insert({
        room_id: room.id,
        category,
        title: titleOrMovie.trim(),
        added_by: nickname,
      })
    }
  }

  async function handleVote(suggestionId, category, rank) {
    // Toggle off if same vote exists
    const existing = votes.find(
      (v) =>
        v.voter_name === nickname &&
        v.suggestion_id === suggestionId &&
        v.rank === rank
    )
    if (existing) {
      await supabase.from('votes').delete().eq('id', existing.id)
      return
    }

    // Remove existing vote at this rank for this category
    await supabase
      .from('votes')
      .delete()
      .match({ room_id: room.id, voter_name: nickname, category, rank })

    // Remove existing vote for this suggestion
    await supabase
      .from('votes')
      .delete()
      .match({ room_id: room.id, voter_name: nickname, suggestion_id: suggestionId })

    // Insert new vote
    await supabase.from('votes').insert({
      room_id: room.id,
      voter_name: nickname,
      suggestion_id: suggestionId,
      category,
      rank,
    })
  }

  async function handlePopcornVote(vote) {
    const existing = popcornVotes.find((v) => v.voter_name === nickname)
    if (existing) {
      if (existing.vote === vote) {
        await supabase.from('popcorn_votes').delete().eq('id', existing.id)
      } else {
        await supabase.from('popcorn_votes').update({ vote }).eq('id', existing.id)
      }
      return
    }
    await supabase.from('popcorn_votes').insert({
      room_id: room.id,
      voter_name: nickname,
      vote,
    })
  }

  function handleCopyLink() {
    navigator.clipboard.writeText(window.location.href)
    setCopied(true)
    setTimeout(() => setCopied(false), 2000)
  }

  if (loading) {
    return (
      <div className="loading">
        <div className="loading-popcorn">🍿</div>
        <p>Laster...</p>
      </div>
    )
  }

  if (error) {
    return (
      <div className="error-page">
        <div className="error-icon">😵</div>
        <h2>{error}</h2>
      </div>
    )
  }

  if (!nickname) {
    return <NicknameModal onSubmit={handleNickname} roomName={room.name} />
  }

  const filmSuggestions = suggestions.filter((s) => s.category === 'film')
  const middagSuggestions = suggestions.filter((s) => s.category === 'middag')
  const filmVotes = votes.filter((v) => v.category === 'film')
  const middagVotes = votes.filter((v) => v.category === 'middag')

  return (
    <div className="room">
      <header className="room-header">
        <div className="room-header-top">
          <h1>{room.name}</h1>
          <span className="room-nick">👤 {nickname}</span>
        </div>
        <div className="share-bar">
          <span className="share-label">Del med vennene dine:</span>
          <button className="share-btn" onClick={handleCopyLink}>
            {copied ? '✨ Kopiert!' : '📋 Kopier lenke'}
          </button>
        </div>
      </header>

      <PopcornPoll
        popcornVotes={popcornVotes}
        nickname={nickname}
        onVote={handlePopcornVote}
      />

      <div className="room-grid">
        <CategorySection
          emoji="🎬"
          title="Film"
          placeholder="F.eks. Interstellar..."
          category="film"
          suggestions={filmSuggestions}
          votes={filmVotes}
          nickname={nickname}
          onAdd={(movie) => handleAddSuggestion('film', movie)}
          onVote={handleVote}
        />
        <CategorySection
          emoji="🍕"
          title="Middag"
          placeholder="F.eks. Taco..."
          category="middag"
          suggestions={middagSuggestions}
          votes={middagVotes}
          nickname={nickname}
          onAdd={(title) => handleAddSuggestion('middag', title)}
          onVote={handleVote}
        />
      </div>
    </div>
  )
}
