import { NextApiRequest, NextApiResponse } from 'next';
import { getServerSession } from 'next-auth';
import { options as authOptions } from '../auth/[...nextauth]';
import prisma from '@/config/prisma';

export default async function handler(
  req: NextApiRequest,
  res: NextApiResponse
) {
  try {
    const session = await getServerSession(req, res, authOptions);
    
    if (!session) {
      return res.status(401).json({ error: 'Unauthorized' });
    }

    // Verificar que el usuario tenga permisos (USER o ADMIN)
    if (session.user.role !== 'ADMIN' && session.user.role !== 'USER') {
      return res.status(403).json({ error: 'Forbidden' });
    }

    if (req.method === 'GET') {
      const { serviceId } = req.query;

      const whereClause = serviceId 
        ? { serviceId: serviceId as string }
        : {};

      const appointments = await prisma.appointment.findMany({
        where: whereClause,
        include: {
          customer: {
            select: {
              id: true,
              firstName: true,
              lastName: true,
            },
          },
          service: {
            select: {
              id: true,
              name: true,
              duration: true,
              price: true,
            },
          },
          staff: {
            select: {
              id: true,
              name: true,
            },
          },
          user: {
            select: {
              id: true,
              name: true,
            },
          },
        },
        orderBy: {
          startTime: 'desc',
        },
      });

      res.status(200).json(appointments);
    } else if (req.method === 'POST') {
      const { 
        customerId, 
        serviceId, 
        staffId, 
        startTime, 
        notes,
        duration 
      } = req.body;

      // Validaciones básicas
      if (!customerId || !serviceId || !startTime) {
        return res.status(400).json({ 
          error: 'Missing required fields: customerId, serviceId, startTime' 
        });
      }

      // Obtener el servicio para calcular endTime
      const service = await prisma.service.findUnique({
        where: { id: serviceId },
      });

      if (!service) {
        return res.status(404).json({ error: 'Service not found' });
      }

      // Calcular endTime basado en la duración del servicio
      const start = new Date(startTime);
      const end = new Date(start.getTime() + (duration || service.duration) * 60000);

      const appointment = await prisma.appointment.create({
        data: {
          startTime: start,
          endTime: end,
          customerId,
          serviceId,
          staffId: staffId || null,
          userId: session.user.id,
          notes: notes || null,
          price: service.price,
          status: 'CONFIRMED',
        },
        include: {
          customer: {
            select: {
              firstName: true,
              lastName: true,
            },
          },
          service: {
            select: {
              name: true,
            },
          },
          staff: {
            select: {
              name: true,
            },
          },
        },
      });

      res.status(201).json(appointment);
    } else {
      res.status(405).json({ error: 'Method not allowed' });
    }
  } catch (error) {
    console.error('Error handling appointments:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
} 