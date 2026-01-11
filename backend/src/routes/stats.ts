import type { FastifyInstance } from 'fastify';
import { prisma } from '../lib/prisma.js';

export async function statsRoutes(fastify: FastifyInstance) {
  // ─────────────────────────────────────────────────────────────
  // GET /stats/dashboard — статистика для дашборда менеджера
  // ─────────────────────────────────────────────────────────────
  fastify.get('/dashboard', { preHandler: [fastify.requireManager] }, async (request, reply) => {
    const now = new Date();

    // Get all tasks
    const tasks = await prisma.instantTask.findMany({
      select: {
        id: true,
        status: true,
        deadline: true,
        updatedAt: true,
      },
    });

    const completedToday = tasks.filter((t) => {
      if (t.status !== 'DONE') return false;
      const updated = new Date(t.updatedAt);
      return (
        updated.getDate() === now.getDate() &&
        updated.getMonth() === now.getMonth() &&
        updated.getFullYear() === now.getFullYear()
      );
    }).length;

    const overdue = tasks.filter(
      (t) => t.status === 'IN_PROGRESS' && t.deadline && new Date(t.deadline) < now
    ).length;

    const pending = tasks.filter((t) => t.status === 'IN_PROGRESS').length;

    // Recent activity
    const recentActivity = await prisma.activityLog.findMany({
      orderBy: { createdAt: 'desc' },
      take: 10,
      include: {
        user: {
          select: { id: true, name: true },
        },
      },
    });

    // Employee count
    const employeeCount = await prisma.user.count({ where: { role: 'EMPLOYEE' } });

    // Active routine templates
    const routineTemplateCount = await prisma.routineTemplate.count();

    return reply.send({
      stats: {
        completedToday,
        overdue,
        pending,
        employeeCount,
        routineTemplateCount,
      },
      recentActivity: recentActivity.map((a) => ({
        id: a.id,
        employee: a.user.name,
        action: a.action,
        time: a.createdAt,
      })),
    });
  });

  // ─────────────────────────────────────────────────────────────
  // GET /stats/employee — статистика для сотрудника
  // ─────────────────────────────────────────────────────────────
  fastify.get('/employee', { preHandler: [fastify.authenticate] }, async (request, reply) => {
    const { userId } = request.user;
    const now = new Date();

    const tasks = await prisma.instantTask.findMany({
      where: { assigneeId: userId },
      select: {
        id: true,
        status: true,
        deadline: true,
        updatedAt: true,
      },
    });

    const completedToday = tasks.filter((t) => {
      if (t.status !== 'DONE') return false;
      const updated = new Date(t.updatedAt);
      return (
        updated.getDate() === now.getDate() &&
        updated.getMonth() === now.getMonth() &&
        updated.getFullYear() === now.getFullYear()
      );
    }).length;

    const overdue = tasks.filter(
      (t) => t.status === 'IN_PROGRESS' && t.deadline && new Date(t.deadline) < now
    ).length;

    const pendingToday = tasks.filter((t) => t.status === 'IN_PROGRESS').length;

    return reply.send({
      stats: {
        completedToday,
        pendingToday,
        overdue,
      },
    });
  });
}

