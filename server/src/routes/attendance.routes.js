import express from 'express';
import { PrismaClient } from '@prisma/client';
import { authenticate, adminOnly } from '../middleware/auth.js';

const prisma = new PrismaClient();
const router = express.Router();

router.post('/mark', authenticate, adminOnly, async (req, res) => {
  try {
    const records = req.body; 
    
    if (!Array.isArray(records)) {
      return res.status(400).json({ message: 'Expected an array of records' });
    }

    const upsertPromises = records.map(record => {
      const d = new Date(record.date);
      return prisma.attendance.upsert({
        where: {
          studentId_subjectId_date: {
            studentId: record.studentId,
            subjectId: record.subjectId,
            date: d
          }
        },
        update: {
          status: record.status,
          markedById: req.user.id
        },
        create: {
          studentId: record.studentId,
          subjectId: record.subjectId,
          date: d,
          status: record.status,
          markedById: req.user.id
        }
      });
    });

    await Promise.all(upsertPromises);
    res.json({ message: 'Attendance marked successfully' });
  } catch (error) {
    res.status(500).json({ message: 'Server error', error: error.message });
  }
});

router.get('/student/:studentId', authenticate, async (req, res) => {
  try {
    const { studentId } = req.params;
    const { subjectId, month } = req.query;

    if (req.user.role !== 'ADMIN') {
      const student = await prisma.student.findUnique({ where: { userId: req.user.id } });
      if (!student || student.id !== studentId) {
        return res.status(403).json({ message: 'Access denied' });
      }
    }

    const where = { studentId };
    if (subjectId) where.subjectId = subjectId;
    if (month) {
      const [year, m] = month.split('-');
      const startDate = new Date(year, m - 1, 1);
      const endDate = new Date(year, m, 1);
      where.date = { gte: startDate, lt: endDate };
    }

    const records = await prisma.attendance.findMany({
      where,
      include: {
        subject: { select: { id: true, name: true } }
      },
      orderBy: { date: 'desc' }
    });

    res.json(records);
  } catch (error) {
    res.status(500).json({ message: 'Server error', error: error.message });
  }
});

router.get('/summary/:studentId', authenticate, async (req, res) => {
  try {
    const { studentId } = req.params;

    if (req.user.role !== 'ADMIN') {
      const student = await prisma.student.findUnique({ where: { userId: req.user.id } });
      if (!student || student.id !== studentId) {
        return res.status(403).json({ message: 'Access denied' });
      }
    }

    const records = await prisma.attendance.findMany({
      where: { studentId },
      include: { subject: true }
    });

    const subjectMap = {};
    let totalClasses = 0;
    let totalPresent = 0;

    records.forEach(r => {
      if (!subjectMap[r.subjectId]) {
        subjectMap[r.subjectId] = {
          subjectId: r.subjectId,
          subjectName: r.subject.name,
          totalClasses: 0,
          present: 0,
          absent: 0
        };
      }
      
      subjectMap[r.subjectId].totalClasses++;
      totalClasses++;
      
      if (r.status === 'PRESENT') {
        subjectMap[r.subjectId].present++;
        totalPresent++;
      } else {
        subjectMap[r.subjectId].absent++;
      }
    });

    const subjects = Object.values(subjectMap).map(s => ({
      ...s,
      percentage: s.totalClasses ? ((s.present / s.totalClasses) * 100).toFixed(2) : 0
    }));

    const overallPercentage = totalClasses ? ((totalPresent / totalClasses) * 100).toFixed(2) : 0;

    res.json({
      subjects,
      overallPercentage,
      totalClasses,
      totalPresent
    });
  } catch (error) {
    res.status(500).json({ message: 'Server error', error: error.message });
  }
});

router.get('/batch/:batchId', authenticate, adminOnly, async (req, res) => {
  try {
    const { batchId } = req.params;
    const { subjectId, date } = req.query;

    if (!subjectId || !date) {
      return res.status(400).json({ message: 'subjectId and date are required' });
    }

    const d = new Date(date);
    const startOfDay = new Date(d.setHours(0,0,0,0));
    const endOfDay = new Date(d.setHours(23,59,59,999));

    const records = await prisma.attendance.findMany({
      where: {
        subjectId,
        date: { gte: startOfDay, lte: endOfDay },
        student: { batchId }
      },
      include: {
        student: {
          select: { name: true, enrollmentNo: true }
        }
      }
    });

    res.json(records);
  } catch (error) {
    res.status(500).json({ message: 'Server error', error: error.message });
  }
});

export default router;
