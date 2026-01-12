import Fastify from 'fastify';
import cors from '@fastify/cors';
import { env } from './config/env.js';
import jwtPlugin from './plugins/jwt.js';
import { authRoutes } from './routes/auth.js';
import { employeesRoutes } from './routes/employees.js';
import { tasksRoutes } from './routes/tasks.js';
import { routinesRoutes } from './routes/routines.js';
import { notificationsRoutes } from './routes/notifications.js';
import { statsRoutes } from './routes/stats.js';

async function main() {
  const fastify = Fastify({
    logger: {
      level: 'info',
      transport: {
        target: 'pino-pretty',
        options: {
          translateTime: 'HH:MM:ss Z',
          ignore: 'pid,hostname',
        },
      },
    },
  });

  // Plugins
  await fastify.register(cors, {
    origin: true, // Allow all origins in dev; restrict in production
    credentials: true,
  });
  await fastify.register(jwtPlugin);

  // Routes
  await fastify.register(authRoutes, { prefix: '/auth' });
  await fastify.register(employeesRoutes, { prefix: '/employees' });
  await fastify.register(tasksRoutes, { prefix: '/tasks' });
  await fastify.register(routinesRoutes, { prefix: '/routines' });
  await fastify.register(notificationsRoutes, { prefix: '/notifications' });
  await fastify.register(statsRoutes, { prefix: '/stats' });

  // Health check
  fastify.get('/health', async () => ({ status: 'ok', timestamp: new Date().toISOString() }));

  // Start server
  try {
    await fastify.listen({ port: env.PORT, host: env.HOST });
    console.log(`🚀 Server running at http://${env.HOST}:${env.PORT}`);
  } catch (err) {
    fastify.log.error(err);
    process.exit(1);
  }
}

main();

