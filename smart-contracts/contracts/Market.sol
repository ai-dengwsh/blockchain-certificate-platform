// SPDX-License-Identifier: MIT
pragma solidity ^0.8.0;

import "@openzeppelin/contracts/security/ReentrancyGuard.sol";
import "@openzeppelin/contracts/token/ERC721/IERC721.sol";

contract Market is ReentrancyGuard {
    struct Listing {
        address seller;
        address tokenAddress;
        uint256 tokenId;
        uint256 price;
        bool isActive;
    }

    // 市场手续费率（1%）
    uint256 public constant FEE_RATE = 100;
    
    // 记录所有挂单
    mapping(uint256 => Listing) public listings;
    uint256 private _listingIds;

    // 事件
    event Listed(uint256 listingId, address seller, address tokenAddress, uint256 tokenId, uint256 price);
    event Sale(uint256 listingId, address buyer, uint256 price);
    event Canceled(uint256 listingId);

    // 创建挂单
    function createListing(
        address tokenAddress,
        uint256 tokenId,
        uint256 price
    ) external nonReentrant returns (uint256) {
        require(price > 0, "Price must be greater than zero");
        
        IERC721 token = IERC721(tokenAddress);
        require(token.ownerOf(tokenId) == msg.sender, "Not token owner");
        require(token.getApproved(tokenId) == address(this), "Market not approved");

        _listingIds++;
        uint256 listingId = _listingIds;

        listings[listingId] = Listing({
            seller: msg.sender,
            tokenAddress: tokenAddress,
            tokenId: tokenId,
            price: price,
            isActive: true
        });

        emit Listed(listingId, msg.sender, tokenAddress, tokenId, price);
        return listingId;
    }

    // 购买
    function buy(uint256 listingId) external payable nonReentrant {
        Listing storage listing = listings[listingId];
        require(listing.isActive, "Listing is not active");
        require(msg.value >= listing.price, "Insufficient payment");

        listing.isActive = false;
        
        IERC721(listing.tokenAddress).transferFrom(
            listing.seller,
            msg.sender,
            listing.tokenId
        );

        // 计算并转移手续费
        uint256 fee = (listing.price * FEE_RATE) / 10000;
        uint256 sellerAmount = listing.price - fee;
        
        payable(listing.seller).transfer(sellerAmount);
        
        emit Sale(listingId, msg.sender, listing.price);
    }

    // 取消挂单
    function cancelListing(uint256 listingId) external nonReentrant {
        Listing storage listing = listings[listingId];
        require(listing.seller == msg.sender, "Not the seller");
        require(listing.isActive, "Listing is not active");

        listing.isActive = false;
        emit Canceled(listingId);
    }

    // 获取挂单信息
    function getListing(uint256 listingId) external view returns (
        address seller,
        address tokenAddress,
        uint256 tokenId,
        uint256 price,
        bool isActive
    ) {
        Listing memory listing = listings[listingId];
        return (
            listing.seller,
            listing.tokenAddress,
            listing.tokenId,
            listing.price,
            listing.isActive
        );
    }
}
