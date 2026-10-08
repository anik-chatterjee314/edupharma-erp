import express from 'express';
import { PrismaClient } from '@prisma/client';
import { authenticate, adminOnly } from '../middleware/auth.js';

const prisma = new PrismaClient();
const router = express.Router();

router.get('/', authenticate, adminOnly, async (req, res) => {
  try {
    const { batchId, subjectId } = req.query;
    
    const where = {};
    if (batchId) where.batchId = batchId;
    if (subjectId) where.subjectId = subjectId;

    const tests = await prisma.test.findMany({
      where,
      include: {
        subject: { select: { id: true, name: true } },
        batch: { select: { id: true, name: true } }
      },
      orderBy: { date: 'desc' }
    });

    res.json(tests);
  } catch (error) {
    res.status(500).json({ message: 'Server error', error: error.message });
  }
});

router.get('/student/:studentId', authenticate, async (req, res) => {
  try {
    const { studentId } = req.params;

    if (req.user.role !== 'ADMIN') {
      const student = await prisma.student.findUnique({ where: { userId: req.user.id } });
      if (!student || student.id !== studentId) {
        return res.status(403).json({ message: 'Access denied' });
      }
    }

    const marks = await prisma.mark.findMany({
      where: {
        studentId,
        test: { isPublished: true }
      },
      include: {
        test: {
          include: {
            subject: { select: { name: true } }
          }
        }
      },
      orderBy: { test: { date: 'desc' } }
    });

    res.json(marks);
  } catch (error) {
    res.status(500).json({ message: 'Server error', error: error.message });
  }
});

router.post('/', authenticate, adminOnly, async (req, res) => {
  try {
    const { title, subjectId, batchId, date, maxMarks, duration, isPublished } = req.body;

    const test = await prisma.test.create({
      data: {
        title,
        subjectId,
        batchId,
        date: new Date(date),
        maxMarks,
        duration,
        isPublished: isPublished || false,
        createdById: req.user.id
      }
    });

    res.status(201).json(test);
  } catch (error) {
    res.status(500).json({ message: 'Server error', error: error.message });
  }
});

router.put('/:id', authenticate, adminOnly, async (req, res) => {
  try {
    const { title, subjectId, batchId, date, maxMarks, duration } = req.body;

    const test = await prisma.test.update({
      where: { id: req.params.id },
      data: {
        ...(title && { title }),
        ...(subjectId && { subjectId }),
        ...(batchId && { batchId }),
        ...(date && { date: new Date(date) }),
        ...(maxMarks && { maxMarks }),
        ...(duration && { duration })
      }
    });

    res.json(test);
  } catch (error) {
    res.status(500).json({ message: 'Server error', error: error.message });
  }
});

router.patch('/:id/publish', authenticate, adminOnly, async (req, res) => {
  try {
    const test = await prisma.test.findUnique({ where: { id: req.params.id } });
    if (!test) return res.status(404).json({ message: 'Test not found' });

    const updated = await prisma.test.update({
      where: { id: req.params.id },
      data: { isPublished: !test.isPublished }
    });

    res.json(updated);
  } catch (error) {
    res.status(500).json({ message: 'Server error', error: error.message });
  }
});

router.post('/:id/marks', authenticate, adminOnly, async (req, res) => {
  try {
    const { id: testId } = req.params;
    const marksData = req.body; // Array of { studentId, status, marks }

    const test = await prisma.test.findUnique({ where: { id: testId } });
    if (!test) return res.status(404).json({ message: 'Test not found' });

    // Upsert marks
    const upsertPromises = marksData.map(m => {
      const val = parseFloat(m.marks) || 0;
      const percentage = (val / test.maxMarks) * 100;
      return prisma.mark.upsert({
        where: {
          testId_studentId: {
            testId,
            studentId: m.studentId
          }
        },
        update: {
          status: m.status,
          marksObtained: val,
          percentage
        },
        create: {
          testId,
          studentId: m.studentId,
          status: m.status,
          marksObtained: val,
          percentage
        }
      });
    });

    await Promise.all(upsertPromises);

    // Calculate ranks
    const allMarks = await prisma.mark.findMany({
      where: { testId, status: 'PRESENT' },
      orderBy: { marksObtained: 'desc' }
    });

    let currentRank = 1;
    let prevMarks = null;
    let itemsAtRank = 0;

    const rankUpdates = allMarks.map((m) => {
      if (prevMarks !== null && m.marksObtained < prevMarks) {
        currentRank += itemsAtRank;
        itemsAtRank = 1;
      } else {
        itemsAtRank++;
      }
      prevMarks = m.marksObtained;

      return prisma.mark.update({
        where: { id: m.id },
        data: { rank: currentRank }
      });
    });

    await Promise.all(rankUpdates);

    res.json({ message: 'Marks saved and ranks calculated' });
  } catch (error) {
    res.status(500).json({ message: 'Server error', error: error.message });
  }
});

router.get('/:id/results', authenticate, adminOnly, async (req, res) => {
  try {
    const test = await prisma.test.findUnique({
      where: { id: req.params.id },
      include: {
        subject: { select: { name: true } },
        marks: {
          include: {
            student: {
              select: { name: true, enrollmentNo: true }
            }
          },
          orderBy: { rank: 'asc' }
        }
      }
    });

    if (!test) return res.status(404).json({ message: 'Test not found' });

    res.json(test);
  } catch (error) {
    res.status(500).json({ message: 'Server error', error: error.message });
  }
});

export default router;
