import { useEffect, useState } from 'react'
import { supabase } from '../supabase'

const fmt = t => new Date(t).toLocaleString('vi-VN')

export default function MyWishes({ onChanged }) {
  const [rows, setRows] = useState([])
  const [status, setStatus] = useState('all')
  const [month, setMonth] = useState('')
  const [deadlines, setDeadlines] = useState({})
  const [now, setNow] = useState(Date.now())

  async function load() {
    let q = supabase.from('wishes').select('*').order('created_at', { ascending: false }).limit(100)
    if (status === 'pending') q = q.is('completed_at', null)
    if (status === 'done') q = q.not('completed_at', 'is', null)
    if (month) {
      const [y, m] = month.split('-').map(Number)
      q = q.gte('created_at', new Date(y, m - 1, 1).toISOString())
           .lt('created_at', new Date(y, m, 1).toISOString())
    }
    const { data } = await q
    setRows(data || [])
  }
  useEffect(() => { load() }, [status, month])

  useEffect(() => {
    if (!Object.keys(deadlines).length) return
    const t = setInterval(() => setNow(Date.now()), 1000)
    return () => clearInterval(t)
  }, [deadlines])

  async function toggle(w) {
    if (w.completed_at) {
      await supabase.from('wishes').update({ completed_at: null }).eq('id', w.id)
      setDeadlines(d => { const n = { ...d }; delete n[w.id]; return n })
    } else {
      await supabase.from('wishes').update({ completed_at: new Date().toISOString() }).eq('id', w.id)
      setNow(Date.now())
      setDeadlines(d => ({ ...d, [w.id]: Date.now() + 30000 }))
      setTimeout(async () => {
        await supabase.rpc('flush_my_notices')
        onChanged()
      }, 31000)
    }
    load(); onChanged()
  }

  return (
    <div>
      <div className="row">
        <select value={status} onChange={e => setStatus(e.target.value)}>
          <option value="all">Tất cả</option>
          <option value="pending">Đang ước</option>
          <option value="done">Đã thành công</option>
        </select>
        <input type="month" value={month} onChange={e => setMonth(e.target.value)} />
      </div>
      {rows.map(w => {
        const left = deadlines[w.id] ? Math.ceil((deadlines[w.id] - now) / 1000) : 0
        return (
          <div className="card" key={w.id}>
            <b>{w.nickname}</b> ước cho <b>{w.target_name}</b>
            <p>{w.content}</p>
            <small>Ước: {fmt(w.created_at)} · {w.completed_at ? 'Xong: ' + fmt(w.completed_at) : 'Đang chờ'}</small>
            <div>
              {w.completed_at
                ? <button onClick={() => toggle(w)}>{left > 0 ? `↩ Hoàn tác (${left}s)` : 'Bỏ tick'}</button>
                : <button onClick={() => toggle(w)}>✔ Đã thành công</button>}
            </div>
          </div>
        )
      })}
      {!rows.length && <p className="muted">Không có điều ước phù hợp.</p>}
    </div>
  )
}