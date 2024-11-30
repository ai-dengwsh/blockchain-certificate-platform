// SPDX-License-Identifier: MIT
pragma solidity ^0.8.0;

import "@openzeppelin/contracts/token/ERC721/ERC721.sol";
import "@openzeppelin/contracts/access/Ownable.sol";

contract Certificate is ERC721, Ownable {
    struct CertificateData {
        string ipfsHash;    // IPFS哈希，用于存储凭证内容
        uint256 timestamp;  // 创建时间戳
        bool isValid;       // 凭证是否有效
    }

    mapping(uint256 => CertificateData) private _certificates;
    uint256 private _tokenIds;

    constructor() ERC721("BlockchainCertificate", "CERT") {}

    // 创建新凭证
    function createCertificate(address to, string memory ipfsHash) 
        public 
        onlyOwner 
        returns (uint256) 
    {
        _tokenIds++;
        uint256 newTokenId = _tokenIds;
        
        _mint(to, newTokenId);
        _certificates[newTokenId] = CertificateData({
            ipfsHash: ipfsHash,
            timestamp: block.timestamp,
            isValid: true
        });

        return newTokenId;
    }

    // 获取凭证数据
    function getCertificate(uint256 tokenId) 
        public 
        view 
        returns (string memory, uint256, bool) 
    {
        require(_exists(tokenId), "Certificate does not exist");
        CertificateData memory cert = _certificates[tokenId];
        return (cert.ipfsHash, cert.timestamp, cert.isValid);
    }

    // 作废凭证
    function invalidateCertificate(uint256 tokenId) 
        public 
        onlyOwner 
    {
        require(_exists(tokenId), "Certificate does not exist");
        _certificates[tokenId].isValid = false;
    }

    // 验证凭证有效性
    function isValidCertificate(uint256 tokenId) 
        public 
        view 
        returns (bool) 
    {
        require(_exists(tokenId), "Certificate does not exist");
        return _certificates[tokenId].isValid;
    }
}
