
import { Suspense } from 'react'
import PengajuanDetail from '@/components/PengajuanDetail' // adjusted path with correct casing

export default function DetailPage() {
  return (
    <Suspense fallback={<div>Loading...</div>}>
      <PengajuanDetail />
    </Suspense>
  )
}