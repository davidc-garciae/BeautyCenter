import { NextApiRequest, NextApiResponse } from 'next';
import { getServerSession } from 'next-auth/next';
import { options } from '../auth/[...nextauth]';
import prisma from '@/config/prisma';

export default async function handler(
  req: NextApiRequest,
  res: NextApiResponse
) {
  if (req.method === 'GET') {
    return handleGetUsers(req, res);
  }
  
  res.setHeader('Allow', ['GET']);
  return res.status(405).json({ message: 'Método no permitido' });
}

async function handleGetUsers(req: NextApiRequest, res: NextApiResponse) {
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

    // Solo ADMIN puede ver la lista de usuarios
    if (currentUser.role !== 'ADMIN') {
      return res.status(403).json({ message: 'Acceso denegado. Solo administradores.' });
    }

    // Obtener todos los usuarios
    const users = await prisma.user.findMany({
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
      },
      orderBy: {
        createdAt: 'desc'
      }
    });

    // Formatear los datos para la respuesta
    const formattedUsers = users.map(user => ({
      id: user.id,
      name: user.name || 'Usuario',
      email: user.email,
      role: user.role,
      enabled: user.enabled,
      image: user.image,
      createdAt: user.createdAt.toISOString(),
      updatedAt: user.updatedAt.toISOString(),
      appointmentsCount: user._count.appointments
    }));

    return res.status(200).json(formattedUsers);
  } catch (error) {
    console.error('Error obteniendo usuarios:', error);
    return res.status(500).json({ message: 'Error interno del servidor' });
  }
} 