import type { FastifyInstance } from 'fastify';
import { z } from 'zod';
import bcrypt from 'bcryptjs';
import { prisma } from '../lib/prisma.js';

const registerSchema = z.object({
  email: z.string().email(),
  password: z.string().min(6),
  name: z.string().min(2),
  position: z.string().optional(),
  role: z.enum(['MANAGER', 'EMPLOYEE']).default('EMPLOYEE'),
});

const loginSchema = z.object({
  email: z.string().email(),
  password: z.string(),
});

export async function authRoutes(fastify: FastifyInstance) {
  // ─────────────────────────────────────────────────────────────
  // POST /auth/register
  // ─────────────────────────────────────────────────────────────
  fastify.post('/register', async (request, reply) => {
    const parsed = registerSchema.safeParse(request.body);
    if (!parsed.success) {
      return reply.status(400).send({ error: 'Validation failed', details: parsed.error.flatten() });
    }

    const { email, password, name, position, role } = parsed.data;

    // Check if user exists
    const existing = await prisma.user.findUnique({ where: { email } });
    if (existing) {
      return reply.status(409).send({ error: 'User with this email already exists' });
    }

    // This route is deprecated - registration should go through invite system
    return reply.status(400).send({ 
      error: 'Direct registration is not allowed. Use invite-based registration instead.' 
    });

    /* Old code - kept for reference
    const hashedPassword = await bcrypt.hash(password, 12);
    const user = await prisma.user.create({
      data: {
        email,
        password: hashedPassword,
        name,
        position,
        role,
        organizationId: 'required',
      },
      select: {
        id: true,
        email: true,
        name: true,
        position: true,
        role: true,
        createdAt: true,
      },
    }); */
  });

  // ─────────────────────────────────────────────────────────────
  // POST /auth/login
  // ─────────────────────────────────────────────────────────────
  fastify.post('/login', async (request, reply) => {
    const parsed = loginSchema.safeParse(request.body);
    if (!parsed.success) {
      return reply.status(400).send({ error: 'Validation failed', details: parsed.error.flatten() });
    }

    const { email, password } = parsed.data;

    // Find user
    const user = await prisma.user.findUnique({ where: { email } });
    if (!user) {
      return reply.status(401).send({ error: 'Invalid credentials' });
    }

    // Verify password
    const valid = await bcrypt.compare(password, user.password);
    if (!valid) {
      return reply.status(401).send({ error: 'Invalid credentials' });
    }

    // Generate token with organizationId
    const token = fastify.jwt.sign({
      userId: user.id,
      role: user.role,
      organizationId: user.organizationId,
    });

    return reply.send({
      user: {
        id: user.id,
        email: user.email,
        name: user.name,
        position: user.position,
        role: user.role,
        avatar: user.avatar,
      },
      token,
    });
  });

  // ─────────────────────────────────────────────────────────────
  // GET /auth/me — текущий пользователь
  // ─────────────────────────────────────────────────────────────
  fastify.get('/me', { preHandler: [fastify.authenticate] }, async (request, reply) => {
    const user = await prisma.user.findUnique({
      where: { id: request.user.userId },
      select: {
        id: true,
        email: true,
        name: true,
        position: true,
        role: true,
        avatar: true,
        createdAt: true,
      },
    });

    if (!user) {
      return reply.status(404).send({ error: 'User not found' });
    }

    return reply.send({ user });
  });

  // ─────────────────────────────────────────────────────────────
  // POST /auth/push-token — сохранение push-токена
  // ─────────────────────────────────────────────────────────────
  const pushTokenSchema = z.object({
    pushToken: z.string().min(1),
    platform: z.enum(['ios', 'android', 'web']).optional(),
  });

  fastify.post('/push-token', { preHandler: [fastify.authenticate] }, async (request, reply) => {
    const parsed = pushTokenSchema.safeParse(request.body);
    if (!parsed.success) {
      return reply.status(400).send({ error: 'Invalid push token' });
    }

    const { pushToken, platform } = parsed.data;
    const userId = request.user.userId;

    // Upsert push token
    await prisma.pushToken.upsert({
      where: {
        userId_token: {
          userId,
          token: pushToken,
        },
      },
      update: {
        updatedAt: new Date(),
        platform,
      },
      create: {
        userId,
        token: pushToken,
        platform,
      },
    });

    return reply.send({ success: true });
  });

  // ─────────────────────────────────────────────────────────────
  // DELETE /auth/push-token — удаление push-токена (при выходе)
  // ─────────────────────────────────────────────────────────────
  fastify.delete('/push-token', { preHandler: [fastify.authenticate] }, async (request, reply) => {
    const parsed = pushTokenSchema.safeParse(request.body);
    if (!parsed.success) {
      return reply.status(400).send({ error: 'Invalid push token' });
    }

    const { pushToken } = parsed.data;
    const userId = request.user.userId;

    await prisma.pushToken.deleteMany({
      where: {
        userId,
        token: pushToken,
      },
    });

    return reply.send({ success: true });
  });
}

