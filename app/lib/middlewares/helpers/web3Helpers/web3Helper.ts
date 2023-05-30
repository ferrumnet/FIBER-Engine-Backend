module.exports = {

  async getTransaction(network: any, txId: any) {
    let web3 = web3ConfigurationHelper.web3(network.rpcUrl).eth;
    if (web3) {
      let transaction = await web3.getTransaction(txId)
      return transaction;
    }
    return null;
  }

}
