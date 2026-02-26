import { Request, Response } from 'express';
import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

// Crear un log de actividad
export async function createActivityLog(
  userId: string,
  action: 'CREATE' | 'UPDATE' | 'DELETE',
  entityType: string,
  entityId: string,
  description: string,
  propertyId?: string,
  changes?: any
) {
  try {
    await prisma.activityLog.create({
      data: {
        userId,
        action,
        entityType,
        entityId,
        description,
        propertyId,
        changes: changes ? JSON.stringify(changes) : null,
      },
    });
  } catch (error) {
    console.error('Error creating activity log:', error);
  }
}

// Obtener todos los logs (con paginación y filtros)
export async function getActivityLogs(req: Request, res: Response) {
  try {
    const page = parseInt(req.query.page as string) || 1;
    const limit = parseInt(req.query.limit as string) || 50;
    const skip = (page - 1) * limit;

    const { entityType, userId, propertyId, action } = req.query;

    const where: any = {};
    if (entityType) where.entityType = entityType;
    if (userId) where.userId = userId;
    if (propertyId) where.propertyId = propertyId;
    if (action) where.action = action;

    const [logs, total] = await Promise.all([
      prisma.activityLog.findMany({
        where,
        include: {
          user: {
            select: {
              id: true,
              fullName: true,
              username: true,
              role: true,
            },
          },
          property: {
            select: {
              id: true,
              internalCode: true,
              propietarioNombre: true,
            },
          },
        },
        orderBy: {
          createdAt: 'desc',
        },
        skip,
        take: limit,
      }),
      prisma.activityLog.count({ where }),
    ]);

    res.json({
      logs,
      pagination: {
        page,
        limit,
        total,
        pages: Math.ceil(total / limit),
      },
    });
  } catch (error) {
    console.error('Error fetching activity logs:', error);
    res.status(500).json({ message: 'Error al obtener los registros' });
  }
}

// Obtener logs de una propiedad específica
export async function getPropertyLogs(req: Request, res: Response) {
  try {
    const { propertyId } = req.params;

    const logs = await prisma.activityLog.findMany({
      where: {
        OR: [
          { propertyId },
          { entityType: 'Property', entityId: propertyId },
        ],
      },
      include: {
        user: {
          select: {
            id: true,
            fullName: true,
            username: true,
          },
        },
      },
      orderBy: {
        createdAt: 'desc',
      },
    });

    res.json(logs);
  } catch (error) {
    console.error('Error fetching property logs:', error);
    res.status(500).json({ message: 'Error al obtener el historial' });
  }
}

// Obtener estadísticas de actividad
export async function getActivityStats(req: Request, res: Response) {
  try {
    const [totalLogs, logsByAction, logsByUser, recentLogs] = await Promise.all([
      prisma.activityLog.count(),
      prisma.activityLog.groupBy({
        by: ['action'],
        _count: true,
      }),
      prisma.activityLog.groupBy({
        by: ['userId'],
        _count: true,
        orderBy: {
          _count: {
            userId: 'desc',
          },
        },
        take: 5,
      }),
      prisma.activityLog.findMany({
        take: 10,
        orderBy: {
          createdAt: 'desc',
        },
        include: {
          user: {
            select: {
              fullName: true,
            },
          },
          property: {
            select: {
              internalCode: true,
            },
          },
        },
      }),
    ]);

    // Get user details for top users
    const userIds = logsByUser.map((log) => log.userId);
    const users = await prisma.user.findMany({
      where: {
        id: {
          in: userIds,
        },
      },
      select: {
        id: true,
        fullName: true,
      },
    });

    const topUsers = logsByUser.map((log) => ({
      user: users.find((u) => u.id === log.userId),
      count: log._count,
    }));

    res.json({
      total: totalLogs,
      byAction: logsByAction,
      topUsers,
      recent: recentLogs,
    });
  } catch (error) {
    console.error('Error fetching activity stats:', error);
    res.status(500).json({ message: 'Error al obtener estadísticas' });
  }
}
