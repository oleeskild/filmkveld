import { useState, useRef, useEffect, useCallback } from 'react'
import { searchMovies, POSTER_BASE } from '../tmdb'

export default function AddFilm({ onAdd }) {
  const [query, setQuery] = useState('')
  const [results, setResults] = useState([])
  const [open, setOpen] = useState(false)
  const [loading, setLoading] = useState(false)
  const [activeIndex, setActiveIndex] = useState(-1)
  const wrapperRef = useRef(null)
  const debounceRef = useRef(null)

  const doSearch = useCallback(async (q) => {
    if (q.length < 2) {
      setResults([])
      setOpen(false)
      return
    }
    setLoading(true)
    const data = await searchMovies(q)
    setResults(data)
    setOpen(data.length > 0)
    setActiveIndex(-1)
    setLoading(false)
  }, [])

  function handleChange(e) {
    const val = e.target.value
    setQuery(val)
    clearTimeout(debounceRef.current)
    debounceRef.current = setTimeout(() => doSearch(val), 300)
  }

  function handleSelect(movie) {
    onAdd({
      title: movie.title,
      posterPath: movie.posterPath,
      year: movie.year,
    })
    setQuery('')
    setResults([])
    setOpen(false)
  }

  function handleKeyDown(e) {
    if (!open) return
    if (e.key === 'ArrowDown') {
      e.preventDefault()
      setActiveIndex((i) => (i < results.length - 1 ? i + 1 : 0))
    } else if (e.key === 'ArrowUp') {
      e.preventDefault()
      setActiveIndex((i) => (i > 0 ? i - 1 : results.length - 1))
    } else if (e.key === 'Enter' && activeIndex >= 0) {
      e.preventDefault()
      handleSelect(results[activeIndex])
    } else if (e.key === 'Escape') {
      setOpen(false)
    }
  }

  useEffect(() => {
    function handleClickOutside(e) {
      if (wrapperRef.current && !wrapperRef.current.contains(e.target)) {
        setOpen(false)
      }
    }
    document.addEventListener('mousedown', handleClickOutside)
    return () => document.removeEventListener('mousedown', handleClickOutside)
  }, [])

  useEffect(() => {
    return () => clearTimeout(debounceRef.current)
  }, [])

  return (
    <div className="add-film-wrapper" ref={wrapperRef}>
      <div className="add-form">
        <input
          type="text"
          placeholder="Søk etter film..."
          value={query}
          onChange={handleChange}
          onKeyDown={handleKeyDown}
          maxLength={80}
        />
        {loading && <span className="add-film-spinner">...</span>}
      </div>
      {open && (
        <div className="add-film-dropdown">
          {results.map((movie, i) => (
            <button
              key={movie.id}
              className={`add-film-option ${i === activeIndex ? 'active' : ''}`}
              onClick={() => handleSelect(movie)}
              onMouseEnter={() => setActiveIndex(i)}
            >
              {movie.posterPath ? (
                <img
                  className="add-film-poster"
                  src={`${POSTER_BASE}${movie.posterPath}`}
                  alt=""
                />
              ) : (
                <div className="add-film-poster add-film-poster-empty">🎬</div>
              )}
              <div className="add-film-option-info">
                <span className="add-film-option-title">{movie.title}</span>
                {movie.year && (
                  <span className="add-film-option-year">{movie.year}</span>
                )}
              </div>
            </button>
          ))}
        </div>
      )}
    </div>
  )
}
