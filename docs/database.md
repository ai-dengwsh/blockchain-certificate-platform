# MySQL数据库技术文档

## 1. 数据库设计

### 1.1 数据库概述
数据库名称：blockchain_db
字符集：utf8mb4
排序规则：utf8mb4_unicode_ci

### 1.2 表结构设计

#### 1.2.1 用户表 (users)
用于存储用户基本信息和认证数据。

```sql
CREATE TABLE users (
    id BIGINT PRIMARY KEY AUTO_INCREMENT COMMENT '用户ID',
    username VARCHAR(50) UNIQUE NOT NULL COMMENT '用户名',
    password_hash VARCHAR(255) NOT NULL COMMENT '密码哈希',
    email VARCHAR(100) UNIQUE NOT NULL COMMENT '邮箱',
    wallet_address VARCHAR(42) UNIQUE COMMENT '钱包地址',
    status ENUM('active', 'inactive', 'banned') DEFAULT 'active' COMMENT '用户状态',
    created_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP COMMENT '创建时间',
    updated_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP COMMENT '更新时间',
    INDEX idx_wallet_address (wallet_address),
    INDEX idx_status (status)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COMMENT='用户信息表';
```

#### 1.2.2 凭证表 (certificates)
存储区块链上凭证的相关信息。

```sql
CREATE TABLE certificates (
    id BIGINT PRIMARY KEY AUTO_INCREMENT COMMENT '凭证ID',
    token_id BIGINT UNIQUE NOT NULL COMMENT 'NFT Token ID',
    owner_address VARCHAR(42) NOT NULL COMMENT '所有者钱包地址',
    ipfs_hash VARCHAR(255) NOT NULL COMMENT 'IPFS哈希值',
    metadata JSON COMMENT '凭证元数据',
    status ENUM('valid', 'invalid') DEFAULT 'valid' COMMENT '凭证状态',
    tx_hash VARCHAR(66) NOT NULL COMMENT '交易哈希',
    created_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP COMMENT '创建时间',
    updated_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP COMMENT '更新时间',
    INDEX idx_owner_address (owner_address),
    INDEX idx_status (status),
    INDEX idx_token_id (token_id)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COMMENT='凭证信息表';
```

#### 1.2.3 交易记录表 (transactions)
记录所有区块链交易信息。

```sql
CREATE TABLE transactions (
    id BIGINT PRIMARY KEY AUTO_INCREMENT COMMENT '交易ID',
    tx_hash VARCHAR(66) UNIQUE NOT NULL COMMENT '交易哈希',
    from_address VARCHAR(42) NOT NULL COMMENT '发送方地址',
    to_address VARCHAR(42) NOT NULL COMMENT '接收方地址',
    amount DECIMAL(65,0) COMMENT '交易金额',
    token_id BIGINT COMMENT '相关Token ID',
    type ENUM('transfer', 'mint', 'burn', 'list', 'buy', 'cancel') NOT NULL COMMENT '交易类型',
    status ENUM('pending', 'completed', 'failed') DEFAULT 'pending' COMMENT '交易状态',
    gas_used BIGINT COMMENT 'Gas消耗',
    gas_price BIGINT COMMENT 'Gas价格',
    created_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP COMMENT '创建时间',
    updated_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP COMMENT '更新时间',
    INDEX idx_from_address (from_address),
    INDEX idx_to_address (to_address),
    INDEX idx_type (type),
    INDEX idx_status (status)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COMMENT='交易记录表';
```

#### 1.2.4 市场挂单表 (market_listings)
记录凭证市场的挂单信息。

```sql
CREATE TABLE market_listings (
    id BIGINT PRIMARY KEY AUTO_INCREMENT COMMENT '挂单ID',
    token_id BIGINT NOT NULL COMMENT 'NFT Token ID',
    seller_address VARCHAR(42) NOT NULL COMMENT '卖家地址',
    price DECIMAL(65,0) NOT NULL COMMENT '售价',
    status ENUM('active', 'sold', 'canceled') DEFAULT 'active' COMMENT '挂单状态',
    tx_hash VARCHAR(66) NOT NULL COMMENT '交易哈希',
    buyer_address VARCHAR(42) COMMENT '买家地址',
    sold_at TIMESTAMP NULL COMMENT '售出时间',
    created_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP COMMENT '创建时间',
    updated_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP COMMENT '更新时间',
    INDEX idx_seller_address (seller_address),
    INDEX idx_token_id (token_id),
    INDEX idx_status (status),
    INDEX idx_price (price)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COMMENT='市场挂单表';
```

### 1.3 索引设计
每个表都包含了针对性能优化的索引：
- 主键索引：所有表都使用自增ID作为主键
- 唯一索引：用户名、邮箱、钱包地址等唯一字段
- 普通索引：状态字段、外键关联字段、常用查询字段

### 1.4 数据库约束
1. 外键约束
   - market_listings.token_id -> certificates.token_id
   - transactions.token_id -> certificates.token_id

2. 唯一约束
   - users: username, email, wallet_address
   - certificates: token_id
   - transactions: tx_hash

3. 非空约束
   - 所有关键字段都设置了NOT NULL
   - 状态字段都有默认值

## 2. 性能优化

### 2.1 索引优化
- 针对高频查询建立复合索引
- 避免过度建立索引
- 定期维护索引统计信息

### 2.2 查询优化
- 使用EXPLAIN分析查询计划
- 避免SELECT *，只查询必要字段
- 合理使用分页和限制结果集大小

### 2.3 表优化
- 选择适当的字段类型和长度
- 使用适当的存储引擎（InnoDB）
- 定期进行表维护和碎片整理

## 3. 数据安全

### 3.1 备份策略
- 每日全量备份
- 实时binlog备份
- 定期备份验证和恢复测试

### 3.2 数据加密
- 敏感信息加密存储
- 使用SSL/TLS加密传输
- 实现字段级加密

### 3.3 访问控制
- 最小权限原则
- 定期审计数据库访问日志
- 实现多层次的访问控制

## 4. 运维管理

### 4.1 监控指标
- 连接数
- 查询性能
- 磁盘空间
- 锁等待情况
- 慢查询日志

### 4.2 维护计划
- 定期优化表
- 更新统计信息
- 清理历史数据
- 升级补丁

### 4.3 扩展性
- 主从复制配置
- 读写分离
- 分库分表预案

## 5. 开发规范

### 5.1 命名规范
- 表名使用小写字母，下划线分隔
- 字段名使用小写字母，下划线分隔
- 索引名称规范：idx_字段名

### 5.2 SQL规范
- 使用预处理语句
- 合理使用事务
- 避免使用触发器和存储过程
- 注意SQL注入防护

### 5.3 代码规范
- 统一使用Sequelize ORM
- 实现数据访问层（DAO）
- 统一错误处理
- 规范化日志记录
