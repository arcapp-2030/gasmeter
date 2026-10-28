import { Suspense } from 'react'
import { getSaaSData } from '@/app/actions/saas'
import SaasDashboard from '@/app/components/SaasDashboard'

async function DashboardContent() {
  const saasData = await getSaaSData()
  return <SaasDashboard initialData={saasData} />
}

export default function Page() {
  return (
    <Suspense fallback={<div className="flex h-screen items-center justify-center bg-slate-900 text-orange-400 font-sans">Carregando GasMeter SaaS...</div>}>
      <DashboardContent />
    </Suspense>
  )
}