const express = require('express');
const { body, query, validationResult } = require('express-validator');
const { prisma } = require('../utils/database');
const { authenticate, authorize, optionalAuth } = require('../middleware/auth');

const router = express.Router();

// @desc    Get comments for an article
// @route   GET /api/comments
// @access  Public
router.get('/', optionalAuth, async (req, res, next) => {
  try {
    const { articleId, status, page = 1, limit = 20 } = req.query;
    const skip = (parseInt(page) - 1) * parseInt(limit);

    if (!articleId) {
      return res.status(400).json({
        success: false,
        message: 'Article ID is required'
      });
    }

    // Build where clause
    const where = { articleId };
    
    // If not authenticated or not admin/editor, only show approved comments
    if (!req.user || !['ADMIN', 'EDITOR'].includes(req.user.role)) {
      where.status = 'APPROVED';
    } else if (status) {
      where.status = status;
    }

    const comments = await prisma.comment.findMany({
      where,
      skip,
      take: parseInt(limit),
      orderBy: { createdAt: 'desc' },
      include: {
        replies: {
          where: { status: 'APPROVED' },
          orderBy: { createdAt: 'asc' }
        }
      }
    });

    const total = await prisma.comment.count({ where });

    res.json({
      success: true,
      data: {
        comments,
        pagination: {
          currentPage: parseInt(page),
          totalPages: Math.ceil(total / parseInt(limit)),
          totalComments: total,
          hasNextPage: parseInt(page) < Math.ceil(total / parseInt(limit)),
          hasPrevPage: parseInt(page) > 1
        }
      }
    });
  } catch (error) {
    next(error);
  }
});

// @desc    Create new comment
// @route   POST /api/comments
// @access  Public
router.post('/', [
  body('articleId').isString(),
  body('content').trim().isLength({ min: 5, max: 1000 }),
  body('authorName').trim().isLength({ min: 2, max: 100 }),
  body('authorEmail').isEmail().normalizeEmail(),
  body('parentId').optional().isString()
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

    const { articleId, content, authorName, authorEmail, parentId } = req.body;

    // Check if article exists and is published
    const article = await prisma.article.findUnique({
      where: { id: articleId }
    });

    if (!article || article.status !== 'PUBLISHED') {
      return res.status(404).json({
        success: false,
        message: 'Article not found'
      });
    }

    // If it's a reply, check if parent comment exists
    if (parentId) {
      const parentComment = await prisma.comment.findUnique({
        where: { id: parentId }
      });

      if (!parentComment || parentComment.articleId !== articleId) {
        return res.status(400).json({
          success: false,
          message: 'Invalid parent comment'
        });
      }
    }

    // Get client IP for spam prevention
    const clientIP = req.ip || req.connection.remoteAddress || req.socket.remoteAddress;

    // Create comment (default status PENDING for moderation)
    const comment = await prisma.comment.create({
      data: {
        content,
        authorName,
        authorEmail,
        authorIp: clientIP,
        articleId,
        parentId,
        status: 'PENDING' // Comments require moderation
      },
      include: {
        replies: {
          where: { status: 'APPROVED' },
          orderBy: { createdAt: 'asc' }
        }
      }
    });

    res.status(201).json({
      success: true,
      message: 'Comment submitted successfully. It will be visible after moderation.',
      data: { comment }
    });
  } catch (error) {
    next(error);
  }
});

// @desc    Update comment status (moderate)
// @route   PUT /api/comments/:id/status
// @access  Private (Editor, Admin)
router.put('/:id/status', authenticate, authorize('EDITOR', 'ADMIN'), [
  body('status').isIn(['PENDING', 'APPROVED', 'REJECTED', 'SPAM'])
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
    const { status } = req.body;

    const comment = await prisma.comment.findUnique({
      where: { id },
      include: {
        replies: true
      }
    });

    if (!comment) {
      return res.status(404).json({
        success: false,
        message: 'Comment not found'
      });
    }

    const updatedComment = await prisma.comment.update({
      where: { id },
      data: { status },
      include: {
        replies: {
          where: { status: 'APPROVED' },
          orderBy: { createdAt: 'asc' }
        }
      }
    });

    res.json({
      success: true,
      message: 'Comment status updated successfully',
      data: { comment: updatedComment }
    });
  } catch (error) {
    next(error);
  }
});

// @desc    Update comment
// @route   PUT /api/comments/:id
// @access  Private (Author of comment or Admin/Editor)
router.put('/:id', authenticate, async (req, res, next) => {
  try {
    const { id } = req.params;
    const { content } = req.body;

    if (!content) {
      return res.status(400).json({
        success: false,
        message: 'Content is required'
      });
    }

    const comment = await prisma.comment.findUnique({
      where: { id }
    });

    if (!comment) {
      return res.status(404).json({
        success: false,
        message: 'Comment not found'
      });
    }

    // Check permissions - only author or admin/editor can edit
    const isOwner = comment.authorEmail === req.user?.email;
    const isAdmin = req.user && ['ADMIN', 'EDITOR'].includes(req.user.role);

    if (!isOwner && !isAdmin) {
      return res.status(403).json({
        success: false,
        message: 'Not authorized to edit this comment'
      });
    }

    // Reset to pending after editing
    const updatedComment = await prisma.comment.update({
      where: { id },
      data: {
        content,
        status: 'PENDING'
      },
      include: {
        replies: {
          where: { status: 'APPROVED' },
          orderBy: { createdAt: 'asc' }
        }
      }
    });

    res.json({
      success: true,
      message: 'Comment updated successfully. It will be visible after moderation.',
      data: { comment: updatedComment }
    });
  } catch (error) {
    next(error);
  }
});

// @desc    Delete comment
// @route   DELETE /api/comments/:id
// @access  Private (Author of comment or Admin/Editor)
router.delete('/:id', authenticate, async (req, res, next) => {
  try {
    const { id } = req.params;

    const comment = await prisma.comment.findUnique({
      where: { id },
      include: {
        replies: true
      }
    });

    if (!comment) {
      return res.status(404).json({
        success: false,
        message: 'Comment not found'
      });
    }

    // Check permissions
    const isOwner = comment.authorEmail === req.user?.email;
    const isAdmin = req.user && ['ADMIN', 'EDITOR'].includes(req.user.role);

    if (!isOwner && !isAdmin) {
      return res.status(403).json({
        success: false,
        message: 'Not authorized to delete this comment'
      });
    }

    // Delete comment and its replies
    await prisma.comment.deleteMany({
      where: {
        OR: [
          { id },
          { parentId: id }
        ]
      }
    });

    res.json({
      success: true,
      message: 'Comment deleted successfully'
    });
  } catch (error) {
    next(error);
  }
});

// @desc    Get pending comments for moderation
// @route   GET /api/comments/moderation/pending
// @access  Private (Editor, Admin)
router.get('/moderation/pending', authenticate, authorize('EDITOR', 'ADMIN'), async (req, res, next) => {
  try {
    const { page = 1, limit = 20 } = req.query;
    const skip = (parseInt(page) - 1) * parseInt(limit);

    const [comments, total] = await Promise.all([
      prisma.comment.findMany({
        where: { status: 'PENDING' },
        skip,
        take: parseInt(limit),
        orderBy: { createdAt: 'desc' },
        include: {
          article: {
            select: {
              id: true,
              title: true,
              slug: true
            }
          }
        }
      }),
      prisma.comment.count({
        where: { status: 'PENDING' }
      })
    ]);

    res.json({
      success: true,
      data: {
        comments,
        pagination: {
          currentPage: parseInt(page),
          totalPages: Math.ceil(total / parseInt(limit)),
          totalComments: total,
          hasNextPage: parseInt(page) < Math.ceil(total / parseInt(limit)),
          hasPrevPage: parseInt(page) > 1
        }
      }
    });
  } catch (error) {
    next(error);
  }
});

module.exports = router;