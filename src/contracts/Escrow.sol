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
        bool inspected; //有没有被inspector认证通过
    }

    mapping(uint256 => ProductInfo) public products;

    //对于一个商品,他的buyer/seller/inspector三方都准备就绪后,在这里做标记
    mapping(uint256 => mapping(address => bool)) public agrees;

    modifier OnlySeller()
    {
        require(msg.sender == seller, "Only seller clients can call");
        _;
    }

    modifier OnlyBuyer(uint256 nftid)
    {
        require(msg.sender == products[nftid].buyer, "Only buyer clients can call");
        _;
    }

    modifier OnlyInspector()
    {
        require(msg.sender == inspector, "Only inspector can call");
        _;
    }

    constructor(address _nft_addr, address payable _seller, address _inspector, address _lender)
    {
        nft_address = _nft_addr;
        seller = _seller;
        inspector = _inspector;
        lender = _lender;
    }

    //seller调用这个函数来把自己的商品上架,并委托escrow处理
    function Host(uint256 nft_ID, uint256 _price, uint256 _deposit, address _buyer) public OnlySeller()
    {
        //IERC721(nft_address)是类型转换
        //transferFrom将NFT代币从msg.sender转移至本合约中
        IERC721(nft_address).transferFrom(msg.sender, address(this), nft_ID);

        ProductInfo memory entry = ProductInfo({
            is_on_sale: true,
            price: _price,
            deposit: _deposit,
            buyer: _buyer,
            inspected: false
        });
        products[nft_ID] = entry;
    }

    //buyer调用这个函数来交押金
    //该函数可能发生货币支付,所以需要标注payable否则交易无法进行
    //调用端通过PayDeposit(1, {value: xxx})来为msg.value赋值, 这样写了以后调用时转移就已经发生
    function PayDeposit(uint256 nft_ID) public payable OnlyBuyer(nft_ID)
    {
        require(msg.value >= products[nft_ID].deposit);
        //
    }

    //该合约发生货币转移时自动触发的内置函数
    receive() external payable
    {
    }

    //balance是address类型的内置成员,返回该地址拥有的加密货币数量
    function GetBalance() public view returns (uint256)
    {
        return address(this).balance;
    }

    function InspectionVerify(uint256 nid, bool passed) public OnlyInspector()
    {
        products[nid].inspected = passed;
    }

    function CheckInspectionResult(uint256 nid) public view returns(bool)
    {
        return products[nid].inspected;
    }

    function Ready(uint256 nid) public
    {
        agrees[nid][msg.sender] = true; //mark function caller is ready
    }

    function ExecuteSale(uint256 nid) public
    {
        require(products[nid].inspected); //验证监管已同意
        require(agrees[nid][products[nid].buyer]); //买家声称过自己已经就绪 下同
        require(agrees[nid][seller]);
        require(agrees[nid][lender]);
        require(address(this).balance >= products[nid].price); //合约余额足够支付价格

        //标记已卖出
        products[nid].is_on_sale = false;

        //钱给seller
        //call,一种转移ETH的方式,这里把本合约的余额全部转移到seller账户
        //payable将seller地址转为可交易地址,如果seller声明是payable address则不需要再转
        //{value: amount}是特殊语法,填写发送多少货币
        //call的函数参数空字符串,意思是不执行额外函数,仅转移货币
        (bool success,) = payable(seller).call{value: address(this).balance}("");

        require(success);

        //货给buyer
        IERC721(nft_address).transferFrom(address(this), products[nid].buyer, nid);
    }
}