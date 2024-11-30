const { Certificate, Transaction } = require('../models');
const Web3Service = require('../services/web3.service');
const IPFSService = require('../services/ipfs.service');
const { Op } = require('sequelize');

class CertificateController {
  // 创建新凭证
  async create(req, res, next) {
    try {
      const { metadata } = req.body;
      const ownerAddress = req.user.wallet_address;

      if (!ownerAddress) {
        return res.status(400).json({
          code: 400,
          message: '用户钱包地址未设置'
        });
      }

      // 上传元数据到IPFS
      const ipfsHash = await IPFSService.uploadMetadata(metadata);

      // 调用智能合约铸造NFT
      const web3Service = new Web3Service();
      const result = await web3Service.mintCertificate(ownerAddress, ipfsHash);

      // 创建凭证记录
      const certificate = await Certificate.create({
        token_id: result.tokenId,
        owner_address: ownerAddress,
        ipfs_hash: ipfsHash,
        metadata: metadata,
        status: 'valid',
        tx_hash: result.transactionHash
      });

      // 记录交易
      await Transaction.create({
        tx_hash: result.transactionHash,
        from_address: web3Service.getContractAddress(),
        to_address: ownerAddress,
        token_id: result.tokenId,
        type: 'mint',
        status: 'completed',
        gas_used: result.gasUsed,
        gas_price: result.gasPrice
      });

      res.status(201).json({
        code: 201,
        message: '凭证创建成功',
        data: certificate
      });
    } catch (error) {
      next(error);
    }
  }

  // 获取凭证列表
  async list(req, res, next) {
    try {
      const { page = 1, limit = 10, status } = req.query;
      const where = {};

      if (status) {
        where.status = status;
      }

      const certificates = await Certificate.findAndCountAll({
        where,
        limit: parseInt(limit),
        offset: (page - 1) * limit,
        order: [['created_at', 'DESC']]
      });

      res.json({
        code: 200,
        data: {
          total: certificates.count,
          items: certificates.rows,
          page: parseInt(page),
          limit: parseInt(limit)
        }
      });
    } catch (error) {
      next(error);
    }
  }

  // 获取用户的凭证
  async getUserCertificates(req, res, next) {
    try {
      const { page = 1, limit = 10 } = req.query;
      const ownerAddress = req.user.wallet_address;

      const certificates = await Certificate.findAndCountAll({
        where: { owner_address: ownerAddress },
        limit: parseInt(limit),
        offset: (page - 1) * limit,
        order: [['created_at', 'DESC']]
      });

      res.json({
        code: 200,
        data: {
          total: certificates.count,
          items: certificates.rows,
          page: parseInt(page),
          limit: parseInt(limit)
        }
      });
    } catch (error) {
      next(error);
    }
  }

  // 获取凭证详情
  async getDetails(req, res, next) {
    try {
      const { tokenId } = req.params;

      const certificate = await Certificate.findOne({
        where: { token_id: tokenId },
        include: [{
          model: Transaction,
          where: {
            token_id: tokenId
          },
          required: false
        }]
      });

      if (!certificate) {
        return res.status(404).json({
          code: 404,
          message: '凭证不存在'
        });
      }

      res.json({
        code: 200,
        data: certificate
      });
    } catch (error) {
      next(error);
    }
  }

  // 验证凭证
  async verify(req, res, next) {
    try {
      const { tokenId } = req.params;

      const certificate = await Certificate.findOne({
        where: { token_id: tokenId }
      });

      if (!certificate) {
        return res.status(404).json({
          code: 404,
          message: '凭证不存在'
        });
      }

      // 调用智能合约验证
      const web3Service = new Web3Service();
      const isValid = await web3Service.verifyCertificate(tokenId);

      res.json({
        code: 200,
        data: {
          isValid,
          certificate
        }
      });
    } catch (error) {
      next(error);
    }
  }

  // 转移凭证
  async transfer(req, res, next) {
    try {
      const { tokenId, toAddress } = req.body;
      const fromAddress = req.user.wallet_address;

      const certificate = await Certificate.findOne({
        where: { 
          token_id: tokenId,
          owner_address: fromAddress
        }
      });

      if (!certificate) {
        return res.status(404).json({
          code: 404,
          message: '凭证不存在或您不是凭证所有者'
        });
      }

      // 调用智能合约转移
      const web3Service = new Web3Service();
      const result = await web3Service.transferCertificate(fromAddress, toAddress, tokenId);

      // 更新凭证所有者
      await certificate.update({
        owner_address: toAddress
      });

      // 记录交易
      await Transaction.create({
        tx_hash: result.transactionHash,
        from_address: fromAddress,
        to_address: toAddress,
        token_id: tokenId,
        type: 'transfer',
        status: 'completed',
        gas_used: result.gasUsed,
        gas_price: result.gasPrice
      });

      res.json({
        code: 200,
        message: '凭证转移成功',
        data: {
          transactionHash: result.transactionHash
        }
      });
    } catch (error) {
      next(error);
    }
  }
}

module.exports = new CertificateController();
