import { exec } from 'child_process';
import { promisify } from 'util';
import { prisma } from './prisma.js';
import { env } from '../config/env.js';

const execAsync = promisify(exec);
const DOCKER_CONTAINER_NAME = 'manager-postgres';

function parseDatabaseUrl(url: string) {
  const regex = /postgresql:\/\/([^:]+):([^@]+)@([^:]+):(\d+)\/([^?]+)/;
  const match = url.match(regex);
  if (!match) throw new Error('Invalid DATABASE_URL format');
  return { user: match[1], password: match[2], host: match[3], port: match[4], database: match[5] };
}

async function isDockerRunning(): Promise<boolean> {
  try { await execAsync('docker info'); return true; } catch { return false; }
}

async function containerExists(): Promise<boolean> {
  try {
    const { stdout } = await execAsync('docker ps -a --filter name=' + DOCKER_CONTAINER_NAME + ' -q');
    return stdout.trim().length > 0;
  } catch { return false; }
}

async function containerRunning(): Promise<boolean> {
  try {
    const { stdout } = await execAsync('docker ps --filter name=' + DOCKER_CONTAINER_NAME + ' -q');
    return stdout.trim().length > 0;
  } catch { return false; }
}

async function createContainer(): Promise<void> {
  const db = parseDatabaseUrl(env.DATABASE_URL);
  console.log('Creating PostgreSQL: user=' + db.user + ', db=' + db.database + ', port=' + db.port);
  const cmd = 'docker run -d --name ' + DOCKER_CONTAINER_NAME +
    ' -e POSTGRES_USER=' + db.user +
    ' -e POSTGRES_PASSWORD=' + db.password +
    ' -e POSTGRES_DB=' + db.database +
    ' -p ' + db.port + ':5432 postgres:15';
  await execAsync(cmd);
  console.log('Waiting for PostgreSQL...');
  await new Promise(r => setTimeout(r, 3000));
}

async function startContainer(): Promise<void> {
  console.log('Starting PostgreSQL...');
  await execAsync('docker start ' + DOCKER_CONTAINER_NAME);
  await new Promise(r => setTimeout(r, 2000));
}

async function runMigrations(): Promise<void> {
  console.log('Running migrations...');
  try {
    await execAsync('npx prisma migrate deploy', { cwd: process.cwd() });
    console.log('Migrations applied');
  } catch {
    console.log('Trying db push...');
    await execAsync('npx prisma db push', { cwd: process.cwd() });
    console.log('Schema synchronized');
  }
}

async function checkConnection(): Promise<boolean> {
  try { await prisma.$queryRaw`SELECT 1`; return true; } catch { return false; }
}

async function isEmpty(): Promise<boolean> {
  try { return (await prisma.user.count()) === 0; } catch { return true; }
}

async function runSeed(): Promise<void> {
  console.log('Seeding database...');
  await execAsync('npm run db:seed', { cwd: process.cwd() });
  console.log('Database seeded');
}

export async function initializeDatabase(): Promise<void> {
  console.log('Initializing database...');
  
  if (!(await isDockerRunning())) {
    console.error('Docker is not running!');
    process.exit(1);
  }

  const exists = await containerExists();
  const running = await containerRunning();

  if (!exists) await createContainer();
  else if (!running) await startContainer();
  else console.log('PostgreSQL already running');

  let connected = false;
  for (let i = 0; i < 10; i++) {
    connected = await checkConnection();
    if (connected) break;
    console.log('Waiting for DB... ' + (i + 1) + '/10');
    await new Promise(r => setTimeout(r, 1000));
  }

  if (!connected) { console.error('Failed to connect'); process.exit(1); }

  console.log('Database connected');
  await runMigrations();
  if (await isEmpty()) await runSeed();
  console.log('Database ready!');
}
