'use server'

import { prisma } from '../../lib/prisma'

export async function getDashboardMetrics() {
  try {
    const [companiesCount, condosCount, unitsCount, recentReadings] = await Promise.all([
      prisma.company.count(),
      prisma.condo.count(),
      prisma.unit.count(),
      prisma.reading.findMany({
        take: 5,
        orderBy: { readingDate: 'desc' },
        include: {
          unit: {
            include: {
              condo: true,
            },
          },
        },
      }),
    ])

    // Soma o faturamento total das leituras registradas
    const totalRevenueAgg = await prisma.reading.aggregate({
      _sum: {
        totalAmount: true,
        consumption: true,
      },
    })

    return {
      companiesCount,
      condosCount,
      unitsCount,
      totalRevenue: totalRevenueAgg._sum.totalAmount || 0,
      totalConsumption: totalRevenueAgg._sum.consumption || 0,
      recentReadings,
    }
  } catch (error) {
    console.error('Erro ao buscar métricas do dashboard:', error)
    return {
      companiesCount: 0,
      condosCount: 0,
      unitsCount: 0,
      totalRevenue: 0,
      totalConsumption: 0,
      recentReadings: [],
    }
  }
}