import express from 'express';
import { PrismaClient } from '@prisma/client';
import { authenticate, adminOnly } from '../middleware/auth.js';

const prisma = new PrismaClient();
const router = express.Router();

router.use(authenticate, adminOnly);

// Income
router.get('/income', async (req, res) => {
    try {
        const { category, startDate, endDate } = req.query;
        let where = {};
        if (category) where.category = category;
        if (startDate && endDate) {
            where.date = {
                gte: new Date(startDate),
                lte: new Date(endDate)
            };
        }
        const income = await prisma.income.findMany({ where, orderBy: { date: 'desc' } });
        res.json(income);
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
});

router.post('/income', async (req, res) => {
    try {
        const { amount, date, source, category, description } = req.body;
        const income = await prisma.income.create({
            data: {
                amount: parseFloat(amount),
                date: new Date(date),
                source,
                category,
                description,
                createdById: req.user.id
            }
        });
        res.status(201).json(income);
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
});

router.put('/income/:id', async (req, res) => {
    try {
        const { amount, date, source, category, description } = req.body;
        const income = await prisma.income.update({
            where: { id: parseInt(req.params.id) },
            data: {
                amount: amount ? parseFloat(amount) : undefined,
                date: date ? new Date(date) : undefined,
                source,
                category,
                description
            }
        });
        res.json(income);
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
});

router.delete('/income/:id', async (req, res) => {
    try {
        await prisma.income.delete({ where: { id: parseInt(req.params.id) } });
        res.json({ message: 'Income record deleted' });
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
});

// Expenses
router.get('/expenses', async (req, res) => {
    try {
        const { category, startDate, endDate } = req.query;
        let where = {};
        if (category) where.category = category;
        if (startDate && endDate) {
            where.date = {
                gte: new Date(startDate),
                lte: new Date(endDate)
            };
        }
        const expenses = await prisma.expense.findMany({ where, orderBy: { date: 'desc' } });
        res.json(expenses);
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
});

router.post('/expenses', async (req, res) => {
    try {
        const { amount, date, title, category, description } = req.body;
        const expense = await prisma.expense.create({
            data: {
                amount: parseFloat(amount),
                date: new Date(date),
                title,
                category,
                description,
                createdById: req.user.id
            }
        });
        res.status(201).json(expense);
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
});

router.put('/expenses/:id', async (req, res) => {
    try {
        const { amount, date, title, category, description } = req.body;
        const expense = await prisma.expense.update({
            where: { id: parseInt(req.params.id) },
            data: {
                amount: amount ? parseFloat(amount) : undefined,
                date: date ? new Date(date) : undefined,
                title,
                category,
                description
            }
        });
        res.json(expense);
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
});

router.delete('/expenses/:id', async (req, res) => {
    try {
        await prisma.expense.delete({ where: { id: parseInt(req.params.id) } });
        res.json({ message: 'Expense record deleted' });
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
});

// Summary
router.get('/summary', async (req, res) => {
    try {
        const incomes = await prisma.income.findMany();
        const expenses = await prisma.expense.findMany();
        
        const totalIncome = incomes.reduce((sum, item) => sum + item.amount, 0);
        const totalExpenses = expenses.reduce((sum, item) => sum + item.amount, 0);
        
        const now = new Date();
        const currentMonthIncomes = incomes.filter(i => i.date.getMonth() === now.getMonth() && i.date.getFullYear() === now.getFullYear());
        const currentMonthExpenses = expenses.filter(e => e.date.getMonth() === now.getMonth() && e.date.getFullYear() === now.getFullYear());
        
        const currentMonthIncome = currentMonthIncomes.reduce((sum, item) => sum + item.amount, 0);
        const currentMonthExpenseTotal = currentMonthExpenses.reduce((sum, item) => sum + item.amount, 0);
        
        res.json({
            totalIncome,
            totalExpenses,
            netProfit: totalIncome - totalExpenses,
            currentMonthIncome,
            currentMonthExpenses: currentMonthExpenseTotal
        });
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
});

router.get('/pnl', async (req, res) => {
    try {
        const incomes = await prisma.income.findMany();
        const expenses = await prisma.expense.findMany();
        
        const monthlyData = {};
        
        incomes.forEach(inc => {
            const month = inc.date.toISOString().substring(0, 7);
            if (!monthlyData[month]) monthlyData[month] = { month, income: 0, expenses: 0, net: 0 };
            monthlyData[month].income += inc.amount;
        });
        
        expenses.forEach(exp => {
            const month = exp.date.toISOString().substring(0, 7);
            if (!monthlyData[month]) monthlyData[month] = { month, income: 0, expenses: 0, net: 0 };
            monthlyData[month].expenses += exp.amount;
        });
        
        const pnl = Object.values(monthlyData).map(data => ({
            ...data,
            net: data.income - data.expenses
        })).sort((a, b) => a.month.localeCompare(b.month));
        
        res.json(pnl);
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
});

export default router;
