const express = require('express');
const { prisma } = require('../utils/database');
const { authenticate, authorize } = require('../middleware/auth');

const router = express.Router();

// All admin routes require authentication and admin role
router.use(authenticate);
router.use(authorize('ADMIN', 'EDITOR'));

// @desc    Get dashboard statistics
// @route   GET /api/admin/dashboard
// @access  Private (Admin, Editor)
router.get('/dashboard', async (req, res, next) => {
  try {
    const [
      totalArticles,
      publishedArticles,
      draftArticles,
      totalAuthors,
      totalCategories,
      totalViews,
      totalComments,
      recentArticles,
      topArticles,
      categoryStats
    ] = await Promise.all([
      // Total articles count
      prisma.article.count(),
      
      // Published articles count
      prisma.article.count({
        where: { status: 'PUBLISHED' }
      }),
      
      // Draft articles count
      prisma.article.count({
        where: { status: 'DRAFT' }
      }),
      
      // Total authors count
      prisma.author.count({
        where: { status: 'ACTIVE' }
      }),
      
      // Total categories count
      prisma.category.count({
        where: { isActive: true }
      }),
      
      // Total views across all articles
      prisma.article.aggregate({
        _sum: { views: true }
      }),
      
      // Total comments
      prisma.comment.count({
        where: { status: 'APPROVED' }
      }),
      
      // Recent articles (last 10)
      prisma.article.findMany({
        take: 10,
        orderBy: { createdAt: 'desc' },
        include: {
          category: { select: { name: true } },
          author: { select: { name: true } }
        }
      }),
      
      // Top performing articles
      prisma.article.findMany({
        where: { status: 'PUBLISHED' },
        take: 5,
        orderBy: { views: 'desc' },
        include: {
          category: { select: { name: true } },
          author: { select: { name: true } }
        }
      }),
      
      // Articles by category
      prisma.category.findMany({
        where: { isActive: true },
        include: {
          _count: {
            select: {
              articles: {
                where: { status: 'PUBLISHED' }
              }
            }
          }
        }
      })
    ]);

    // Calculate growth percentages (this would be more sophisticated in production)
    const stats = {
      totalArticles,
      publishedArticles,
      draftArticles,
      totalAuthors,
      totalCategories,
      totalViews: totalViews._sum.views || 0,
      totalComments
    };

    res.json({
      success: true,
      data: {
        stats,
        recentArticles,
        topArticles,
        categoryStats
      }
    });
  } catch (error) {
    next(error);
  }
});

// @desc    Get articles analytics
// @route   GET /api/admin/analytics/articles
// @access  Private (Admin, Editor)
router.get('/analytics/articles', async (req, res, next) => {
  try {
    const { period = '30' } = req.query; // days
    const startDate = new Date();
    startDate.setDate(startDate.getDate() - parseInt(period));

    const [
      articlesByStatus,
      articlesByCategory,
      articlesGrowth,
      topAuthors
    ] = await Promise.all([
      // Articles by status
      prisma.article.groupBy({
        by: ['status'],
        _count: { id: true }
      }),

      // Articles by category
      prisma.category.findMany({
        where: { isActive: true },
        include: {
          _count: {
            select: {
              articles: {
                where: { status: 'PUBLISHED' }
              }
            }
          }
        }
      }),

      // Articles created over time
      prisma.article.findMany({
        where: {
          createdAt: { gte: startDate }
        },
        select: {
          createdAt: true,
          status: true
        },
        orderBy: { createdAt: 'asc' }
      }),

      // Top authors by article count
      prisma.author.findMany({
        where: { status: 'ACTIVE' },
        take: 10,
        include: {
          _count: {
            select: {
              articles: {
                where: { status: 'PUBLISHED' }
              }
            }
          }
        },
        orderBy: {
          articles: {
            _count: 'desc'
          }
        }
      })
    ]);

    // Process articles growth data
    const growthData = articlesGrowth.reduce((acc, article) => {
      const date = article.createdAt.toISOString().split('T')[0];
      if (!acc[date]) {
        acc[date] = { total: 0, published: 0, draft: 0 };
      }
      acc[date].total++;
      acc[date][article.status.toLowerCase()]++;
      return acc;
    }, {});

    res.json({
      success: true,
      data: {
        articlesByStatus,
        articlesByCategory,
        growthData,
        topAuthors
      }
    });
  } catch (error) {
    next(error);
  }
});

// @desc    Get user management data
// @route   GET /api/admin/users
// @access  Private (Admin)
router.get('/users', authorize('ADMIN'), async (req, res, next) => {
  try {
    const { page = 1, limit = 20, search, role, status } = req.query;
    const skip = (parseInt(page) - 1) * parseInt(limit);

    // Build where clause
    const where = {};
    
    if (search) {
      where.OR = [
        { name: { contains: search } },
        { email: { contains: search } }
      ];
    }

    if (role) {
      where.role = role;
    }

    if (status) {
      where.status = status;
    }

    const [users, total] = await Promise.all([
      prisma.user.findMany({
        where,
        skip,
        take: parseInt(limit),
        orderBy: { createdAt: 'desc' },
        select: {
          id: true,
          email: true,
          name: true,
          role: true,
          status: true,
          avatar: true,
          createdAt: true,
          updatedAt: true,
          _count: {
            select: { articles: true }
          }
        }
      }),
      prisma.user.count({ where })
    ]);

    res.json({
      success: true,
      data: {
        users,
        pagination: {
          currentPage: parseInt(page),
          totalPages: Math.ceil(total / parseInt(limit)),
          totalUsers: total,
          hasNextPage: parseInt(page) < Math.ceil(total / parseInt(limit)),
          hasPrevPage: parseInt(page) > 1
        }
      }
    });
  } catch (error) {
    next(error);
  }
});

// @desc    Update user status/role
// @route   PUT /api/admin/users/:id
// @access  Private (Admin)
router.put('/users/:id', authorize('ADMIN'), async (req, res, next) => {
  try {
    const { id } = req.params;
    const { role, status } = req.body;

    if (!role && !status) {
      return res.status(400).json({
        success: false,
        message: 'At least one field (role or status) is required'
      });
    }

    const user = await prisma.user.update({
      where: { id },
      data: {
        ...(role && { role }),
        ...(status && { status })
      },
      select: {
        id: true,
        email: true,
        name: true,
        role: true,
        status: true,
        updatedAt: true
      }
    });

    res.json({
      success: true,
      message: 'User updated successfully',
      data: { user }
    });
  } catch (error) {
    next(error);
  }
});

// @desc    Delete user
// @route   DELETE /api/admin/users/:id
// @access  Private (Admin)
router.delete('/users/:id', authorize('ADMIN'), async (req, res, next) => {
  try {
    const { id } = req.params;

    // Check if user exists
    const user = await prisma.user.findUnique({
      where: { id },
      include: {
        _count: {
          select: { articles: true }
        }
      }
    });

    if (!user) {
      return res.status(404).json({
        success: false,
        message: 'User not found'
      });
    }

    // Prevent deleting users with articles (or reassign them first)
    if (user._count.articles > 0) {
      return res.status(400).json({
        success: false,
        message: 'Cannot delete user with articles. Please reassign or delete articles first.'
      });
    }

    await prisma.user.delete({
      where: { id }
    });

    res.json({
      success: true,
      message: 'User deleted successfully'
    });
  } catch (error) {
    next(error);
  }
});

// @desc    Get system settings
// @route   GET /api/admin/settings
// @access  Private (Admin, Editor)
router.get('/settings', async (req, res, next) => {
  try {
    const settings = await prisma.setting.findMany({
      orderBy: [{ category: 'asc' }, { key: 'asc' }]
    });

    res.json({
      success: true,
      data: { settings }
    });
  } catch (error) {
    next(error);
  }
});

// @desc    Update system settings
// @route   PUT /api/admin/settings
// @access  Private (Admin)
router.put('/settings', authorize('ADMIN'), async (req, res, next) => {
  try {
    const settings = req.body;

    // Update multiple settings
    const updatePromises = Object.entries(settings).map(([key, value]) =>
      prisma.setting.upsert({
        where: { key },
        update: { value: value.toString() },
        create: {
          key,
          value: value.toString(),
          isPublic: false
        }
      })
    );

    await Promise.all(updatePromises);

    res.json({
      success: true,
      message: 'Settings updated successfully'
    });
  } catch (error) {
    next(error);
  }
});

// @desc    Get content moderation queue
// @route   GET /api/admin/moderation
// @access  Private (Admin, Editor)
router.get('/moderation', async (req, res, next) => {
  try {
    const [pendingComments, articlesForReview] = await Promise.all([
      prisma.comment.findMany({
        where: { status: 'PENDING' },
        include: {
          article: {
            select: {
              id: true,
              title: true,
              slug: true
            }
          }
        },
        orderBy: { createdAt: 'desc' },
        take: 50
      }),
      prisma.article.findMany({
        where: { status: 'REVIEW' },
        include: {
          category: { select: { name: true } },
          author: { select: { name: true } }
        },
        orderBy: { createdAt: 'desc' },
        take: 20
      })
    ]);

    res.json({
      success: true,
      data: {
        pendingComments,
        articlesForReview
      }
    });
  } catch (error) {
    next(error);
  }
});

module.exports = router;