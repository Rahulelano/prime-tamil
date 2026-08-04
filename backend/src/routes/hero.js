const express = require('express');
const { body, validationResult } = require('express-validator');
const { prisma } = require('../utils/database');
const { authenticate, authorize } = require('../middleware/auth');

const router = express.Router();

// @desc    Get active hero
// @route   GET /api/hero
// @access  Public
router.get('/', async (req, res, next) => {
  try {
    const hero = await prisma.hero.findFirst({
      where: { isActive: true }
    });

    res.json({
      success: true,
      data: { hero }
    });
  } catch (error) {
    next(error);
  }
});

// @desc    Create or update hero
// @route   POST /api/hero
// @access  Private (Admin)
router.post('/', [
  authenticate,
  authorize('ADMIN')
], [
  body('title').trim().isLength({ min: 1, max: 200 }),
  body('imageUrl').isString(),
  body('description').optional().trim().isLength({ max: 500 }),
  body('isActive').optional().isBoolean()
], async (req, res, next) => {
  try {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({
        success: false,
        message: 'Validation failed',
        errors: errors.array()
      });
    }

    const { title, imageUrl, description, isActive = true } = req.body;

    // If setting to active, deactivate other heroes
    if (isActive) {
      await prisma.hero.updateMany({
        where: { isActive: true },
        data: { isActive: false }
      });
    }

    // Create new hero
    const hero = await prisma.hero.create({
      data: {
        title,
        imageUrl,
        description,
        isActive
      }
    });

    res.status(201).json({
      success: true,
      message: 'Hero created successfully',
      data: { hero }
    });
  } catch (error) {
    next(error);
  }
});

// @desc    Update hero
// @route   PUT /api/hero/:id
// @access  Private (Admin)
router.put('/:id', [
  authenticate,
  authorize('ADMIN')
], [
  body('title').optional().trim().isLength({ min: 1, max: 200 }),
  body('imageUrl').optional().isString(),
  body('description').optional().trim().isLength({ max: 500 }),
  body('isActive').optional().isBoolean()
], async (req, res, next) => {
  try {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({
        success: false,
        message: 'Validation failed',
        errors: errors.array()
      });
    }

    const { id } = req.params;
    const { title, imageUrl, description, isActive } = req.body;

    // Check if hero exists
    const existingHero = await prisma.hero.findUnique({
      where: { id }
    });

    if (!existingHero) {
      return res.status(404).json({
        success: false,
        message: 'Hero not found'
      });
    }

    // If setting to active, deactivate other heroes
    if (isActive && !existingHero.isActive) {
      await prisma.hero.updateMany({
        where: { isActive: true },
        data: { isActive: false }
      });
    }

    // Update hero
    const hero = await prisma.hero.update({
      where: { id },
      data: {
        ...(title !== undefined && { title }),
        ...(imageUrl !== undefined && { imageUrl }),
        ...(description !== undefined && { description }),
        ...(isActive !== undefined && { isActive })
      }
    });

    res.json({
      success: true,
      message: 'Hero updated successfully',
      data: { hero }
    });
  } catch (error) {
    next(error);
  }
});

// @desc    Delete hero
// @route   DELETE /api/hero/:id
// @access  Private (Admin)
router.delete('/:id', [
  authenticate,
  authorize('ADMIN')
], async (req, res, next) => {
  try {
    const { id } = req.params;

    const hero = await prisma.hero.findUnique({
      where: { id }
    });

    if (!hero) {
      return res.status(404).json({
        success: false,
        message: 'Hero not found'
      });
    }

    await prisma.hero.delete({
      where: { id }
    });

    res.json({
      success: true,
      message: 'Hero deleted successfully'
    });
  } catch (error) {
    next(error);
  }
});

// @desc    Get all heroes (for admin)
// @route   GET /api/hero/admin/list
// @access  Private (Admin)
router.get('/admin/list', [
  authenticate,
  authorize('ADMIN')
], async (req, res, next) => {
  try {
    const heroes = await prisma.hero.findMany({
      orderBy: { createdAt: 'desc' }
    });

    res.json({
      success: true,
      data: { heroes }
    });
  } catch (error) {
    next(error);
  }
});

module.exports = router;