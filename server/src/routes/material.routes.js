import express from 'express';
import { PrismaClient } from '@prisma/client';
import { authenticate, adminOnly } from '../middleware/auth.js';
import { uploadMaterial } from '../middleware/upload.js';
import fs from 'fs';
import path from 'path';

const prisma = new PrismaClient();
const router = express.Router();

router.get('/', authenticate, async (req, res) => {
    try {
        const { subjectId, batchId, courseId, category, search } = req.query;
        let where = {};
        
        if (req.user.role === 'STUDENT') {
            const student = await prisma.student.findUnique({ where: { userId: req.user.id } });
            if (!student) return res.status(404).json({ message: 'Student not found' });
            where = {
                batchId: student.batchId,
                courseId: student.courseId
            };
        } else {
            if (subjectId) where.subjectId = parseInt(subjectId);
            if (batchId) where.batchId = parseInt(batchId);
            if (courseId) where.courseId = parseInt(courseId);
            if (category) where.category = category;
        }

        if (search) {
            where.OR = [
                { title: { contains: search } },
                { topic: { contains: search } }
            ];
        }

        const materials = await prisma.studyMaterial.findMany({
            where,
            include: { subject: true, batch: true, course: true },
            orderBy: { createdAt: 'desc' }
        });
        res.json(materials);
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
});

router.post('/', authenticate, adminOnly, uploadMaterial, async (req, res) => {
    try {
        const { title, subjectId, topic, category, description, batchId, courseId } = req.body;
        const file = req.file;
        
        if (!file) return res.status(400).json({ message: 'File is required' });

        const material = await prisma.studyMaterial.create({
            data: {
                title,
                topic,
                category,
                description,
                subjectId: subjectId ? parseInt(subjectId) : null,
                batchId: batchId ? parseInt(batchId) : null,
                courseId: courseId ? parseInt(courseId) : null,
                fileUrl: file.path,
                fileName: file.originalname,
                fileType: file.mimetype,
                fileSize: file.size,
                uploadedById: req.user.id
            }
        });
        res.status(201).json(material);
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
});

router.put('/:id', authenticate, adminOnly, async (req, res) => {
    try {
        const { title, subjectId, topic, category, description, batchId, courseId } = req.body;
        const material = await prisma.studyMaterial.update({
            where: { id: parseInt(req.params.id) },
            data: {
                title,
                topic,
                category,
                description,
                subjectId: subjectId ? parseInt(subjectId) : null,
                batchId: batchId ? parseInt(batchId) : null,
                courseId: courseId ? parseInt(courseId) : null
            }
        });
        res.json(material);
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
});

router.delete('/:id', authenticate, adminOnly, async (req, res) => {
    try {
        const material = await prisma.studyMaterial.findUnique({ where: { id: parseInt(req.params.id) } });
        if (!material) return res.status(404).json({ message: 'Material not found' });
        
        if (material.fileUrl && fs.existsSync(material.fileUrl)) {
            fs.unlinkSync(material.fileUrl);
        }

        await prisma.studyMaterial.delete({ where: { id: parseInt(req.params.id) } });
        res.json({ message: 'Material deleted successfully' });
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
});

router.get('/:id/download', authenticate, async (req, res) => {
    try {
        const material = await prisma.studyMaterial.findUnique({ where: { id: parseInt(req.params.id) } });
        if (!material) return res.status(404).json({ message: 'Material not found' });
        
        res.download(path.resolve(material.fileUrl), material.fileName);
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
});

export default router;
