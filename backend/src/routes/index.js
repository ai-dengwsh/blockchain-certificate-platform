const express = require('express');
const router = express.Router();
const authRoutes = require('./auth.routes');
const certificateRoutes = require('./certificate.routes');

// API路由
router.use('/auth', authRoutes);
router.use('/certificates', certificateRoutes);

// 404处理
router.use((req, res) => {
  res.status(404).json({
    code: 404,
    message: '请求的资源不存在'
  });
});

module.exports = router;
