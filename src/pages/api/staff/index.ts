import { NextApiRequest, NextApiResponse } from 'next';
import { getServerSession } from 'next-auth';
import { options as authOptions } from '../auth/[...nextauth]';
import prisma from '@/config/prisma';

export default async function handler(
  req: NextApiRequest,
  res: NextApiResponse
) {
  if (req.method !== 'GET') {
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

    const staff = await prisma.user.findMany({
      where: {
        OR: [
          { role: 'STAFF' },
          { role: 'ADMIN' },
        ],
        enabled: true,
        deleted: false,
      },
      select: {
        id: true,
        name: true,
        email: true,
        role: true,
      },
      orderBy: {
        name: 'asc',
      },
    });

    res.status(200).json(staff);
  } catch (error) {
    console.error('Error fetching staff:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
} 