import { POSTER_BASE } from '../tmdb'

const POINTS = { 1: 3, 2: 2, 3: 1 }
const MEDALS = ['🏆', '🥈', '🥉']

export default function Leaderboard({ suggestions, votes }) {
  if (suggestions.length === 0) return null

  const scored = suggestions.map((s) => {
    const sVotes = votes.filter((v) => v.suggestion_id === s.id)
    const points = sVotes.reduce((sum, v) => sum + POINTS[v.rank], 0)
    const first = sVotes.filter((v) => v.rank === 1).length
    const second = sVotes.filter((v) => v.rank === 2).length
    const third = sVotes.filter((v) => v.rank === 3).length
    return { ...s, points, first, second, third, totalVotes: sVotes.length }
  })

  const sorted = scored
    .filter((s) => s.totalVotes > 0)
    .sort((a, b) => b.points - a.points || b.first - a.first)

  if (sorted.length === 0) return null

  return (
    <div className="leaderboard">
      <h4>Resultater</h4>
      <div className="leaderboard-list">
        {sorted.map((item, i) => {
          const maxPoints = sorted[0].points
          const pct = maxPoints > 0 ? (item.points / maxPoints) * 100 : 0

          return (
            <div key={item.id} className={`lb-row ${i < 3 ? `lb-top-${i + 1}` : ''}`}>
              <span className="lb-rank">
                {i < 3 ? MEDALS[i] : `${i + 1}.`}
              </span>
              {item.poster_path && (
                <img
                  className="lb-poster"
                  src={`${POSTER_BASE}${item.poster_path}`}
                  alt=""
                />
              )}
              <div className="lb-info">
                <span className="lb-title">
                  {item.title}
                  {item.release_year && (
                    <span className="lb-year"> ({item.release_year})</span>
                  )}
                </span>
                <div className="lb-bar-container">
                  <div
                    className="lb-bar"
                    style={{ width: `${pct}%` }}
                  />
                </div>
                <span className="lb-breakdown">
                  {item.points} poeng
                  {item.first > 0 && ` · ${item.first}x🥇`}
                  {item.second > 0 && ` · ${item.second}x🥈`}
                  {item.third > 0 && ` · ${item.third}x🥉`}
                </span>
              </div>
            </div>
          )
        })}
      </div>
    </div>
  )
}
