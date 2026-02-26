import { useState } from 'react'

export default function NicknameModal({ onSubmit, roomName }) {
  const [name, setName] = useState('')

  function handleSubmit(e) {
    e.preventDefault()
    if (name.trim()) onSubmit(name.trim())
  }

  return (
    <div className="modal-overlay">
      <div className="modal">
        <div className="modal-icon">🎟️</div>
        <h2>Velkommen til</h2>
        <h3 className="modal-room-name">{roomName}</h3>
        <form onSubmit={handleSubmit}>
          <label htmlFor="nickname">Hva heter du?</label>
          <input
            id="nickname"
            type="text"
            placeholder="Ditt kallenavn..."
            value={name}
            onChange={(e) => setName(e.target.value)}
            maxLength={20}
            autoFocus
          />
          <button type="submit" disabled={!name.trim()}>
            🎉 Bli med!
          </button>
        </form>
      </div>
    </div>
  )
}
