import express from 'express';
import { PrismaClient } from '@prisma/client';
import { authenticate, adminOnly } from '../middleware/auth.js';

const prisma = new PrismaClient();
const router = express.Router();

router.get('/', authenticate, adminOnly, async (req, res) => {
    try {
        const { type, priority, status } = req.query;
        let where = {};
        if (type) where.type = type;
        if (priority) where.priority = priority;
        if (status) where.status = status;

        const reminders = await prisma.reminder.findMany({
            where,
            include: { student: true },
            orderBy: { dueDate: 'asc' }
        });
        
        const now = new Date();
        const computedReminders = reminders.map(r => ({
            ...r,
            isOverdue: new Date(r.dueDate) < now && r.status === 'PENDING'
        }));
        
        res.json(computedReminders);
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
});

router.post('/', authenticate, adminOnly, async (req, res) => {
    try {
        const { title, description, type, priority, dueDate, studentId } = req.body;
        const reminder = await prisma.reminder.create({
            data: {
                title,
                description,
                type,
                priority,
                dueDate: new Date(dueDate),
                studentId: studentId ? parseInt(studentId) : null,
                createdById: req.user.id
            }
        });
        res.status(201).json(reminder);
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
});

router.put('/:id', authenticate, adminOnly, async (req, res) => {
    try {
        const { title, description, type, priority, dueDate, status, studentId } = req.body;
        const reminder = await prisma.reminder.update({
            where: { id: parseInt(req.params.id) },
            data: {
                title,
                description,
                type,
                priority,
                dueDate: dueDate ? new Date(dueDate) : undefined,
                status,
                studentId: studentId ? parseInt(studentId) : undefined
            }
        });
        res.json(reminder);
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
});

router.delete('/:id', authenticate, adminOnly, async (req, res) => {
    try {
        await prisma.reminder.delete({ where: { id: parseInt(req.params.id) } });
        res.json({ message: 'Reminder deleted successfully' });
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
});

export default router;
