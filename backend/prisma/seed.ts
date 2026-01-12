import { PrismaClient } from '@prisma/client';
import bcrypt from 'bcryptjs';

const prisma = new PrismaClient();

async function main() {
  console.log('🌱 Seeding database...');

  // Clear existing data
  await prisma.activityLog.deleteMany();
  await prisma.notification.deleteMany();
  await prisma.comment.deleteMany();
  await prisma.routineTaskCompletion.deleteMany();
  await prisma.dailyRoutineProgress.deleteMany();
  await prisma.routineTask.deleteMany();
  await prisma.routineTemplate.deleteMany();
  await prisma.instantTask.deleteMany();
  await prisma.invite.deleteMany();
  await prisma.pushToken.deleteMany();
  await prisma.user.deleteMany();
  await prisma.organization.deleteMany();

  // Create organization
  const organization = await prisma.organization.create({
    data: {
      name: 'Demo Restaurant',
    },
  });
  console.log('✅ Created organization:', organization.name);

  // Create manager
  const managerPassword = await bcrypt.hash('manager123', 12);
  const manager = await prisma.user.create({
    data: {
      email: 'manager@example.com',
      password: managerPassword,
      name: 'Sarah Johnson',
      phone: '+79001234567',
      position: 'Менеджер',
      role: 'MANAGER',
      organizationId: organization.id,
    },
  });
  console.log('✅ Created manager:', manager.email);

  // Create employees
  const employeePassword = await bcrypt.hash('employee123', 12);
  const employees = await Promise.all([
    prisma.user.create({
      data: {
        email: 'mike@example.com',
        password: employeePassword,
        name: 'Mike Chen',
        phone: '+79001234568',
        position: 'Повар',
        role: 'EMPLOYEE',
        organizationId: organization.id,
      },
    }),
    prisma.user.create({
      data: {
        email: 'emma@example.com',
        password: employeePassword,
        name: 'Emma Davis',
        phone: '+79001234569',
        position: 'Бармен',
        role: 'EMPLOYEE',
        organizationId: organization.id,
      },
    }),
    prisma.user.create({
      data: {
        email: 'james@example.com',
        password: employeePassword,
        name: 'James Wilson',
        phone: '+79001234570',
        position: 'Официант',
        role: 'EMPLOYEE',
        organizationId: organization.id,
      },
    }),
    prisma.user.create({
      data: {
        email: 'lisa@example.com',
        password: employeePassword,
        name: 'Lisa Anderson',
        phone: '+79001234571',
        position: 'Хостес',
        role: 'EMPLOYEE',
        organizationId: organization.id,
      },
    }),
  ]);
  console.log('✅ Created', employees.length, 'employees');

  // Create instant tasks
  const tasks = await Promise.all([
    prisma.instantTask.create({
      data: {
        title: 'Починить сломанный льдогенератор',
        description: 'Льдогенератор на кухне не работает, нужно вызвать мастера или починить самостоятельно',
        priority: 'HIGH',
        status: 'IN_PROGRESS',
        deadline: new Date(Date.now() + 2 * 60 * 60 * 1000), // 2 hours
        organizationId: organization.id,
        assigneeId: employees[0].id,
        creatorId: manager.id,
      },
    }),
    prisma.instantTask.create({
      data: {
        title: 'Заказать винные бокалы на замену',
        description: 'Нужно заказать 20 новых винных бокалов взамен разбитых',
        priority: 'MEDIUM',
        status: 'IN_PROGRESS',
        deadline: new Date(Date.now() + 24 * 60 * 60 * 1000), // 1 day
        organizationId: organization.id,
        assigneeId: employees[1].id,
        creatorId: manager.id,
      },
    }),
    prisma.instantTask.create({
      data: {
        title: 'Обновить меню-доску',
        description: 'Обновить специальные предложения на меню-доске у входа',
        priority: 'LOW',
        status: 'DONE',
        deadline: new Date(Date.now() + 3 * 24 * 60 * 60 * 1000),
        organizationId: organization.id,
        assigneeId: employees[1].id,
        creatorId: manager.id,
      },
    }),
    prisma.instantTask.create({
      data: {
        title: 'Обучить нового бармена',
        description: 'Провести обучение нового сотрудника по стандартам работы',
        priority: 'MEDIUM',
        status: 'IN_PROGRESS',
        deadline: new Date(Date.now() + 48 * 60 * 60 * 1000),
        organizationId: organization.id,
        assigneeId: employees[1].id,
        creatorId: manager.id,
      },
    }),
  ]);
  console.log('✅ Created', tasks.length, 'instant tasks');

  // Create routine templates
  const routineTemplate = await prisma.routineTemplate.create({
    data: {
      name: 'Утренний чек-лист бармена',
      repeatTime: '09:00',
      organizationId: organization.id,
      employeeId: employees[1].id,
      tasks: {
        create: [
          { title: 'Проверить уровень запасов', order: 0 },
          { title: 'Убрать барную зону', order: 1 },
          { title: 'Подготовить гарниры', order: 2 },
          { title: 'Заполнить холодильники', order: 3 },
          { title: 'Проверить оборудование', order: 4 },
          { title: 'Ознакомиться со специальным меню', order: 5 },
        ],
      },
    },
  });
  console.log('✅ Created routine template:', routineTemplate.name);

  // Create demo invite
  const demoInvite = await prisma.invite.create({
    data: {
      phone: '+79999999999',
      code: 'DEMO123',
      status: 'PENDING',
      expiresAt: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000), // 7 days
      organizationId: organization.id,
      createdById: manager.id,
    },
  });
  console.log('✅ Created demo invite:', demoInvite.code);

  // Create some notifications
  await prisma.notification.createMany({
    data: [
      {
        type: 'NEW_TASK',
        title: 'Назначена новая задача',
        message: 'Починить сломанный льдогенератор',
        userId: employees[0].id,
        taskId: tasks[0].id,
      },
      {
        type: 'DEADLINE',
        title: 'Приближается срок выполнения',
        message: 'Заказать винные бокалы - осталось менее 24 часов',
        userId: employees[1].id,
        taskId: tasks[1].id,
      },
      {
        type: 'COMPLETED',
        title: 'Задача выполнена',
        message: 'Обновить меню-доску',
        userId: manager.id,
        taskId: tasks[2].id,
        read: true,
      },
    ],
  });
  console.log('✅ Created notifications');

  // Create activity logs
  await prisma.activityLog.createMany({
    data: [
      { action: 'Завершена задача "Обновить меню-доску"', userId: employees[1].id },
      { action: 'Добавлен комментарий к "Заказать винные бокалы"', userId: employees[1].id },
      { action: 'Отмечено "Убрать барную зону" как выполнено', userId: employees[1].id },
      { action: 'Начало смены', userId: employees[1].id },
    ],
  });
  console.log('✅ Created activity logs');

  console.log('\n🎉 Seeding complete!\n');
  console.log('Demo accounts:');
  console.log('  Manager: manager@example.com / manager123');
  console.log('  Employee: emma@example.com / employee123');
}

main()
  .catch((e) => {
    console.error('❌ Seeding failed:', e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });

