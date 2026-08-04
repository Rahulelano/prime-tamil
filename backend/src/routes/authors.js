const express = require('express');
const { body, query, validationResult } = require('express-validator');
const slugify = require('slugify');
const { prisma } = require('../utils/database');
const { authenticate, authorize } = require('../middleware/auth');

const router = express.Router();

// @desc    Get all authors
// @route   GET /api/authors
// @access  Public
router.get('/', async (req, res, next) => {
  try {
    const page = parseInt(req.query.page) || 1;
    const limit = parseInt(req.query.limit) || 20;
    const skip = (page - 1) * limit;
    const search = req.query.search;
    const role = req.query.role;
    const status = req.query.status;

    // Build where clause
    const where = {};
    
    if (search) {
      where.OR = [
        { name: { contains: search } },
        { email: { contains: search } },
        { bio: { contains: search } }
      ];
    }

    if (role) {
      where.role = role;
    }

    if (status) {
      where.status = status;
    } else {
      // Default to active authors for public
      where.status = 'ACTIVE';
    }

    const authors = await prisma.author.findMany({
      where,
      skip,
      take: limit,
      orderBy: { name: 'asc' },
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

    const total = await prisma.author.count({ where });

    res.json({
      success: true,
      data: {
        authors,
        pagination: {
          currentPage: page,
          totalPages: Math.ceil(total / limit),
          totalAuthors: total,
          hasNextPage: page < Math.ceil(total / limit),
          hasPrevPage: page > 1
        }
      }
    });
  } catch (error) {
    next(error);
  }
});

// @desc    Get single author
// @route   GET /api/authors/:id
// @access  Public
router.get('/:id', async (req, res, next) => {
  try {
    const { id } = req.params;

    const author = await prisma.author.findUnique({
      where: { id },
      include: {
        articles: {
          where: { status: 'PUBLISHED' },
          take: 10,
          orderBy: { publishedAt: 'desc' },
          include: {
            category: {
              select: {
                id: true,
                name: true,
                slug: true
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

    if (!author) {
      return res.status(404).json({
        success: false,
        message: 'Author not found'
      });
    }

    res.json({
      success: true,
      data: { author }
    });
  } catch (error) {
    next(error);
  }
});

// @desc    Create new author
// @route   POST /api/authors
// @access  Private (Editor, Admin)
router.post('/', authenticate, authorize('EDITOR', 'ADMIN'), [
  body('name').trim().isLength({ min: 2 }),
  body('email').isEmail().normalizeEmail(),
  body('bio').trim().isLength({ min: 10, max: 1000 }),
  body('role').optional().isIn(['ADMIN', 'EDITOR', 'AUTHOR', 'REPORTER']),
  body('specialties').optional().isArray(),
  body('phone').optional().isMobilePhone(),
  body('location').optional().trim()
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
      email,
      phone,
      bio,
      avatar,
      role = 'AUTHOR',
      specialties = [],
      socialLinks,
      location,
      verified = false
    } = req.body;

    // Check if author already exists
    const existingAuthor = await prisma.author.findUnique({
      where: { email }
    });

    if (existingAuthor) {
      return res.status(400).json({
        success: false,
        message: 'Author already exists with this email'
      });
    }

    const author = await prisma.author.create({
      data: {
        name,
        email,
        phone,
        bio,
        avatar,
        role,
        specialties,
        socialLinks,
        location,
        verified
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
      message: 'Author created successfully',
      data: { author }
    });
  } catch (error) {
    next(error);
  }
});

// @desc    Update author
// @route   PUT /api/authors/:id
// @access  Private (Editor, Admin)
router.put('/:id', authenticate, authorize('EDITOR', 'ADMIN'), [
  body('name').optional().trim().isLength({ min: 2 }),
  body('email').optional().isEmail().normalizeEmail(),
  body('bio').optional().trim().isLength({ min: 10, max: 1000 }),
  body('role').optional().isIn(['ADMIN', 'EDITOR', 'AUTHOR', 'REPORTER']),
  body('specialties').optional().isArray(),
  body('phone').optional().isMobilePhone(),
  body('location').optional().trim(),
  body('status').optional().isIn(['ACTIVE', 'INACTIVE', 'SUSPENDED'])
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
      email,
      phone,
      bio,
      avatar,
      role,
      specialties,
      socialLinks,
      location,
      verified,
      status
    } = req.body;

    // Check if author exists
    const existingAuthor = await prisma.author.findUnique({
      where: { id }
    });

    if (!existingAuthor) {
      return res.status(404).json({
        success: false,
        message: 'Author not found'
      });
    }

    // Check email uniqueness if email is being updated
    if (email && email !== existingAuthor.email) {
      const emailConflict = await prisma.author.findUnique({
        where: { email }
      });

      if (emailConflict) {
        return res.status(400).json({
          success: false,
          message: 'Author already exists with this email'
        });
      }
    }

    const author = await prisma.author.update({
      where: { id },
      data: {
        ...(name && { name }),
        ...(email && { email }),
        ...(phone !== undefined && { phone }),
        ...(bio && { bio }),
        ...(avatar !== undefined && { avatar }),
        ...(role && { role }),
        ...(specialties && { specialties }),
        ...(socialLinks !== undefined && { socialLinks }),
        ...(location !== undefined && { location }),
        ...(verified !== undefined && { verified }),
        ...(status && { status }),
        lastActive: new Date()
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
      message: 'Author updated successfully',
      data: { author }
    });
  } catch (error) {
    next(error);
  }
});

// @desc    Delete author
// @route   DELETE /api/authors/:id
// @access  Private (Admin)
router.delete('/:id', authenticate, authorize('ADMIN'), async (req, res, next) => {
  try {
    const { id } = req.params;

    const author = await prisma.author.findUnique({
      where: { id },
      include: {
        _count: {
          select: {
            articles: true
          }
        }
      }
    });

    if (!author) {
      return res.status(404).json({
        success: false,
        message: 'Author not found'
      });
    }

    // Check if author has published articles
    if (author._count.articles > 0) {
      return res.status(400).json({
        success: false,
        message: 'Cannot delete author with published articles. Please reassign or delete articles first.'
      });
    }

    await prisma.author.delete({
      where: { id }
    });

    res.json({
      success: true,
      message: 'Author deleted successfully'
    });
  } catch (error) {
    next(error);
  }
});

// @desc    Get author statistics
// @route   GET /api/authors/:id/stats
// @access  Public
router.get('/:id/stats', async (req, res, next) => {
  try {
    const { id } = req.params;

    const author = await prisma.author.findUnique({
      where: { id },
      include: {
        articles: {
          where: { status: 'PUBLISHED' },
          select: {
            id: true,
            views: true,
            likes: true,
            shares: true,
            publishedAt: true
          }
        }
      }
    });

    if (!author) {
      return res.status(404).json({
        success: false,
        message: 'Author not found'
      });
    }

    // Calculate statistics
    const totalArticles = author.articles.length;
    const totalViews = author.articles.reduce((sum, article) => sum + article.views, 0);
    const totalLikes = author.articles.reduce((sum, article) => sum + article.likes, 0);
    const totalShares = author.articles.reduce((sum, article) => sum + article.shares, 0);
    const averageViews = totalArticles > 0 ? Math.round(totalViews / totalArticles) : 0;

    // Get articles by month for the last 6 months
    const sixMonthsAgo = new Date();
    sixMonthsAgo.setMonth(sixMonthsAgo.getMonth() - 6);

    const articlesByMonth = author.articles
      .filter(article => new Date(article.publishedAt) >= sixMonthsAgo)
      .reduce((acc, article) => {
        const month = new Date(article.publishedAt).toISOString().slice(0, 7); // YYYY-MM
        acc[month] = (acc[month] || 0) + 1;
        return acc;
      }, {});

    res.json({
      success: true,
      data: {
        stats: {
          totalArticles,
          totalViews,
          totalLikes,
          totalShares,
          averageViews,
          articlesByMonth
        }
      }
    });
  } catch (error) {
    next(error);
  }
});

module.exports = router;