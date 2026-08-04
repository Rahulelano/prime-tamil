const express = require('express');
const { body, query, validationResult } = require('express-validator');
const slugify = require('slugify');
const { prisma } = require('../utils/database');
const { authenticate, authorize, optionalAuth } = require('../middleware/auth');

const router = express.Router();

// @desc    Get all articles
// @route   GET /api/articles
// @access  Public
router.get('/', [
  query('page').optional().isInt({ min: 1 }),
  query('limit').optional().isInt({ min: 1, max: 100 }),
  query('status').optional().isIn(['DRAFT', 'REVIEW', 'PUBLISHED', 'ARCHIVED']),
  query('category').optional().isString(),
  query('author').optional().isString(),
  query('featured').optional().isBoolean(),
  query('breaking').optional().isBoolean(),
  query('search').optional().isString()
], optionalAuth, async (req, res, next) => {
  try {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({
        success: false,
        message: 'Validation failed',
        errors: errors.array()
      });
    }

    const page = parseInt(req.query.page) || 1;
    const limit = parseInt(req.query.limit) || 12;
    const skip = (page - 1) * limit;

    // Build where clause
    const where = {};

    if (req.user) {
      // If authenticated, can see more articles based on role
      if (!['ADMIN', 'EDITOR'].includes(req.user.role)) {
        where.status = 'PUBLISHED';
      }
    } else {
      // If not authenticated, only show published articles
      where.status = 'PUBLISHED';
    }

    if (req.query.category) {
      where.categoryId = req.query.category;
    }

    if (req.query.author) {
      where.authorId = req.query.author;
    }

    if (req.query.featured === 'true') {
      where.isFeatured = true;
    }

    if (req.query.breaking === 'true') {
      where.isBreaking = true;
    }

    if (req.query.search) {
      where.OR = [
        { title: { contains: req.query.search } },
        { excerpt: { contains: req.query.search } },
        { content: { contains: req.query.search } }
      ];
    }

    // Get articles with relations
    const articles = await prisma.article.findMany({
      where,
      skip,
      take: limit,
      orderBy: [
        { isBreaking: 'desc' },
        { publishedAt: 'desc' }
      ],
      include: {
        category: {
          select: {
            id: true,
            name: true,
            slug: true
          }
        },
        author: {
          select: {
            id: true,
            name: true,
            bio: true,
            avatar: true
          }
        }
      }
    });

    // Get total count for pagination
    const total = await prisma.article.count({ where });
    const totalPages = Math.ceil(total / limit);

    res.json({
      success: true,
      data: {
        articles,
        pagination: {
          currentPage: page,
          totalPages,
          totalArticles: total,
          hasNextPage: page < totalPages,
          hasPrevPage: page > 1
        }
      }
    });
  } catch (error) {
    next(error);
  }
});

// @desc    Get single article by slug
// @route   GET /api/articles/:slug
// @access  Public
router.get('/:slug', optionalAuth, async (req, res, next) => {
  try {
    const { slug } = req.params;

    const article = await prisma.article.findUnique({
      where: { slug },
      include: {
        category: true,
        author: true,
        comments: {
          where: { status: 'APPROVED' },
          orderBy: { createdAt: 'desc' },
          include: {
            replies: {
              where: { status: 'APPROVED' },
              orderBy: { createdAt: 'asc' }
            }
          }
        }
      }
    });

    if (!article) {
      return res.status(404).json({
        success: false,
        message: 'Article not found'
      });
    }

    // Check if user can view this article
    if (article.status !== 'PUBLISHED') {
      if (!req.user || !['ADMIN', 'EDITOR'].includes(req.user.role)) {
        return res.status(404).json({
          success: false,
          message: 'Article not found'
        });
      }
    }

    // Increment view count for published articles
    if (article.status === 'PUBLISHED') {
      await prisma.article.update({
        where: { id: article.id },
        data: { views: { increment: 1 } }
      });
    }

    res.json({
      success: true,
      data: { article }
    });
  } catch (error) {
    next(error);
  }
});

// @desc    Create new article
// @route   POST /api/articles
// @access  Private (Author, Editor, Admin) - Temporarily disabled for development
router.post('/', process.env.NODE_ENV === 'production' ? [authenticate, authorize('AUTHOR', 'EDITOR', 'ADMIN')] : [], [
  body('title').trim().isLength({ min: 5, max: 200 }),
  body('excerpt').trim().isLength({ min: 10, max: 500 }),
  body('content').trim().isLength({ min: 50 }),
  body('categoryId').isString(),
  body('categoryId').isString(),
  body('authorId').optional().isString(),
  body('authorName').optional().isString(),
  body('authorLogo').optional().isString(),
  body('status').optional().isIn(['DRAFT', 'REVIEW', 'PUBLISHED']),
  body('isFeatured').optional().isBoolean(),
  body('isBreaking').optional().isBoolean()
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
      title,
      excerpt,
      content,
      categoryId,
      authorId,
      authorName,
      authorLogo,
      images = [],
      status = 'DRAFT',
      isFeatured = false,
      isBreaking = false,
      seoTitle,
      seoDescription,
      seoKeywords,
      publishedAt,
      scheduledFor
    } = req.body;

    // Generate slug from title
    const slug = slugify(title, { lower: true, strict: true });

    // Check if slug already exists
    const existingArticle = await prisma.article.findUnique({
      where: { slug }
    });

    if (existingArticle) {
      return res.status(400).json({
        success: false,
        message: 'Article with similar title already exists'
      });
    }

    // Verify category and author exist
    const [category, author] = await Promise.all([
      prisma.category.findUnique({ where: { id: categoryId } }),
      prisma.author.findUnique({ where: { id: authorId } })
    ]);

    if (!category) {
      return res.status(400).json({
        success: false,
        message: 'Invalid category'
      });
    }

    if (!author && !authorName) {
      return res.status(400).json({
        success: false,
        message: 'Either author selection or manual author name is required'
      });
    }

    // Create article
    const article = await prisma.article.create({
      data: {
        title,
        slug,
        excerpt,
        content,
        categoryId,
        authorId,
        authorName,
        authorLogo,
        userId: req.user?.id || 'dev-user', // Default user for development
        images,
        status,
        isFeatured,
        isBreaking,
        seoTitle,
        seoDescription,
        seoKeywords: seoKeywords || '',
        publishedAt: status === 'PUBLISHED' ? (publishedAt || new Date()) : null,
        scheduledFor
      },
      include: {
        category: {
          select: {
            id: true,
            name: true,
            slug: true
          }
        },
        author: {
          select: {
            id: true,
            name: true,
            bio: true,
            avatar: true
          }
        }
      }
    });

    res.status(201).json({
      success: true,
      message: 'Article created successfully',
      data: { article }
    });
  } catch (error) {
    next(error);
  }
});

// @desc    Update article
// @route   PUT /api/articles/:id
// @access  Private (Author, Editor, Admin) - Temporarily disabled for development
router.put('/:id', process.env.NODE_ENV === 'production' ? [authenticate, authorize('AUTHOR', 'EDITOR', 'ADMIN')] : [], async (req, res, next) => {
  try {
    const { id } = req.params;
    const {
      title,
      excerpt,
      content,
      categoryId,
      authorId,
      authorName,
      authorLogo,
      images,
      status,
      isFeatured,
      isBreaking,
      seoTitle,
      seoDescription,
      seoKeywords,
      publishedAt,
      scheduledFor
    } = req.body;

    // Check if article exists
    const existingArticle = await prisma.article.findUnique({
      where: { id },
      include: { user: true }
    });

    if (!existingArticle) {
      return res.status(404).json({
        success: false,
        message: 'Article not found'
      });
    }

    // Check permissions (skip in development)
    if (process.env.NODE_ENV === 'production' && req.user?.role === 'AUTHOR' && existingArticle.userId !== req.user.id) {
      return res.status(403).json({
        success: false,
        message: 'Not authorized to update this article'
      });
    }

    // Generate new slug if title changed
    let slug = existingArticle.slug;
    if (title && title !== existingArticle.title) {
      slug = slugify(title, { lower: true, strict: true });

      // Check if new slug conflicts
      const slugConflict = await prisma.article.findUnique({
        where: { slug }
      });

      if (slugConflict && slugConflict.id !== id) {
        return res.status(400).json({
          success: false,
          message: 'Article with similar title already exists'
        });
      }
    }

    // Verify category and author if provided
    if (categoryId) {
      const category = await prisma.category.findUnique({ where: { id: categoryId } });
      if (!category) {
        return res.status(400).json({
          success: false,
          message: 'Invalid category'
        });
      }
    }

    if (authorId) {
      const author = await prisma.author.findUnique({ where: { id: authorId } });
      if (!author) {
        return res.status(400).json({
          success: false,
          message: 'Invalid author'
        });
      }
    }

    // Update article
    const article = await prisma.article.update({
      where: { id },
      data: {
        ...(title && { title }),
        ...(slug !== existingArticle.slug && { slug }),
        ...(excerpt && { excerpt }),
        ...(content && { content }),
        ...(categoryId && { categoryId }),
        ...(authorId !== undefined && { authorId }),
        ...(authorName !== undefined && { authorName }),
        ...(authorLogo !== undefined && { authorLogo }),
        ...(images !== undefined && { images }),
        ...(status && { status }),
        ...(isFeatured !== undefined && { isFeatured }),
        ...(isBreaking !== undefined && { isBreaking }),
        ...(seoTitle !== undefined && { seoTitle }),
        ...(seoDescription !== undefined && { seoDescription }),
        ...(seoKeywords && { seoKeywords }),
        ...(publishedAt && { publishedAt }),
        ...(scheduledFor !== undefined && { scheduledFor }),
        // Set publishedAt when publishing
        ...(status === 'PUBLISHED' && !existingArticle.publishedAt && { publishedAt: new Date() })
      },
      include: {
        category: {
          select: {
            id: true,
            name: true,
            slug: true
          }
        },
        author: {
          select: {
            id: true,
            name: true,
            bio: true,
            avatar: true
          }
        }
      }
    });

    res.json({
      success: true,
      message: 'Article updated successfully',
      data: { article }
    });
  } catch (error) {
    next(error);
  }
});

// @desc    Delete article
// @route   DELETE /api/articles/:id
// @access  Private (Editor, Admin) - Temporarily disabled for development
router.delete('/:id', process.env.NODE_ENV === 'production' ? [authenticate, authorize('EDITOR', 'ADMIN')] : [], async (req, res, next) => {
  try {
    const { id } = req.params;

    const article = await prisma.article.findUnique({
      where: { id }
    });

    if (!article) {
      return res.status(404).json({
        success: false,
        message: 'Article not found'
      });
    }

    await prisma.article.delete({
      where: { id }
    });

    res.json({
      success: true,
      message: 'Article deleted successfully'
    });
  } catch (error) {
    next(error);
  }
});

// @desc    Get featured articles
// @route   GET /api/articles/featured
// @access  Public
router.get('/featured/list', async (req, res, next) => {
  try {
    const limit = parseInt(req.query.limit) || 5;

    const articles = await prisma.article.findMany({
      where: {
        status: 'PUBLISHED',
        isFeatured: true
      },
      take: limit,
      orderBy: { publishedAt: 'desc' },
      include: {
        category: {
          select: {
            id: true,
            name: true,
            slug: true
          }
        },
        author: {
          select: {
            id: true,
            name: true,
            bio: true,
            avatar: true
          }
        }
      }
    });

    res.json({
      success: true,
      data: { articles }
    });
  } catch (error) {
    next(error);
  }
});

// @desc    Get breaking news
// @route   GET /api/articles/breaking
// @access  Public
router.get('/breaking/list', async (req, res, next) => {
  try {
    const limit = parseInt(req.query.limit) || 10;

    const articles = await prisma.article.findMany({
      where: {
        status: 'PUBLISHED',
        isBreaking: true
      },
      take: limit,
      orderBy: { publishedAt: 'desc' },
      select: {
        id: true,
        title: true,
        slug: true,
        excerpt: true,
        publishedAt: true
      }
    });

    res.json({
      success: true,
      data: { articles }
    });
  } catch (error) {
    next(error);
  }
});

// @desc    Get trending articles
// @route   GET /api/articles/trending
// @access  Public
router.get('/trending/list', async (req, res, next) => {
  try {
    const limit = parseInt(req.query.limit) || 5;

    const articles = await prisma.article.findMany({
      where: {
        status: 'PUBLISHED'
      },
      take: limit,
      orderBy: { views: 'desc' },
      include: {
        category: {
          select: {
            id: true,
            name: true,
            slug: true
          }
        },
        author: {
          select: {
            id: true,
            name: true,
            bio: true,
            avatar: true
          }
        }
      }
    });

    res.json({
      success: true,
      data: { articles }
    });
  } catch (error) {
    next(error);
  }
});

// @desc    Search articles
// @route   GET /api/articles/search
// @access  Public
router.get('/search', [
  query('q').isString().isLength({ min: 1 }),
  query('page').optional().isInt({ min: 1 }),
  query('limit').optional().isInt({ min: 1, max: 50 })
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

    const { q: searchTerm } = req.query;
    const page = parseInt(req.query.page) || 1;
    const limit = parseInt(req.query.limit) || 20;
    const skip = (page - 1) * limit;

    const articles = await prisma.article.findMany({
      where: {
        status: 'PUBLISHED',
        OR: [
          { title: { contains: searchTerm } },
          { excerpt: { contains: searchTerm } },
          { content: { contains: searchTerm } }
        ]
      },
      skip,
      take: limit,
      orderBy: { publishedAt: 'desc' },
      include: {
        category: {
          select: {
            id: true,
            name: true,
            slug: true
          }
        },
        author: {
          select: {
            id: true,
            name: true,
            bio: true,
            avatar: true
          }
        }
      }
    });

    const total = await prisma.article.count({
      where: {
        status: 'PUBLISHED',
        OR: [
          { title: { contains: searchTerm } },
          { excerpt: { contains: searchTerm } },
          { content: { contains: searchTerm } }
        ]
      }
    });

    res.json({
      success: true,
      data: {
        articles,
        pagination: {
          currentPage: page,
          totalPages: Math.ceil(total / limit),
          totalArticles: total,
          hasNextPage: page < Math.ceil(total / limit),
          hasPrevPage: page > 1
        }
      }
    });
  } catch (error) {
    next(error);
  }
});

module.exports = router;