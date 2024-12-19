//js解构赋值语法,仅从chai库中提取expect函数,避免写chai.expect的麻烦
//chai是一个用于写断言的node库
//hardhat是个开发期间提供智能合约测试环境的库

//切回CommonJS的方式加载hardhat,因为这插件支持这个
import { createRequire } from "module";
const require = createRequire(import.meta.url);
const { ethers } = require("hardhat");

//用ESM加载chai
import { expect } from "chai";

const tokens = (n) => {
    //parseUnits函数将传入的代币转为以wei单位的数值,'ether'参数指明了输入的值的原单位
    return ethers.utils.parseUnits(n.toString(), 'ether');
};

describe("Equipment Market Test", () => {

    let seller, buyer, lender, inspector;
    let contract_market, contract_escrow;

    before(async () =>
    {
        console.log("Initializing...")

        let robots = await ethers.getSigners();
        seller = robots[0];
        buyer = robots[1];
        lender = robots[2];
        inspector = robots[3];
        buyer = robots[4];

        //hardhat测试环境中创建一个用于操作智能合约的对象,例如可以用来部署这个合约
        let factory = await ethers.getContractFactory('Equipment');
        contract_market = await factory.deploy();
        await contract_market.deployed();

        //传入的URI是IPFS远端的某个文件,该文件描述一件实际商品(图片/音频/房产信息etc)
        //通过connect和mint,将该商品绑定为NFT,并且该NFT现在属于seller
        //*合约的函数调用并不会直接返回编写代码时的返回值,因为调用只相当于发布到网上等人执行,而是会返回TransactionResponse对象,其中包含wait函数
        let transaction_mint = await contract_market.connect(seller).Mint("https://violet-worthwhile-frog-952.mypinata.cloud/ipfs/QmcjWDaT24bXR8e9ToURre7F5TVVn8UaRe2mrSFcJVQMZW");
        //等待矿工完成这个交易,返回TransactionReceipt对象
        await transaction_mint.wait();
        
        factory = await ethers.getContractFactory('Escrow');
        contract_escrow = await factory.deploy(contract_market.address, seller.address, inspector.address, lender.address);
        await contract_escrow.deployed();

        //approve: seller说现在contract_escrow这个地址可以使用我的NTF代币1,比如它可以把我这个代币花出去(也就是帮我卖货)
        let transaction_apv = await contract_market.connect(seller).approve(contract_escrow.address, 1);
        await transaction_apv.wait();

        //escrow开始工作,将seller的商品转移到自己名下,开始对接买家
        let transaction_host = await contract_escrow.connect(seller).Host(1, tokens(10), tokens(1), buyer.address);
        await transaction_host.wait();
    });

    describe(("- Identity confirmation"), async () => {
        
        it("Confirm NTF address", async () => {
            const addr = await contract_escrow.nft_address();
            expect(addr).to.be.equal(contract_market.address);
        });

        it("Confirm seller address", async () => {
            const addr = await contract_escrow.seller();
            expect(addr).to.be.equal(seller.address);
        });

        it("Confirm lender address", async () => {
            const addr = await contract_escrow.lender();
            expect(addr).to.be.equal(lender.address);
        });

        it("Confirm inspector address", async () => {
            const addr = await contract_escrow.inspector();
            expect(addr).be.equal(inspector.address);
        });
    });

    describe(("- Hosting confirmation"), async () => {
        
        it("NTF at esrow", async () => {
            let owner = await contract_market.ownerOf(1);
            expect(owner).to.be.equal(contract_escrow.address);
        });

        it("NTF info check", async () => {
            const info = await contract_escrow.products(1); //注意不是[]
            expect(info.is_on_sale).to.be.true;
            expect(info.price.toString()).to.equal(tokens(10).toString()); //这里是js,solidity中的uint256是用js的BigNumber类型表示,该类型不像普通数字一样能做比较,所以转为string对比
            expect(info.deposit.toString()).to.equal(tokens(1).toString());
            expect(info.buyer).equal(buyer.address);
        });
    });

    describe(("- Deposit confirmation"), async () => {

        it("Pay Deposit", async () => {
            //{value:..}是仅限这个测试插件中对payable function附加货币的语法
            let transaction_deposit = await contract_escrow.connect(buyer).PayDeposit(1, { value: tokens(5) });
            await transaction_deposit.wait();
            let check = await contract_escrow.GetBalance();
            expect(check.toString()).to.equal(tokens(5).toString());
        });

    });

    describe(("- Inspection confirmation"), async () => {
        
        it("Inspector verify", async () => {
            let transaction_ins = await contract_escrow.connect(inspector).InspectionVerify(1, true);
            await transaction_ins.wait();
            const result = await contract_escrow.CheckInspectionResult(1);
            expect(result).to.be.equal(true);
        });

    });

    describe(("- Everyone ready confirmation"), async () => {
        
        it("Say ready", async () => {
            let transaction_ready = await contract_escrow.connect(buyer).Ready(1);
            await transaction_ready.wait();
            transaction_ready = await contract_escrow.connect(seller).Ready(1);
            await transaction_ready.wait();
            transaction_ready = await contract_escrow.connect(inspector).Ready(1);
            await transaction_ready.wait();

            //注意js中这个取map of map的语法
            expect(await contract_escrow.agrees(1, buyer.address)).to.be.equal(true);
            expect(await contract_escrow.agrees(1, seller.address)).to.be.equal(true);
            expect(await contract_escrow.agrees(1, inspector.address)).to.be.equal(true);
        });

    });
})

//1.
//describe: 测试时的逻辑分组函数,不直接起作用,而是负责调用内部的it等函数
//it: 执行一个测试用例,it之间不要有依赖
//beforeEach: 作用域中,在每个it执行之前调用,用来初始化每个用例
//beforeAll(在mocha中是before): 做一次总的初始化

//2.
//PS: install像mocha和harhat这样的开发测试库时,可以npm install --save-dev,表示这些库仅会在开发期间使用,从而加入开发专用的依赖列表

//3.
//PS: npx hardhat
//npx = 如果这个库没有安装,那就先安装再执行? / 执行工程内的(而不是全局的)插件?
//npx hardhat init -> 需要先初始化,创建hardhat.config.js