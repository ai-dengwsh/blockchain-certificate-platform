# 后端技术文档

## 1. 系统架构

### 1.1 技术栈
- Node.js + Express
- MySQL数据库
- JWT认证
- Web3.js (区块链交互)
- Sequelize ORM

### 1.2 模块划分
- 用户认证模块
- 区块链交互模块
- 数据库管理模块
- 文件系统模块
- API接口模块
- 支付集成模块

## 2. 数据库设计

### 2.1 用户表 (users)
```sql
CREATE TABLE users (
    id BIGINT PRIMARY KEY AUTO_INCREMENT,
    username VARCHAR(50) UNIQUE NOT NULL,
    password_hash VARCHAR(255) NOT NULL,
    email VARCHAR(100) UNIQUE NOT NULL,
    wallet_address VARCHAR(42),
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP
);
```

### 2.2 交易记录表 (transactions)
```sql
CREATE TABLE transactions (
    id BIGINT PRIMARY KEY AUTO_INCREMENT,
    tx_hash VARCHAR(66) UNIQUE NOT NULL,
    from_address VARCHAR(42) NOT NULL,
    to_address VARCHAR(42) NOT NULL,
    amount DECIMAL(65,0),
    token_id BIGINT,
    status ENUM('pending', 'completed', 'failed') NOT NULL,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);
```

### 2.3 凭证记录表 (certificates)
```sql
CREATE TABLE certificates (
    id BIGINT PRIMARY KEY AUTO_INCREMENT,
    token_id BIGINT UNIQUE NOT NULL,
    owner_address VARCHAR(42) NOT NULL,
    ipfs_hash VARCHAR(255) NOT NULL,
    status ENUM('valid', 'invalid') NOT NULL,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP
);
```

## 3. API接口设计

### 3.1 用户认证
```
POST /api/auth/register
POST /api/auth/login
POST /api/auth/logout
GET /api/auth/profile
```

### 3.2 凭证管理
```
POST /api/certificates/create
GET /api/certificates/:id
GET /api/certificates/list
PUT /api/certificates/:id/invalidate
```

### 3.3 交易市场
```
POST /api/market/list
GET /api/market/listings
POST /api/market/buy
DELETE /api/market/cancel
```

### 3.4 账户管理
```
GET /api/account/balance
POST /api/account/transfer
GET /api/account/transactions
```

## 4. 区块链交互

### 4.1 Web3配置
```javascript
const Web3 = require('web3');
const web3 = new Web3(new Web3.providers.HttpProvider(process.env.ETH_NODE_URL));
```

### 4.2 合约交互
- 加载合约ABI
- 创建合约实例
- 调用合约方法
- 监听合约事件

## 5. 安全措施

### 5.1 认证与授权
- JWT token验证
- 角色基础访问控制
- 请求频率限制

### 5.2 数据安全
- 密码加密存储
- SQL注入防护
- XSS防护
- CSRF防护

### 5.3 通信安全
- HTTPS
- API签名验证
- 敏感数据加密

## 6. 性能优化

### 6.1 数据库优化
- 索引优化
- 查询优化
- 连接池管理

### 6.2 缓存策略
- Redis缓存
- 内存缓存
- 静态资源缓存

### 6.3 并发处理
- 异步处理
- 队列机制
- 负载均衡

## 7. 监控与日志

### 7.1 系统监控
- 服务器状态监控
- API性能监控
- 错误追踪

### 7.2 日志管理
- 访问日志
- 错误日志
- 交易日志

## 8. 部署与维护

### 8.1 部署流程
1. 环境配置
2. 数据库迁移
3. 服务启动
4. 监控配置

### 8.2 维护计划
- 定期备份
- 性能优化
- 安全更新
- 功能升级
