import type { FastifyInstance } from 'fastify';
import { prisma } from '../lib/prisma.js';

export async function notificationsRoutes(fastify: FastifyInstance) {
  // ─────────────────────────────────────────────────────────────
  // GET /notifications — список уведомлений текущего пользователя
  // ─────────────────────────────────────────────────────────────
  fastify.get('/', { preHandler: [fastify.authenticate] }, async (request, reply) => {
    const { userId } = request.user;

    const notifications = await prisma.notification.findMany({
      where: { userId },
      orderBy: { createdAt: 'desc' },
      take: 50,
      select: {
        id: true,
        type: true,
        title: true,
        message: true,
        read: true,
        createdAt: true,
        taskId: true,
      },
    });

    const unreadCount = notifications.filter((n) => !n.read).length;

    return reply.send({ notifications, unreadCount });
  });

  // ─────────────────────────────────────────────────────────────
  // PATCH /notifications/:id/read — отметить как прочитанное
  // ─────────────────────────────────────────────────────────────
  fastify.patch<{ Params: { id: string } }>(
    '/:id/read',
    { preHandler: [fastify.authenticate] },
    async (request, reply) => {
      const { id } = request.params;
      const { userId } = request.user;

      const notification = await prisma.notification.findUnique({ where: { id } });

      if (!notification) {
        return reply.status(404).send({ error: 'Notification not found' });
      }

      if (notification.userId !== userId) {
        return reply.status(403).send({ error: 'Forbidden' });
      }

      const updated = await prisma.notification.update({
        where: { id },
        data: { read: true },
      });

      return reply.send({ notification: updated });
    }
  );

  // ─────────────────────────────────────────────────────────────
  // POST /notifications/read-all — отметить все как прочитанные
  // ─────────────────────────────────────────────────────────────
  fastify.post('/read-all', { preHandler: [fastify.authenticate] }, async (request, reply) => {
    const { userId } = request.user;

    await prisma.notification.updateMany({
      where: { userId, read: false },
      data: { read: true },
    });

    return reply.send({ success: true });
  });
}

