// SPDX-License-Identifier: MIT
pragma solidity ^0.8.0;

import "@openzeppelin/contracts/token/ERC1155/ERC1155.sol";
import "@openzeppelin/contracts/access/Ownable.sol";
import "@openzeppelin/contracts/utils/Strings.sol";

/// @title TestNFT Contract
/// @author lupo0x
contract TestNFT is ERC1155, Ownable {
    /*//////////////////////////////////////////////////////////////
                                TYPES
    //////////////////////////////////////////////////////////////*/
    enum Category { Art, Gaming, PFPs, Music }
    
    struct NFTInfo {
        Category category;
        uint256 maxSupply;
        uint256 currentSupply;
        uint256 price;
        bool active;
    }

    /*//////////////////////////////////////////////////////////////
                            STATE VARIABLES
    //////////////////////////////////////////////////////////////*/
    mapping(uint256 => NFTInfo) public nftInfo;
    mapping(address => mapping(Category => uint256)) public userCategoryBalance;
    string private _baseURI;

    /*//////////////////////////////////////////////////////////////
                                EVENTS
    //////////////////////////////////////////////////////////////*/
    /// @notice Emitted when a new NFT type is created
    /// @param tokenId The ID of the new NFT
    /// @param category The category of the NFT
    /// @param maxSupply Maximum number of editions allowed
    event NFTCreated(uint256 indexed tokenId, Category category, uint256 maxSupply);

    /// @notice Emitted when an NFT is minted
    /// @param account The address that minted the NFT
    /// @param tokenId The ID of the minted NFT
    event NFTMinted(address indexed account, uint256 indexed tokenId);

    /*//////////////////////////////////////////////////////////////
                               CONSTRUCTOR
    //////////////////////////////////////////////////////////////*/
    /// @notice Initializes the NFT contract
    /// @param baseURI The base URI for token metadata
    constructor(string memory baseURI,address initialOwner) ERC1155("TestNFT") Ownable(initialOwner) {
        _baseURI = baseURI;
    }

    /*//////////////////////////////////////////////////////////////
                              CORE FUNCTIONS
    //////////////////////////////////////////////////////////////*/
    /// @notice Creates a new NFT type
    /// @param tokenId The ID for the new NFT
    /// @param category The category of the NFT
    /// @param maxSupply Maximum number of editions allowed
    /// @param price Price in wei to mint each edition
    function createNFT(
        uint256 tokenId,
        Category category,
        uint256 maxSupply,
        uint256 price
    ) external onlyOwner {
        require(!nftInfo[tokenId].active, "NFT already exists");
        
        nftInfo[tokenId] = NFTInfo({
            category: category,
            maxSupply: maxSupply,
            currentSupply: 0,
            price: price,
            active: true
        });
        
        emit NFTCreated(tokenId, category, maxSupply);
    }
    
    /// @notice Mints an NFT
    /// @param tokenId The ID of the NFT to mint
    function mint(uint256 tokenId) external payable {
        NFTInfo storage nft = nftInfo[tokenId];
        require(nft.active, "NFT does not exist");
        require(msg.value >= nft.price, "Insufficient payment");
        require(nft.currentSupply < nft.maxSupply, "Max supply reached");
        require(
            userCategoryBalance[msg.sender][nft.category] < 2,
            "Category limit reached"
        );
        
        nft.currentSupply++;
        userCategoryBalance[msg.sender][nft.category]++;
        _mint(msg.sender, tokenId, 1, "");
        
        emit NFTMinted(msg.sender, tokenId);
    }

    /*//////////////////////////////////////////////////////////////
                            ADMIN FUNCTIONS
    //////////////////////////////////////////////////////////////*/
    /// @notice Sets the base URI for token metadata
    /// @param newBaseURI The new base URI
    function setBaseURI(string memory newBaseURI) external onlyOwner {
        _baseURI = newBaseURI;
    }
    
    /// @notice Withdraws contract balance to owner
    function withdraw() external onlyOwner {
        payable(owner()).transfer(address(this).balance);
    }

    /*//////////////////////////////////////////////////////////////
                            VIEW FUNCTIONS
    //////////////////////////////////////////////////////////////*/
    /// @notice Gets the URI for a token's metadata
    /// @param tokenId The ID of the token
    /// @return The token's URI
    function uri(uint256 tokenId) public view virtual override returns (string memory) {
        require(nftInfo[tokenId].active, "NFT does not exist");
        return string(
            abi.encodePacked(
                _baseURI,
                Strings.toString(tokenId),
                ".json"
            )
        );
    }
}