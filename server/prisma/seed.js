import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

async function main() {
  console.log('Seeding initial database data...');

  // Clean existing data
  await prisma.task.deleteMany();
  await prisma.projectUser.deleteMany();
  await prisma.project.deleteMany();
  await prisma.user.deleteMany();

  // Create Users
  const user1 = await prisma.user.create({
    data: {
      name: 'Alex Rivera',
      email: 'alex@example.com',
      avatarUrl: 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=150',
    },
  });

  const user2 = await prisma.user.create({
    data: {
      name: 'Sarah Chen',
      email: 'sarah@example.com',
      avatarUrl: 'https://images.unsplash.com/photo-1494790108377-be9c29b29330?w=150',
    },
  });

  const user3 = await prisma.user.create({
    data: {
      name: 'Marcus Vance',
      email: 'marcus@example.com',
      avatarUrl: 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=150',
    },
  });

  // Create Project
  const project = await prisma.project.create({
    data: {
      name: 'Productivity Suite 2.0',
      description: 'Kanban board & workload optimization release',
    },
  });

  // Assign Users to Project
  await prisma.projectUser.createMany({
    data: [
      { projectId: project.id, userId: user1.id, role: 'OWNER' },
      { projectId: project.id, userId: user2.id, role: 'MEMBER' },
      { projectId: project.id, userId: user3.id, role: 'MEMBER' },
    ],
  });

  // Create Tasks
  // To-Do tasks
  await prisma.task.create({
    data: {
      title: 'Design Dark Mode theme',
      description: 'Create Figma tokens and Tailwind color definitions',
      status: 'To-Do',
      priority: 'Medium',
      dueDate: new Date(Date.now() + 86400000 * 3),
      projectId: project.id,
      assigneeId: user1.id,
    },
  });

  await prisma.task.create({
    data: {
      title: 'Audit API Performance',
      description: 'Optimize queries for task fetching and user relations',
      status: 'To-Do',
      priority: 'High',
      dueDate: new Date(Date.now() + 86400000 * 5),
      projectId: project.id,
      assigneeId: user2.id,
    },
  });

  // In Progress tasks: Give Marcus 6 tasks to trigger burnout warning (>5 tasks)
  const marcusTaskTitles = [
    { title: 'Implement WebSocket notifications', priority: 'Urgent' },
    { title: 'Refactor Drag & Drop handlers', priority: 'High' },
    { title: 'Setup PostgreSQL migrations script', priority: 'High' },
    { title: 'Build export to CSV feature', priority: 'Low' },
    { title: 'Fix mobile layout overflow', priority: 'Medium' },
    { title: 'Configure CI/CD Pipeline', priority: 'Urgent' },
  ];

  for (const t of marcusTaskTitles) {
    await prisma.task.create({
      data: {
        title: t.title,
        description: `Task for ${t.title}`,
        status: 'In Progress',
        priority: t.priority,
        dueDate: new Date(Date.now() + 86400000 * 2),
        projectId: project.id,
        assigneeId: user3.id,
      },
    });
  }

  // Done tasks
  await prisma.task.create({
    data: {
      title: 'Initialize Repository & Dependencies',
      description: 'Setup Node, Express, Prisma, and Vite React frontend',
      status: 'Done',
      priority: 'High',
      dueDate: new Date(Date.now() - 86400000),
      projectId: project.id,
      assigneeId: user1.id,
    },
  });

  console.log('Database seeded successfully!');
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
