import express from 'express';
import { PrismaClient } from '@prisma/client';
import { authenticate, adminOnly } from '../middleware/auth.js';

const prisma = new PrismaClient();
const router = express.Router();

router.get('/', authenticate, adminOnly, async (req, res) => {
  try {
    const { studentId, startDate, endDate, paymentMode } = req.query;
    
    const where = {};
    if (studentId) where.studentId = studentId;
    if (paymentMode) where.paymentMode = paymentMode;
    if (startDate || endDate) {
      where.date = {};
      if (startDate) where.date.gte = startDate;
      if (endDate) where.date.lte = endDate;
    }

    const payments = await prisma.payment.findMany({
      where,
      include: {
        student: {
          select: { name: true, enrollmentNo: true, email: true, courseId: true, batchId: true }
        }
      },
      orderBy: { date: 'desc' }
    });

    res.json(payments);
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

    const payments = await prisma.payment.findMany({
      where: { studentId },
      include: {
        student: {
          select: { name: true, enrollmentNo: true, email: true }
        }
      },
      orderBy: { date: 'desc' }
    });

    res.json(payments);
  } catch (error) {
    res.status(500).json({ message: 'Server error', error: error.message });
  }
});

router.get('/summary', authenticate, adminOnly, async (req, res) => {
  try {
    const aggregate = await prisma.payment.aggregate({
      _sum: { amount: true }
    });
    const totalCollected = aggregate._sum.amount || 0;

    const students = await prisma.student.findMany({
      include: { payments: true }
    });

    let pendingFees = 0;
    let overdueCount = 0;

    students.forEach(student => {
      const paid = student.payments.reduce((sum, p) => sum + p.amount, 0);
      const balance = student.totalFees - paid;
      if (balance > 0) {
        pendingFees += balance;
        overdueCount++;
      }
    });

    // Mock monthly collection for simplicity (could be grouped in DB)
    const monthlyCollection = [];

    res.json({ totalCollected, pendingFees, overdueCount, monthlyCollection });
  } catch (error) {
    res.status(500).json({ message: 'Server error', error: error.message });
  }
});

router.post('/', authenticate, adminOnly, async (req, res) => {
  try {
    const { studentId, amount, paymentMode, remarks, date } = req.body;
    
    const student = await prisma.student.findUnique({
      where: { id: studentId },
      include: { payments: true }
    });

    if (!student) return res.status(404).json({ message: 'Student not found' });

    const receiptNo = `REC-${Date.now()}`;
    const previousPaid = student.payments.reduce((sum, p) => sum + p.amount, 0);
    const remainingBalance = student.totalFees - (previousPaid + amount);

    const payment = await prisma.payment.create({
      data: {
        studentId,
        amount,
        paymentMode,
        remarks,
        date: date ? new Date(date) : new Date(),
        receiptNo,
        remainingBalance
      }
    });

    res.status(201).json(payment);
  } catch (error) {
    res.status(500).json({ message: 'Server error', error: error.message });
  }
});

router.put('/:id', authenticate, adminOnly, async (req, res) => {
  try {
    const { amount, paymentMode, remarks, date } = req.body;
    const payment = await prisma.payment.update({
      where: { id: req.params.id },
      data: {
        ...(amount && { amount }),
        ...(paymentMode && { paymentMode }),
        ...(remarks && { remarks }),
        ...(date && { date: new Date(date) })
      }
    });
    res.json(payment);
  } catch (error) {
    res.status(500).json({ message: 'Server error', error: error.message });
  }
});

router.delete('/:id', authenticate, adminOnly, async (req, res) => {
  try {
    await prisma.payment.delete({ where: { id: req.params.id } });
    res.json({ message: 'Payment deleted' });
  } catch (error) {
    res.status(500).json({ message: 'Server error', error: error.message });
  }
});

router.get('/:id/receipt', authenticate, async (req, res) => {
  try {
    const payment = await prisma.payment.findUnique({
      where: { id: req.params.id },
      include: {
        student: {
          include: {
            course: true,
            batch: true
          }
        }
      }
    });

    if (!payment) return res.status(404).json({ message: 'Payment not found' });

    if (req.user.role !== 'ADMIN') {
      const student = await prisma.student.findUnique({ where: { userId: req.user.id } });
      if (!student || student.id !== payment.studentId) {
        return res.status(403).json({ message: 'Access denied' });
      }
    }

    res.json(payment);
  } catch (error) {
    res.status(500).json({ message: 'Server error', error: error.message });
  }
});

export default router;
