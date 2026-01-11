import type { FastifyInstance } from 'fastify';
import { z } from 'zod';
import { prisma } from '../lib/prisma.js';

const createTemplateSchema = z.object({
  name: z.string().min(1),
  employeeId: z.string(),
  repeatTime: z.string().regex(/^\d{2}:\d{2}$/).default('09:00'),
  tasks: z.array(z.string().min(1)).min(1),
});

const updateTemplateSchema = z.object({
  name: z.string().min(1).optional(),
  repeatTime: z.string().regex(/^\d{2}:\d{2}$/).optional(),
  tasks: z.array(z.string().min(1)).optional(),
});

export async function routinesRoutes(fastify: FastifyInstance) {
  // ─────────────────────────────────────────────────────────────
  // GET /routines — список шаблонов
  // ─────────────────────────────────────────────────────────────
  fastify.get('/', { preHandler: [fastify.authenticate] }, async (request, reply) => {
    const { userId, role } = request.user;

    const where = role === 'MANAGER' ? {} : { employeeId: userId };

    const templates = await prisma.routineTemplate.findMany({
      where,
      orderBy: { createdAt: 'desc' },
      include: {
        employee: {
          select: { id: true, name: true, position: true },
        },
        tasks: {
          orderBy: { order: 'asc' },
          select: { id: true, title: true, order: true },
        },
      },
    });

    return reply.send({ templates });
  });

  // ─────────────────────────────────────────────────────────────
  // GET /routines/:id — детали шаблона
  // ─────────────────────────────────────────────────────────────
  fastify.get<{ Params: { id: string } }>('/:id', { preHandler: [fastify.authenticate] }, async (request, reply) => {
    const { id } = request.params;

    const template = await prisma.routineTemplate.findUnique({
      where: { id },
      include: {
        employee: {
          select: { id: true, name: true, position: true },
        },
        tasks: {
          orderBy: { order: 'asc' },
          select: { id: true, title: true, order: true },
        },
      },
    });

    if (!template) {
      return reply.status(404).send({ error: 'Template not found' });
    }

    return reply.send({ template });
  });

  // ─────────────────────────────────────────────────────────────
  // POST /routines — создать шаблон (только менеджер)
  // ─────────────────────────────────────────────────────────────
  fastify.post('/', { preHandler: [fastify.requireManager] }, async (request, reply) => {
    const parsed = createTemplateSchema.safeParse(request.body);
    if (!parsed.success) {
      return reply.status(400).send({ error: 'Validation failed', details: parsed.error.flatten() });
    }

    const { name, employeeId, repeatTime, tasks } = parsed.data;

    // Verify employee exists
    const employee = await prisma.user.findUnique({ where: { id: employeeId } });
    if (!employee) {
      return reply.status(404).send({ error: 'Employee not found' });
    }

    const template = await prisma.routineTemplate.create({
      data: {
        name,
        employeeId,
        repeatTime,
        tasks: {
          create: tasks.map((title, index) => ({
            title,
            order: index,
          })),
        },
      },
      include: {
        employee: {
          select: { id: true, name: true },
        },
        tasks: {
          orderBy: { order: 'asc' },
        },
      },
    });

    return reply.status(201).send({ template });
  });

  // ─────────────────────────────────────────────────────────────
  // PATCH /routines/:id — обновить шаблон (только менеджер)
  // ─────────────────────────────────────────────────────────────
  fastify.patch<{ Params: { id: string } }>('/:id', { preHandler: [fastify.requireManager] }, async (request, reply) => {
    const { id } = request.params;

    const parsed = updateTemplateSchema.safeParse(request.body);
    if (!parsed.success) {
      return reply.status(400).send({ error: 'Validation failed', details: parsed.error.flatten() });
    }

    const existing = await prisma.routineTemplate.findUnique({ where: { id } });
    if (!existing) {
      return reply.status(404).send({ error: 'Template not found' });
    }

    const { name, repeatTime, tasks } = parsed.data;

    // If tasks provided, replace all tasks
    if (tasks) {
      await prisma.routineTask.deleteMany({ where: { templateId: id } });
      await prisma.routineTask.createMany({
        data: tasks.map((title, index) => ({
          title,
          order: index,
          templateId: id,
        })),
      });
    }

    const template = await prisma.routineTemplate.update({
      where: { id },
      data: {
        ...(name && { name }),
        ...(repeatTime && { repeatTime }),
      },
      include: {
        tasks: {
          orderBy: { order: 'asc' },
        },
      },
    });

    return reply.send({ template });
  });

  // ─────────────────────────────────────────────────────────────
  // DELETE /routines/:id — удалить шаблон (только менеджер)
  // ─────────────────────────────────────────────────────────────
  fastify.delete<{ Params: { id: string } }>('/:id', { preHandler: [fastify.requireManager] }, async (request, reply) => {
    const { id } = request.params;

    const template = await prisma.routineTemplate.findUnique({ where: { id } });
    if (!template) {
      return reply.status(404).send({ error: 'Template not found' });
    }

    await prisma.routineTemplate.delete({ where: { id } });

    return reply.send({ success: true });
  });

  // ─────────────────────────────────────────────────────────────
  // GET /routines/:id/progress/:date — прогресс за день
  // ─────────────────────────────────────────────────────────────
  fastify.get<{ Params: { id: string; date: string } }>(
    '/:id/progress/:date',
    { preHandler: [fastify.authenticate] },
    async (request, reply) => {
      const { id, date } = request.params;

      const template = await prisma.routineTemplate.findUnique({
        where: { id },
        include: {
          tasks: { orderBy: { order: 'asc' } },
        },
      });

      if (!template) {
        return reply.status(404).send({ error: 'Template not found' });
      }

      const dateObj = new Date(date);
      dateObj.setHours(0, 0, 0, 0);

      let progress = await prisma.dailyRoutineProgress.findUnique({
        where: {
          templateId_date: {
            templateId: id,
            date: dateObj,
          },
        },
        include: {
          completions: true,
        },
      });

      // If no progress record exists, create one
      if (!progress) {
        progress = await prisma.dailyRoutineProgress.create({
          data: {
            templateId: id,
            date: dateObj,
          },
          include: {
            completions: true,
          },
        });
      }

      // Map tasks with their completion status
      const tasksWithStatus = template.tasks.map((task) => {
        const completion = progress!.completions.find((c) => c.taskId === task.id);
        return {
          id: task.id,
          title: task.title,
          order: task.order,
          completed: !!completion?.completedAt,
          completedAt: completion?.completedAt,
          photos: completion?.photos ?? [],
        };
      });

      return reply.send({
        progress: {
          id: progress.id,
          date: progress.date,
          comments: progress.comments,
          tasks: tasksWithStatus,
        },
      });
    }
  );

  // ─────────────────────────────────────────────────────────────
  // POST /routines/:id/progress/:date/tasks/:taskId/complete
  // ─────────────────────────────────────────────────────────────
  fastify.post<{ Params: { id: string; date: string; taskId: string } }>(
    '/:id/progress/:date/tasks/:taskId/complete',
    { preHandler: [fastify.authenticate] },
    async (request, reply) => {
      const { id, date, taskId } = request.params;
      const { userId } = request.user;

      const schema = z.object({
        completed: z.boolean(),
        photos: z.array(z.string()).optional(),
      });
      const parsed = schema.safeParse(request.body);
      if (!parsed.success) {
        return reply.status(400).send({ error: 'Validation failed' });
      }

      const dateObj = new Date(date);
      dateObj.setHours(0, 0, 0, 0);

      // Get or create progress
      let progress = await prisma.dailyRoutineProgress.findUnique({
        where: {
          templateId_date: {
            templateId: id,
            date: dateObj,
          },
        },
      });

      if (!progress) {
        progress = await prisma.dailyRoutineProgress.create({
          data: {
            templateId: id,
            date: dateObj,
          },
        });
      }

      // Upsert completion
      const completion = await prisma.routineTaskCompletion.upsert({
        where: {
          taskId_progressId: {
            taskId,
            progressId: progress.id,
          },
        },
        update: {
          completedAt: parsed.data.completed ? new Date() : null,
          photos: parsed.data.photos ?? [],
        },
        create: {
          taskId,
          progressId: progress.id,
          completedAt: parsed.data.completed ? new Date() : null,
          photos: parsed.data.photos ?? [],
        },
      });

      // Log activity
      const task = await prisma.routineTask.findUnique({ where: { id: taskId } });
      if (task && parsed.data.completed) {
        await prisma.activityLog.create({
          data: {
            action: `Отмечено "${task.title}" как выполнено`,
            userId,
          },
        });
      }

      return reply.send({ completion });
    }
  );
}

