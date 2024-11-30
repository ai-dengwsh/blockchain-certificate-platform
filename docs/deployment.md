# 区块链证书管理平台部署指南

## 环境要求

### 基础环境
- Node.js >= 14.x
- MySQL >= 8.0
- Git
- MetaMask浏览器插件

### 区块链环境
- Ethereum测试网络(Goerli/Sepolia)或本地测试网络(Ganache)
- Truffle >= 5.x (用于智能合约部署)
- Web3.js >= 1.x

## 部署步骤

### 1. 克隆项目
```bash
git clone https://github.com/ai_dengwsh/blockchain-certificate-platform.git
cd blockchain-certificate-platform
```

### 2. 智能合约部署

1. 安装依赖
```bash
cd smart-contracts
npm install
```

2. 配置部署网络
编辑 `truffle-config.js` 文件，配置目标网络信息。

3. 部署合约
```bash
truffle migrate --network [network_name]
```

4. 记录合约地址
将生成的合约地址复制到后端配置文件中。

### 3. 后端部署

1. 安装依赖
```bash
cd backend
npm install
```

2. 配置环境变量
复制 `.env.example` 到 `.env` 并填写配置:
```
DB_HOST=localhost
DB_USER=your_db_user
DB_PASS=your_db_password
DB_NAME=blockchain_db
JWT_SECRET=your_jwt_secret
CONTRACT_ADDRESS=your_contract_address
WEB3_PROVIDER=your_web3_provider_url
```

3. 初始化数据库
```bash
npm run db:migrate
npm run db:seed
```

4. 启动服务
```bash
# 开发环境
npm run dev

# 生产环境
npm run build
npm start
```

### 4. 前端部署

1. 安装依赖
```bash
cd frontend
npm install
```

2. 配置环境变量
复制 `.env.example` 到 `.env` 并填写配置:
```
VITE_API_URL=your_backend_api_url
VITE_CONTRACT_ADDRESS=your_contract_address
```

3. 构建和部署
```bash
# 开发环境
npm run dev

# 生产环境
npm run build
```

4. 部署到Web服务器
将 `dist` 目录部署到Web服务器(如Nginx)。

### 5. Nginx配置示例

```nginx
server {
    listen 80;
    server_name your_domain.com;

    # 前端
    location / {
        root /path/to/frontend/dist;
        try_files $uri $uri/ /index.html;
    }

    # 后端API
    location /api {
        proxy_pass http://localhost:3000;
        proxy_http_version 1.1;
        proxy_set_header Upgrade $http_upgrade;
        proxy_set_header Connection 'upgrade';
        proxy_set_header Host $host;
        proxy_cache_bypass $http_upgrade;
    }
}
```

## 系统维护

### 数据库备份
```bash
# 创建备份
mysqldump -u user -p blockchain_db > backup.sql

# 恢复备份
mysql -u user -p blockchain_db < backup.sql
```

### 日志管理
- 后端日志位于: `/backend/logs`
- 使用 PM2 进行进程管理和日志轮转

### 监控
- 使用 PM2 监控后端服务状态
- 推荐使用 Prometheus + Grafana 进行系统监控

## 安全建议

1. 启用HTTPS
2. 配置防火墙规则
3. 定期更新依赖包
4. 启用请求速率限制
5. 定期备份数据
6. 使用环境变量管理敏感信息
7. 监控异常登录和交易行为

## 常见问题

1. MetaMask连接问题
   - 检查网络配置
   - 确保账户已解锁

2. 智能合约交互失败
   - 检查Gas费用设置
   - 验证合约地址配置

3. 数据库连接问题
   - 检查数据库凭证
   - 验证网络连接

4. API请求失败
   - 检查CORS配置
   - 验证API地址配置

## 更新维护

1. 代码更新
```bash
git pull origin main
npm install # 在各个目录中运行
```

2. 数据库迁移
```bash
npm run db:migrate
```

3. 重启服务
```bash
pm2 restart all
```
