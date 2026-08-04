const express = require('express');
const multer = require('multer');
const path = require('path');
const fs = require('fs').promises;
const { body, query, validationResult } = require('express-validator');
const { prisma } = require('../utils/database');
const { authenticate, authorize, optionalAuth } = require('../middleware/auth');

const router = express.Router();

// Configure multer for e-paper PDF uploads
const storage = multer.diskStorage({
  destination: async (req, file, cb) => {
    const uploadPath = path.join(__dirname, '../../uploads/epapers');
    try {
      await fs.access(uploadPath);
    } catch {
      await fs.mkdir(uploadPath, { recursive: true });
    }
    cb(null, uploadPath);
  },
  filename: (req, file, cb) => {
    const uniqueSuffix = Date.now() + '-' + Math.round(Math.random() * 1E9);
    const ext = path.extname(file.originalname);
    cb(null, 'epaper-' + uniqueSuffix + ext);
  }
});

const fileFilter = (req, file, cb) => {
  if (file.mimetype === 'application/pdf') {
    cb(null, true);
  } else {
    cb(new Error('Only PDF files are allowed for e-papers'), false);
  }
};

const upload = multer({
  storage,
  fileFilter,
  limits: {
    fileSize: 50 * 1024 * 1024, // 50MB for PDFs
  }
});

// @desc    Get all e-paper issues
// @route   GET /api/epaper
// @access  Public
router.get('/', optionalAuth, async (req, res, next) => {
  try {
    const { page = 1, limit = 12, year, month, status = 'PUBLISHED' } = req.query;
    const skip = (parseInt(page) - 1) * parseInt(limit);

    // Build where clause
    const where = { status };

    // If not authenticated or not admin/editor, only show published issues
    if (!req.user || !['ADMIN', 'EDITOR'].includes(req.user.role)) {
      where.status = 'PUBLISHED';
    }

    // Filter by year and month if provided
    if (year) {
      const startDate = new Date(parseInt(year), 0, 1);
      const endDate = new Date(parseInt(year) + 1, 0, 1);
      where.issueDate = { gte: startDate, lt: endDate };
    }

    if (month && year) {
      const startDate = new Date(parseInt(year), parseInt(month) - 1, 1);
      const endDate = new Date(parseInt(year), parseInt(month), 1);
      where.issueDate = { gte: startDate, lt: endDate };
    }

    const [issues, total] = await Promise.all([
      prisma.epaperIssue.findMany({
        where,
        skip,
        take: parseInt(limit),
        orderBy: { issueDate: 'desc' }
      }),
      prisma.epaperIssue.count({ where })
    ]);

    res.json({
      success: true,
      data: {
        issues,
        pagination: {
          currentPage: parseInt(page),
          totalPages: Math.ceil(total / parseInt(limit)),
          totalIssues: total,
          hasNextPage: parseInt(page) < Math.ceil(total / parseInt(limit)),
          hasPrevPage: parseInt(page) > 1
        }
      }
    });
  } catch (error) {
    next(error);
  }
});

// @desc    Get single e-paper issue
// @route   GET /api/epaper/:id
// @access  Public
router.get('/:id', optionalAuth, async (req, res, next) => {
  try {
    const { id } = req.params;

    const issue = await prisma.epaperIssue.findUnique({
      where: { id }
    });

    if (!issue) {
      return res.status(404).json({
        success: false,
        message: 'E-paper issue not found'
      });
    }

    // Check if user can view this issue
    if (issue.status !== 'PUBLISHED') {
      if (!req.user || !['ADMIN', 'EDITOR'].includes(req.user.role)) {
        return res.status(404).json({
          success: false,
          message: 'E-paper issue not found'
        });
      }
    }

    // Increment view count
    await prisma.epaperIssue.update({
      where: { id },
      data: { viewCount: { increment: 1 } }
    });

    res.json({
      success: true,
      data: { issue }
    });
  } catch (error) {
    next(error);
  }
});

// @desc    Download e-paper issue
// @route   GET /api/epaper/:id/download
// @access  Public
router.get('/:id/download', optionalAuth, async (req, res, next) => {
  try {
    const { id } = req.params;

    const issue = await prisma.epaperIssue.findUnique({
      where: { id }
    });

    if (!issue) {
      return res.status(404).json({
        success: false,
        message: 'E-paper issue not found'
      });
    }

    // Check if user can download this issue
    if (issue.status !== 'PUBLISHED') {
      if (!req.user || !['ADMIN', 'EDITOR'].includes(req.user.role)) {
        return res.status(404).json({
          success: false,
          message: 'E-paper issue not found'
        });
      }
    }

    // Increment download count
    await prisma.epaperIssue.update({
      where: { id },
      data: { downloadCount: { increment: 1 } }
    });

    // Construct file path
    // pdfUrl is like /uploads/epapers/filename.pdf
    const filename = path.basename(issue.pdfUrl);
    const filePath = path.join(__dirname, '../../uploads/epapers', filename);

    // Check if file exists
    try {
      await fs.access(filePath);
    } catch (error) {
      console.error('PDF file not found:', filePath);
      return res.status(404).json({
        success: false,
        message: 'PDF file not found on server'
      });
    }

    // Send file with inline disposition to allow viewing in iframe
    // The frontend <a> tag with 'download' attribute will handle forced download
    res.setHeader('Content-Disposition', `inline; filename="${issue.title || 'epaper'}.pdf"`);
    res.setHeader('Content-Type', 'application/pdf');
    res.sendFile(filePath);
  } catch (error) {
    next(error);
  }
});

// @desc    Get e-paper issues by date range
// @route   GET /api/epaper/date-range
// @access  Public
router.get('/date-range', optionalAuth, async (req, res, next) => {
  try {
    const { startDate, endDate } = req.query;

    if (!startDate || !endDate) {
      return res.status(400).json({
        success: false,
        message: 'Start date and end date are required'
      });
    }

    const start = new Date(startDate);
    const end = new Date(endDate);

    if (isNaN(start.getTime()) || isNaN(end.getTime())) {
      return res.status(400).json({
        success: false,
        message: 'Invalid date format'
      });
    }

    // Build where clause
    const where = {
      issueDate: {
        gte: start,
        lte: end
      }
    };

    // Only show published issues to public
    if (!req.user || !['ADMIN', 'EDITOR'].includes(req.user.role)) {
      where.status = 'PUBLISHED';
    }

    const issues = await prisma.epaperIssue.findMany({
      where,
      orderBy: { issueDate: 'desc' }
    });

    res.json({
      success: true,
      data: { issues }
    });
  } catch (error) {
    next(error);
  }
});

// @desc    Create new e-paper issue
// @route   POST /api/epaper
// @access  Private (Editor, Admin)
router.post('/', authenticate, authorize('EDITOR', 'ADMIN'), upload.single('pdf'), [
  body('issueDate').isISO8601(),
  body('title').optional().trim().isLength({ max: 200 }),
  body('description').optional().trim().isLength({ max: 1000 }),
  body('pageCount').optional().isInt({ min: 1 })
], async (req, res, next) => {
  try {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      console.error('Validation failed:', errors.array());
      return res.status(400).json({
        success: false,
        message: 'Validation failed',
        errors: errors.array()
      });
    }

    if (!req.file) {
      console.error('No PDF file uploaded');
      return res.status(400).json({
        success: false,
        message: 'PDF file is required'
      });
    }

    const { issueDate, title, description, pageCount, status = 'PUBLISHED' } = req.body;
    console.log('Creating e-paper issue:', { issueDate, title, pageCount, status });

    // Check if issue for this date already exists
    const dateObj = new Date(issueDate);
    const startOfDay = new Date(dateObj.getFullYear(), dateObj.getMonth(), dateObj.getDate(), 0, 0, 0, 0);
    const endOfDay = new Date(dateObj.getFullYear(), dateObj.getMonth(), dateObj.getDate(), 23, 59, 59, 999);

    console.log('Checking for existing issue between:', startOfDay, 'and', endOfDay);

    const existingIssue = await prisma.epaperIssue.findFirst({
      where: {
        issueDate: {
          gte: startOfDay,
          lt: endOfDay
        }
      }
    });

    if (existingIssue) {
      console.error('Issue already exists for date:', issueDate);
      return res.status(400).json({
        success: false,
        message: 'An e-paper issue for this date already exists'
      });
    }

    // Create new issue
    const issue = await prisma.epaperIssue.create({
      data: {
        issueDate: new Date(issueDate),
        pdfUrl: `/uploads/epapers/${req.file.filename}`,
        pageCount: parseInt(pageCount) || 1,
        title,
        description,
        status,
        coverImage: null // TODO: Generate cover image from PDF first page if possible
      }
    });

    res.status(201).json({
      success: true,
      message: 'E-paper issue created successfully',
      data: { issue }
    });
  } catch (error) {
    next(error);
  }
});

// @desc    Delete e-paper issue
// @route   DELETE /api/epaper/:id
// @access  Private (Editor, Admin)
router.delete('/:id', authenticate, authorize('EDITOR', 'ADMIN'), async (req, res, next) => {
  try {
    const { id } = req.params;

    const issue = await prisma.epaperIssue.findUnique({
      where: { id }
    });

    if (!issue) {
      return res.status(404).json({
        success: false,
        message: 'E-paper issue not found'
      });
    }

    // Delete PDF file
    if (issue.pdfUrl) {
      const filename = path.basename(issue.pdfUrl);
      const filePath = path.join(__dirname, '../../uploads/epapers', filename);
      try {
        await fs.unlink(filePath);
      } catch (error) {
        console.error('Error deleting PDF file:', error);
        // Continue with database deletion even if file deletion fails
      }
    }

    // Delete from database
    await prisma.epaperIssue.delete({
      where: { id }
    });

    res.json({
      success: true,
      message: 'E-paper issue deleted successfully'
    });
  } catch (error) {
    next(error);
  }
});

module.exports = router;