-- 创建数据库
CREATE DATABASE IF NOT EXISTS blockchain_db
    DEFAULT CHARACTER SET utf8mb4
    DEFAULT COLLATE utf8mb4_unicode_ci;

USE blockchain_db;

-- 用户表
CREATE TABLE IF NOT EXISTS users (
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

-- 凭证表
CREATE TABLE IF NOT EXISTS certificates (
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

-- 交易记录表
CREATE TABLE IF NOT EXISTS transactions (
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

-- 市场挂单表
CREATE TABLE IF NOT EXISTS market_listings (
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

-- 添加外键约束
ALTER TABLE certificates
    ADD CONSTRAINT fk_certificates_owner
    FOREIGN KEY (owner_address) 
    REFERENCES users(wallet_address)
    ON DELETE RESTRICT
    ON UPDATE CASCADE;

ALTER TABLE market_listings
    ADD CONSTRAINT fk_listings_token
    FOREIGN KEY (token_id)
    REFERENCES certificates(token_id)
    ON DELETE RESTRICT
    ON UPDATE CASCADE,
    ADD CONSTRAINT fk_listings_seller
    FOREIGN KEY (seller_address)
    REFERENCES users(wallet_address)
    ON DELETE RESTRICT
    ON UPDATE CASCADE,
    ADD CONSTRAINT fk_listings_buyer
    FOREIGN KEY (buyer_address)
    REFERENCES users(wallet_address)
    ON DELETE RESTRICT
    ON UPDATE CASCADE;

ALTER TABLE transactions
    ADD CONSTRAINT fk_transactions_from
    FOREIGN KEY (from_address)
    REFERENCES users(wallet_address)
    ON DELETE RESTRICT
    ON UPDATE CASCADE,
    ADD CONSTRAINT fk_transactions_to
    FOREIGN KEY (to_address)
    REFERENCES users(wallet_address)
    ON DELETE RESTRICT
    ON UPDATE CASCADE,
    ADD CONSTRAINT fk_transactions_token
    FOREIGN KEY (token_id)
    REFERENCES certificates(token_id)
    ON DELETE RESTRICT
    ON UPDATE CASCADE;
