const express = require('express');
const router = express.Router();
const certificateController = require('../controllers/certificate.controller');
const auth = require('../middlewares/auth');
const { body, param } = require('express-validator');

// 验证中间件
const validateCreate = [
  body('metadata').isObject().withMessage('metadata必须是一个对象')
];

const validateTransfer = [
  body('tokenId').isNumeric().withMessage('tokenId必须是数字'),
  body('toAddress')
    .matches(/^0x[a-fA-F0-9]{40}$/)
    .withMessage('请输入有效的接收方钱包地址')
];

// 创建凭证
router.post('/', 
  auth, 
  validateCreate,
  certificateController.create
);

// 获取凭证列表
router.get('/', 
  certificateController.list
);

// 获取用户的凭证
router.get('/my-certificates', 
  auth, 
  certificateController.getUserCertificates
);

// 获取凭证详情
router.get('/:tokenId',
  param('tokenId').isNumeric().withMessage('tokenId必须是数字'),
  certificateController.getDetails
);

// 验证凭证
router.get('/:tokenId/verify',
  param('tokenId').isNumeric().withMessage('tokenId必须是数字'),
  certificateController.verify
);

// 转移凭证
router.post('/transfer',
  auth,
  validateTransfer,
  certificateController.transfer
);

module.exports = router;
