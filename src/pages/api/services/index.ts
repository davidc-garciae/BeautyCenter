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
      const services = await prisma.service.findMany({
        where: {
          enabled: true,
        },
        include: {
          category: {
            select: {
              id: true,
              name: true,
            },
          },
          creator: {
            select: {
              id: true,
              name: true,
            },
          },
        },
        orderBy: {
          name: 'asc',
        },
      });

      res.status(200).json(services);
    } else if (req.method === 'POST') {
      // Solo ADMIN puede crear servicios
      if (session.user.role !== 'ADMIN') {
        return res.status(403).json({ error: 'Solo administradores pueden crear servicios' });
      }

      const { name, description, duration, price, categoryId } = req.body;

      // Validaciones básicas
      if (!name || !duration || !price) {
        return res.status(400).json({ 
          error: 'Campos requeridos: name, duration, price' 
        });
      }

      // Validar que la duración sea positiva
      if (duration <= 0) {
        return res.status(400).json({ 
          error: 'La duración debe ser mayor a 0 minutos' 
        });
      }

      // Validar que el precio sea positivo
      if (price <= 0) {
        return res.status(400).json({ 
          error: 'El precio debe ser mayor a 0' 
        });
      }

      // Verificar que la categoría existe si se proporciona
      if (categoryId) {
        const categoryExists = await prisma.serviceCategory.findUnique({
          where: { id: categoryId },
        });

        if (!categoryExists) {
          return res.status(404).json({ error: 'Categoría no encontrada' });
        }
      }

      const service = await prisma.service.create({
        data: {
          name,
          description: description || null,
          duration: parseInt(duration),
          price: parseFloat(price),
          categoryId: categoryId || null,
          createdBy: session.user.id,
          enabled: true,
        },
        include: {
          category: {
            select: {
              id: true,
              name: true,
            },
          },
          creator: {
            select: {
              id: true,
              name: true,
            },
          },
        },
      });

      res.status(201).json(service);
    }
  } catch (error) {
    console.error('Error fetching services:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
} 