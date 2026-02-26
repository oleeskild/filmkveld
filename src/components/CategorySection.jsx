import AddSuggestion from './AddSuggestion'
import AddFilm from './AddFilm'
import SuggestionCard from './SuggestionCard'
import Leaderboard from './Leaderboard'

export default function CategorySection({
  emoji,
  title,
  placeholder,
  category,
  suggestions,
  votes,
  nickname,
  onAdd,
  onVote,
}) {
  // Current user's picks for this category
  const myPicks = [1, 2, 3].map((rank) => {
    const vote = votes.find(
      (v) => v.voter_name === nickname && v.rank === rank && v.category === category
    )
    if (!vote) return null
    const suggestion = suggestions.find((s) => s.id === vote.suggestion_id)
    return suggestion ? suggestion.title : null
  })

  return (
    <section className="category-section">
      <div className="category-header">
        <span className="category-emoji">{emoji}</span>
        <h2>{title}</h2>
      </div>

      <div className="my-picks">
        <h4>Dine valg:</h4>
        <div className="picks-row">
          {[1, 2, 3].map((rank) => (
            <div key={rank} className={`pick-slot ${myPicks[rank - 1] ? 'filled' : ''}`}>
              <span className="pick-rank">
                {rank === 1 ? '🥇' : rank === 2 ? '🥈' : '🥉'}
              </span>
              <span className="pick-title">
                {myPicks[rank - 1] || '—'}
              </span>
            </div>
          ))}
        </div>
      </div>

      {category === 'film' ? (
        <AddFilm onAdd={onAdd} />
      ) : (
        <AddSuggestion placeholder={placeholder} onAdd={onAdd} />
      )}

      <div className="suggestions-list">
        {suggestions.length === 0 ? (
          <p className="empty-state">
            Ingen forslag ennå. Legg til det første! ✨
          </p>
        ) : (
          suggestions.map((s) => (
            <SuggestionCard
              key={s.id}
              suggestion={s}
              votes={votes}
              nickname={nickname}
              category={category}
              onVote={onVote}
            />
          ))
        )}
      </div>

      <Leaderboard suggestions={suggestions} votes={votes} />
    </section>
  )
}
