import { useEffect, useState } from 'react'
import { supabase } from '../supabase'

export default function WishForm({ session, onClose, onDone }) {
  const [nickname, setNickname] = useState('')
  const [target, setTarget] = useState('')
  const [content, setContent] = useState('')
  const [showTarget, setShowTarget] = useState(false)
  const [msg, setMsg] = useState('')
  const [sending, setSending] = useState(false)

  useEffect(() => {
    supabase.from('nicknames').select('nickname').maybeSingle()
      .then(({ data }) => data && setNickname(data.nickname))
  }, [])

  async function submit(e) {
    e.preventDefault()
    setSending(true); setMsg('')
    await supabase.from('nicknames')
      .upsert({ user_id: session.user.id, nickname }, { onConflict: 'user_id' })
    const { error } = await supabase.from('wishes').insert({
      nickname, target_name: target, content, show_target: showTarget
    })
    setSending(false)
    if (error) {
      if (error.message.includes('LIMIT_USER')) setMsg('Bạn đã dùng hết 3 điều ước hôm nay. Quay lại sau 7 giờ sáng nhé.')
      else if (error.message.includes('LIMIT_GLOBAL')) setMsg('Cây đang nghỉ, quay lại sau 7 giờ sáng.')
      else setMsg('Có lỗi: ' + error.message)
      return
    }
    onDone(); onClose()
  }

  return (
    <div className="modal"><form className="card" onSubmit={submit}>
      <h2>Ước nguyện</h2>
      <label>Biệt danh<input value={nickname} onChange={e => setNickname(e.target.value)} required minLength={2} maxLength={20} /></label>
      <label>Ước cho ai<input value={target} onChange={e => setTarget(e.target.value)} required maxLength={40} /></label>
      <label className="row"><input type="checkbox" checked={showTarget} onChange={e => setShowTarget(e.target.checked)} /> Cho phép hiện tên người này trên bảng công khai</label>
      <label>Điều ước<textarea value={content} onChange={e => setContent(e.target.value)} required minLength={3} maxLength={300} rows={4} /></label>
      {msg && <p className="err">{msg}</p>}
      <div className="row">
        <button disabled={sending}>{sending ? 'Đang gửi…' : 'Gửi điều ước'}</button>
        <button type="button" onClick={onClose}>Đóng</button>
      </div>
    </form></div>
  )
}