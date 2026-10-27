import { NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma'; // Instância do Prisma Client

export async function POST(request: Request) {
  try {
    const body = await request.json();
    const { unitId, currentValue, photoUrl } = body;

    // 1. Busca a última leitura da unidade
    const lastReading = await prisma.reading.findFirst({
      where: { unitId },
      orderBy: { readingDate: 'desc' },
    });

    // 2. Busca parâmetros de tarifação do condomínio
    const unit = await prisma.unit.findUnique({
      where: { id: unitId },
      include: { condo: true },
    });

    if (!unit) return NextResponse.json({ error: 'Unidade não encontrada' }, { status: 404 });

    const previousValue = lastReading ? lastReading.currentValue : 0;
    const consumption = currentValue - previousValue;

    if (consumption < 0) {
      return NextResponse.json({ error: 'Leitura atual não pode ser menor que a anterior' }, { status: 400 });
    }

    const gasRate = unit.condo.gasRate;
    const fixedFee = unit.condo.fixedFee;
    const totalAmount = (consumption * gasRate) + fixedFee;

    // Detecta anomalia (ex: consumo 50% superior à média)
    const status = consumption > 40 ? 'ANOMALY' : 'CONFIRMED';

    // 3. Salva a nova leitura
    const newReading = await prisma.reading.create({
      data: {
        unitId,
        previousValue,
        currentValue,
        consumption,
        totalAmount,
        photoUrl,
        status,
      },
    });

    return NextResponse.json(newReading);
  } catch (error) {
    return NextResponse.json({ error: 'Erro ao registrar leitura' }, { status: 500 });
  }
}