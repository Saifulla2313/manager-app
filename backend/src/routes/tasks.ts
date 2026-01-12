import type { FastifyInstance } from 'fastify';
import { z } from 'zod';
import { prisma } from '../lib/prisma.js';
import { notifyNewTask, notifyTaskCompleted, notifyNewComment } from '../services/push.js';

const createTaskSchema = z.object({
  title: z.string().min(1),
  description: z.string().optional(),
  priority: z.enum(['LOW', 'MEDIUM', 'HIGH']).default('MEDIUM'),
  deadline: z.string().datetime().optional(),
  assigneeId: z.string(),
  photos: z.array(z.string()).optional(),
});

const updateTaskSchema = z.object({
  title: z.string().min(1).optional(),
  description: z.string().optional(),
  priority: z.enum(['LOW', 'MEDIUM', 'HIGH']).optional(),
  status: z.enum(['IN_PROGRESS', 'DONE']).optional(),
  deadline: z.string().datetime().optional(),
  completionPhotos: z.array(z.string()).optional(),
});

export async function tasksRoutes(fastify: FastifyInstance) {
  // ─────────────────────────────────────────────────────────────
  // GET /tasks — список задач
  // ─────────────────────────────────────────────────────────────
  fastify.get('/', { preHandler: [fastify.authenticate] }, async (request, reply) => {
    const { userId, role, organizationId } = request.user;

    const where = role === 'MANAGER' 
      ? { organizationId } 
      : { assigneeId: userId, organizationId };

    const tasks = await prisma.instantTask.findMany({
      where,
      orderBy: [{ status: 'asc' }, { deadline: 'asc' }, { createdAt: 'desc' }],
      select: {
        id: true,
        title: true,
        description: true,
        priority: true,
        status: true,
        deadline: true,
        photos: true,
        completionPhotos: true,
        createdAt: true,
        assignee: {
          select: {
            id: true,
            name: true,
            avatar: true,
          },
        },
        creator: {
          select: {
            id: true,
            name: true,
          },
        },
        _count: {
          select: { comments: true },
        },
      },
    });

    return reply.send({ tasks });
  });

  // ─────────────────────────────────────────────────────────────
  // GET /tasks/:id — детали задачи
  // ─────────────────────────────────────────────────────────────
  fastify.get<{ Params: { id: string } }>('/:id', { preHandler: [fastify.authenticate] }, async (request, reply) => {
    const { id } = request.params;
    const { organizationId } = request.user;

    const task = await prisma.instantTask.findFirst({
      where: { id, organizationId },
      include: {
        assignee: {
          select: {
            id: true,
            name: true,
            position: true,
            avatar: true,
          },
        },
        creator: {
          select: {
            id: true,
            name: true,
          },
        },
        comments: {
          orderBy: { createdAt: 'asc' },
          include: {
            author: {
              select: {
                id: true,
                name: true,
                role: true,
              },
            },
          },
        },
      },
    });

    if (!task) {
      return reply.status(404).send({ error: 'Task not found' });
    }

    return reply.send({ task });
  });

  // ─────────────────────────────────────────────────────────────
  // POST /tasks — создать задачу (только менеджер)
  // ─────────────────────────────────────────────────────────────
  fastify.post('/', { preHandler: [fastify.requireManager] }, async (request, reply) => {
    const parsed = createTaskSchema.safeParse(request.body);
    if (!parsed.success) {
      return reply.status(400).send({ error: 'Validation failed', details: parsed.error.flatten() });
    }

    const { title, description, priority, deadline, assigneeId, photos } = parsed.data;
    const creatorId = request.user.userId;
    const { organizationId } = request.user;

    // Verify assignee exists and is in same organization
    const assignee = await prisma.user.findFirst({ 
      where: { id: assigneeId, organizationId } 
    });
    if (!assignee) {
      return reply.status(404).send({ error: 'Assignee not found in your organization' });
    }

    const task = await prisma.instantTask.create({
      data: {
        title,
        description,
        priority,
        deadline: deadline ? new Date(deadline) : null,
        photos: photos ?? [],
        organizationId,
        assigneeId,
        creatorId,
      },
      include: {
        assignee: {
          select: { id: true, name: true },
        },
      },
    });

    // Create notification for assignee
    await prisma.notification.create({
      data: {
        type: 'NEW_TASK',
        title: 'Назначена новая задача',
        message: title,
        userId: assigneeId,
        taskId: task.id,
      },
    });

    // Send push notification
    const creator = await prisma.user.findUnique({ 
      where: { id: creatorId }, 
      select: { name: true } 
    });
    notifyNewTask(assigneeId, task.id, title, creator?.name ?? 'Менеджер');

    // Log activity
    await prisma.activityLog.create({
      data: {
        action: `Создана задача "${title}"`,
        userId: creatorId,
      },
    });

    return reply.status(201).send({ task });
  });

  // ─────────────────────────────────────────────────────────────
  // PATCH /tasks/:id — обновить задачу
  // ─────────────────────────────────────────────────────────────
  fastify.patch<{ Params: { id: string } }>('/:id', { preHandler: [fastify.authenticate] }, async (request, reply) => {
    const { id } = request.params;
    const { userId, role } = request.user;

    const parsed = updateTaskSchema.safeParse(request.body);
    if (!parsed.success) {
      return reply.status(400).send({ error: 'Validation failed', details: parsed.error.flatten() });
    }

    // Check task exists
    const existing = await prisma.instantTask.findUnique({ where: { id } });
    if (!existing) {
      return reply.status(404).send({ error: 'Task not found' });
    }

    // Only manager or assignee can update
    if (role !== 'MANAGER' && existing.assigneeId !== userId) {
      return reply.status(403).send({ error: 'Forbidden' });
    }

    const { title, description, priority, status, deadline, completionPhotos } = parsed.data;

    const task = await prisma.instantTask.update({
      where: { id },
      data: {
        ...(title && { title }),
        ...(description !== undefined && { description }),
        ...(priority && { priority }),
        ...(status && { status }),
        ...(deadline && { deadline: new Date(deadline) }),
        ...(completionPhotos && { completionPhotos }),
      },
    });

    // If status changed to DONE, create notification & log
    if (status === 'DONE' && existing.status !== 'DONE') {
      await prisma.notification.create({
        data: {
          type: 'COMPLETED',
          title: 'Задача выполнена',
          message: `Задача "${task.title}" выполнена`,
          userId: existing.creatorId,
          taskId: task.id,
        },
      });

      // Send push notification to manager
      const employee = await prisma.user.findUnique({ 
        where: { id: existing.assigneeId }, 
        select: { name: true } 
      });
      notifyTaskCompleted(existing.creatorId, task.id, task.title, employee?.name ?? 'Сотрудник');

      await prisma.activityLog.create({
        data: {
          action: `Завершена задача "${task.title}"`,
          userId,
        },
      });
    }

    return reply.send({ task });
  });

  // ─────────────────────────────────────────────────────────────
  // DELETE /tasks/:id — удалить задачу (только менеджер)
  // ─────────────────────────────────────────────────────────────
  fastify.delete<{ Params: { id: string } }>('/:id', { preHandler: [fastify.requireManager] }, async (request, reply) => {
    const { id } = request.params;

    const task = await prisma.instantTask.findUnique({ where: { id } });
    if (!task) {
      return reply.status(404).send({ error: 'Task not found' });
    }

    await prisma.instantTask.delete({ where: { id } });

    return reply.send({ success: true });
  });

  // ─────────────────────────────────────────────────────────────
  // POST /tasks/:id/comments — добавить комментарий
  // ─────────────────────────────────────────────────────────────
  fastify.post<{ Params: { id: string } }>('/:id/comments', { preHandler: [fastify.authenticate] }, async (request, reply) => {
    const { id } = request.params;
    const { userId } = request.user;

    const schema = z.object({ message: z.string().min(1) });
    const parsed = schema.safeParse(request.body);
    if (!parsed.success) {
      return reply.status(400).send({ error: 'Validation failed' });
    }

    const task = await prisma.instantTask.findUnique({ where: { id } });
    if (!task) {
      return reply.status(404).send({ error: 'Task not found' });
    }

    const comment = await prisma.comment.create({
      data: {
        message: parsed.data.message,
        authorId: userId,
        taskId: id,
      },
      include: {
        author: {
          select: { id: true, name: true, role: true },
        },
      },
    });

    // Notify the other party
    const notifyUserId = userId === task.assigneeId ? task.creatorId : task.assigneeId;
    await prisma.notification.create({
      data: {
        type: 'COMMENT',
        title: 'Новый комментарий',
        message: parsed.data.message.slice(0, 100),
        userId: notifyUserId,
        taskId: id,
      },
    });

    // Send push notification
    notifyNewComment(
      notifyUserId, 
      id, 
      task.title, 
      comment.author.name, 
      parsed.data.message
    );

    await prisma.activityLog.create({
      data: {
        action: `Добавлен комментарий к "${task.title}"`,
        userId,
      },
    });

    return reply.status(201).send({ comment });
  });
}

