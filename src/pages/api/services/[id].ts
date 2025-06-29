import { NextApiRequest, NextApiResponse } from 'next';
import { getServerSession } from 'next-auth';
import { options as authOptions } from '../auth/[...nextauth]';
import prisma from '@/config/prisma';

export default async function handler(
  req: NextApiRequest,
  res: NextApiResponse
) {
  if (req.method !== 'PUT' && req.method !== 'DELETE') {
    return res.status(405).json({ error: 'Method not allowed' });
  }

  try {
    const session = await getServerSession(req, res, authOptions);
    
    if (!session) {
      return res.status(401).json({ error: 'Unauthorized' });
    }

    // Solo ADMIN puede modificar servicios
    if (session.user.role !== 'ADMIN') {
      return res.status(403).json({ error: 'Solo administradores pueden modificar servicios' });
    }

    const { id } = req.query;

    if (typeof id !== 'string') {
      return res.status(400).json({ error: 'ID de servicio inválido' });
    }

    // Verificar que el servicio existe
    const existingService = await prisma.service.findUnique({
      where: { id },
    });

    if (!existingService) {
      return res.status(404).json({ error: 'Servicio no encontrado' });
    }

    if (req.method === 'PUT') {
      const { name, description, duration, price, categoryId, enabled } = req.body;

      // Validaciones básicas
      if (!name || !duration || price === undefined) {
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
      if (price < 0) {
        return res.status(400).json({ 
          error: 'El precio debe ser mayor o igual a 0' 
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

      const updatedService = await prisma.service.update({
        where: { id },
        data: {
          name,
          description: description || null,
          duration: parseInt(duration),
          price: parseFloat(price),
          categoryId: categoryId || null,
          enabled: enabled !== undefined ? enabled : true,
        },
        include: {
          category: {
            select: {
              id: true,
              name: true,
              color: true,
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

      res.status(200).json(updatedService);

    } else if (req.method === 'DELETE') {
      // En lugar de eliminar completamente, desactivamos el servicio
      const deletedService = await prisma.service.update({
        where: { id },
        data: {
          enabled: false,
        },
      });

      res.status(200).json({ 
        message: 'Servicio desactivado exitosamente',
        service: deletedService 
      });
    }
  } catch (error) {
    console.error('Error updating service:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
} 