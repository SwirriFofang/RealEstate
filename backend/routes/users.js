const express = require('express');
const { body, validationResult } = require('express-validator');
const { supabase } = require('../config/database');
const { authMiddleware } = require('../middleware/auth');
const { TABLES } = require('../config/tableNames');

const router = express.Router();

// Get user profile
router.get('/profile', authMiddleware, async (req, res) => {
  try {
    const { data: user, error } = await supabase
      .from(TABLES.USERS)
      .select('id, email, full_name, role, is_approved, created_at')
      .eq('id', req.user.userId)
      .single();

    if (error) {
      return res.status(500).json({ error: 'Failed to fetch profile' });
    }

    res.json({ user });

  } catch (error) {
    console.error('Profile fetch error:', error);
    res.status(500).json({ error: 'Server error' });
  }
});

// Update user profile
router.put('/profile', authMiddleware, [
  body('fullName').optional().notEmpty().withMessage('Full name cannot be empty'),
  body('email').optional().isEmail().normalizeEmail().withMessage('Valid email required')
], async (req, res) => {
  try {
    // Check validation errors
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({ errors: errors.array() });
    }

    const { fullName, email } = req.body;
    const updateData = {};

    if (fullName) updateData.full_name = fullName;
    if (email) updateData.email = email;

    const { data: user, error } = await supabase
      .from(TABLES.USERS)
      .update(updateData)
      .eq('id', req.user.userId)
      .select()
      .single();

    if (error) {
      if (error.code === '23505') {
        return res.status(400).json({ error: 'Email already exists' });
      }
      return res.status(500).json({ error: 'Failed to update profile' });
    }

    res.json({
      message: 'Profile updated successfully',
      user: {
        id: user.id,
        email: user.email,
        fullName: user.full_name,
        role: user.role,
        isApproved: user.is_approved
      }
    });

  } catch (error) {
    console.error('Profile update error:', error);
    res.status(500).json({ error: 'Server error' });
  }
});

// Change password
router.put('/password', authMiddleware, [
  body('currentPassword').notEmpty().withMessage('Current password is required'),
  body('newPassword').isLength({ min: 8 }).withMessage('New password must be at least 8 characters'),
  body('confirmPassword').custom((value, { req }) => {
    if (value !== req.body.newPassword) {
      throw new Error('Passwords do not match');
    }
    return true;
  })
], async (req, res) => {
  try {
    // Check validation errors
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({ errors: errors.array() });
    }

    const { currentPassword, newPassword } = req.body;

    // Get current user
    const { data: user, error } = await supabase
      .from(TABLES.USERS)
      .select('password_hash')
      .eq('id', req.user.userId)
      .single();

    if (error) {
      return res.status(500).json({ error: 'Failed to fetch user' });
    }

    // Verify current password
    const bcrypt = require('bcryptjs');
    const isValidPassword = await bcrypt.compare(currentPassword, user.password_hash);
    if (!isValidPassword) {
      return res.status(400).json({ error: 'Current password is incorrect' });
    }

    // Hash new password
    const saltRounds = 12;
    const newPasswordHash = await bcrypt.hash(newPassword, saltRounds);

    // Update password
    const { error: updateError } = await supabase
      .from(TABLES.USERS)
      .update({ password_hash: newPasswordHash })
      .eq('id', req.user.userId);

    if (updateError) {
      return res.status(500).json({ error: 'Failed to update password' });
    }

    res.json({ message: 'Password updated successfully' });

  } catch (error) {
    console.error('Password change error:', error);
    res.status(500).json({ error: 'Server error' });
  }
});

// Get all users (admin only)
router.get('/', authMiddleware, async (req, res) => {
  try {
    // Check if user is admin
    if (req.user.role !== 'admin') {
      return res.status(403).json({ error: 'Admin access required' });
    }

    const { data: users, error } = await supabase
      .from(TABLES.USERS)
      .select('id, email, full_name, role, is_approved, created_at')
      .order('created_at', { ascending: false });

    if (error) {
      return res.status(500).json({ error: 'Failed to fetch users' });
    }

    res.json({ users });

  } catch (error) {
    console.error('Users fetch error:', error);
    res.status(500).json({ error: 'Server error' });
  }
});

// Approve project owner (admin only)
router.put('/:userId/approve', authMiddleware, async (req, res) => {
  try {
    // Check if user is admin
    if (req.user.role !== 'admin') {
      return res.status(403).json({ error: 'Admin access required' });
    }

    const { userId } = req.params;

    const { data: user, error } = await supabase
      .from(TABLES.USERS)
      .update({ is_approved: true })
      .eq('id', userId)
      .select()
      .single();

    if (error) {
      return res.status(500).json({ error: 'Failed to approve user' });
    }

    res.json({
      message: 'User approved successfully',
      user: {
        id: user.id,
        email: user.email,
        fullName: user.full_name,
        role: user.role,
        isApproved: user.is_approved
      }
    });

  } catch (error) {
    console.error('User approval error:', error);
    res.status(500).json({ error: 'Server error' });
  }
});

module.exports = router;
