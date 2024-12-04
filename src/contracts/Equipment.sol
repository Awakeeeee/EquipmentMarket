// SPDX-License-Identifier: MIT
pragma solidity ^0.8.2;

//openzeppelin是一个帮助写NFT的插件
//ERC721是以太坊用于创建NFT的接口标准
import "@openzeppelin/contracts/utils/Counters.sol";
import "@openzeppelin/contracts/token/ERC721/ERC721.sol";
import "@openzeppelin/contracts/token/ERC721/extensions/ERC721URIStorage.sol";

contract Equipment is ERC721URIStorage
{
    //Counters是一个库(namespace), Counters.Counter是一个类型, using语句的含义是该类型可以调用库中的函数
    using Counters for Counters.Counter;
    //合约铸造NFT时会赋予ID,其实就是自增的数字,Counter一般就是用来计数的
    //NTF的形式暂时可以理解成 [合约地址]#ID + metadata (0x21987d869a9f79sf7d9g#23)
    Counters.Counter private mTokenID;

    //调用父ctor的语法
    constructor() ERC721("Equipment", "EPT")
    {

    }

    function Mint(string memory token_uri) public returns(uint256)
    {
        mTokenID.increment();
        uint256 mintID = mTokenID.current();
        _mint(msg.sender, mintID);
        _setTokenURI(mintID, token_uri);
        return mintID;
    }

    function TotalSupply() public view returns(uint256)
    {
        return mTokenID.current();
    }
}
