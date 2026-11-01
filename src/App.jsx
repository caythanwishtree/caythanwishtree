import { useEffect, useState } from 'react'
import { supabase } from './supabase'
import PublicList from './components/PublicList'
import WishForm from './components/WishForm'
import MyWishes from './components/MyWishes'
import Stats from './components/Stats'
import Scene from './components/Scene'

export default function App() {
  const [session, setSession] = useState(null)
  const [ready, setReady] = useState(false)
  const [tab, setTab] = useState('home')
  const [showForm, setShowForm] = useState(false)
  const [reloadKey, setReloadKey] = useState(0)

  useEffect(() => {
    supabase.auth.getSession().then(({ data }) => { setSession(data.session); setReady(true) })
    const { data } = supabase.auth.onAuthStateChange((_e, s) => setSession(s))
    return () => data.subscription.unsubscribe()
  }, [])

  const login = () => supabase.auth.signInWithOAuth({
    provider: 'google', options: { redirectTo: window.location.origin }
  })
  const refresh = () => setReloadKey(k => k + 1)

  if (!ready) return <p className="center">Đang tải…</p>

  return (
    <>
      <style>{'.app{position:relative;z-index:1;pointer-events:none}.app *{pointer-events:auto}'}</style>
      <div style={{ position: 'fixed', inset: 0, zIndex: 0 }}><Scene /></div>

      <div className="app">
        <header>
          <h1>Cây Thần</h1>
          {session
            ? <button onClick={() => supabase.auth.signOut()}>Thoát</button>
            : <button onClick={login}>Đăng nhập Google</button>}
        </header>

        {session && (
          <nav>
            <button className={tab === 'home' ? 'on' : ''} onClick={() => setTab('home')}>Trang chủ</button>
            <button className={tab === 'mine' ? 'on' : ''} onClick={() => setTab('mine')}>Điều ước của tôi</button>
          </nav>
        )}

        {tab === 'home' && (
          <>
            {session && <button className="wish-btn" onClick={() => setShowForm(true)}>✨ Ước nguyện</button>}
            <Stats reloadKey={reloadKey} />
            <div className="lists">
              <section><h2>Đang ước</h2><PublicList status="pending" reloadKey={reloadKey} /></section>
              <section><h2>Đã thành công</h2><PublicList status="done" reloadKey={reloadKey} /></section>
            </div>
          </>
        )}
        {tab === 'mine' && session && <MyWishes session={session} onChanged={refresh} />}
        {showForm && <WishForm session={session} onClose={() => setShowForm(false)} onDone={refresh} />}
      </div>
    </>
  )
}