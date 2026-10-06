import { Router } from 'express';
import { PrismaClient } from '@prisma/client';

const router = Router();
const prisma = new PrismaClient();

// GET /api/users - list all users with workload task counts
router.get('/', async (req, res) => {
  try {
    const users = await prisma.user.findMany({
      include: {
        tasks: {
          select: {
            id: true,
            status: true,
            priority: true,
          },
        },
      },
      orderBy: { name: 'asc' },
    });

    // Compute workload metrics per user
    const usersWithWorkload = users.map((user) => {
      const inProgressCount = user.tasks.filter((t) => t.status === 'In Progress').length;
      const todoCount = user.tasks.filter((t) => t.status === 'To-Do').length;
      const doneCount = user.tasks.filter((t) => t.status === 'Done').length;
      const totalCount = user.tasks.length;
      const isBurnoutWarning = inProgressCount > 5; // > 5 tasks in "In Progress"

      return {
        ...user,
        workload: {
          inProgressCount,
          todoCount,
          doneCount,
          totalCount,
          isBurnoutWarning,
        },
      };
    });

    res.json(usersWithWorkload);
  } catch (error) {
    console.error('Error fetching users:', error);
    res.status(500).json({ error: 'Failed to fetch users' });
  }
});

// POST /api/users - create new user
router.post('/', async (req, res) => {
  try {
    const { name, email, avatarUrl } = req.body;
    if (!name || !email) {
      return res.status(400).json({ error: 'Name and email are required' });
    }

    const existingUser = await prisma.user.findUnique({ where: { email } });
    if (existingUser) {
      return res.status(400).json({ error: 'User with this email already exists' });
    }

    const user = await prisma.user.create({
      data: {
        name,
        email,
        avatarUrl: avatarUrl || `https://api.dicebear.com/7.x/avataaars/svg?seed=${encodeURIComponent(name)}`,
      },
    });

    res.status(201).json(user);
  } catch (error) {
    console.error('Error creating user:', error);
    res.status(500).json({ error: 'Failed to create user' });
  }
});

export default router;
