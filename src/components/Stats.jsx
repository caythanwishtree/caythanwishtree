import { useEffect, useState } from 'react'
import { supabase } from '../supabase'

export default function Stats({ reloadKey }) {
  const [s, setS] = useState({ day_count: 0, month_count: 0, year_count: 0 })

  useEffect(() => {
    supabase.rpc('wish_stats_simple').then(({ data }) => data && data[0] && setS(data[0]))
  }, [reloadKey])

  return (
    <section className="stats">
      <h2>Điều ước đã thành công</h2>
      <p>Hôm nay: <b>{s.day_count}</b></p>
      <p>Tháng này: <b>{s.month_count}</b></p>
      <p>Năm nay: <b>{s.year_count}</b></p>
    </section>
  )
}