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
      const categories = await prisma.serviceCategory.findMany({
        where: {
          enabled: true,
        },
        select: {
          id: true,
          name: true,
          description: true,
          color: true,
          createdAt: true,
          _count: {
            select: {
              services: true,
            },
          },
        },
        orderBy: {
          name: 'asc',
        },
      });

      res.status(200).json(categories);

    } else if (req.method === 'POST') {
      // Solo ADMIN puede crear categorías
      if (session.user.role !== 'ADMIN') {
        return res.status(403).json({ error: 'Solo administradores pueden crear categorías' });
      }

      const { name, description, color } = req.body;

      // Validaciones básicas
      if (!name) {
        return res.status(400).json({ 
          error: 'El nombre es obligatorio' 
        });
      }

      // Verificar nombre único
      const nameExists = await prisma.serviceCategory.findFirst({
        where: { 
          name,
          enabled: true 
        },
      });

      if (nameExists) {
        return res.status(400).json({ error: 'Ya existe una categoría con ese nombre' });
      }

      const category = await prisma.serviceCategory.create({
        data: {
          name,
          description: description || null,
          color: color || null,
          enabled: true,
        },
        include: {
          _count: {
            select: {
              services: true,
            },
          },
        },
      });

      res.status(201).json(category);
    }
  } catch (error) {
    console.error('Error fetching categories:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
} 