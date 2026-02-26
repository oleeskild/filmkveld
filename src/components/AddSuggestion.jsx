import { useState } from 'react'

export default function AddSuggestion({ placeholder, onAdd }) {
  const [title, setTitle] = useState('')
  const [adding, setAdding] = useState(false)

  async function handleSubmit(e) {
    e.preventDefault()
    if (!title.trim()) return
    setAdding(true)
    await onAdd(title)
    setTitle('')
    setAdding(false)
  }

  return (
    <form className="add-form" onSubmit={handleSubmit}>
      <input
        type="text"
        placeholder={placeholder}
        value={title}
        onChange={(e) => setTitle(e.target.value)}
        maxLength={80}
      />
      <button type="submit" disabled={adding || !title.trim()}>
        {adding ? '...' : '+ Legg til'}
      </button>
    </form>
  )
}
