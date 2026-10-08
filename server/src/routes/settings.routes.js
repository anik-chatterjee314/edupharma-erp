import express from 'express';
import { PrismaClient } from '@prisma/client';
import { authenticate, adminOnly } from '../middleware/auth.js';

const prisma = new PrismaClient();
const router = express.Router();

router.get('/', authenticate, adminOnly, async (req, res) => {
    try {
        let settings = await prisma.academySettings.findFirst();
        if (!settings) {
            settings = await prisma.academySettings.create({
                data: {
                    name: 'EduPharma Academy',
                    contactEmail: 'contact@edupharma.com',
                    contactPhone: '0000000000'
                }
            });
        }
        res.json(settings);
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
});

router.put('/', authenticate, adminOnly, async (req, res) => {
    try {
        let settings = await prisma.academySettings.findFirst();
        if (settings) {
            settings = await prisma.academySettings.update({
                where: { id: settings.id },
                data: req.body
            });
        } else {
            settings = await prisma.academySettings.create({ data: req.body });
        }
        res.json(settings);
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
});

router.get('/courses', authenticate, async (req, res) => {
    try {
        const courses = await prisma.course.findMany();
        res.json(courses);
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
});

router.get('/batches', authenticate, async (req, res) => {
    try {
        const batches = await prisma.batch.findMany();
        res.json(batches);
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
});

router.get('/subjects', authenticate, async (req, res) => {
    try {
        const subjects = await prisma.subject.findMany();
        res.json(subjects);
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
});

router.post('/courses', authenticate, adminOnly, async (req, res) => {
    try {
        const { name, fullName, duration } = req.body;
        const course = await prisma.course.create({
            data: { name, fullName, duration }
        });
        res.status(201).json(course);
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
});

router.post('/batches', authenticate, adminOnly, async (req, res) => {
    try {
        const { name, year, section } = req.body;
        const batch = await prisma.batch.create({
            data: { name, year, section }
        });
        res.status(201).json(batch);
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
});

router.post('/subjects', authenticate, adminOnly, async (req, res) => {
    try {
        const { name, code } = req.body;
        const subject = await prisma.subject.create({
            data: { name, code }
        });
        res.status(201).json(subject);
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
});

// Delete course
router.delete('/courses/:id', authenticate, adminOnly, async (req, res) => {
    try {
        // Check if course has students
        const count = await prisma.student.count({ where: { courseId: req.params.id } });
        if (count > 0) {
            return res.status(400).json({ error: 'Cannot delete course with enrolled students' });
        }
        await prisma.course.delete({ where: { id: req.params.id } });
        res.json({ message: 'Course deleted successfully' });
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
});

// Delete batch
router.delete('/batches/:id', authenticate, adminOnly, async (req, res) => {
    try {
        const count = await prisma.student.count({ where: { batchId: req.params.id } });
        if (count > 0) {
            return res.status(400).json({ error: 'Cannot delete batch with enrolled students' });
        }
        await prisma.batch.delete({ where: { id: req.params.id } });
        res.json({ message: 'Batch deleted successfully' });
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
});

// Delete subject
router.delete('/subjects/:id', authenticate, adminOnly, async (req, res) => {
    try {
        await prisma.subject.delete({ where: { id: req.params.id } });
        res.json({ message: 'Subject deleted successfully' });
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
});

export default router;
