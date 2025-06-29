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

    // Solo ADMIN puede gestionar categorías
    if (session.user.role !== 'ADMIN') {
      return res.status(403).json({ error: 'Solo administradores pueden gestionar categorías' });
    }

    const { id } = req.query;

    if (!id || typeof id !== 'string') {
      return res.status(400).json({ error: 'ID de categoría requerido' });
    }

    // Verificar que la categoría existe
    const existingCategory = await prisma.serviceCategory.findUnique({
      where: { id },
    });

    if (!existingCategory) {
      return res.status(404).json({ error: 'Categoría no encontrada' });
    }

    if (req.method === 'PUT') {
      const { name, description, color } = req.body;

      // Validaciones básicas
      if (!name) {
        return res.status(400).json({ 
          error: 'El nombre es obligatorio' 
        });
      }

      // Verificar nombre único si cambió
      if (name !== existingCategory.name) {
        const nameExists = await prisma.serviceCategory.findFirst({
          where: { 
            name,
            enabled: true,
            id: { not: id }
          },
        });

        if (nameExists) {
          return res.status(400).json({ error: 'Ya existe una categoría con ese nombre' });
        }
      }

      const updatedCategory = await prisma.serviceCategory.update({
        where: { id },
        data: {
          name,
          description: description || null,
          color: color || null,
        },
        include: {
          _count: {
            select: {
              services: true,
            },
          },
        },
      });

      return res.status(200).json(updatedCategory);

    } else if (req.method === 'DELETE') {
      // Verificar si la categoría tiene servicios asociados
      const servicesCount = await prisma.service.count({
        where: {
          categoryId: id,
          enabled: true,
        },
      });

      if (servicesCount > 0) {
        return res.status(400).json({ 
          error: 'No se puede eliminar una categoría que tiene servicios asociados' 
        });
      }

      // Soft delete de la categoría
      await prisma.serviceCategory.update({
        where: { id },
        data: { enabled: false },
      });

      return res.status(200).json({ message: 'Categoría eliminada exitosamente' });

    } else {
      return res.status(405).json({ error: 'Method not allowed' });
    }

  } catch (error) {
    console.error('Error handling category:', error);
    return res.status(500).json({ error: 'Internal server error' });
  }
} 