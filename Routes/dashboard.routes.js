const express = require('express');
const router = express.Router();
const dashboardController = require('../Controllers/dashboard.controller');
const { authenticate, requireAuth } = require('../middlewares/auth.js');

router.get('/posts', dashboardController.getDashboardPosts);

// router.post('/posts/:postId/like', authenticate, requireAuth, dashboardController.likePost);
router.post('/posts/:postId/view', authenticate, dashboardController.viewPost);

module.exports = router;