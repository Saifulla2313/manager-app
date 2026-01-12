import { FastifyInstance } from 'fastify';
import { z } from 'zod';
import { prisma } from '../lib/prisma';
import bcrypt from 'bcryptjs';

const createOrganizationSchema = z.object({
  organizationName: z.string().min(2).max(100),
  managerName: z.string().min(2).max(100),
  managerEmail: z.string().email(),
  managerPassword: z.string().min(6),
  managerPhone: z.string().optional(),
});

const inviteEmployeeSchema = z.object({
  phone: z.string().regex(/^\+?\d{10,15}$/, 'Invalid phone number'),
});

const registerByInviteSchema = z.object({
  inviteCode: z.string().min(6).max(10),
  name: z.string().min(2).max(100),
  email: z.string().email(),
  password: z.string().min(6),
  position: z.string().optional(),
});

export default async function organizationRoutes(app: FastifyInstance) {
  // ──────────────────────────────────────────────────────────────
  // Создать организацию + главный аккаунт менеджера (публичный роут)
  // ──────────────────────────────────────────────────────────────
  app.post('/organizations', async (request, reply) => {
    try {
      const body = createOrganizationSchema.parse(request.body);

      // Проверка уникальности email
      const existingUser = await prisma.user.findUnique({
        where: { email: body.managerEmail },
      });

      if (existingUser) {
        return reply.status(409).send({ error: 'Email already in use' });
      }

      // Создаём организацию + менеджера в транзакции
      const hashedPassword = await bcrypt.hash(body.managerPassword, 12);

      const result = await prisma.$transaction(async (tx) => {
        // Создаём организацию
        const organization = await tx.organization.create({
          data: {
            name: body.organizationName,
          },
        });

        // Создаём менеджера
        const manager = await tx.user.create({
          data: {
            email: body.managerEmail,
            password: hashedPassword,
            name: body.managerName,
            phone: body.managerPhone,
            role: 'MANAGER',
            organizationId: organization.id,
          },
        });

        return { organization, manager };
      });

      // Генерируем JWT токен
      const token = app.jwt.sign({
        userId: result.manager.id,
        role: result.manager.role,
        organizationId: result.organization.id,
      });

      return reply.status(201).send({
        token,
        user: {
          id: result.manager.id,
          email: result.manager.email,
          name: result.manager.name,
          role: result.manager.role,
        },
        organization: {
          id: result.organization.id,
          name: result.organization.name,
        },
      });
    } catch (error) {
      if (error instanceof z.ZodError) {
        return reply.status(400).send({ error: error.errors });
      }
      console.error('Error creating organization:', error);
      return reply.status(500).send({ error: 'Internal server error' });
    }
  });

  // ──────────────────────────────────────────────────────────────
  // Получить информацию о своей организации
  // ──────────────────────────────────────────────────────────────
  app.get('/organizations/me', {
    onRequest: [app.authenticate],
    handler: async (request, reply) => {
      try {
        const { organizationId } = request.user;

        const organization = await prisma.organization.findUnique({
          where: { id: organizationId },
          include: {
            _count: {
              select: {
                users: true,
                instantTasks: true,
                routineTemplates: true,
              },
            },
          },
        });

        if (!organization) {
          return reply.status(404).send({ error: 'Organization not found' });
        }

        return reply.send(organization);
      } catch (error) {
        console.error('Error fetching organization:', error);
        return reply.status(500).send({ error: 'Internal server error' });
      }
    },
  });

  // ──────────────────────────────────────────────────────────────
  // Пригласить сотрудника по номеру телефона (только MANAGER)
  // ──────────────────────────────────────────────────────────────
  app.post('/organizations/invites', {
    onRequest: [app.authenticate],
    handler: async (request, reply) => {
      try {
        const { userId, role, organizationId } = request.user;

        if (role !== 'MANAGER') {
          return reply.status(403).send({ error: 'Only managers can invite employees' });
        }

        const body = inviteEmployeeSchema.parse(request.body);

        // Проверяем, нет ли уже активного инвайта для этого номера
        const existingInvite = await prisma.invite.findFirst({
          where: {
            phone: body.phone,
            organizationId,
            status: 'PENDING',
            expiresAt: { gte: new Date() },
          },
        });

        if (existingInvite) {
          return reply.status(409).send({
            error: 'Active invite already exists for this phone number',
            invite: existingInvite,
          });
        }

        // Генерируем уникальный 6-значный код
        const code = Math.random().toString(36).substring(2, 8).toUpperCase();

        // Создаём инвайт
        const invite = await prisma.invite.create({
          data: {
            phone: body.phone,
            code,
            status: 'PENDING',
            expiresAt: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000), // 7 дней
            organizationId,
            createdById: userId,
          },
          include: {
            organization: true,
            createdBy: true,
          },
        });

        // Отправляем WhatsApp сообщение
        const { whatsappService } = await import('../services/whatsapp.js');
        await whatsappService.sendInvite({
          phone: body.phone,
          inviteCode: invite.code,
          organizationName: invite.organization.name,
          managerName: invite.createdBy.name,
        });

        return reply.status(201).send({
          invite: {
            id: invite.id,
            phone: invite.phone,
            code: invite.code,
            expiresAt: invite.expiresAt,
            status: invite.status,
          },
        });
      } catch (error) {
        if (error instanceof z.ZodError) {
          return reply.status(400).send({ error: error.errors });
        }
        console.error('Error creating invite:', error);
        return reply.status(500).send({ error: 'Internal server error' });
      }
    },
  });

  // ──────────────────────────────────────────────────────────────
  // Получить список инвайтов (только MANAGER)
  // ──────────────────────────────────────────────────────────────
  app.get('/organizations/invites', {
    onRequest: [app.authenticate],
    handler: async (request, reply) => {
      try {
        const { role, organizationId } = request.user;

        if (role !== 'MANAGER') {
          return reply.status(403).send({ error: 'Only managers can view invites' });
        }

        const invites = await prisma.invite.findMany({
          where: { organizationId },
          include: {
            createdBy: {
              select: { id: true, name: true, email: true },
            },
            usedBy: {
              select: { id: true, name: true, email: true },
            },
          },
          orderBy: { createdAt: 'desc' },
        });

        return reply.send({ invites });
      } catch (error) {
        console.error('Error fetching invites:', error);
        return reply.status(500).send({ error: 'Internal server error' });
      }
    },
  });

  // ──────────────────────────────────────────────────────────────
  // Регистрация сотрудника по инвайт-коду (публичный роут)
  // ──────────────────────────────────────────────────────────────
  app.post('/organizations/register-by-invite', async (request, reply) => {
    try {
      const body = registerByInviteSchema.parse(request.body);

      // Ищем инвайт
      const invite = await prisma.invite.findUnique({
        where: { code: body.inviteCode },
        include: { organization: true },
      });

      if (!invite) {
        return reply.status(404).send({ error: 'Invalid invite code' });
      }

      if (invite.status !== 'PENDING') {
        return reply.status(400).send({ error: 'Invite already used' });
      }

      if (invite.expiresAt < new Date()) {
        await prisma.invite.update({
          where: { id: invite.id },
          data: { status: 'EXPIRED' },
        });
        return reply.status(400).send({ error: 'Invite expired' });
      }

      // Проверка уникальности email
      const existingUser = await prisma.user.findUnique({
        where: { email: body.email },
      });

      if (existingUser) {
        return reply.status(409).send({ error: 'Email already in use' });
      }

      // Создаём сотрудника
      const hashedPassword = await bcrypt.hash(body.password, 12);

      const employee = await prisma.user.create({
        data: {
          email: body.email,
          password: hashedPassword,
          name: body.name,
          phone: invite.phone,
          position: body.position,
          role: 'EMPLOYEE',
          organizationId: invite.organizationId,
        },
      });

      // Обновляем инвайт
      await prisma.invite.update({
        where: { id: invite.id },
        data: {
          status: 'ACCEPTED',
          usedAt: new Date(),
          usedById: employee.id,
        },
      });

      // Генерируем JWT токен
      const token = app.jwt.sign({
        userId: employee.id,
        role: employee.role,
        organizationId: invite.organizationId,
      });

      return reply.status(201).send({
        token,
        user: {
          id: employee.id,
          email: employee.email,
          name: employee.name,
          role: employee.role,
        },
        organization: {
          id: invite.organization.id,
          name: invite.organization.name,
        },
      });
    } catch (error) {
      if (error instanceof z.ZodError) {
        return reply.status(400).send({ error: error.errors });
      }
      console.error('Error registering by invite:', error);
      return reply.status(500).send({ error: 'Internal server error' });
    }
  });

  // ──────────────────────────────────────────────────────────────
  // Удалить/отменить инвайт (только MANAGER)
  // ──────────────────────────────────────────────────────────────
  app.delete('/organizations/invites/:inviteId', {
    onRequest: [app.authenticate],
    handler: async (request, reply) => {
      try {
        const { role, organizationId } = request.user;
        const { inviteId } = request.params as { inviteId: string };

        if (role !== 'MANAGER') {
          return reply.status(403).send({ error: 'Only managers can delete invites' });
        }

        const invite = await prisma.invite.findUnique({
          where: { id: inviteId },
        });

        if (!invite || invite.organizationId !== organizationId) {
          return reply.status(404).send({ error: 'Invite not found' });
        }

        await prisma.invite.delete({
          where: { id: inviteId },
        });

        return reply.status(204).send();
      } catch (error) {
        console.error('Error deleting invite:', error);
        return reply.status(500).send({ error: 'Internal server error' });
      }
    },
  });
}
