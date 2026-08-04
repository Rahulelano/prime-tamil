const express = require('express');
const { body, query, validationResult } = require('express-validator');
const slugify = require('slugify');
const { prisma } = require('../utils/database');
const { authenticate, authorize, optionalAuth } = require('../middleware/auth');

const router = express.Router();

// @desc    Get all categories
// @route   GET /api/categories
// @access  Public
router.get('/', optionalAuth, async (req, res, next) => {
  try {
    const categories = await prisma.category.findMany({
      where: { isActive: true },
      orderBy: { sortOrder: 'asc' },
      include: {
        _count: {
          select: {
            articles: {
              where: { status: 'PUBLISHED' }
            }
          }
        }
      }
    });

    res.json({
      success: true,
      data: { categories }
    });
  } catch (error) {
    next(error);
  }
});

// @desc    Get single category
// @route   GET /api/categories/:id
// @access  Public
router.get('/:id', optionalAuth, async (req, res, next) => {
  try {
    const { id } = req.params;

    const category = await prisma.category.findUnique({
      where: { id },
      include: {
        articles: {
          where: { status: 'PUBLISHED' },
          take: 10,
          orderBy: { publishedAt: 'desc' },
          include: {
            author: {
              select: {
                id: true,
                name: true,
                avatar: true
              }
            }
          }
        },
        _count: {
          select: {
            articles: {
              where: { status: 'PUBLISHED' }
            }
          }
        }
      }
    });

    if (!category) {
      return res.status(404).json({
        success: false,
        message: 'Category not found'
      });
    }

    res.json({
      success: true,
      data: { category }
    });
  } catch (error) {
    next(error);
  }
});

// @desc    Get category by slug
// @route   GET /api/categories/slug/:slug
// @access  Public
router.get('/slug/:slug', optionalAuth, async (req, res, next) => {
  try {
    const { slug } = req.params;
    const page = parseInt(req.query.page) || 1;
    const limit = parseInt(req.query.limit) || 12;
    const skip = (page - 1) * limit;

    const category = await prisma.category.findUnique({
      where: { slug },
      include: {
        articles: {
          where: { status: 'PUBLISHED' },
          skip,
          take: limit,
          orderBy: { publishedAt: 'desc' },
          include: {
            author: {
              select: {
                id: true,
                name: true,
                avatar: true
              }
            }
          }
        },
        _count: {
          select: {
            articles: {
              where: { status: 'PUBLISHED' }
            }
          }
        }
      }
    });

    if (!category) {
      return res.status(404).json({
        success: false,
        message: 'Category not found'
      });
    }

    const totalArticles = category._count.articles;
    const totalPages = Math.ceil(totalArticles / limit);

    res.json({
      success: true,
      data: {
        category: {
          id: category.id,
          name: category.name,
          slug: category.slug,
          description: category.description,
          color: category.color,
          icon: category.icon,
          articles: category.articles,
          articleCount: totalArticles
        },
        pagination: {
          currentPage: page,
          totalPages,
          totalArticles,
          hasNextPage: page < totalPages,
          hasPrevPage: page > 1
        }
      }
    });
  } catch (error) {
    next(error);
  }
});

// @desc    Create new category
// @route   POST /api/categories
// @access  Private (Editor, Admin)
router.post('/', authenticate, authorize('EDITOR', 'ADMIN'), [
  body('name').trim().isLength({ min: 2, max: 100 }),
  body('description').optional().trim().isLength({ max: 500 }),
  body('color').optional().matches(/^#[0-9A-F]{6}$/i),
  body('icon').optional().trim(),
  body('sortOrder').optional().isInt({ min: 0 })
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

    const {
      name,
      description,
      color,
      icon,
      isActive = true,
      sortOrder = 0
    } = req.body;

    // Generate slug from name
    const slug = slugify(name, { lower: true, strict: true });

    // Check if category already exists
    const existingCategory = await prisma.category.findFirst({
      where: {
        OR: [
          { name },
          { slug }
        ]
      }
    });

    if (existingCategory) {
      return res.status(400).json({
        success: false,
        message: 'Category with this name or slug already exists'
      });
    }

    const category = await prisma.category.create({
      data: {
        name,
        slug,
        description,
        color,
        icon,
        isActive,
        sortOrder
      },
      include: {
        _count: {
          select: {
            articles: true
          }
        }
      }
    });

    res.status(201).json({
      success: true,
      message: 'Category created successfully',
      data: { category }
    });
  } catch (error) {
    next(error);
  }
});

// @desc    Update category
// @route   PUT /api/categories/:id
// @access  Private (Editor, Admin)
router.put('/:id', authenticate, authorize('EDITOR', 'ADMIN'), [
  body('name').optional().trim().isLength({ min: 2, max: 100 }),
  body('description').optional().trim().isLength({ max: 500 }),
  body('color').optional().matches(/^#[0-9A-F]{6}$/i),
  body('icon').optional().trim(),
  body('sortOrder').optional().isInt({ min: 0 }),
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
    const {
      name,
      description,
      color,
      icon,
      isActive,
      sortOrder
    } = req.body;

    // Check if category exists
    const existingCategory = await prisma.category.findUnique({
      where: { id }
    });

    if (!existingCategory) {
      return res.status(404).json({
        success: false,
        message: 'Category not found'
      });
    }

    // Generate new slug if name changed
    let slug = existingCategory.slug;
    if (name && name !== existingCategory.name) {
      slug = slugify(name, { lower: true, strict: true });
      
      // Check if new slug conflicts
      const slugConflict = await prisma.category.findUnique({
        where: { slug }
      });

      if (slugConflict && slugConflict.id !== id) {
        return res.status(400).json({
          success: false,
          message: 'Category with this name or slug already exists'
        });
      }
    }

    const category = await prisma.category.update({
      where: { id },
      data: {
        ...(name && { name }),
        ...(slug !== existingCategory.slug && { slug }),
        ...(description !== undefined && { description }),
        ...(color !== undefined && { color }),
        ...(icon !== undefined && { icon }),
        ...(isActive !== undefined && { isActive }),
        ...(sortOrder !== undefined && { sortOrder })
      },
      include: {
        _count: {
          select: {
            articles: {
              where: { status: 'PUBLISHED' }
            }
          }
        }
      }
    });

    res.json({
      success: true,
      message: 'Category updated successfully',
      data: { category }
    });
  } catch (error) {
    next(error);
  }
});

// @desc    Delete category
// @route   DELETE /api/categories/:id
// @access  Private (Admin)
router.delete('/:id', authenticate, authorize('ADMIN'), async (req, res, next) => {
  try {
    const { id } = req.params;

    const category = await prisma.category.findUnique({
      where: { id },
      include: {
        _count: {
          select: {
            articles: true
          }
        }
      }
    });

    if (!category) {
      return res.status(404).json({
        success: false,
        message: 'Category not found'
      });
    }

    // Check if category has articles
    if (category._count.articles > 0) {
      return res.status(400).json({
        success: false,
        message: 'Cannot delete category with articles. Please reassign or delete articles first.'
      });
    }

    await prisma.category.delete({
      where: { id }
    });

    res.json({
      success: true,
      message: 'Category deleted successfully'
    });
  } catch (error) {
    next(error);
  }
});

module.exports = router;