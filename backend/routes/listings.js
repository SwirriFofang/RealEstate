const express = require('express');
const { body, validationResult } = require('express-validator');
const { supabase } = require('../config/database');
const { authMiddleware } = require('../middleware/auth');
const { TABLES, RELATIONS } = require('../config/tableNames');

const router = express.Router();

// Get all listings (public)
router.get('/', async (req, res) => {
  try {
    const { 
      page = 1, 
      limit = 10, 
      status, 
      location,
      sortBy = 'created_at',
      sortOrder = 'desc'
    } = req.query;

    const offset = (page - 1) * limit;

    let query = supabase
      .from(TABLES.LISTINGS)
      .select(`
        *,
        owner:${RELATIONS.USERS}(email, full_name),
        media:${RELATIONS.LISTING_MEDIA}(file_path, file_type, mime_type)
      `)
      .order(sortBy, { ascending: sortOrder === 'asc' });

    // Apply filters
    if (status) {
      query = query.eq('status', status);
    }
    if (location) {
      query = query.ilike('location', `%${location}%`);
    }

    const { data: listings, error, count } = await query
      .range(offset, offset + limit - 1);

    if (error) {
      return res.status(500).json({ error: 'Failed to fetch listings' });
    }

    res.json({
      listings,
      pagination: {
        page: parseInt(page),
        limit: parseInt(limit),
        total: count || 0,
        totalPages: Math.ceil((count || 0) / limit)
      }
    });

  } catch (error) {
    console.error('Listings fetch error:', error);
    res.status(500).json({ error: 'Server error' });
  }
});

// Get single listing
router.get('/:id', async (req, res) => {
  try {
    const { id } = req.params;

    const { data: listing, error } = await supabase
      .from(TABLES.LISTINGS)
      .select(`
        *,
        owner:${RELATIONS.USERS}(email, full_name),
        media:${RELATIONS.LISTING_MEDIA}(file_path, file_type, mime_type),
        investments:${RELATIONS.INVESTMENTS}(count)
      `)
      .eq('id', id)
      .single();

    if (error) {
      if (error.code === 'PGRST116') {
        return res.status(404).json({ error: 'Listing not found' });
      }
      return res.status(500).json({ error: 'Failed to fetch listing' });
    }

    res.json({ listing });

  } catch (error) {
    console.error('Listing fetch error:', error);
    res.status(500).json({ error: 'Server error' });
  }
});

// Create new listing (project owners only)
router.post('/', authMiddleware, [
  body('title').notEmpty().withMessage('Title is required'),
  body('location').notEmpty().withMessage('Location is required'),
  body('description').notEmpty().withMessage('Description is required'),
  body('targetAmount').isFloat({ gt: 0 }).withMessage('Valid target amount required'),
  body('fractions').isInt({ gt: 0 }).withMessage('Valid fractions required'),
  body('duration').isInt({ gt: 0, lte: 180 }).withMessage('Duration must be between 1 and 180 days')
], async (req, res) => {
  try {
    // Check validation errors
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({ errors: errors.array() });
    }

    // Check if user is project owner
    if (req.user.role !== 'project_owner') {
      return res.status(403).json({ error: 'Project owner access required' });
    }

    const { title, location, description, targetAmount, fractions, duration } = req.body;

    const { data: listing, error } = await supabase
      .from(TABLES.LISTINGS)
      .insert([{
        title,
        location,
        description,
        target_amount: targetAmount,
        fractions,
        duration_days: duration,
        max_days: 180,
        days_left: duration,
        status: 'active',
        progress: 0,
        owner_id: req.user.userId
      }])
      .select()
      .single();

    if (error) {
      console.error('Listing creation error:', error);
      return res.status(500).json({ error: 'Failed to create listing' });
    }

    res.status(201).json({
      message: 'Listing created successfully',
      listing
    });

  } catch (error) {
    console.error('Listing creation error:', error);
    res.status(500).json({ error: 'Server error' });
  }
});

// Update listing
router.put('/:id', authMiddleware, [
  body('title').optional().notEmpty().withMessage('Title cannot be empty'),
  body('location').optional().notEmpty().withMessage('Location cannot be empty'),
  body('description').optional().notEmpty().withMessage('Description cannot be empty'),
  body('targetAmount').optional().isFloat({ gt: 0 }).withMessage('Valid target amount required'),
  body('fractions').optional().isInt({ gt: 0 }).withMessage('Valid fractions required')
], async (req, res) => {
  try {
    // Check validation errors
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({ errors: errors.array() });
    }

    const { id } = req.params;
    const { title, location, description, targetAmount, fractions } = req.body;

    // Check if user owns the listing
    const { data: existingListing, error: checkError } = await supabase
      .from(TABLES.LISTINGS)
      .select('owner_id')
      .eq('id', id)
      .single();

    if (checkError) {
      return res.status(500).json({ error: 'Failed to verify listing ownership' });
    }

    if (existingListing.owner_id !== req.user.userId) {
      return res.status(403).json({ error: 'Access denied' });
    }

    const updateData = {};
    if (title) updateData.title = title;
    if (location) updateData.location = location;
    if (description) updateData.description = description;
    if (targetAmount) updateData.target_amount = targetAmount;
    if (fractions) updateData.fractions = fractions;

    const { data: listing, error } = await supabase
      .from(TABLES.LISTINGS)
      .update(updateData)
      .eq('id', id)
      .select()
      .single();

    if (error) {
      return res.status(500).json({ error: 'Failed to update listing' });
    }

    res.json({
      message: 'Listing updated successfully',
      listing
    });

  } catch (error) {
    console.error('Listing update error:', error);
    res.status(500).json({ error: 'Server error' });
  }
});

// Extend listing duration
router.put('/:id/extend', authMiddleware, async (req, res) => {
  try {
    const { id } = req.params;
    const { days } = req.body;

    if (!days || days <= 0 || days > 30) {
      return res.status(400).json({ error: 'Extension days must be between 1 and 30' });
    }

    // Check if user owns the listing
    const { data: existingListing, error: checkError } = await supabase
      .from(TABLES.LISTINGS)
      .select('owner_id, days_left, max_days, status')
      .eq('id', id)
      .single();

    if (checkError) {
      return res.status(500).json({ error: 'Failed to verify listing ownership' });
    }

    if (existingListing.owner_id !== req.user.userId) {
      return res.status(403).json({ error: 'Access denied' });
    }

    if (existingListing.status !== 'active') {
      return res.status(400).json({ error: 'Only active listings can be extended' });
    }

    const newDaysLeft = Math.min(
      existingListing.days_left + days,
      existingListing.max_days
    );

    if (newDaysLeft === existingListing.days_left) {
      return res.status(400).json({ error: 'Maximum duration already reached' });
    }

    const { data: listing, error } = await supabase
      .from(TABLES.LISTINGS)
      .update({ days_left: newDaysLeft })
      .eq('id', id)
      .select()
      .single();

    if (error) {
      return res.status(500).json({ error: 'Failed to extend listing' });
    }

    res.json({
      message: 'Listing duration extended successfully',
      listing,
      daysExtended: days,
      newDaysLeft
    });

  } catch (error) {
    console.error('Listing extension error:', error);
    res.status(500).json({ error: 'Server error' });
  }
});

// Delete listing
router.delete('/:id', authMiddleware, async (req, res) => {
  try {
    const { id } = req.params;

    // Check if user owns the listing
    const { data: existingListing, error: checkError } = await supabase
      .from(TABLES.LISTINGS)
      .select('owner_id')
      .eq('id', id)
      .single();

    if (checkError) {
      return res.status(500).json({ error: 'Failed to verify listing ownership' });
    }

    if (existingListing.owner_id !== req.user.userId) {
      return res.status(403).json({ error: 'Access denied' });
    }

    const { error } = await supabase
      .from(TABLES.LISTINGS)
      .delete()
      .eq('id', id);

    if (error) {
      return res.status(500).json({ error: 'Failed to delete listing' });
    }

    res.json({ message: 'Listing deleted successfully' });

  } catch (error) {
    console.error('Listing deletion error:', error);
    res.status(500).json({ error: 'Server error' });
  }
});

// Get user's listings
router.get('/my-listings', authMiddleware, async (req, res) => {
  try {
    const { page = 1, limit = 10, status } = req.query;
    const offset = (page - 1) * limit;

    let query = supabase
      .from(TABLES.LISTINGS)
      .select(`
        *,
        media:${RELATIONS.LISTING_MEDIA}(file_path, file_type),
        investments:${RELATIONS.INVESTMENTS}(fractions)
      `)
      .eq('owner_id', req.user.userId)
      .order('created_at', { ascending: false });

    if (status) {
      query = query.eq('status', status);
    }

    const { data: listings, error, count } = await query
      .range(offset, offset + limit - 1);

    if (error) {
      return res.status(500).json({ error: 'Failed to fetch listings' });
    }

    res.json({
      listings,
      pagination: {
        page: parseInt(page),
        limit: parseInt(limit),
        total: count || 0,
        totalPages: Math.ceil((count || 0) / limit)
      }
    });

  } catch (error) {
    console.error('My listings fetch error:', error);
    res.status(500).json({ error: 'Server error' });
  }
});

module.exports = router;
