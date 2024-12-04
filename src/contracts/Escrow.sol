// SPDX-License-Identifier: MIT
pragma solidity ^0.8.2;

interface IERC721
{
    function transferFrom(address from, address to, uint256 tID) external;
}

//Escrow代表托管合约,即买方和卖方之间的托管中介,在区块链中中介是合约而不是人
contract Escrow
{
    address public nft_address; //NFT铸造商地址/NFT来源地址
    address payable public seller;
    address public inspector;
    address public lender; //可以贷款给买家的机构

    struct ProductInfo
    {
        bool is_on_sale;
        uint256 price;
        uint256 deposit; //商品在escrow寄卖的保证金
        address buyer;
    }

    mapping(uint256 => ProductInfo) public products;

    modifier OnlySeller()
    {
        require(msg.sender == seller, "Only seller clients can call Host");
        _;
    }

    constructor(address _nft_addr, address payable _seller, address _inspector, address _lender)
    {
        nft_address = _nft_addr;
        seller = _seller;
        inspector = _inspector;
        lender = _lender;
    }

    //将商品(以tokenID代表)从卖方(host调用者)那里转移到托管所(即这个Escrow实例)
    function Host(uint256 nft_ID, uint256 _price, uint256 _deposit, address _buyer) public OnlySeller()
    {
        //IERC721(nft_address)是类型转换
        IERC721(nft_address).transferFrom(msg.sender, address(this), nft_ID);

        ProductInfo memory entry = ProductInfo({
            is_on_sale: true,
            price: _price,
            deposit: _deposit,
            buyer: _buyer
        });
        products[nft_ID] = entry;
    }
}