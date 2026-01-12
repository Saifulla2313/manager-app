import type { FastifyInstance } from 'fastify';
import { prisma } from '../lib/prisma.js';

export async function employeesRoutes(fastify: FastifyInstance) {
  // ─────────────────────────────────────────────────────────────
  // GET /employees — список сотрудников (только для менеджера)
  // ─────────────────────────────────────────────────────────────
  fastify.get('/', { preHandler: [fastify.requireManager] }, async (request, reply) => {
    const { organizationId } = request.user;
    const today = new Date();
    today.setHours(0, 0, 0, 0);

    const employees = await prisma.user.findMany({
      where: { role: 'EMPLOYEE', organizationId },
      select: {
        id: true,
        name: true,
        position: true,
        avatar: true,
        assignedTasks: {
          select: {
            id: true,
            status: true,
            deadline: true,
          },
        },
      },
      orderBy: { name: 'asc' },
    });

    // Calculate stats for each employee
    const result = employees.map((emp) => {
      const totalToday = emp.assignedTasks.length;
      const completedToday = emp.assignedTasks.filter((t) => t.status === 'DONE').length;
      const overdue = emp.assignedTasks.filter(
        (t) => t.status === 'IN_PROGRESS' && t.deadline && new Date(t.deadline) < new Date()
      ).length;

      return {
        id: emp.id,
        name: emp.name,
        position: emp.position,
        avatar: emp.avatar,
        completedToday,
        totalToday,
        overdue,
      };
    });

    return reply.send({ employees: result });
  });

  // ─────────────────────────────────────────────────────────────
  // GET /employees/:id — профиль сотрудника
  // ─────────────────────────────────────────────────────────────
  fastify.get<{ Params: { id: string } }>('/:id', { preHandler: [fastify.authenticate] }, async (request, reply) => {
    const { id } = request.params;
    const { organizationId } = request.user;

    const employee = await prisma.user.findFirst({
      where: { id, organizationId },
      select: {
        id: true,
        name: true,
        position: true,
        avatar: true,
        role: true,
        assignedTasks: {
          orderBy: { createdAt: 'desc' },
          take: 20,
          select: {
            id: true,
            title: true,
            priority: true,
            status: true,
            deadline: true,
          },
        },
        routineTemplates: {
          select: {
            id: true,
            name: true,
            repeatTime: true,
            tasks: {
              select: {
                id: true,
                title: true,
                order: true,
              },
              orderBy: { order: 'asc' },
            },
          },
        },
        activityLogs: {
          orderBy: { createdAt: 'desc' },
          take: 10,
          select: {
            id: true,
            action: true,
            createdAt: true,
          },
        },
      },
    });

    if (!employee) {
      return reply.status(404).send({ error: 'Employee not found' });
    }

    // Calculate stats
    const completedToday = employee.assignedTasks.filter((t) => t.status === 'DONE').length;
    const overdue = employee.assignedTasks.filter(
      (t) => t.status === 'IN_PROGRESS' && t.deadline && new Date(t.deadline) < new Date()
    ).length;
    const totalAssigned = employee.assignedTasks.length;

    return reply.send({
      employee: {
        ...employee,
        stats: {
          completedToday,
          overdue,
          totalAssigned,
        },
      },
    });
  });
}

