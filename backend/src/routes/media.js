const express = require('express');
const multer = require('multer');
const sharp = require('sharp');
const path = require('path');
const fs = require('fs').promises;
const { body, validationResult } = require('express-validator');
const { prisma } = require('../utils/database');
const { authenticate, authorize } = require('../middleware/auth');

const router = express.Router();

// Ensure upload directory exists
const createUploadDir = async (dir) => {
  try {
    await fs.access(dir);
  } catch {
    await fs.mkdir(dir, { recursive: true });
  }
};

// Configure multer for different file types
const storage = multer.diskStorage({
  destination: async (req, file, cb) => {
    const uploadPath = path.join(__dirname, '../../uploads');
    await createUploadDir(uploadPath);

    let subDir = 'general';
    if (file.mimetype.startsWith('image/')) {
      subDir = 'images';
    } else if (file.mimetype === 'application/pdf') {
      subDir = 'pdfs';
    } else if (file.mimetype.startsWith('video/')) {
      subDir = 'videos';
    }

    const finalPath = path.join(uploadPath, subDir);
    await createUploadDir(finalPath);
    cb(null, finalPath);
  },
  filename: (req, file, cb) => {
    const uniqueSuffix = Date.now() + '-' + Math.round(Math.random() * 1E9);
    const ext = path.extname(file.originalname);
    cb(null, file.fieldname + '-' + uniqueSuffix + ext);
  }
});

const fileFilter = (req, file, cb) => {
  const allowedTypes = process.env.ALLOWED_FILE_TYPES?.split(',') || [
    'image/jpeg',
    'image/jpg',
    'image/png',
    'image/gif',
    'image/webp',
    'image/avif',
    'application/pdf'
  ];

  if (allowedTypes.includes(file.mimetype)) {
    cb(null, true);
  } else {
    cb(new Error(`File type ${file.mimetype} is not allowed`), false);
  }
};

const upload = multer({
  storage,
  fileFilter,
  limits: {
    fileSize: parseInt(process.env.MAX_FILE_SIZE) || 10 * 1024 * 1024, // 10MB
  }
});

// @desc    Upload single file
// @route   POST /api/media/upload
// @access  Private (Author, Editor, Admin)
router.post('/upload', authenticate, authorize('AUTHOR', 'EDITOR', 'ADMIN'), upload.single('file'), async (req, res, next) => {
  try {
    if (!req.file) {
      return res.status(400).json({
        success: false,
        message: 'No file uploaded'
      });
    }

    const { altText, caption, folder } = req.body;

    // Generate different sizes for images
    let imageData = {};
    if (req.file.mimetype.startsWith('image/')) {
      const sizes = {
        thumbnail: 150,
        small: 400,
        medium: 800,
        large: 1200
      };

      const uploadDir = path.join(__dirname, '../../uploads/images');
      const baseName = path.parse(req.file.filename).name;
      const ext = path.parse(req.file.filename).ext;

      for (const [size, width] of Object.entries(sizes)) {
        const outputPath = path.join(uploadDir, `${baseName}_${size}${ext}`);
        await sharp(req.file.path)
          .resize(width, null, {
            withoutEnlargement: true,
            fit: 'inside'
          })
          .jpeg({ quality: 85 })
          .toFile(outputPath);
      }

      imageData = {
        thumbnail: `/uploads/images/${baseName}_thumbnail${ext}`,
        small: `/uploads/images/${baseName}_small${ext}`,
        medium: `/uploads/images/${baseName}_medium${ext}`,
        large: `/uploads/images/${baseName}_large${ext}`
      };
    }

    // Create media record
    const media = await prisma.media.create({
      data: {
        filename: req.file.filename,
        originalName: req.file.originalname,
        mimeType: req.file.mimetype,
        size: req.file.size,
        url: `/uploads/${path.relative(path.join(__dirname, '../../uploads'), req.file.path).replace(/\\/g, '/')}`,
        altText,
        caption,
        folder,
        uploadedBy: req.user.id
      }
    });

    res.json({
      success: true,
      message: 'File uploaded successfully',
      data: {
        media,
        imageData // For images with multiple sizes
      }
    });
  } catch (error) {
    // Clean up uploaded file on error
    if (req.file) {
      try {
        await fs.unlink(req.file.path);
      } catch (unlinkError) {
        console.error('Error deleting file:', unlinkError);
      }
    }
    next(error);
  }
});

// @desc    Upload multiple files
// @route   POST /api/media/upload-multiple
// @access  Private (Author, Editor, Admin)
router.post('/upload-multiple', authenticate, authorize('AUTHOR', 'EDITOR', 'ADMIN'), upload.array('files', 10), async (req, res, next) => {
  try {
    if (!req.files || req.files.length === 0) {
      return res.status(400).json({
        success: false,
        message: 'No files uploaded'
      });
    }

    const mediaPromises = req.files.map(async (file) => {
      return await prisma.media.create({
        data: {
          filename: file.filename,
          originalName: file.originalname,
          mimeType: file.mimetype,
          size: file.size,
          url: `/uploads/${path.relative(path.join(__dirname, '../../uploads'), file.path).replace(/\\/g, '/')}`,
          uploadedBy: req.user.id
        }
      });
    });

    const media = await Promise.all(mediaPromises);

    res.json({
      success: true,
      message: `${media.length} files uploaded successfully`,
      data: { media }
    });
  } catch (error) {
    // Clean up uploaded files on error
    if (req.files) {
      const cleanupPromises = req.files.map(async (file) => {
        try {
          await fs.unlink(file.path);
        } catch (unlinkError) {
          console.error('Error deleting file:', unlinkError);
        }
      });
      await Promise.all(cleanupPromises);
    }
    next(error);
  }
});

// @desc    Get all media files
// @route   GET /api/media
// @access  Private (Author, Editor, Admin)
router.get('/', authenticate, authorize('AUTHOR', 'EDITOR', 'ADMIN'), async (req, res, next) => {
  try {
    const { page = 1, limit = 20, search, mimeType, folder } = req.query;
    const skip = (parseInt(page) - 1) * parseInt(limit);

    // Build where clause
    const where = {};

    if (search) {
      where.OR = [
        { originalName: { contains: search } },
        { altText: { contains: search } },
        { caption: { contains: search } }
      ];
    }

    if (mimeType) {
      where.mimeType = { startsWith: mimeType };
    }

    if (folder) {
      where.folder = folder;
    }

    const [media, total] = await Promise.all([
      prisma.media.findMany({
        where,
        skip,
        take: parseInt(limit),
        orderBy: { createdAt: 'desc' }
      }),
      prisma.media.count({ where })
    ]);

    res.json({
      success: true,
      data: {
        media,
        pagination: {
          currentPage: parseInt(page),
          totalPages: Math.ceil(total / parseInt(limit)),
          totalMedia: total,
          hasNextPage: parseInt(page) < Math.ceil(total / parseInt(limit)),
          hasPrevPage: parseInt(page) > 1
        }
      }
    });
  } catch (error) {
    next(error);
  }
});

// @desc    Get single media file
// @route   GET /api/media/:id
// @access  Private (Author, Editor, Admin)
router.get('/:id', authenticate, authorize('AUTHOR', 'EDITOR', 'ADMIN'), async (req, res, next) => {
  try {
    const { id } = req.params;

    const media = await prisma.media.findUnique({
      where: { id }
    });

    if (!media) {
      return res.status(404).json({
        success: false,
        message: 'Media not found'
      });
    }

    res.json({
      success: true,
      data: { media }
    });
  } catch (error) {
    next(error);
  }
});

// @desc    Update media metadata
// @route   PUT /api/media/:id
// @access  Private (Author, Editor, Admin)
router.put('/:id', authenticate, authorize('AUTHOR', 'EDITOR', 'ADMIN'), [
  body('altText').optional().trim().isLength({ max: 200 }),
  body('caption').optional().trim().isLength({ max: 500 }),
  body('folder').optional().trim()
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
    const { altText, caption, folder } = req.body;

    // Check if media exists
    const existingMedia = await prisma.media.findUnique({
      where: { id }
    });

    if (!existingMedia) {
      return res.status(404).json({
        success: false,
        message: 'Media not found'
      });
    }

    // Check permissions (users can only update their own media unless admin/editor)
    if (req.user.role === 'AUTHOR' && existingMedia.uploadedBy !== req.user.id) {
      return res.status(403).json({
        success: false,
        message: 'Not authorized to update this media'
      });
    }

    const media = await prisma.media.update({
      where: { id },
      data: {
        ...(altText !== undefined && { altText }),
        ...(caption !== undefined && { caption }),
        ...(folder !== undefined && { folder })
      }
    });

    res.json({
      success: true,
      message: 'Media updated successfully',
      data: { media }
    });
  } catch (error) {
    next(error);
  }
});

// @desc    Delete media file
// @route   DELETE /api/media/:id
// @access  Private (Author, Editor, Admin)
router.delete('/:id', authenticate, authorize('AUTHOR', 'EDITOR', 'ADMIN'), async (req, res, next) => {
  try {
    const { id } = req.params;

    const media = await prisma.media.findUnique({
      where: { id }
    });

    if (!media) {
      return res.status(404).json({
        success: false,
        message: 'Media not found'
      });
    }

    // Check permissions
    if (req.user.role === 'AUTHOR' && media.uploadedBy !== req.user.id) {
      return res.status(403).json({
        success: false,
        message: 'Not authorized to delete this media'
      });
    }

    // Delete physical file
    try {
      const filePath = path.join(__dirname, '../../', media.url);
      await fs.unlink(filePath);
    } catch (fileError) {
      console.error('Error deleting physical file:', fileError);
      // Continue with database deletion even if file deletion fails
    }

    // Delete from database
    await prisma.media.delete({
      where: { id }
    });

    res.json({
      success: true,
      message: 'Media deleted successfully'
    });
  } catch (error) {
    next(error);
  }
});

module.exports = router;