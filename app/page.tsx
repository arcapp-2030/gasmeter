import { getSaaSData } from '@/app/actions/saas'
import SaasDashboard from '@/app/components/SaasDashboard'

export const dynamic = 'force-dynamic'

export default async function Page() {
  // Busca todas as empresas, condomínios, unidades e leituras do Neon DB
  const saasData = await getSaaSData()

  return <SaasDashboard initialData={saasData} />
}