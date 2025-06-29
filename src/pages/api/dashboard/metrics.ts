import { NextApiRequest, NextApiResponse } from 'next';
import { getServerSession } from 'next-auth';
import { options as authOptions } from '../auth/[...nextauth]';
import prisma from '@/config/prisma';
import { startOfMonth, endOfMonth } from 'date-fns';

export default async function handler(
  req: NextApiRequest,
  res: NextApiResponse
) {
  if (req.method !== 'GET') {
    return res.status(405).json({ error: 'Method not allowed' });
  }

  try {
    const session = await getServerSession(req, res, authOptions);
    
    if (!session) {
      return res.status(401).json({ error: 'Unauthorized' });
    }

    if (session.user.role !== 'ADMIN' && session.user.role !== 'USER') {
      return res.status(403).json({ error: 'Forbidden' });
    }

    const now = new Date();
    const startOfCurrentMonth = startOfMonth(now);
    const endOfCurrentMonth = endOfMonth(now);
    
    // 1. Ingresos totales del mes
    const monthlyRevenue = await prisma.appointment.aggregate({
      where: {
        status: 'COMPLETED',
        startTime: {
          gte: startOfCurrentMonth,
          lte: endOfCurrentMonth,
        },
      },
      _sum: {
        price: true,
      },
    });

    // 2. Nuevos clientes este mes
    const newCustomersThisMonth = await prisma.customer.count({
      where: {
        createdAt: {
          gte: startOfCurrentMonth,
          lte: endOfCurrentMonth,
        },
      },
    });

    // 3. Citas completadas este mes
    const appointmentsThisMonth = await prisma.appointment.count({
      where: {
        status: 'COMPLETED',
        startTime: {
          gte: startOfCurrentMonth,
          lte: endOfCurrentMonth,
        },
      },
    });

    // 4. Total de servicios activos
    const totalActiveServices = await prisma.service.count({
      where: {
        enabled: true,
      },
    });

    res.status(200).json({
      monthlyRevenue: monthlyRevenue._sum.price || 0,
      newCustomersThisMonth,
      appointmentsThisMonth,
      totalActiveServices,
    });

  } catch (error) {
    console.error('Error fetching dashboard metrics:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
} 