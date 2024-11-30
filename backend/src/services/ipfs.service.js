const IPFS = require('ipfs-http-client');
const config = require('../config/config');

class IPFSService {
  constructor() {
    this.ipfs = IPFS.create({
      host: config.ipfs.host,
      port: config.ipfs.port,
      protocol: config.ipfs.protocol
    });
  }

  // 上传元数据到IPFS
  async uploadMetadata(metadata) {
    try {
      const result = await this.ipfs.add(JSON.stringify(metadata));
      return result.path;
    } catch (error) {
      throw new Error(`IPFS上传失败: ${error.message}`);
    }
  }

  // 从IPFS获取元数据
  async getMetadata(hash) {
    try {
      const stream = await this.ipfs.cat(hash);
      let data = '';
      
      for await (const chunk of stream) {
        data += chunk.toString();
      }
      
      return JSON.parse(data);
    } catch (error) {
      throw new Error(`IPFS获取失败: ${error.message}`);
    }
  }
}

module.exports = new IPFSService();
