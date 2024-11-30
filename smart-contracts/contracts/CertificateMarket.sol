// SPDX-License-Identifier: MIT
pragma solidity ^0.8.19;

import "@openzeppelin/contracts/token/ERC721/IERC721.sol";
import "@openzeppelin/contracts/security/ReentrancyGuard.sol";
import "@openzeppelin/contracts/access/Ownable.sol";
import "@openzeppelin/contracts/utils/Counters.sol";

contract CertificateMarket is ReentrancyGuard, Ownable {
    using Counters for Counters.Counter;

    struct Listing {
        address seller;
        uint256 price;
        bool active;
    }

    IERC721 public nftContract;
    address public feeAccount;
    uint256 public listingFee;
    uint256 public totalVolume;
    Counters.Counter private _activeListings;

    mapping(uint256 => Listing) private _listings;

    event ListingCreated(uint256 indexed tokenId, address indexed seller, uint256 price);
    event ListingCancelled(uint256 indexed tokenId);
    event CertificateSold(uint256 indexed tokenId, address indexed seller, address indexed buyer, uint256 price);

    constructor(address _nftContract, address _feeAccount, uint256 _listingFee) {
        nftContract = IERC721(_nftContract);
        feeAccount = _feeAccount;
        listingFee = _listingFee;
    }

    function createListing(uint256 tokenId, uint256 price) external payable nonReentrant {
        require(msg.value == listingFee, "Must pay listing fee");
        require(nftContract.ownerOf(tokenId) == msg.sender, "Must be token owner");
        require(nftContract.getApproved(tokenId) == address(this), "Market not approved");

        _listings[tokenId] = Listing({
            seller: msg.sender,
            price: price,
            active: true
        });

        _activeListings.increment();

        emit ListingCreated(tokenId, msg.sender, price);
    }

    function cancelListing(uint256 tokenId) external nonReentrant {
        Listing storage listing = _listings[tokenId];
        require(listing.seller == msg.sender, "Must be listing seller");
        require(listing.active, "Listing not active");

        listing.active = false;
        _activeListings.decrement();

        emit ListingCancelled(tokenId);
    }

    function purchaseCertificate(uint256 tokenId) external payable nonReentrant {
        Listing storage listing = _listings[tokenId];
        require(listing.active, "Listing is not active");
        require(msg.value == listing.price, "Must pay the exact price");

        listing.active = false;
        _activeListings.decrement();

        // Update market statistics
        totalVolume += listing.price;

        // Transfer NFT to buyer
        nftContract.safeTransferFrom(listing.seller, msg.sender, tokenId);

        // Transfer funds to seller
        payable(listing.seller).transfer(listing.price);

        emit CertificateSold(tokenId, listing.seller, msg.sender, listing.price);
    }

    function getListing(uint256 tokenId) external view returns (address seller, uint256 price, bool active) {
        Listing storage listing = _listings[tokenId];
        return (listing.seller, listing.price, listing.active);
    }

    function activeListingsCount() external view returns (uint256) {
        return _activeListings.current();
    }

    function withdrawFees() external onlyOwner {
        uint256 balance = address(this).balance;
        payable(feeAccount).transfer(balance);
    }

    function updateListingFee(uint256 _newFee) external onlyOwner {
        listingFee = _newFee;
    }

    function updateFeeAccount(address _newFeeAccount) external onlyOwner {
        feeAccount = _newFeeAccount;
    }
}
