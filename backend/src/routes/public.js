const express = require('express');
const { prisma } = require('../utils/database');

const router = express.Router();

// @desc    Get featured articles for homepage
// @route   GET /api/public/featured-articles
// @access  Public
router.get('/featured-articles', async (req, res, next) => {
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
// @route   GET /api/public/breaking-news
// @access  Public
router.get('/breaking-news', async (req, res, next) => {
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
// @route   GET /api/public/trending
// @access  Public
router.get('/trending', async (req, res, next) => {
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

// @desc    Get most read articles
// @route   GET /api/public/most-read
// @access  Public
router.get('/most-read', async (req, res, next) => {
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

// @desc    Get articles by category
// @route   GET /api/public/category/:slug
// @access  Public
router.get('/category/:slug', async (req, res, next) => {
  try {
    const { slug } = req.params;
    const page = parseInt(req.query.page) || 1;
    const limit = parseInt(req.query.limit) || 12;
    const skip = (page - 1) * limit;

    // Get category first
    const category = await prisma.category.findUnique({
      where: { slug }
    });

    if (!category) {
      return res.status(404).json({
        success: false,
        message: 'Category not found'
      });
    }

    // Get articles in this category
    const articles = await prisma.article.findMany({
      where: {
        status: 'PUBLISHED',
        categoryId: category.id
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

    // Get total count for pagination
    const total = await prisma.article.count({
      where: {
        status: 'PUBLISHED',
        categoryId: category.id
      }
    });

    const totalPages = Math.ceil(total / limit);

    res.json({
      success: true,
      data: {
        category: {
          id: category.id,
          name: category.name,
          slug: category.slug,
          description: category.description
        },
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

// @desc    Get article by slug
// @route   GET /api/public/article/:slug
// @access  Public
router.get('/article/:slug', async (req, res, next) => {
  try {
    const { slug } = req.params;

    const article = await prisma.article.findUnique({
      where: { slug },
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
        },
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

    if (!article || article.status !== 'PUBLISHED') {
      return res.status(404).json({
        success: false,
        message: 'Article not found'
      });
    }

    // Increment view count
    await prisma.article.update({
      where: { id: article.id },
      data: { views: { increment: 1 } }
    });

    // Get related articles
    const relatedArticles = await prisma.article.findMany({
      where: {
        status: 'PUBLISHED',
        categoryId: article.categoryId,
        id: { not: article.id }
      },
      take: 3,
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
      data: {
        article,
        relatedArticles
      }
    });
  } catch (error) {
    next(error);
  }
});

// @desc    Search articles
// @route   GET /api/public/search
// @access  Public
router.get('/search', async (req, res, next) => {
  try {
    const { q: searchTerm } = req.query;
    const page = parseInt(req.query.page) || 1;
    const limit = parseInt(req.query.limit) || 20;
    const skip = (page - 1) * limit;

    if (!searchTerm) {
      return res.status(400).json({
        success: false,
        message: 'Search term is required'
      });
    }

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
        searchTerm,
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

// @desc    Get all categories for navigation
// @route   GET /api/public/categories
// @access  Public
router.get('/categories', async (req, res, next) => {
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

// @desc    Get sidebar data (trending, most read, etc.)
// @route   GET /api/public/sidebar
// @access  Public
router.get('/sidebar', async (req, res, next) => {
  try {
    const [trending, mostRead] = await Promise.all([
      // Trending articles
      prisma.article.findMany({
        where: { status: 'PUBLISHED' },
        take: 5,
        orderBy: { views: 'desc' },
        select: {
          id: true,
          title: true,
          slug: true,
          excerpt: true,
          publishedAt: true,
          views: true
        }
      }),
      // Most read articles (same as trending for now, but could be different logic)
      prisma.article.findMany({
        where: { status: 'PUBLISHED' },
        take: 5,
        orderBy: { views: 'desc' },
        select: {
          id: true,
          title: true,
          slug: true,
          excerpt: true,
          publishedAt: true,
          views: true
        }
      })
    ]);

    res.json({
      success: true,
      data: {
        trendingArticles: trending,
        mostReadArticles: mostRead
      }
    });
  } catch (error) {
    next(error);
  }
});

module.exports = router;