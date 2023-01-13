// import Web3 from 'web3';
var Web3 = require('web3');
import fiberRouter from '../../../../../artifacts/contracts/upgradeable-Bridge/FiberRouter.sol/FiberRouter.json';
import erc20Abi from '../../../../../artifacts/contracts/upgradeable-Bridge/FiberRouter.sol/IERC20.json';

module.exports = {

  web3(rpcUrl: string) {

    if (rpcUrl) {
      return new Web3(new Web3.providers.HttpProvider(rpcUrl));
    }
    return null;
  },

  erc20(rpcUrl: string, tokenContractAddress: string) {
    let web3 = this.web3(rpcUrl).eth;
    return new web3.Contract(erc20Abi as any, tokenContractAddress);
  },

  getfiberAbi() {
    let abi = fiberRouter.abi;
    return abi;
  },

  getfiberSwapInputs() {
    let abis = fiberRouter.abi;
    let inputs = abis.find(abi => abi.name === 'Withdrawal' && abi.type === 'event');
    return inputs;
  }

}
