/** @type import('hardhat/config').HardhatUserConfig */

require("@nomiclabs/hardhat-waffle");

module.exports = {
  solidity: "0.8.27",
  
  paths: {
    sources: "./src/contracts",
  },
};
