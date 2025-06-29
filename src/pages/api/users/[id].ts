import { NextApiRequest, NextApiResponse } from 'next';
import { getServerSession } from 'next-auth/next';
import { options } from '../auth/[...nextauth]';
import prisma from '@/config/prisma';

export default async function handler(
  req: NextApiRequest,
  res: NextApiResponse
) {
  if (req.method === 'PUT') {
    return handleUpdateUser(req, res);
  }
  
  res.setHeader('Allow', ['PUT']);
  return res.status(405).json({ message: 'Método no permitido' });
}

async function handleUpdateUser(req: NextApiRequest, res: NextApiResponse) {
  try {
    // Verificar autenticación
    const session = await getServerSession(req, res, options);
    
    if (!session?.user?.email) {
      return res.status(401).json({ message: 'No autorizado' });
    }

    // Obtener usuario de la sesión
    const currentUser = await prisma.user.findUnique({
      where: { email: session.user.email },
      select: { role: true }
    });

    if (!currentUser) {
      return res.status(404).json({ message: 'Usuario no encontrado' });
    }

    // Solo ADMIN puede actualizar roles
    if (currentUser.role !== 'ADMIN') {
      return res.status(403).json({ message: 'Acceso denegado. Solo administradores.' });
    }

    const { id } = req.query;
    const { role } = req.body;

    // Validaciones
    if (!id) {
      return res.status(400).json({ message: 'ID de usuario requerido' });
    }

    if (!role) {
      return res.status(400).json({ message: 'Rol requerido' });
    }

    // Verificar que el rol sea válido
    const validRoles = ['ADMIN', 'USER', 'STAFF'];
    if (!validRoles.includes(role)) {
      return res.status(400).json({ message: 'Rol inválido' });
    }

    // Verificar que el usuario a actualizar existe
    const userToUpdate = await prisma.user.findUnique({
      where: { id: id as string },
      select: { id: true, email: true, role: true }
    });

    if (!userToUpdate) {
      return res.status(404).json({ message: 'Usuario a actualizar no encontrado' });
    }

    // Actualizar el rol del usuario
    const updatedUser = await prisma.user.update({
      where: { id: id as string },
      data: { role },
      select: {
        id: true,
        name: true,
        email: true,
        role: true,
        enabled: true,
        image: true,
        createdAt: true,
        updatedAt: true,
        _count: {
          select: {
            appointments: true
          }
        }
      }
    });

    // Formatear respuesta
    const formattedUser = {
      id: updatedUser.id,
      name: updatedUser.name || 'Usuario',
      email: updatedUser.email,
      role: updatedUser.role,
      enabled: updatedUser.enabled,
      image: updatedUser.image,
      createdAt: updatedUser.createdAt.toISOString(),
      updatedAt: updatedUser.updatedAt.toISOString(),
      appointmentsCount: updatedUser._count.appointments
    };

    return res.status(200).json({
      message: 'Rol actualizado exitosamente',
      user: formattedUser
    });
  } catch (error) {
    console.error('Error actualizando rol de usuario:', error);
    return res.status(500).json({ message: 'Error interno del servidor' });
  }
} 