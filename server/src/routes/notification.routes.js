import express from 'express';
import { PrismaClient } from '@prisma/client';
import { authenticate, adminOnly } from '../middleware/auth.js';

const prisma = new PrismaClient();
const router = express.Router();

router.get('/', authenticate, async (req, res) => {
    try {
        const { studentId } = req.query;
        let where = {};
        
        if (req.user.role === 'STUDENT') {
            const student = await prisma.student.findUnique({ where: { userId: req.user.id } });
            if (!student) return res.status(404).json({ message: 'Student not found' });
            where.studentId = student.id;
        } else if (studentId) {
            where.studentId = parseInt(studentId);
        }

        const notifications = await prisma.notification.findMany({
            where,
            orderBy: { createdAt: 'desc' }
        });
        res.json(notifications);
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
});

router.post('/', authenticate, adminOnly, async (req, res) => {
    try {
        const { studentId, title, message, type } = req.body;
        const notification = await prisma.notification.create({
            data: {
                studentId: parseInt(studentId),
                title,
                message,
                type
            }
        });
        res.status(201).json(notification);
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
});

router.patch('/:id/read', authenticate, async (req, res) => {
    try {
        const notificationId = parseInt(req.params.id);
        const notification = await prisma.notification.findUnique({ where: { id: notificationId } });
        if (!notification) return res.status(404).json({ message: 'Notification not found' });
        
        if (req.user.role === 'STUDENT') {
            const student = await prisma.student.findUnique({ where: { userId: req.user.id } });
            if (!student || student.id !== notification.studentId) {
                return res.status(403).json({ message: 'Forbidden' });
            }
        }
        
        const updated = await prisma.notification.update({
            where: { id: notificationId },
            data: { isRead: true }
        });
        res.json(updated);
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
});

router.delete('/:id', authenticate, adminOnly, async (req, res) => {
    try {
        await prisma.notification.delete({ where: { id: parseInt(req.params.id) } });
        res.json({ message: 'Notification deleted successfully' });
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
});

export default router;
