import React from 'react'
import { Flame } from 'lucide-react'
import Link from 'next/link'

export default function AuthLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <div className="min-h-screen bg-slate-950 text-slate-100 flex flex-col justify-center items-center p-4 relative overflow-hidden">
      {/* Elementos visuais de fundo */}
      <div className="absolute top-1/4 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[500px] h-[500px] bg-orange-500/10 rounded-full blur-3xl pointer-events-none" />

      {/* Brand Header */}
      <div className="mb-8 text-center z-10">
        <Link href="/" className="inline-flex items-center gap-3">
          <div className="bg-gradient-to-tr from-amber-500 to-orange-600 p-3 rounded-2xl shadow-xl shadow-orange-500/20">
            <Flame className="w-8 h-8 text-white" />
          </div>
          <span className="text-2xl font-bold tracking-wide text-white">
            GasMeter <span className="text-orange-500">SaaS</span>
          </span>
        </Link>
        <p className="text-xs text-slate-400 mt-2">
          Gestão Inteligente e Telemetria de Gás Encanado para Condomínios
        </p>
      </div>

      {/* Box do Formulário */}
      <div className="w-full max-w-md bg-slate-900 border border-slate-800 rounded-2xl p-8 shadow-2xl z-10">
        {children}
      </div>

      {/* Footer */}
      <p className="text-xs text-slate-600 mt-8 text-center z-10">
        &copy; {new Date().getFullYear()} GasMeter SaaS. Todos os direitos reservados.
      </p>
    </div>
  )
}