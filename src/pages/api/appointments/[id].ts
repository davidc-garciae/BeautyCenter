import { NextApiRequest, NextApiResponse } from 'next';
import { getServerSession } from 'next-auth';
import { options as authOptions } from '../auth/[...nextauth]';
import prisma from '@/config/prisma';
import { AppointmentStatus } from '@prisma/client';

export default async function handler(
  req: NextApiRequest,
  res: NextApiResponse
) {
  try {
    const session = await getServerSession(req, res, authOptions);
    const { id } = req.query;

    if (!session) {
      return res.status(401).json({ error: 'Unauthorized' });
    }
    
    if (typeof id !== 'string') {
      return res.status(400).json({ error: 'Invalid appointment ID' });
    }

    // Proteger el endpoint: solo ADMINs pueden modificar o eliminar
    if (req.method === 'PATCH' || req.method === 'DELETE') {
      if (session.user.role !== 'ADMIN') {
        return res.status(403).json({ error: 'Forbidden: Admin access required' });
      }
    }

    if (req.method === 'GET') {
      const appointment = await prisma.appointment.findUnique({
        where: { id },
        include: {
          customer: true,
          service: true,
          staff: true,
          user: true,
        },
      });

      if (!appointment) {
        return res.status(404).json({ error: 'Appointment not found' });
      }
      res.status(200).json(appointment);

    } else if (req.method === 'PATCH') {
      const { status } = req.body;

      if (!status || !Object.values(AppointmentStatus).includes(status)) {
        return res.status(400).json({ error: 'Invalid status provided' });
      }

      const updatedAppointment = await prisma.appointment.update({
        where: { id },
        data: { status },
        include: {
          customer: true,
          service: true,
        }
      });

      res.status(200).json(updatedAppointment);
      
    } else if (req.method === 'DELETE') {
      await prisma.appointment.delete({
        where: { id },
      });
      res.status(204).end();

    } else {
      res.setHeader('Allow', ['GET', 'PATCH', 'DELETE']);
      res.status(405).json({ error: `Method ${req.method} not allowed` });
    }
  } catch (error) {
    console.error(`Error handling /api/appointments/${req.query.id}:`, error);
    res.status(500).json({ error: 'Internal server error' });
  }
} 