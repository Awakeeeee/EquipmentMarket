/** @type import('hardhat/config').HardhatUserConfig */

require("@nomiclabs/hardhat-waffle");

module.exports = {
  solidity: "0.8.27",
  
  paths: {
    sources: "./src/contracts",
  },

  networks: {
    hardhat: {
      chainId: 31337,  // 本地区块链的 Chain ID
      url: "http://127.0.0.1:8546",  // 修改为新的 URL
      gas: "auto",  // 自动计算 gas 限制
      blockGasLimit: 10000000,  // 自定义每个区块的最大 gas 限制
      // accounts: {
      //   mnemonic: "test test test test test test test test test test test test test test test test",  // 自定义账户助记词
      // }
    }
  }
};
