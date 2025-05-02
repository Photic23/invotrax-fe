
import { Suspense } from 'react'
import PengajuanDetail from '../../../components/PengajuanDetail'

export default function DetailPage() {
  return (
    <Suspense fallback={<div>Loading...</div>}>
      <PengajuanDetail />
    </Suspense>
  )
}