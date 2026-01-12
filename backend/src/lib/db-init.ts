import { exec } from 'child_process';
import { promisify } from 'util';
import { prisma } from './prisma.js';

const execAsync = promisify(exec);
const DOCKER_CONTAINER_NAME = 'manager-postgres';

async function isDockerRunning(): Promise<boolean> {
  try {
    await execAsync('docker info');
    return true;
  } catch {
    return false;
  }
}

async function isPostgresContainerExists(): Promise<boolean> {
  try {
    const cmd = 'docker ps -a --filter name=' + DOCKER_CONTAINER_NAME + ' --format {{.Names}}';
    const { stdout } = await execAsync(cmd);
    return stdout.trim() === DOCKER_CONTAINER_NAME;
  } catch {
    return false;
  }
}

async function isPostgresContainerRunning(): Promise<boolean> {
  try {
    const cmd = 'docker ps --filter name=' + DOCKER_CONTAINER_NAME + ' --format {{.Names}}';
    const { stdout } = await execAsync(cmd);
    return stdout.trim() === DOCKER_CONTAINER_NAME;
  } catch {
    return false;
  }
}

async function createPostgresContainer(): Promise<void> {
  console.log('Creating PostgreSQL container...');
  const cmd = 'docker run -d --name ' + DOCKER_CONTAINER_NAME + ' -e POSTGRES_USER=postgres -e POSTGRES_PASSWORD=postgres -e POSTGRES_DB=manager_db -p 5432:5432 postgres:15';
  await execAsync(cmd);
  console.log('Waiting for PostgreSQL...');
  await new Promise(resolve => setTimeout(resolve, 3000));
}

async function startPostgresContainer(): Promise<void> {
  console.log('Starting PostgreSQL container...');
  await execAsync('docker start ' + DOCKER_CONTAINER_NAME);
  await new Promise(resolve => setTimeout(resolve, 2000));
}

async function runMigrations(): Promise<void> {
  console.log('Running migrations...');
  try {
    await execAsync('npx prisma migrate deploy', { cwd: process.cwd() });
    console.log('Migrations applied');
  } catch {
    console.log('Trying prisma db push...');
    await execAsync('npx prisma db push', { cwd: process.cwd() });
    console.log('Schema synchronized');
  }
}

async function isDatabaseEmpty(): Promise<boolean> {
  try {
    const count = await prisma.user.count();
    return count === 0;
  } catch {
    return true;
  }
}

async function runSeed(): Promise<void> {
  console.log('Seeding database...');
  await execAsync('npm run db:seed', { cwd: process.cwd() });
  console.log('Database seeded');
}

async function checkConnection(): Promise<boolean> {
  try {
    await prisma.$queryRaw`SELECT 1`;
    return true;
  } catch {
    return false;
  }
}

export async function initializeDatabase(): Promise<void> {
  console.log('Initializing database...');

  if (!(await isDockerRunning())) {
    console.error('Docker is not running!');
    process.exit(1);
  }

  const exists = await isPostgresContainerExists();
  const running = await isPostgresContainerRunning();

  if (!exists) {
    await createPostgresContainer();
  } else if (!running) {
    await startPostgresContainer();
  } else {
    console.log('PostgreSQL already running');
  }

  let connected = false;
  for (let i = 0; i < 10; i++) {
    connected = await checkConnection();
    if (connected) break;
    console.log('Waiting for DB... ' + (i + 1) + '/10');
    await new Promise(r => setTimeout(r, 1000));
  }

  if (!connected) {
    console.error('Failed to connect to database');
    process.exit(1);
  }

  console.log('Database connected');
  await runMigrations();

  if (await isDatabaseEmpty()) {
    await runSeed();
  }

  console.log('Database ready!');
}
