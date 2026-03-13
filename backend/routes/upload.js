const express = require('express');
const multer = require('multer');
const path = require('path');
const fs = require('fs');
const { supabase } = require('../config/database');
const { authMiddleware } = require('../middleware/auth');
const { TABLES, RELATIONS } = require('../config/tableNames');

const router = express.Router();

// Configure multer for file uploads
const storage = multer.diskStorage({
  destination: (req, file, cb) => {
    const uploadPath = process.env.UPLOAD_PATH || './uploads';
    if (!fs.existsSync(uploadPath)) {
      fs.mkdirSync(uploadPath, { recursive: true });
    }
    cb(null, uploadPath);
  },
  filename: (req, file, cb) => {
    const uniqueSuffix = Date.now() + '-' + Math.round(Math.random() * 1E9);
    cb(null, file.fieldname + '-' + uniqueSuffix + path.extname(file.originalname));
  }
});

const fileFilter = (req, file, cb) => {
  // Allowed file types
  const allowedImageTypes = ['image/jpeg', 'image/jpg', 'image/png', 'image/gif'];
  const allowedVideoTypes = ['video/mp4', 'video/avi', 'video/quicktime', 'video/webm'];
  
  if (allowedImageTypes.includes(file.mimetype) || allowedVideoTypes.includes(file.mimetype)) {
    cb(null, true);
  } else {
    cb(new Error('Invalid file type. Only images (JPEG, PNG, GIF) and videos (MP4, WEBM, AVI, MOV) are allowed.'), false);
  }
};

const upload = multer({
  storage,
  fileFilter,
  limits: {
    fileSize: parseInt(process.env.MAX_FILE_SIZE) || 10 * 1024 * 1024, // 10MB default
    files: 8 // Max 8 files (5 images + 3 videos)
  }
});

// Upload files for a listing
router.post('/listing/:listingId', authMiddleware, upload.array('files', 8), async (req, res) => {
  try {
    const { listingId } = req.params;

    if (!req.files || req.files.length === 0) {
      return res.status(400).json({ error: 'No files uploaded' });
    }

    // Verify listing ownership
    const { data: listing, error: listingError } = await supabase
      .from(TABLES.LISTINGS)
      .select('owner_id')
      .eq('id', listingId)
      .single();

    if (listingError) {
      return res.status(500).json({ error: 'Failed to verify listing' });
    }

    if (listing.owner_id !== req.user.userId) {
      return res.status(403).json({ error: 'Access denied' });
    }

    // Process uploaded files
    const uploadedFiles = [];
    let imageCount = 0;
    let videoCount = 0;

    for (const file of req.files) {
      const fileType = file.mimetype.startsWith('image/') ? 'image' : 'video';
      
      if (fileType === 'image') {
        imageCount++;
        if (imageCount > 5) {
          return res.status(400).json({ error: 'Maximum 5 images allowed' });
        }
      } else {
        videoCount++;
        if (videoCount > 3) {
          return res.status(400).json({ error: 'Maximum 3 videos allowed' });
        }
      }

      // Save file info to database
      const { data: mediaFile, error: mediaError } = await supabase
        .from(TABLES.LISTING_MEDIA)
        .insert([{
          listing_id: listingId,
          file_name: file.originalname,
          file_path: `/uploads/${file.filename}`,
          file_type: fileType,
          file_size: file.size,
          mime_type: file.mimetype
        }])
        .select()
        .single();

      if (mediaError) {
        console.error('Media file save error:', mediaError);
        return res.status(500).json({ error: 'Failed to save file info' });
      }

      uploadedFiles.push({
        id: mediaFile.id,
        fileName: file.originalname,
        filePath: `/uploads/${file.filename}`,
        fileType,
        fileSize: file.size,
        mimeType: file.mimetype
      });
    }

    res.json({
      message: 'Files uploaded successfully',
      files: uploadedFiles,
      counts: {
        images: imageCount,
        videos: videoCount,
        total: uploadedFiles.length
      }
    });

  } catch (error) {
    console.error('File upload error:', error);
    res.status(500).json({ error: 'Server error during file upload' });
  }
});

// Delete uploaded file
router.delete('/file/:fileId', authMiddleware, async (req, res) => {
  try {
    const { fileId } = req.params;

    // Get file info
    const { data: file, error: fileError } = await supabase
      .from(TABLES.LISTING_MEDIA)
      .select(`
        *,
        listing:${RELATIONS.LISTINGS}(owner_id)
      `)
      .eq('id', fileId)
      .single();

    if (fileError) {
      return res.status(404).json({ error: 'File not found' });
    }

    // Check permissions
    if (file.listing.owner_id !== req.user.userId) {
      return res.status(403).json({ error: 'Access denied' });
    }

    // Delete from database
    const { error: deleteError } = await supabase
      .from(TABLES.LISTING_MEDIA)
      .delete()
      .eq('id', fileId);

    if (deleteError) {
      return res.status(500).json({ error: 'Failed to delete file' });
    }

    // Delete from filesystem
    const filePath = path.join(__dirname, '..', file.file_path);
    if (fs.existsSync(filePath)) {
      fs.unlinkSync(filePath);
    }

    res.json({ message: 'File deleted successfully' });

  } catch (error) {
    console.error('File deletion error:', error);
    res.status(500).json({ error: 'Server error during file deletion' });
  }
});

// Get files for a listing
router.get('/listing/:listingId', authMiddleware, async (req, res) => {
  try {
    const { listingId } = req.params;

    // Verify listing ownership
    const { data: listing, error: listingError } = await supabase
      .from(TABLES.LISTINGS)
      .select('owner_id')
      .eq('id', listingId)
      .single();

    if (listingError) {
      return res.status(500).json({ error: 'Failed to verify listing' });
    }

    if (listing.owner_id !== req.user.userId) {
      return res.status(403).json({ error: 'Access denied' });
    }

    // Get files
    const { data: files, error } = await supabase
      .from(TABLES.LISTING_MEDIA)
      .select('*')
      .eq('listing_id', listingId)
      .order('created_at', { ascending: false });

    if (error) {
      return res.status(500).json({ error: 'Failed to fetch files' });
    }

    res.json({ files });

  } catch (error) {
    console.error('Files fetch error:', error);
    res.status(500).json({ error: 'Server error' });
  }
});

// Serve uploaded files (protected route)
router.get('/serve/:filename', authMiddleware, async (req, res) => {
  try {
    const { filename } = req.params;

    // Verify file belongs to user
    const { data: file, error } = await supabase
      .from(TABLES.LISTING_MEDIA)
      .select(`
        *,
        listing:${RELATIONS.LISTINGS}(owner_id)
      `)
      .eq('file_name', filename)
      .single();

    if (error) {
      return res.status(404).json({ error: 'File not found' });
    }

    if (file.listing.owner_id !== req.user.userId && req.user.role !== 'admin') {
      return res.status(403).json({ error: 'Access denied' });
    }

    const filePath = path.join(__dirname, '..', file.file_path);
    
    if (!fs.existsSync(filePath)) {
      return res.status(404).json({ error: 'File not found on disk' });
    }

    res.sendFile(filePath);

  } catch (error) {
    console.error('File serve error:', error);
    res.status(500).json({ error: 'Server error during file serve' });
  }
});

module.exports = router;
