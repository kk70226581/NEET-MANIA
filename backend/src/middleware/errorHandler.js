const errorHandler = (err, req, res, next) => {
  // Multer upload errors
  if (err.name === 'MulterError') {
    const field = err.field || 'file';
    const pdfLimit = Number(process.env.PDF_UPLOAD_LIMIT_MB) || 100;
    const imageLimit = Number(process.env.IMAGE_UPLOAD_LIMIT_MB) || 8;
    const limit = field === 'pdf' ? pdfLimit : imageLimit;

    if (err.code === 'LIMIT_FILE_SIZE') {
      return res.status(400).json({
        success: false,
        message: `${field.toUpperCase()} is too large. Maximum allowed size is ${limit} MB.`
      });
    }

    return res.status(400).json({
      success: false,
      message: err.message || 'File upload failed'
    });
  }

  console.error('Error:', err);

  // JWT Errors
  if (err.name === 'JsonWebTokenError') {
    return res.status(401).json({
      success: false,
      message: 'Invalid token'
    });
  }

  if (err.name === 'TokenExpiredError') {
    return res.status(401).json({
      success: false,
      message: 'Token expired'
    });
  }

  // Mongoose Errors
  if (err.name === 'ValidationError') {
    const messages = Object.values(err.errors).map(e => e.message);
    return res.status(400).json({
      success: false,
      message: 'Validation error',
      details: messages
    });
  }

  if (err.code === 11000) {
    const field = Object.keys(err.keyPattern)[0];
    return res.status(400).json({
      success: false,
      message: `${field} already exists`
    });
  }

  if (err.name === 'CastError') {
    return res.status(400).json({
      success: false,
      message: 'Invalid ID format'
    });
  }

  // Custom Errors
  if (err.statusCode) {
    return res.status(err.statusCode).json({
      success: false,
      message: err.message
    });
  }

  // Default error
  res.status(500).json({
    success: false,
    message: 'Internal server error',
    error: process.env.NODE_ENV === 'development' ? err.message : undefined
  });
};

module.exports = errorHandler;
