import { NextApiRequest, NextApiResponse } from 'next';
import { getServerSession } from 'next-auth';
import { options as authOptions } from '../auth/[...nextauth]';
import prisma from '@/config/prisma';

export default async function handler(
  req: NextApiRequest,
  res: NextApiResponse
) {
  if (req.method !== 'GET' && req.method !== 'POST') {
    return res.status(405).json({ error: 'Method not allowed' });
  }

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
      const customers = await prisma.customer.findMany({
        where: {
          enabled: true,
        },
        select: {
          id: true,
          firstName: true,
          lastName: true,
          email: true,
          phone: true,
          address: true,
          dateOfBirth: true,
          notes: true,
          createdAt: true,
          _count: {
            select: {
              appointments: true,
            },
          },
        },
        orderBy: [
          { firstName: 'asc' },
          { lastName: 'asc' },
        ],
      });

      res.status(200).json(customers);

    } else if (req.method === 'POST') {
      const { firstName, lastName, email, phone, address, dateOfBirth, notes } = req.body;

      // Validaciones básicas
      if (!firstName || !lastName) {
        return res.status(400).json({ 
          error: 'Nombre y apellido son obligatorios' 
        });
      }

      // Verificar email único si se proporciona
      if (email) {
        const emailExists = await prisma.customer.findUnique({
          where: { email },
        });

        if (emailExists) {
          return res.status(400).json({ error: 'El email ya está en uso' });
        }
      }

      const customer = await prisma.customer.create({
        data: {
          firstName,
          lastName,
          email: email || null,
          phone: phone || null,
          address: address || null,
          dateOfBirth: dateOfBirth ? new Date(dateOfBirth) : null,
          notes: notes || null,
          createdBy: session.user.id,
          enabled: true,
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

      res.status(201).json(customer);
    }
  } catch (error) {
    console.error('Error fetching customers:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
} 