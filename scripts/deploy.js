//const hre = require("hardhat");

import { createRequire } from "module";
const require = createRequire(import.meta.url);
const hre = require("hardhat");

const tokens = (n) => {
    return hre.ethers.utils.parseUnits(n.toString(), 'ether');
};

async function main()
{
    let seller, buyer, lender, inspector;
    [buyer, seller, inspector, lender] = await hre.ethers.getSigners()

    const EQUIPMENT = await hre.ethers.getContractFactory("Equipment")
    const ct_market = await EQUIPMENT.deploy()
    await ct_market.deployed()
    console.log(`Equipment合约已部署在: ${ct_market.address}"`)

    let transaction = await ct_market.connect(seller).Mint("https://violet-worthwhile-frog-952.mypinata.cloud/ipfs/bafkreidp7i2pweuvirnekdh3w24ar2fa5qvmzyk4o4nq7d7dnuty4zag5a")
    await transaction.wait()
    console.log("创建NTF:青铜斧")

    // transaction = await ct_market.connect(seller).Mint("https://violet-worthwhile-frog-952.mypinata.cloud/ipfs/bafkreibfuusi7vtxu4bo5k2zw4jvapcmm6i2pqpgkh2sspdq2wyx6ydgey")
    // await transaction.wait()
    // console.log("创建NTF:宝石戒指")

    const ESCROW = await hre.ethers.getContractFactory("Escrow")
    const ct_escrow = await ESCROW.deploy(ct_market.address, seller.address, inspector.address, lender.address)
    await ct_escrow.deployed()
    console.log(`Escrow合约已部署在: ${ct_escrow.address}"`)

    transaction = await ct_market.connect(seller).approve(ct_escrow.address, 1)
    await transaction.wait();
    console.log("装备NTF已委托给Escrow交易")

    //TODO 为什么直接传了买家地址 这时候知道谁来买吗
    transaction = await ct_escrow.connect(seller).Host(1, tokens(5), tokens(10), buyer.address)
    console.log("装备NTF已上架")
}

main()
.then(() => process.exit(0))
.catch((error) => {
    console.log(error);
    process.exit(1);
});