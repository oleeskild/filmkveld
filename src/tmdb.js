const API_KEY = import.meta.env.VITE_TMDB_API_KEY
const BASE_URL = 'https://api.themoviedb.org/3'
export const POSTER_BASE = 'https://image.tmdb.org/t/p/w200'

export async function searchMovies(query) {
  if (!API_KEY || !query || query.length < 2) return []

  const res = await fetch(
    `${BASE_URL}/search/movie?api_key=${API_KEY}&query=${encodeURIComponent(query)}&language=en-US&include_adult=false`
  )
  if (!res.ok) return []

  const data = await res.json()
  return (data.results || []).slice(0, 8).map((m) => ({
    id: m.id,
    title: m.title,
    posterPath: m.poster_path,
    year: m.release_date ? m.release_date.slice(0, 4) : null,
  }))
}
