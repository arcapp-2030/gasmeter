'use server'

import { prisma } from '../../lib/prisma'
import { revalidatePath } from 'next/cache'

// Função para cadastrar uma nova empresa de gestão de gás
export async function createCompany(formData: FormData) {
  const name = formData.get('name') as string
  const cnpj = formData.get('cnpj') as string

  if (!name || !cnpj) {
    throw new Error('Nome e CNPJ são obrigatórios.')
  }

  try {
    const company = await prisma.company.create({
      data: {
        name,
        cnpj,
      },
    })

    revalidatePath('/') // Atualiza a página com os novos dados
    return { success: true, company }
  } catch (error: any) {
    return { success: false, error: error.message || 'Erro ao cadastrar empresa.' }
  }
}

// Função para listar as empresas cadastradas
export async function getCompanies() {
  try {
    const companies = await prisma.company.findMany({
      include: {
        condos: true, // Traz os condomínios vinculados
      },
      orderBy: { createdAt: 'desc' },
    })
    return companies
  } catch (error) {
    console.error('Erro ao buscar empresas:', error)
    return []
  }
}