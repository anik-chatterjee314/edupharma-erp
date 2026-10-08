import express from 'express';
import { PrismaClient } from '@prisma/client';
import { authenticate, adminOnly } from '../middleware/auth.js';

const prisma = new PrismaClient();
const router = express.Router();

router.use(authenticate, adminOnly);

router.get('/students', async (req, res) => {
    try {
        const { batchId, courseId, status } = req.query;
        let where = {};
        if (batchId) where.batchId = parseInt(batchId);
        if (courseId) where.courseId = parseInt(courseId);
        if (status) where.status = status;

        const students = await prisma.student.findMany({
            where,
            include: { course: true, batch: true, user: true }
        });
        res.json(students);
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
});

router.get('/attendance', async (req, res) => {
    try {
        const { batchId, subjectId } = req.query;
        let where = {};
        if (batchId) where.batchId = parseInt(batchId);
        if (subjectId) where.subjectId = parseInt(subjectId);

        const attendanceRecords = await prisma.attendance.findMany({
            where,
            include: { student: true }
        });
        
        const studentStats = {};
        attendanceRecords.forEach(record => {
            const sId = record.studentId;
            if (!studentStats[sId]) {
                studentStats[sId] = {
                    studentId: sId,
                    studentName: record.student.firstName + ' ' + record.student.lastName,
                    total: 0,
                    present: 0
                };
            }
            studentStats[sId].total += 1;
            if (record.status === 'PRESENT') studentStats[sId].present += 1;
        });

        const report = Object.values(studentStats).map(stat => ({
            ...stat,
            percentage: stat.total > 0 ? ((stat.present / stat.total) * 100).toFixed(2) : 0
        }));

        res.json(report);
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
});

router.get('/fees', async (req, res) => {
    try {
        const { batchId, status } = req.query;
        let studentWhere = {};
        if (batchId) studentWhere.batchId = parseInt(batchId);
        
        const students = await prisma.student.findMany({
            where: studentWhere,
            include: { user: true, payments: true }
        });
        
        const feeReport = students.map(student => {
            const totalFees = student.totalFees || 0;
            const totalPaid = student.payments.reduce((sum, p) => sum + (p.status === 'COMPLETED' ? p.amount : 0), 0);
            const remaining = totalFees - totalPaid;
            let currentStatus = 'paid';
            if (remaining > 0) currentStatus = 'pending';
            
            return {
                studentId: student.id,
                studentName: student.firstName + ' ' + student.lastName,
                totalFees,
                totalPaid,
                remaining,
                status: currentStatus
            };
        });
        
        const filtered = status ? feeReport.filter(f => f.status === status) : feeReport;
        res.json(filtered);
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
});

router.get('/tests', async (req, res) => {
    try {
        const { testId, batchId } = req.query;
        let where = {};
        if (testId) where.testId = parseInt(testId);
        
        // Ensure test belongs to batch if batchId provided
        const testsWhere = batchId ? { batchId: parseInt(batchId) } : {};
        
        const results = await prisma.testResult.findMany({
            where,
            include: { 
                student: true, 
                test: { where: testsWhere } 
            }
        });
        
        // Filter out if test relation didn't match batchId
        const validResults = batchId ? results.filter(r => r.test != null) : results;
        
        const testGroups = {};
        validResults.forEach(r => {
            const tId = r.testId;
            if (!testGroups[tId]) {
                testGroups[tId] = {
                    testId: tId,
                    testTitle: r.test ? r.test.title : 'Unknown',
                    totalMarks: r.test ? r.test.totalMarks : 0,
                    passingMarks: r.test ? r.test.passingMarks : 0,
                    students: [],
                    totalObtained: 0,
                    passedCount: 0
                };
            }
            testGroups[tId].students.push({
                studentId: r.studentId,
                name: r.student.firstName + ' ' + r.student.lastName,
                marksObtained: r.marksObtained,
                passed: r.marksObtained >= testGroups[tId].passingMarks
            });
            testGroups[tId].totalObtained += r.marksObtained;
            if (r.marksObtained >= testGroups[tId].passingMarks) {
                testGroups[tId].passedCount += 1;
            }
        });
        
        const report = Object.values(testGroups).map(group => ({
            ...group,
            averageMarks: group.students.length > 0 ? (group.totalObtained / group.students.length).toFixed(2) : 0,
            passRate: group.students.length > 0 ? ((group.passedCount / group.students.length) * 100).toFixed(2) : 0
        }));

        res.json(report);
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
});

router.get('/finance', async (req, res) => {
    try {
        const incomes = await prisma.income.findMany();
        const expenses = await prisma.expense.findMany();
        
        const totalIncome = incomes.reduce((sum, item) => sum + item.amount, 0);
        const totalExpenses = expenses.reduce((sum, item) => sum + item.amount, 0);
        
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
        
        const monthlyBreakdown = Object.values(monthlyData).map(data => ({
            ...data,
            net: data.income - data.expenses
        })).sort((a, b) => a.month.localeCompare(b.month));
        
        res.json({
            totalIncome,
            totalExpenses,
            netProfit: totalIncome - totalExpenses,
            monthlyBreakdown
        });
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
});

export default router;
