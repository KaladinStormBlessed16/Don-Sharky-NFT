//SPDX-License-Identifier: MIT
pragma solidity ^0.8.7;

import "@openzeppelin/contracts/access/Ownable.sol";
import "@openzeppelin/contracts/token/ERC721/extensions/ERC721Enumerable.sol";
import "./Err.sol";

//                                .#%@@(
//                        ,#%@@@@@@@@@@#
//        .             ,#&@@@#&@@@@@@@@@@@@@%(
//                *#&@@@#/      ,#@@@@@@@@@@@@@#
//            ,@@@@@@@@#           #&@@@@@@#     #%#
//            ,@@@@@@@@#    /@#*      .##     #%@@@@@@%#(/(#
//            ,@@@@@@@@#    /@@@@@#,       (%@@@@@@@@@@@@@#
//            ,@@@@@@@@#    /@@@@@@@@#  /%@@#*##&@@@@@@#/
//            ,@@@@@@@@#    /@@@@@@@@#%@@%*
//            ,@@@@@@@@@@##/(@@@@@@@@@%#((((#####.
//            ,&@@@@@@@@@@@@@@@@@@@@@@@%#&@@@@@@@@@,   (
//                *#@@@@@@@@@@@@@@@@@@#    #@@@@@@@@# ,###
//                            /@@@@@@@@#    #@@@@@@@%#########.
//    .   .                   /@@@@@@@@#    #@@@@@@@@#######(
//            .#@@%(        /@@@@@@@@#    #@@@@@@@@#  ##*
//        .#@@@@@@@@&%     /@@@@@@@@#    #@@@@@@@@#   ,
//        .#@@@@@@@@@@@@@@@#  /@@@@@@@@#    #@@@@@@@@#
//            .#@@@@@@@@@@@@@#@@@@@@@@#    #@@@@@@@@#
//                /%@@@@@@@@@@@@@@@@@@#    #@@@@@@@@&/
//        ..          #&@@@@@@@@@@@@@@@#    #@@@@@@@@@@@#*
//                    .#@@@@@@@@@@@@@#    (@@@@##/
//                        .*,/@@@@@@@@#    ##.
//                            /@@@@@@@@#
//                            (@@@@@@#
//                .        #@@%#.

contract DonSharky is ERC721Enumerable, Ownable {
    using Strings for uint256;

    string private baseURI;
    string public baseExtension = ".json";
    uint256[3] private cost = [70 ether, 110 ether, 150 ether];
    uint256[3] private maxSupply = [1000, 3000, 3000];
    uint256 public maxMintAmount = 20;
    uint256 private mintPhase = 0;
    bool private paused = true;
    bool private revealed = false;
    string private notRevealedUri;

    uint256 alreadyRevealedTokens = 0;

    mapping(address => uint256) private _freeMintList;
    mapping(address => bool) public isWhitelisted;
    bool public whitelistOn = true;
    address withdrawWallet = 0x97d10440604173a1Cb74486e874166Dd07633eF1;

    event NftMinted(uint256 id, address minter);

    constructor(
        string memory _name,
        string memory _symbol,
        string memory _initBaseURI,
        string memory _initNotRevealedUri
    ) ERC721(_name, _symbol) {
        setBaseURI(_initBaseURI);
        setNotRevealedURI(_initNotRevealedUri);
    }

    ////////////////////////
    //  Logic Functions  //
    //////////////////////

    function mint(uint256 _mintAmount) public payable {
        uint256 totalSupply = totalSupply();

        if (paused && msg.sender != owner()) revert pausedErr();
        if (_mintAmount <= 0 || _mintAmount > maxMintAmount) revert mintAmountErr();
        if (totalSupply + _mintAmount > maxSupply[mintPhase]) revert totalSupplyErr();

        uint256 numFreeMints = _freeMintList[msg.sender];
        uint256 totalFree = 0;
        if (numFreeMints > 0) {
            if (_mintAmount <= numFreeMints) {
                _freeMintList[msg.sender] -= _mintAmount;
                totalFree = _mintAmount;
            } else {
                _freeMintList[msg.sender] = 0;
                totalFree = _mintAmount - numFreeMints;
            }
        }

        if (whitelistOn) require(isWhitelisted[msg.sender] || msg.sender == owner());

        uint256 payAmount = cost[mintPhase] * (_mintAmount - totalFree);
        if (msg.sender != owner() && msg.value < payAmount) revert payAmountErr();

        for (uint256 i = 1; i <= _mintAmount; i++) {
            _safeMint(msg.sender, totalSupply + i);
            emit NftMinted(totalSupply + i, msg.sender);
        }
    }

    function reveal() external onlyOwner {
        revealed = true;
    }

    function withdraw() external payable onlyOwner {
        require(payable(withdrawWallet).send(address(this).balance));
    }

    function addToWhitelist(address[] memory wallets) external onlyOwner {
        for (uint256 i = 0; i < wallets.length; ++i) isWhitelisted[wallets[i]] = true;
    }

    ////////////////////////
    //      Setters      //
    //////////////////////

    function setAlreadyRevealedTokens(uint256 lastTokenRevealed) public onlyOwner {
        require(
            lastTokenRevealed <= totalSupply() && lastTokenRevealed > 0,
            "Token doesn't exists"
        );
        alreadyRevealedTokens = lastTokenRevealed;
    }

    function setFreeMintList(address[] calldata addresses, uint256 numAllowedToFreeMint)
        external
        onlyOwner
    {
        if (numAllowedToFreeMint < 0) revert setParameterErr();
        for (uint256 i = 0; i < addresses.length; i++) {
            _freeMintList[addresses[i]] = numAllowedToFreeMint;
        }
    }

    function setCost(uint256 _newCost) external onlyOwner {
        if (_newCost < 0) revert setParameterErr();
        cost[mintPhase] = _newCost;
    }

    function setMintPhase(uint256 _newMintPhase) external onlyOwner {
        if (_newMintPhase < 0 || _newMintPhase > 3) revert mintPhaseErr();
        if (_newMintPhase == 2) whitelistOn = false;
        mintPhase = _newMintPhase;
    }

    function setNotRevealedURI(string memory _notRevealedURI) public onlyOwner {
        notRevealedUri = _notRevealedURI;
    }

    function setBaseURI(string memory _newBaseURI) public onlyOwner {
        baseURI = _newBaseURI;
    }

    function setBaseExtension(string memory _newBaseExtension) external onlyOwner {
        baseExtension = _newBaseExtension;
    }

    function switchPause() external onlyOwner {
        paused = !paused;
    }

    ////////////////////////
    //       Getters     //
    //////////////////////

    function tokensOfOwner(address _owner) public view returns (uint256[] memory) {
        uint256 ownerTokenCount = balanceOf(_owner);
        uint256[] memory tokenIds = new uint256[](ownerTokenCount);

        for (uint256 i; i < ownerTokenCount; i++) {
            tokenIds[i] = tokenOfOwnerByIndex(_owner, i);
        }

        return tokenIds;
    }

    function tokenURI(uint256 _tokenId) public view virtual override returns (string memory) {
        require(_exists(_tokenId), "ERC721Metadata: URI query for nonexistent token");

        if (!tokenAlreadyRevealed(_tokenId)) {
            return notRevealedUri;
        }

        string memory currentBaseURI = _baseURI();
        return
            bytes(currentBaseURI).length > 0
                ? string(abi.encodePacked(currentBaseURI, _tokenId.toString(), baseExtension))
                : "";
    }

    function tokenAlreadyRevealed(uint256 _tokenId) public view returns (bool) {
        if (_tokenId <= 0 || _tokenId > maxSupply[mintPhase]) return false;
        return _tokenId <= alreadyRevealedTokens;
    }

    function _baseURI() internal view virtual override returns (string memory) {
        return baseURI;
    }

    function numAvailableToFreeMint(address addr) external view returns (uint256) {
        return _freeMintList[addr];
    }

    function getCost() external view returns (uint256) {
        return cost[mintPhase];
    }

    function getMaxSupply() external view returns (uint256) {
        return maxSupply[mintPhase];
    }

    function getMaxMintAmount() external view returns (uint256) {
        return maxMintAmount;
    }

    function getMintPhase() external view returns (uint256) {
        return mintPhase;
    }

    function isPaused() external view returns (bool) {
        return paused;
    }

    function isRevealed() external view returns (bool) {
        return revealed;
    }

    function getNotRevealedUri() external view returns (string memory) {
        return notRevealedUri;
    }
}
