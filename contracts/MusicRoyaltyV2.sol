// SPDX-License-Identifier: MIT
pragma solidity ^0.8.20;

import "@openzeppelin/contracts/token/ERC1155/ERC1155.sol";
import "@openzeppelin/contracts/token/common/ERC2981.sol";

/**
 * @title MusicRoyalty_Marketplace
 * @notice ERC1155-based decentralized music NFT marketplace with built-in royalties.
 *         - Artists stake 0.1 ETH to mint songs
 *         - Buyers and resellers can trade songs freely
 *         - Royalties are automatically paid to the artist
 */
contract MusicRoyalty_Marketplace is ERC1155, ERC2981 {
    // --- Artist Staking ---
    uint256 public constant ARTIST_STAKE_AMOUNT = 0.1 ether;
    mapping(address => bool) public isArtist;

    // --- Song Metadata ---
    struct SongInfo {
        address payable originalArtist;
        string ipfsMetadataHash;
        uint96 royaltyBps; // basis points (e.g., 500 = 5%)
    }

    mapping(uint256 => SongInfo) public songDetails;
    uint256 public tokenCounter;

    // --- Marketplace Listing ---
    struct Listing {
        address seller;
        uint256 price;
        bool active;
    }
    mapping(uint256 => Listing) public listings; // one active listing per tokenId

    // --- Events ---
    event SongCreated(uint256 indexed tokenId, address indexed artist);
    event SongListed(uint256 indexed tokenId, address indexed seller, uint256 price);
    event SongSold(
        uint256 indexed tokenId,
        address indexed seller,
        address indexed buyer,
        uint256 price,
        address royaltyReceiver,
        uint256 royaltyAmount
    );
    event ListingCancelled(uint256 indexed tokenId, address indexed seller);

    constructor() ERC1155("ipfs://") {}

    // --- Artist Staking ---
    function stakeToBecomeArtist() external payable {
        require(!isArtist[msg.sender], "Already an artist");
        require(msg.value == ARTIST_STAKE_AMOUNT, "Stake must be 0.1 ETH");
        isArtist[msg.sender] = true;
    }

    function unstakeAndRetire() external {
        require(isArtist[msg.sender], "Not an artist");
        isArtist[msg.sender] = false;
        (bool sent, ) = payable(msg.sender).call{value: ARTIST_STAKE_AMOUNT}("");
        require(sent, "Refund failed");
    }

    // --- Create Song ---
    function createSong(string memory _ipfsMetadataHash, uint96 _royaltyPercentage) external {
        require(isArtist[msg.sender], "Only artists");
        require(_royaltyPercentage <= 10000, "Invalid royalty percentage");

        tokenCounter++;

        songDetails[tokenCounter] = SongInfo(
            payable(msg.sender),
            _ipfsMetadataHash,
            _royaltyPercentage
        );

        _mint(msg.sender, tokenCounter, 1, "");
        emit SongCreated(tokenCounter, msg.sender);
    }

    // --- List Song for Sale ---
    function listSongForSale(uint256 _tokenId, uint256 _price) external {
        require(balanceOf(msg.sender, _tokenId) > 0, "You don't own this song");
        require(_price > 0, "Price must be > 0");

        listings[_tokenId] = Listing(msg.sender, _price, true);
        emit SongListed(_tokenId, msg.sender, _price);
    }

    // --- Buy Listed Song ---
    function buyListedSong(uint256 _tokenId) external payable {
        Listing storage listing = listings[_tokenId];
        require(listing.active, "Not listed for sale");
        require(msg.value == listing.price, "Incorrect price");

        address seller = listing.seller;
        require(balanceOf(seller, _tokenId) > 0, "Seller no longer owns NFT");

        listing.active = false;

        // --- Royalty Logic ---
        SongInfo memory song = songDetails[_tokenId];
        uint256 royaltyAmount = (msg.value * song.royaltyBps) / 10000;
        uint256 sellerAmount = msg.value - royaltyAmount;

        // Pay royalty to original artist
        if (royaltyAmount > 0) {
            (bool royaltySent, ) = song.originalArtist.call{value: royaltyAmount}("");
            require(royaltySent, "Royalty payment failed");
        }

        // Pay seller
        (bool sellerPaid, ) = payable(seller).call{value: sellerAmount}("");
        require(sellerPaid, "Seller payment failed");

        // Transfer NFT ownership
        _safeTransferFrom(seller, msg.sender, _tokenId, 1, "");

        // Emit detailed event
        emit SongSold(
            _tokenId,
            seller,
            msg.sender,
            msg.value,
            song.originalArtist,
            royaltyAmount
        );
    }

    // --- Cancel Listing ---
    function cancelListing(uint256 _tokenId) external {
        Listing storage listing = listings[_tokenId];
        require(listing.active, "Listing not active");
        require(listing.seller == msg.sender, "Only seller can cancel");
        listing.active = false;
        emit ListingCancelled(_tokenId, msg.sender);
    }

    // --- Metadata URI ---
    function uri(uint256 _tokenId) public view override returns (string memory) {
        SongInfo memory song = songDetails[_tokenId];
        require(bytes(song.ipfsMetadataHash).length > 0, "No metadata");
        return string(abi.encodePacked("ipfs://", song.ipfsMetadataHash));
    }

    // --- Interface Support ---
    function supportsInterface(bytes4 interfaceId)
        public
        view
        virtual
        override(ERC1155, ERC2981)
        returns (bool)
    {
        return super.supportsInterface(interfaceId);
    }
}
