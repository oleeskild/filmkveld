import { POSTER_BASE } from '../tmdb'

function letterboxdUrl(title) {
  const slug = title
    .toLowerCase()
    .replace(/['']/g, '')
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/(^-|-$)/g, '')
  return `https://letterboxd.com/film/${slug}/`
}

const RANK_LABELS = {
  1: '🥇',
  2: '🥈',
  3: '🥉',
}

export default function SuggestionCard({
  suggestion,
  votes,
  nickname,
  category,
  onVote,
}) {
  const myVotes = votes.filter((v) => v.voter_name === nickname)
  const myVoteForThis = myVotes.find(
    (v) => v.suggestion_id === suggestion.id
  )

  // Who voted for this suggestion and at what rank
  const votersForThis = votes
    .filter((v) => v.suggestion_id === suggestion.id)
    .sort((a, b) => a.rank - b.rank)

  return (
    <div className={`suggestion-card ${myVoteForThis ? 'voted' : ''} ${suggestion.poster_path ? 'has-poster' : ''}`}>
      {suggestion.poster_path && (
        <img
          className="suggestion-poster"
          src={`${POSTER_BASE}${suggestion.poster_path}`}
          alt=""
        />
      )}
      <div className="suggestion-content">
        <div className="suggestion-info">
          <span className="suggestion-title">
            {suggestion.title}
            {suggestion.release_year && (
              <span className="suggestion-year"> ({suggestion.release_year})</span>
            )}
          </span>
          <span className="suggestion-by">
            lagt til av {suggestion.added_by}
            {suggestion.poster_path && (
              <>
                {' · '}
                <a
                  className="letterboxd-link"
                  href={letterboxdUrl(suggestion.title)}
                  target="_blank"
                  rel="noopener noreferrer"
                  title="Se på Letterboxd"
                >
                  <img
                    className="letterboxd-icon"
                    src="https://a.ltrbxd.com/logos/letterboxd-mac-icon.png"
                    alt="Letterboxd"
                  />
                </a>
              </>
            )}
          </span>
        </div>

        <div className="rank-buttons">
          {[1, 2, 3].map((rank) => {
            const isSelected =
              myVoteForThis && myVoteForThis.rank === rank
            const myOtherAtRank = myVotes.find(
              (v) =>
                v.rank === rank &&
                v.suggestion_id !== suggestion.id &&
                v.category === category
            )

            return (
              <button
                key={rank}
                className={`rank-btn rank-${rank} ${isSelected ? 'selected' : ''}`}
                onClick={() => onVote(suggestion.id, category, rank)}
                title={
                  isSelected
                    ? 'Klikk for å fjerne'
                    : myOtherAtRank
                    ? 'Erstatter nåværende valg'
                    : `Sett som nr. ${rank}`
                }
              >
                {RANK_LABELS[rank]}
              </button>
            )
          })}
        </div>

        {votersForThis.length > 0 && (
          <div className="voter-tags">
            {votersForThis.map((v) => (
              <span
                key={v.id}
                className={`voter-tag rank-tag-${v.rank}`}
              >
                {RANK_LABELS[v.rank]} {v.voter_name}
              </span>
            ))}
          </div>
        )}
      </div>
    </div>
  )
}
