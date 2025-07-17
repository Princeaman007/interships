// middlewares/debugMiddleware.js
const debugRequests = (req, res, next) => {
  console.log(`🔍 ${req.method} ${req.originalUrl}`);
  console.log('📋 Headers:', {
    'content-type': req.headers['content-type'],
    'authorization': req.headers.authorization ? 'Bearer [TOKEN]' : 'None'
  });
  
  if (req.body && Object.keys(req.body).length > 0) {
    console.log('📦 Body:', req.body);
  }
  
  if (req.file) {
    console.log('📁 File:', {
      filename: req.file.filename,
      size: req.file.size,
      mimetype: req.file.mimetype
    });
  }
  
  next();
};

module.exports = { debugRequests };