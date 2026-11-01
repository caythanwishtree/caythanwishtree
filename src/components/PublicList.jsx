import { useEffect, useRef, useState } from 'react'
import { supabase } from '../supabase'

const fmt = t => new Date(t).toLocaleString('vi-VN')

export default function PublicList({ status, reloadKey }) {
  const [items, setItems] = useState([])
  const [finished, setFinished] = useState(false)
  const busy = useRef(false)
  const col = status === 'done' ? 'completed_at' : 'created_at'

  async function load(reset) {
    if (busy.current) return
    busy.current = true
    let q = supabase.from('public_wishes').select('*')
      .order(col, { ascending: false }).limit(30)
    q = status === 'done' ? q.not('completed_at', 'is', null) : q.is('completed_at', null)
    if (!reset && items.length) q = q.lt(col, items[items.length - 1][col])
    const { data } = await q
    const rows = data || []
    setItems(reset ? rows : [...items, ...rows])
    setFinished(rows.length < 30)
    busy.current = false
  }

  useEffect(() => { load(true) }, [reloadKey])

  const onScroll = e => {
    const el = e.target
    if (!finished && el.scrollTop + el.clientHeight >= el.scrollHeight - 40) load(false)
  }

  return (
    <div className="scroll" onScroll={onScroll}>
      {items.map(w => (
        <div className="card" key={w.id}>
          <b>{w.nickname}</b>
          {w.target_name && <span> ước cho {w.target_name}</span>}
          <p>{w.content}</p>
          <small>Ước: {fmt(w.created_at)}{w.completed_at && ` · Xong: ${fmt(w.completed_at)}`}</small>
        </div>
      ))}
      {!items.length && <p className="muted">Chưa có điều ước nào.</p>}
    </div>
  )
}