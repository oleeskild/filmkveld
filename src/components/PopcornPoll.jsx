export default function PopcornPoll({ popcornVotes, nickname, onVote }) {
  const myVote = popcornVotes.find((v) => v.voter_name === nickname)
  const yesVotes = popcornVotes.filter((v) => v.vote === true)
  const noVotes = popcornVotes.filter((v) => v.vote === false)
  const total = popcornVotes.length

  return (
    <section className="popcorn-poll">
      <div className="popcorn-poll-header">
        <span className="category-emoji">🍿</span>
        <h2>Popcorn?</h2>
      </div>

      <div className="popcorn-buttons">
        <button
          className={`popcorn-btn popcorn-yes ${myVote?.vote === true ? 'selected' : ''}`}
          onClick={() => onVote(true)}
        >
          🍿 Ja!
        </button>
        <button
          className={`popcorn-btn popcorn-no ${myVote?.vote === false ? 'selected' : ''}`}
          onClick={() => onVote(false)}
        >
          🚫 Nei
        </button>
      </div>

      {total > 0 && (
        <div className="popcorn-results">
          <div className="popcorn-bar-container">
            <div
              className="popcorn-bar popcorn-bar-yes"
              style={{ width: total > 0 ? `${(yesVotes.length / total) * 100}%` : '0%' }}
            />
          </div>
          <div className="popcorn-tally">
            <span className="popcorn-tally-yes">{yesVotes.length} ja</span>
            <span className="popcorn-tally-no">{noVotes.length} nei</span>
          </div>
          <div className="popcorn-voters">
            {yesVotes.map((v) => (
              <span key={v.id} className="popcorn-voter popcorn-voter-yes">
                🍿 {v.voter_name}
              </span>
            ))}
            {noVotes.map((v) => (
              <span key={v.id} className="popcorn-voter popcorn-voter-no">
                🚫 {v.voter_name}
              </span>
            ))}
          </div>
        </div>
      )}
    </section>
  )
}
