// import Web3 from 'web3';
var Web3 = require('web3');
import fiberRouter from '../../../../../artifacts/contracts/upgradeable-Bridge/FiberRouter.sol/FiberRouter.json';

module.exports = {

  web3(rpcUrl: string) {

    if (rpcUrl) {
      return new Web3(new Web3.providers.HttpProvider(rpcUrl));
    }
    return null;
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
