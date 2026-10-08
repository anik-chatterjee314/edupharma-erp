import express from 'express';
import { PrismaClient } from '@prisma/client';
import bcrypt from 'bcryptjs';
import { authenticate, adminOnly } from '../middleware/auth.js';
import { uploadPhoto } from '../middleware/upload.js';

const prisma = new PrismaClient();
const router = express.Router();

router.get('/', authenticate, adminOnly, async (req, res) => {
  try {
    const { search, batch, course, status } = req.query;
    
    const where = {};
    if (batch) where.batchId = batch;
    if (course) where.courseId = course;
    if (status) where.status = status;
    if (search) {
      where.OR = [
        { name: { contains: search } },
        { enrollmentNo: { contains: search } },
        { email: { contains: search } },
        { phone: { contains: search } }
      ];
    }

    const students = await prisma.student.findMany({
      where,
      include: {
        user: {
          select: { id: true, email: true, isActive: true, role: true }
        },
        course: true,
        batch: true
      }
    });
    res.json(students);
  } catch (error) {
    res.status(500).json({ message: 'Server error', error: error.message });
  }
});

router.get('/me', authenticate, async (req, res) => {
  try {
    const student = await prisma.student.findUnique({
      where: { userId: req.user.id },
      include: {
        course: true,
        batch: true,
        user: { select: { id: true, email: true } }
      }
    });

    if (!student) {
      return res.status(404).json({ message: 'Student profile not found' });
    }

    res.json(student);
  } catch (error) {
    res.status(500).json({ message: 'Server error', error: error.message });
  }
});

router.get('/:id', authenticate, adminOnly, async (req, res) => {
  try {
    const student = await prisma.student.findUnique({
      where: { id: req.params.id },
      include: {
        user: { select: { id: true, email: true, isActive: true } },
        course: true,
        batch: true
      }
    });

    if (!student) {
      return res.status(404).json({ message: 'Student not found' });
    }

    res.json(student);
  } catch (error) {
    res.status(500).json({ message: 'Server error', error: error.message });
  }
});

router.post('/', authenticate, adminOnly, async (req, res) => {
  try {
    const { name, email, phone, courseId, batchId, totalFees } = req.body;

    const batch = await prisma.batch.findUnique({ where: { id: batchId } });
    if (!batch) return res.status(400).json({ message: 'Batch not found' });

    // Generate enrollment no
    const batchNameStripped = batch.name.replace(/-/g, '').substring(0, 10).toUpperCase();
    
    // Get last student in batch to generate sequence
    const lastStudent = await prisma.student.findFirst({
      where: { batchId },
      orderBy: { enrollmentNo: 'desc' }
    });
    
    let seq = '001';
    if (lastStudent && lastStudent.enrollmentNo) {
      const lastSeq = parseInt(lastStudent.enrollmentNo.slice(-3));
      if (!isNaN(lastSeq)) {
        seq = String(lastSeq + 1).padStart(3, '0');
      }
    }
    
    const enrollmentNo = `EP${batchNameStripped}${seq}`;

    const result = await prisma.$transaction(async (tx) => {
      // Create user WITHOUT password — student will set it via setup-password page
      const user = await tx.user.create({
        data: {
          email: email.toLowerCase().trim(),
          password: null,
          passwordSet: false,
          role: 'STUDENT',
          isActive: true
        }
      });

      const student = await tx.student.create({
        data: {
          userId: user.id,
          name,
          email: email.toLowerCase().trim(),
          enrollmentNo,
          phone,
          courseId,
          batchId,
          totalFees: totalFees || 0,
          status: 'ACTIVE'
        },
        include: {
          user: { select: { id: true, email: true } },
          batch: true,
          course: true
        }
      });

      return student;
    });

    res.status(201).json(result);
  } catch (error) {
    res.status(500).json({ message: 'Server error', error: error.message });
  }
});

router.put('/:id', authenticate, adminOnly, async (req, res) => {
  try {
    const { phone, courseId, batchId, totalFees, name, email } = req.body;
    
    const student = await prisma.student.findUnique({ where: { id: req.params.id } });
    if (!student) return res.status(404).json({ message: 'Student not found' });

    const result = await prisma.$transaction(async (tx) => {
      if (name || email) {
        await tx.user.update({
          where: { id: student.userId },
          data: {
            ...(name && { name }),
            ...(email && { email })
          }
        });
      }

      const updatedStudent = await tx.student.update({
        where: { id: req.params.id },
        data: {
          ...(phone && { phone }),
          ...(courseId && { courseId }),
          ...(batchId && { batchId }),
          ...(totalFees !== undefined && { totalFees })
        },
        include: {
          user: { select: { id: true, email: true } }
        }
      });
      return updatedStudent;
    });

    res.json(result);
  } catch (error) {
    res.status(500).json({ message: 'Server error', error: error.message });
  }
});

router.patch('/:id/status', authenticate, adminOnly, async (req, res) => {
  try {
    const student = await prisma.student.findUnique({ where: { id: req.params.id } });
    if (!student) return res.status(404).json({ message: 'Student not found' });

    const newStatus = student.status === 'ACTIVE' ? 'INACTIVE' : 'ACTIVE';
    const newUserStatus = newStatus === 'ACTIVE';

    const result = await prisma.$transaction(async (tx) => {
      await tx.user.update({
        where: { id: student.userId },
        data: { isActive: newUserStatus }
      });

      const updatedStudent = await tx.student.update({
        where: { id: req.params.id },
        data: { status: newStatus },
        include: { user: { select: { id: true, email: true, isActive: true } } }
      });

      return updatedStudent;
    });

    res.json(result);
  } catch (error) {
    res.status(500).json({ message: 'Server error', error: error.message });
  }
});

router.put('/me/photo', authenticate, uploadPhoto, async (req, res) => {
  try {
    if (!req.file) {
      return res.status(400).json({ message: 'No photo uploaded' });
    }

    const student = await prisma.student.findUnique({ where: { userId: req.user.id } });
    if (!student) {
      return res.status(404).json({ message: 'Student profile not found' });
    }

    const updatedStudent = await prisma.student.update({
      where: { userId: req.user.id },
      data: { profilePhoto: req.file.path }
    });

    res.json(updatedStudent);
  } catch (error) {
    res.status(500).json({ message: 'Server error', error: error.message });
  }
});

export default router;
