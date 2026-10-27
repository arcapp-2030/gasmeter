'use client'

import React, { useState } from 'react'
import Link from 'next/link'
import { Lock, Mail, ArrowRight, AlertCircle } from 'lucide-react'
import { useRouter } from 'next/navigation'

export default function LoginPage() {
  const router = useRouter()
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault()
    setLoading(true)
    setError('')

    try {
      // Simulação / Integração com sua Server Action de Autenticação
      if (email && password) {
        // Redireciona para o Dashboard após login bem-sucedido
        router.push('/')
      } else {
        setError('Por favor, preencha todos os campos.')
      }
    } catch (err) {
      setError('E-mail ou senha incorretos.')
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="space-y-6">
      <div>
        <h2 className="text-xl font-bold text-white">Acessar Plataforma</h2>
        <p className="text-xs text-slate-400 mt-1">
          Informe suas credenciais para gerenciar leituras e cobranças
        </p>
      </div>

      {error && (
        <div className="p-3 bg-rose-500/10 border border-rose-500/20 rounded-xl text-rose-400 text-xs flex items-center gap-2">
          <AlertCircle className="w-4 h-4 shrink-0" />
          <span>{error}</span>
        </div>
      )}

      <form onSubmit={handleLogin} className="space-y-4 text-xs">
        <div>
          <label className="block text-slate-300 font-medium mb-1.5">
            E-mail Corporativo
          </label>
          <div className="relative">
            <Mail className="w-4 h-4 absolute left-3 top-3 text-slate-500" />
            <input
              type="email"
              required
              placeholder="seu.email@empresa.com"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              className="w-full bg-slate-950 border border-slate-800 rounded-xl pl-9 pr-4 py-2.5 text-white placeholder-slate-600 focus:outline-none focus:border-orange-500 transition"
            />
          </div>
        </div>

        <div>
          <div className="flex justify-between items-center mb-1.5">
            <label className="text-slate-300 font-medium">Senha</label>
            <Link
              href="/forgot-password"
              className="text-orange-400 hover:text-orange-300 transition"
            >
              Esqueceu a senha?
            </Link>
          </div>
          <div className="relative">
            <Lock className="w-4 h-4 absolute left-3 top-3 text-slate-500" />
            <input
              type="password"
              required
              placeholder="••••••••"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              className="w-full bg-slate-950 border border-slate-800 rounded-xl pl-9 pr-4 py-2.5 text-white placeholder-slate-600 focus:outline-none focus:border-orange-500 transition"
            />
          </div>
        </div>

        <button
          type="submit"
          disabled={loading}
          className="w-full bg-orange-500 hover:bg-orange-600 text-white font-semibold py-3 rounded-xl transition shadow-lg shadow-orange-500/20 flex items-center justify-center gap-2 text-sm disabled:opacity-50"
        >
          {loading ? 'Entrando...' : 'Entrar no Sistema'}
          {!loading && <ArrowRight className="w-4 h-4" />}
        </button>
      </form>

      <div className="pt-4 border-t border-slate-800 text-center text-xs text-slate-400">
        Sua empresa de gestão ainda não utiliza o GasMeter?{' '}
        <Link href="/register" className="text-orange-400 font-semibold hover:underline">
          Cadastre-se gratuitamente
        </Link>
      </div>
    </div>
  )
}