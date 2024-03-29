require("dotenv").config();

const evmMultiswap = require("./sdk/evm/multiswap");
const evmFiberRouter = require("./sdk/evm/router");
const wasmMultiswap = require("./sdk/cosmwasm/multiswap");
const wasmFiberRouter = require("./sdk/cosmwasm/router");

function initContracts(
  chainType,
  fundManagerContract,
  fiberContract,
  rpc,
  privKey,
  gasPrice
) {
  if (chainType == "evm") {
    const multiswap = new evmMultiswap.MultiswapContract(
      fundManagerContract,
      rpc,
      privKey
    );
    const fiberRouter = new evmFiberRouter.FIBERRouterContract(
      fiberContract,
      rpc,
      privKey
    );
    return { multiswap, fiberRouter };
  } else if (chainType == "cosmwasm") {
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
  throw `unsupported chain type ${chainType}`;
}

const { multiswap: sourceMultiswap, fiberRouter: sourceFiberRouter } =
  initContracts(
    global.environment.SOURCE_CHAIN_TYPE,
    global.environment.SOURCE_FUND_MANAGER_CONTRACT,
    global.environment.SOURCE_FIBER_ROUTER_CONTRACT,
    global.environment.SOURCE_CHAIN_RPC,
    global.environment.SOURCE_CHAIN_PRIV_KEY,
    global.environment.SOURCE_GAS_PRICE
  );

const { multiswap: targetMultiswap, fiberRouter: targetFiberRouter } =
  initContracts(
    global.environment.DESTINATION_CHAIN_TYPE,
    global.environment.DESTINATION_FUND_MANAGER_CONTRACT,
    global.environment.DESTINATION_FIBER_ROUTER_CONTRACT,
    global.environment.DESTINATION_CHAIN_RPC,
    global.environment.DESTINATION_CHAIN_PRIV_KEY,
    global.environment.DESTINATION_GAS_PRICE
  );

//swap foundry asset on two networks
async function swap(
  sourceTokenAddress,
  targetFoundryTokenAddress,
  targetTokenAddress,
  amount
) {
  const targetChainId = global.environment.DESTINATION_CHAIN_ID;
  const isFoundryAsset = await sourceMultiswap.isFoundryAsset(
    sourceTokenAddress
  );

  if (isFoundryAsset == false) return;
  console.log("Token is foundry asset");
  console.log(
    "add foundry asset in source network",
    sourceTokenAddress,
    amount,
    targetChainId,
    targetFoundryTokenAddress,
    await sourceFiberRouter.getConnectedWallet()
  );
  const success = await sourceFiberRouter.swap(
    sourceTokenAddress,
    amount,
    targetChainId,
    targetFoundryTokenAddress,
    await sourceFiberRouter.getConnectedWallet()
  );

  if (success) {
    console.log("successfully add foundry in source network !");

    const isTargetTokenFoundry = await targetMultiswap.isFoundryAsset(
      targetTokenAddress
    );

    if (isTargetTokenFoundry === true) {
      console.log("Target token is foundry asset");
      console.log("withdraw and swap to foundry asset ...");

      const success = await targetFiberRouter.withdrawAndSwapToFoundry(
        targetFoundryTokenAddress,
        targetTokenAddress,
        amount
      );
      if (success) {
        console.log("successfully swap foundry token to target foundry token");
        console.log("Cheers! your bridge and swap was successful !!!");
      } else {
        console.log("failed to withdraw and swap foundry token");
      }
    }
  }
}

swap(
  global.environment.SOURCE_CHAIN_TOKEN,
  global.environment.DESTINATION_CHAIN_SOURCE_TOKEN,
  global.environment.DESTINATION_CHAIN_TOKEN,
  "10000000000000000000"
);
