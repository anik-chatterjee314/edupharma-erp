import express from 'express';
import fs from 'fs';
import path from 'path';
import { PrismaClient } from '@prisma/client';
import { authenticate, adminOnly } from '../middleware/auth.js';
import { uploadDocument } from '../middleware/upload.js';

const prisma = new PrismaClient();
const router = express.Router();

router.get('/student/:studentId', authenticate, async (req, res) => {
  try {
    const { studentId } = req.params;

    if (req.user.role !== 'ADMIN') {
      const student = await prisma.student.findUnique({ where: { userId: req.user.id } });
      if (!student || student.id !== studentId) {
        return res.status(403).json({ message: 'Access denied' });
      }
    }

    const documents = await prisma.document.findMany({
      where: { studentId },
      orderBy: { uploadDate: 'desc' }
    });

    res.json(documents);
  } catch (error) {
    res.status(500).json({ message: 'Server error', error: error.message });
  }
});

router.post('/upload', authenticate, adminOnly, uploadDocument, async (req, res) => {
  try {
    if (!req.file) {
      return res.status(400).json({ message: 'No file uploaded' });
    }

    const { studentId, name, category } = req.body;
    
    if (!studentId || !name || !category) {
      fs.unlinkSync(req.file.path);
      return res.status(400).json({ message: 'studentId, name, and category are required' });
    }

    const document = await prisma.document.create({
      data: {
        studentId,
        name,
        category,
        filePath: req.file.path,
        fileType: req.file.mimetype,
        fileSize: req.file.size,
        status: 'PENDING'
      }
    });

    res.status(201).json(document);
  } catch (error) {
    if (req.file && fs.existsSync(req.file.path)) {
      fs.unlinkSync(req.file.path);
    }
    res.status(500).json({ message: 'Server error', error: error.message });
  }
});

router.get('/:id/download', authenticate, async (req, res) => {
  try {
    const document = await prisma.document.findUnique({ where: { id: req.params.id } });
    
    if (!document) {
      return res.status(404).json({ message: 'Document not found' });
    }

    if (req.user.role !== 'ADMIN') {
      const student = await prisma.student.findUnique({ where: { userId: req.user.id } });
      if (!student || student.id !== document.studentId) {
        return res.status(403).json({ message: 'Access denied' });
      }
    }

    const absolutePath = path.resolve(document.filePath);
    if (!fs.existsSync(absolutePath)) {
      return res.status(404).json({ message: 'File not found on server' });
    }

    res.download(absolutePath, document.name);
  } catch (error) {
    res.status(500).json({ message: 'Server error', error: error.message });
  }
});

router.patch('/:id/status', authenticate, adminOnly, async (req, res) => {
  try {
    const { status } = req.body;
    if (!['PENDING', 'VERIFIED'].includes(status)) {
      return res.status(400).json({ message: 'Invalid status' });
    }

    const document = await prisma.document.update({
      where: { id: req.params.id },
      data: { status }
    });

    res.json(document);
  } catch (error) {
    res.status(500).json({ message: 'Server error', error: error.message });
  }
});

router.delete('/:id', authenticate, adminOnly, async (req, res) => {
  try {
    const document = await prisma.document.findUnique({ where: { id: req.params.id } });
    if (!document) {
      return res.status(404).json({ message: 'Document not found' });
    }

    const absolutePath = path.resolve(document.filePath);
    if (fs.existsSync(absolutePath)) {
      fs.unlinkSync(absolutePath);
    }

    await prisma.document.delete({ where: { id: req.params.id } });
    
    res.json({ message: 'Document deleted successfully' });
  } catch (error) {
    res.status(500).json({ message: 'Server error', error: error.message });
  }
});

export default router;
