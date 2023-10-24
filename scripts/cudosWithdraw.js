require("dotenv").config();

const evmMultiswap = require("./multiSwapSdk/evm/multiswap");
const evmFiberRouter = require("./multiSwapSdk/evm/router");
const wasmMultiswap = require("./multiSwapSdk/cosmwasm/multiswap");
const wasmFiberRouter = require("./multiSwapSdk/cosmwasm/router");

function initContracts(
  fundManagerContract,
  fiberContract,
  rpc,
  privKey,
  gasPrice
) {
  const multiswap = new wasmMultiswap.MultiswapContract(
    fundManagerContract,
    rpc,
    privKey,
    gasPrice
  );
  const fiberRouter = new wasmFiberRouter.FIBERRouterContract(
    fiberContract,
    rpc,
    privKey,
    gasPrice
  );
  return { multiswap, fiberRouter };
}

//swap foundry asset on two networks
async function cudosWithdraw(
  targetTokenAddress,
  amount,
  desinationWalletAddress,
  fundManagerAddress,
  routerAddress,
  cudosRpc,
  privateKey,
  gasPrice,
  salt,
  signature
) {
  const { multiswap: targetMultiswap, fiberRouter: targetFiberRouter } =
    initContracts(
      fundManagerAddress,
      routerAddress,
      cudosRpc,
      privateKey,
      gasPrice
    );
  const isFoundryAsset = await targetMultiswap.isFoundryAsset(
    targetTokenAddress
  );
  if (isFoundryAsset == false) return;
  console.log("Token is foundry asset");
  console.log("successfully add foundry in source network !");

  const isTargetTokenFoundry = await targetMultiswap.isFoundryAsset(
    targetTokenAddress
  );
  console.log("Target token is foundry asset");
  console.log("withdraw and swap to foundry asset ...");

  const response = await targetFiberRouter.withdrawSigned(
    targetTokenAddress,
    desinationWalletAddress,
    amount,
    salt,
    signature
  );
  return response;
}

module.exports = cudosWithdraw;
