# 智能合约模块技术文档

## 1. 模块概述
智能合约模块是整个系统的核心，负责在以太坊区块链上实现凭证管理和交易功能。

## 2. 合约架构

### 2.1 Certificate合约
负责数字凭证的创建和管理。

#### 核心功能
- 凭证铸造（Minting）
- 凭证验证
- 凭证状态管理
- 所有权转移

#### 数据结构
```solidity
struct CertificateData {
    string ipfsHash;    // IPFS哈希存储
    uint256 timestamp;  // 时间戳
    bool isValid;       // 有效性
}
```

#### 关键方法
- `createCertificate`: 创建新凭证
- `getCertificate`: 获取凭证信息
- `invalidateCertificate`: 作废凭证
- `isValidCertificate`: 检查凭证有效性

### 2.2 Market合约
实现凭证的交易市场功能。

#### 核心功能
- 凭证挂单
- 凭证购买
- 挂单管理
- 交易费用处理

#### 数据结构
```solidity
struct Listing {
    address seller;
    address tokenAddress;
    uint256 tokenId;
    uint256 price;
    bool isActive;
}
```

#### 关键方法
- `createListing`: 创建交易挂单
- `buy`: 购买凭证
- `cancelListing`: 取消挂单
- `getListing`: 获取挂单信息

## 3. 开发环境

### 3.1 技术栈
- Solidity ^0.8.0
- Truffle Framework
- OpenZeppelin Contracts
- Web3.js

### 3.2 开发工具
- Ganache (本地测试网络)
- Truffle Suite
- Remix IDE (可选)

## 4. 部署流程

### 4.1 本地开发环境
1. 启动Ganache
2. 配置truffle-config.js
3. 执行合约迁移
```bash
truffle migrate --network development
```

### 4.2 测试网络部署
1. 配置网络参数
2. 准备测试网络ETH
3. 执行部署命令
```bash
truffle migrate --network testnet
```

## 5. 测试策略

### 5.1 单元测试
- 使用Truffle的测试框架
- 测试每个合约方法
- 测试异常情况处理

### 5.2 集成测试
- 测试合约间交互
- 测试与前端交互
- 测试与后端集成

## 6. 安全考虑

### 6.1 访问控制
- 使用OpenZeppelin的Ownable合约
- 实现细粒度的权限控制
- 防止未授权访问

### 6.2 重入攻击防护
- 使用ReentrancyGuard
- 实现检查-效果-交互模式
- 严格控制状态更新顺序

### 6.3 数据验证
- 输入参数验证
- 状态检查
- 余额验证

## 7. Gas优化

### 7.1 存储优化
- 使用适当的数据类型
- 优化存储布局
- 减少存储操作

### 7.2 计算优化
- 减少循环操作
- 优化计算逻辑
- 使用事件代替存储

## 8. 维护与升级

### 8.1 合约升级策略
- 使用代理模式
- 实现版本控制
- 数据迁移方案

### 8.2 监控与维护
- 事件监听
- 错误追踪
- 性能监控
