'use server'

import { prisma } from '../../lib/prisma'
import { revalidatePath } from 'next/cache'

// 1. Cadastrar Condomínio
export async function createCondo(formData: FormData) {
  const companyId = formData.get('companyId') as string
  const name = formData.get('name') as string
  const address = formData.get('address') as string
  const gasPricePerM3 = parseFloat(formData.get('gasPricePerM3') as string || '8.50')
  const fixedFee = parseFloat(formData.get('fixedFee') as string || '15.00')

  try {
    await prisma.condo.create({
      data: { companyId, name, address, gasRate: gasPricePerM3, fixedFee },
    })
    revalidatePath('/')
    return { success: true }
  } catch (err: any) {
    return { success: false, error: err.message }
  }
}

// 2. Cadastrar Unidade (Apartamento/Bloco)
export async function createUnit(formData: FormData) {
  const condoId = formData.get('condoId') as string
  const block = formData.get('block') as string
  const unitNumber = formData.get('unitNumber') as string
  const residentName = formData.get('residentName') as string
  const initialReading = parseFloat(formData.get('initialReading') as string || '0')

  try {
    const unit = await prisma.unit.create({
      data: { condoId, block, unitNumber, resident: residentName },
    })

    // Se houver uma leitura inicial diferente de zero
    if (initialReading > 0) {
      await prisma.reading.create({
        data: {
          unitId: unit.id,
          previousValue: 0,
          currentValue: initialReading,
          consumption: initialReading,
          totalAmount: 0,
          status: 'CONFIRMED',
        },
      })
    }

    revalidatePath('/')
    return { success: true }
  } catch (err: any) {
    return { success: false, error: err.message }
  }
}

// 3. Registrar Leitura de Gás (com cálculo de valor e detecção de anomalia)
export async function saveReading(unitId: string, currentVal: number) {
  try {
    const unit = await prisma.unit.findUnique({
      where: { id: unitId },
      include: { condo: true, readings: { orderBy: { readingDate: 'desc' }, take: 1 } },
    })

    if (!unit) throw new Error('Unidade não encontrada')

    const lastReading = unit.readings[0]
    const previousValue = lastReading ? lastReading.currentValue : 0
    const consumption = currentVal - previousValue

    if (consumption < 0) {
      throw new Error('A leitura atual não pode ser menor que a anterior.')
    }

    const totalAmount = (consumption * unit.condo.gasRate) + unit.condo.fixedFee
    const status = consumption > 30 ? 'ANOMALY' : 'CONFIRMED'

    await prisma.reading.create({
      data: {
        unitId,
        previousValue,
        currentValue: currentVal,
        consumption,
        totalAmount,
        status,
      },
    })

    revalidatePath('/')
    return { success: true }
  } catch (err: any) {
    return { success: false, error: err.message }
  }
}

// 4. Carregar todo o Estado do SaaS em uma única consulta otimizada
export async function getSaaSData() {
  try {
    const companies = await prisma.company.findMany({
      include: {
        condos: {
          include: {
            units: {
              include: {
                readings: { orderBy: { readingDate: 'desc' }, take: 1 },
              },
            },
          },
        },
      },
    })

    return companies
  } catch (err) {
    console.error('Erro ao buscar dados do SaaS:', err)
    return []
  }
}