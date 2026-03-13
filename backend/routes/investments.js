const express = require('express');
const { body, validationResult } = require('express-validator');
const { supabase } = require('../config/database');
const { authMiddleware } = require('../middleware/auth');
const { TABLES, RELATIONS } = require('../config/tableNames');

const router = express.Router();

// Get all investments (public)
router.get('/', async (req, res) => {
  try {
    const { 
      page = 1, 
      limit = 10, 
      status,
      sortBy = 'created_at',
      sortOrder = 'desc'
    } = req.query;

    const offset = (page - 1) * limit;

    let query = supabase
      .from(TABLES.INVESTMENTS)
      .select(`
        *,
        investor:${RELATIONS.USERS}(email, full_name),
        listing:${RELATIONS.LISTINGS}(title, location, target_amount, status, progress)
      `)
      .order(sortBy, { ascending: sortOrder === 'asc' });

    if (status) {
      query = query.eq('status', status);
    }

    const { data: investments, error, count } = await query
      .range(offset, offset + limit - 1);

    if (error) {
      return res.status(500).json({ error: 'Failed to fetch investments' });
    }

    res.json({
      investments,
      pagination: {
        page: parseInt(page),
        limit: parseInt(limit),
        total: count || 0,
        totalPages: Math.ceil((count || 0) / limit)
      }
    });

  } catch (error) {
    console.error('Investments fetch error:', error);
    res.status(500).json({ error: 'Server error' });
  }
});

// Get user's investments
router.get('/my-investments', authMiddleware, async (req, res) => {
  try {
    const { page = 1, limit = 10, status } = req.query;
    const offset = (page - 1) * limit;

    let query = supabase
      .from(TABLES.INVESTMENTS)
      .select(`
        *,
        listing:${RELATIONS.LISTINGS}(title, location, target_amount, status, progress, days_left)
      `)
      .eq('investor_id', req.user.userId)
      .order('created_at', { ascending: false });

    if (status) {
      query = query.eq('status', status);
    }

    const { data: investments, error, count } = await query
      .range(offset, offset + limit - 1);

    if (error) {
      return res.status(500).json({ error: 'Failed to fetch investments' });
    }

    res.json({
      investments,
      pagination: {
        page: parseInt(page),
        limit: parseInt(limit),
        total: count || 0,
        totalPages: Math.ceil((count || 0) / limit)
      }
    });

  } catch (error) {
    console.error('My investments fetch error:', error);
    res.status(500).json({ error: 'Server error' });
  }
});

// Create investment
router.post('/', authMiddleware, [
  body('listingId').isUUID().withMessage('Valid listing ID required'),
  body('fractions').isInt({ gt: 0 }).withMessage('Valid fractions required'),
  body('amount').isFloat({ gt: 0 }).withMessage('Valid amount required')
], async (req, res) => {
  try {
    // Check validation errors
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({ errors: errors.array() });
    }

    // Check if user is investor
    if (req.user.role !== 'investor') {
      return res.status(403).json({ error: 'Investor access required' });
    }

    const { listingId, fractions, amount } = req.body;

    // Get listing details
    const { data: listing, error: listingError } = await supabase
      .from(TABLES.LISTINGS)
      .select(`*, owner:${RELATIONS.USERS}(email)`) 
      .eq('id', listingId)
      .single();

    if (listingError || !listing) {
      return res.status(404).json({ error: 'Listing not found' });
    }

    if (listing.status !== 'active') {
      return res.status(400).json({ error: 'Listing is not active' });
    }

    if (listing.days_left <= 0) {
      return res.status(400).json({ error: 'Listing has expired' });
    }

    // Calculate available fractions
    const { data: totalInvested } = await supabase
      .from(TABLES.INVESTMENTS)
      .select('fractions')
      .eq('listing_id', listingId);

    const investedFractions = totalInvested?.reduce((sum, inv) => sum + inv.fractions, 0) || 0;
    const availableFractions = listing.fractions - investedFractions;

    if (fractions > availableFractions) {
      return res.status(400).json({ 
        error: `Only ${availableFractions} fractions available` 
      });
    }

    // Create investment
    const { data: investment, error } = await supabase
      .from(TABLES.INVESTMENTS)
      .insert([{
        listing_id: listingId,
        investor_id: req.user.userId,
        fractions,
        amount,
        status: 'pending'
      }])
      .select()
      .single();

    if (error) {
      console.error('Investment creation error:', error);
      return res.status(500).json({ error: 'Failed to create investment' });
    }

    // Update listing progress
    const newProgress = Math.min(
      ((investedFractions + fractions) / listing.fractions) * 100,
      100
    );

    await supabase
      .from(TABLES.LISTINGS)
      .update({ progress: newProgress })
      .eq('id', listingId);

    // Check if listing is fully funded
    if (newProgress >= 100) {
      await supabase
        .from(TABLES.LISTINGS)
        .update({ status: 'funded' })
        .eq('id', listingId);
    }

    res.status(201).json({
      message: 'Investment created successfully',
      investment: {
        ...investment,
        listing: {
          id: listing.id,
          title: listing.title,
          location: listing.location,
          owner: listing.owner
        }
      }
    });

  } catch (error) {
    console.error('Investment creation error:', error);
    res.status(500).json({ error: 'Server error' });
  }
});

// Confirm investment
router.put('/:id/confirm', authMiddleware, async (req, res) => {
  try {
    const { id } = req.params;

    // Check if user owns the investment
    const { data: existingInvestment, error: checkError } = await supabase
      .from(TABLES.INVESTMENTS)
      .select('investor_id, status')
      .eq('id', id)
      .single();

    if (checkError) {
      return res.status(500).json({ error: 'Failed to verify investment ownership' });
    }

    if (existingInvestment.investor_id !== req.user.userId) {
      return res.status(403).json({ error: 'Access denied' });
    }

    if (existingInvestment.status !== 'pending') {
      return res.status(400).json({ error: 'Investment cannot be confirmed' });
    }

    const { data: investment, error } = await supabase
      .from(TABLES.INVESTMENTS)
      .update({ status: 'confirmed' })
      .eq('id', id)
      .select()
      .single();

    if (error) {
      return res.status(500).json({ error: 'Failed to confirm investment' });
    }

    res.json({
      message: 'Investment confirmed successfully',
      investment
    });

  } catch (error) {
    console.error('Investment confirmation error:', error);
    res.status(500).json({ error: 'Server error' });
  }
});

// Get investments for a listing
router.get('/listing/:listingId', async (req, res) => {
  try {
    const { listingId } = req.params;
    const { page = 1, limit = 10 } = req.query;
    const offset = (page - 1) * limit;

    const { data: investments, error, count } = await supabase
      .from(TABLES.INVESTMENTS)
      .select(`
        *,
        investor:${RELATIONS.USERS}(email, full_name)
      `)
      .eq('listing_id', listingId)
      .order('created_at', { ascending: false })
      .range(offset, offset + limit - 1);

    if (error) {
      return res.status(500).json({ error: 'Failed to fetch investments' });
    }

    res.json({
      investments,
      pagination: {
        page: parseInt(page),
        limit: parseInt(limit),
        total: count || 0,
        totalPages: Math.ceil((count || 0) / limit)
      }
    });

  } catch (error) {
    console.error('Listing investments fetch error:', error);
    res.status(500).json({ error: 'Server error' });
  }
});

module.exports = router;
