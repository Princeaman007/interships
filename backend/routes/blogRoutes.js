const express = require('express');
const router = express.Router();
const { getAllBlogPosts, getBlogPostBySlug } = require('../controllers/blogController');
const { protect, isAdmin } = require('../middlewares/authMiddleware');
const { getAllBlogPostsAdmin } = require('../controllers/blogController');
const {
  createBlogPost,
  updateBlogPost,
  deleteBlogPost
} = require('../controllers/blogController');
const { blogPostValidator } = require('../validators/blogValidator');
const validate = require('../middlewares/validate');

// 🔓 Routes publiques
router.get('/', getAllBlogPosts);
router.get('/:slug', getBlogPostBySlug);
// 🔒 Admin
router.post('/', protect, isAdmin, blogPostValidator,validate, createBlogPost);
router.get('/admin/all', protect, isAdmin, getAllBlogPostsAdmin);
router.put('/:slug', protect, isAdmin, blogPostValidator,validate, updateBlogPost);
router.delete('/:slug', protect, isAdmin, deleteBlogPost);

module.exports = router;
