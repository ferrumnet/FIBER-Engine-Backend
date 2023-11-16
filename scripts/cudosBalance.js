require("dotenv").config();

const wasmMultiswap = require("./multiSwapSdk/cosmwasm/multiswap");

function initContracts(fundManagerContract, rpc, privKey, gasPrice) {
  const multiswap = new wasmMultiswap.MultiswapContract(
    fundManagerContract,
    rpc,
    privKey,
    gasPrice
  );
  return { multiswap };
}

async function cudosBalance(
  foundryTokenAddress,
  fundManagerAddress,
  cudosRpc,
  privateKey
) {
  const { multiswap: targetMultiswap } = initContracts(
    fundManagerAddress,
    cudosRpc,
    privateKey,
    null
  );
  const balance = await targetMultiswap.tokenBalance(
    foundryTokenAddress,
    fundManagerAddress,
    privateKey,
    cudosRpc
  );
  return balance;
}

module.exports = cudosBalance;
