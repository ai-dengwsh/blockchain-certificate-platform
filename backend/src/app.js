const express = require('express');
const cors = require('cors');
const helmet = require('helmet');
const compression = require('compression');
const rateLimit = require('express-rate-limit');
const dotenv = require('dotenv');
const path = require('path');

// 加载环境变量
dotenv.config();

const routes = require('./routes');
const errorHandler = require('./middlewares/error-handler');

const app = express();

// 安全中间件
app.use(helmet());

// CORS配置
app.use(cors());

// 压缩响应
app.use(compression());

// 请求限制
const limiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15分钟
  max: 100 // 限制每个IP 100个请求
});
app.use('/api/', limiter);

// 解析请求体
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// 基础路由
app.get('/', (req, res) => {
  res.json({ message: 'Welcome to Blockchain System API' });
});

// API路由
app.use('/api', routes);

// 错误处理
app.use(errorHandler);

// 启动服务器
const PORT = process.env.PORT || 3000;
app.listen(PORT, () => {
  console.log(`Server is running on port ${PORT}`);
});
