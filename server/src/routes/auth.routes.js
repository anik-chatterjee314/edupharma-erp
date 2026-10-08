import express from 'express';
import { PrismaClient } from '@prisma/client';
import bcrypt from 'bcryptjs';
import { authenticate, adminOnly } from '../middleware/auth.js';
import { generateToken } from '../utils/jwt.js';

const prisma = new PrismaClient();
const router = express.Router();

// ─── Setup Password (first-time users) ────────────────────
router.post('/setup-password', async (req, res) => {
  try {
    const { email, password } = req.body;

    if (!email || !password) {
      return res.status(400).json({ message: 'Email and password are required' });
    }

    if (password.length < 6) {
      return res.status(400).json({ message: 'Password must be at least 6 characters' });
    }

    const user = await prisma.user.findUnique({ where: { email: email.toLowerCase().trim() } });

    if (!user) {
      return res.status(404).json({ message: 'No account found with this email. Contact your admin.' });
    }

    if (!user.isActive) {
      return res.status(403).json({ message: 'Account is inactive. Contact your admin.' });
    }

    if (user.passwordSet) {
      return res.status(400).json({ message: 'Password already set. Please use the login page.' });
    }

    const hashedPassword = await bcrypt.hash(password, 12);
    await prisma.user.update({
      where: { id: user.id },
      data: { password: hashedPassword, passwordSet: true }
    });

    res.json({ message: 'Password set successfully! You can now log in.' });
  } catch (error) {
    res.status(500).json({ message: 'Server error', error: error.message });
  }
});

// ─── Login ────────────────────────────────────────────────
router.post('/login', async (req, res) => {
  try {
    const { email, password } = req.body;

    if (!email || !password) {
      return res.status(400).json({ message: 'Email and password are required' });
    }

    const user = await prisma.user.findUnique({
      where: { email: email.toLowerCase().trim() },
      include: { student: true }
    });

    if (!user || !user.isActive) {
      return res.status(401).json({ message: 'Invalid email or password' });
    }

    // Check if password has been set up
    if (!user.passwordSet || !user.password) {
      return res.status(403).json({ 
        message: 'Password not yet set. Please set up your password first.',
        needsSetup: true 
      });
    }

    const isValid = await bcrypt.compare(password, user.password);
    if (!isValid) {
      return res.status(401).json({ message: 'Invalid email or password' });
    }

    await prisma.user.update({
      where: { id: user.id },
      data: { lastLogin: new Date() }
    });

    const token = generateToken({ id: user.id, role: user.role });
    const { password: _, passwordSet: _ps, ...userWithoutPassword } = user;
    
    let responseUser = { ...userWithoutPassword };
    if (user.role === 'STUDENT' && user.student) {
      const { id: _sid, userId, ...studentFields } = user.student;
      responseUser = { ...responseUser, ...studentFields };
    }

    res.json({ token, user: responseUser });
  } catch (error) {
    res.status(500).json({ message: 'Server error', error: error.message });
  }
});

// ─── Forgot Password ─────────────────────────────────────
router.post('/forgot-password', async (req, res) => {
  try {
    const { email } = req.body;
    const user = await prisma.user.findUnique({ where: { email: email.toLowerCase().trim() } });
    if (!user) {
      return res.status(404).json({ message: 'No account found with this email' });
    }
    // In production, send a real email with reset token
    res.json({ message: 'If an account exists with this email, a reset link has been sent.' });
  } catch (error) {
    res.status(500).json({ message: 'Server error', error: error.message });
  }
});

// ─── Get Current User ─────────────────────────────────────
router.get('/me', authenticate, async (req, res) => {
  try {
    const user = await prisma.user.findUnique({
      where: { id: req.user.id },
      include: {
        student: {
          include: {
            course: true,
            batch: true
          }
        }
      }
    });

    if (!user) {
      return res.status(404).json({ message: 'User not found' });
    }

    const { password: _, passwordSet: _ps, ...userWithoutPassword } = user;
    let responseUser = { ...userWithoutPassword };
    
    if (user.role === 'STUDENT' && user.student) {
      const { userId, ...studentFields } = user.student;
      responseUser = { ...responseUser, ...studentFields };
    }

    res.json({ user: responseUser });
  } catch (error) {
    res.status(500).json({ message: 'Server error', error: error.message });
  }
});

// ─── Change Password (authenticated) ─────────────────────
router.post('/change-password', authenticate, async (req, res) => {
  try {
    const { currentPassword, newPassword } = req.body;
    
    if (!currentPassword || !newPassword) {
      return res.status(400).json({ message: 'Current password and new password are required' });
    }
    
    if (newPassword.length < 6) {
      return res.status(400).json({ message: 'New password must be at least 6 characters' });
    }
    
    const user = await prisma.user.findUnique({ where: { id: req.user.id } });
    if (!user) {
      return res.status(404).json({ message: 'User not found' });
    }
    
    const isValid = await bcrypt.compare(currentPassword, user.password);
    if (!isValid) {
      return res.status(401).json({ message: 'Current password is incorrect' });
    }
    
    const hashedPassword = await bcrypt.hash(newPassword, 12);
    await prisma.user.update({
      where: { id: req.user.id },
      data: { password: hashedPassword }
    });
    
    res.json({ message: 'Password changed successfully' });
  } catch (error) {
    res.status(500).json({ message: 'Server error', error: error.message });
  }
});

export default router;
