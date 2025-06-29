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

    const { id } = req.query;

    if (!id || typeof id !== 'string') {
      return res.status(400).json({ error: 'ID de cliente requerido' });
    }

    // Verificar que el cliente existe
    const existingCustomer = await prisma.customer.findUnique({
      where: { id },
    });

    if (!existingCustomer) {
      return res.status(404).json({ error: 'Cliente no encontrado' });
    }

    if (req.method === 'PUT') {
      const { firstName, lastName, email, phone, address, dateOfBirth, notes } = req.body;

      // Validaciones básicas
      if (!firstName || !lastName) {
        return res.status(400).json({ 
          error: 'Nombre y apellido son obligatorios' 
        });
      }

      // Verificar email único si se proporciona
      if (email && email !== existingCustomer.email) {
        const emailExists = await prisma.customer.findUnique({
          where: { email },
        });

        if (emailExists) {
          return res.status(400).json({ error: 'El email ya está en uso' });
        }
      }

      const updatedCustomer = await prisma.customer.update({
        where: { id },
        data: {
          firstName,
          lastName,
          email: email || null,
          phone: phone || null,
          address: address || null,
          dateOfBirth: dateOfBirth ? new Date(dateOfBirth) : null,
          notes: notes || null,
        },
        include: {
          creator: {
            select: {
              id: true,
              name: true,
            },
          },
          _count: {
            select: {
              appointments: true,
            },
          },
        },
      });

      return res.status(200).json(updatedCustomer);

    } else if (req.method === 'DELETE') {
      // Verificar si el cliente tiene citas pendientes
      const pendingAppointments = await prisma.appointment.count({
        where: {
          customerId: id,
          status: {
            in: ['PENDING', 'CONFIRMED', 'IN_PROGRESS'],
          },
        },
      });

      if (pendingAppointments > 0) {
        return res.status(400).json({ 
          error: 'No se puede eliminar un cliente con citas pendientes' 
        });
      }

      // Soft delete del cliente
      await prisma.customer.update({
        where: { id },
        data: { enabled: false },
      });

      return res.status(200).json({ message: 'Cliente eliminado exitosamente' });

    } else {
      return res.status(405).json({ error: 'Method not allowed' });
    }

  } catch (error) {
    console.error('Error handling customer:', error);
    return res.status(500).json({ error: 'Internal server error' });
  }
} 