'use client'

import React, { useState } from 'react'
import Link from 'next/link'
import { Mail, ArrowLeft, CheckCircle2 } from 'lucide-react'

export default function ForgotPasswordPage() {
  const [email, setEmail] = useState('')
  const [submitted, setSubmitted] = useState(false)

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    if (email) {
      setSubmitted(true)
    }
  }

  return (
    <div className="space-y-6">
      {!submitted ? (
        <>
          <div>
            <h2 className="text-xl font-bold text-white">Recuperar Senha</h2>
            <p className="text-xs text-slate-400 mt-1">
              Digite seu e-mail cadastrado para receber instruções de redefinição
            </p>
          </div>

          <form onSubmit={handleSubmit} className="space-y-4 text-xs">
            <div>
              <label className="block text-slate-300 font-medium mb-1.5">
                E-mail Cadastrado
              </label>
              <div className="relative">
                <Mail className="w-4 h-4 absolute left-3 top-3 text-slate-500" />
                <input
                  type="email"
                  required
                  placeholder="seu.email@empresa.com"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  className="w-full bg-slate-950 border border-slate-800 rounded-xl pl-9 pr-4 py-2.5 text-white placeholder-slate-600 focus:outline-none focus:border-orange-500"
                />
              </div>
            </div>

            <button
              type="submit"
              className="w-full bg-orange-500 hover:bg-orange-600 text-white font-semibold py-3 rounded-xl transition shadow-lg shadow-orange-500/20 text-sm"
            >
              Enviar Instruções
            </button>
          </form>
        </>
      ) : (
        <div className="text-center space-y-4 py-2">
          <div className="w-12 h-12 bg-emerald-500/10 border border-emerald-500/20 text-emerald-400 rounded-full flex items-center justify-center mx-auto">
            <CheckCircle2 className="w-6 h-6" />
          </div>
          <h3 className="text-base font-bold text-white">E-mail Enviado!</h3>
          <p className="text-xs text-slate-400">
            Enviamos um link de recuperação de senha para <strong>{email}</strong>. Por favor, verifique sua caixa de entrada e spam.
          </p>
        </div>
      )}

      <div className="pt-4 border-t border-slate-800 text-center text-xs">
        <Link
          href="/login"
          className="inline-flex items-center gap-1.5 text-slate-400 hover:text-white font-medium transition"
        >
          <ArrowLeft className="w-3.5 h-3.5" /> Voltar para o Login
        </Link>
      </div>
    </div>
  )
}