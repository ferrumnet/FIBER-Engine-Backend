var request = require("supertest");
import {
  ENV,
  baseURL,
  createAuthTokenForNodeInfra,
} from "../constants/constants";
const validQuoteApiUrl = "/api/v1/multiswap/token/categorized/quote/info";
const inValidQuoteApiUrl = "/api/v1/multiswap/token/categorized/quote/infos";

const foundaryToFoundaryCrossChainSwap =
  "?sourceWalletAddress=0xeedfdd620629c7432970d22488124fc92ad6d426&sourceTokenContractAddress=0xb97ef9ef8734c71904d8002f8b6bc66dd9c48a6e&sourceNetworkChainId=43114&sourceAmount=1&destinationTokenContractAddress=0xaf88d065e77c8cc2239327c5edb3a432268e5831&destinationNetworkChainId=42161&destinationWalletAddress=";
const foundaryToOneInchCrossChainSwap =
  "?sourceWalletAddress=0xeedfdd620629c7432970d22488124fc92ad6d426&sourceTokenContractAddress=0xb97ef9ef8734c71904d8002f8b6bc66dd9c48a6e&sourceNetworkChainId=43114&sourceAmount=2&destinationTokenContractAddress=0x9f6abbf0ba6b5bfa27f4deb6597cc6ec20573fda&destinationNetworkChainId=42161&destinationWalletAddress=";
const oneInchToOneInchCrossChainSwap =
  "?sourceWalletAddress=0xeedfdd620629c7432970d22488124fc92ad6d426&sourceTokenContractAddress=0xb31f66aa3c1e785363f0875a1b74e27b85fd66c7&sourceNetworkChainId=43114&sourceAmount=0.1&destinationTokenContractAddress=0x9f6abbf0ba6b5bfa27f4deb6597cc6ec20573fda&destinationNetworkChainId=42161&destinationWalletAddress=";
const oneInchToFoundaryCrossChainSwap =
  "?sourceWalletAddress=0xeedfdd620629c7432970d22488124fc92ad6d426&sourceTokenContractAddress=0x9702230a8ea53601f5cd2dc00fdbc13d4df4a8c7&sourceNetworkChainId=43114&sourceAmount=2.5&destinationTokenContractAddress=0xaf88d065e77c8cc2239327c5edb3a432268e5831&destinationNetworkChainId=42161&destinationWalletAddress=";
const CCTPCrossChainSwap =
  "?sourceWalletAddress=0xeedfdd620629c7432970d22488124fc92ad6d426&sourceTokenContractAddress=0x9702230a8ea53601f5cd2dc00fdbc13d4df4a8c7&sourceNetworkChainId=43114&sourceAmount=10000&destinationTokenContractAddress=0xaf88d065e77c8cc2239327c5edb3a432268e5831&destinationNetworkChainId=42161&destinationWalletAddress=";
const stargateCrossChainSwap =
  "?sourceWalletAddress=0xeedfdd620629c7432970d22488124fc92ad6d426&sourceTokenContractAddress=0xb97ef9ef8734c71904d8002f8b6bc66dd9c48a6e&sourceNetworkChainId=43114&sourceAmount=1&destinationTokenContractAddress=0xaf88d065e77c8cc2239327c5edb3a432268e5831&destinationNetworkChainId=42161&destinationWalletAddress=";
const foundaryToOneInchSameChainSwap =
  "?sourceWalletAddress=0xeedfdd620629c7432970d22488124fc92ad6d426&sourceTokenContractAddress=0xb97ef9ef8734c71904d8002f8b6bc66dd9c48a6e&sourceNetworkChainId=43114&sourceAmount=2.5&destinationTokenContractAddress=0x9f6abbf0ba6b5bfa27f4deb6597cc6ec20573fda&destinationNetworkChainId=42161&destinationWalletAddress=";
const oneInchToOneInchSameChainSwap =
  "?sourceWalletAddress=0xeedfdd620629c7432970d22488124fc92ad6d426&sourceTokenContractAddress=0x9702230a8ea53601f5cd2dc00fdbc13d4df4a8c7&sourceNetworkChainId=43114&sourceAmount=2.5&destinationTokenContractAddress=0x9f6abbf0ba6b5bfa27f4deb6597cc6ec20573fda&destinationNetworkChainId=42161&destinationWalletAddress=";

describe("Corss chain Foundary to Foundary Swap API Endpoint Testing", () => {
  it("should return quote information with status 200", async () => {
    const res = await request(baseURL)
      .get(`${validQuoteApiUrl}${foundaryToFoundaryCrossChainSwap}`)
      .set(
        "Authorization",
        `Bearer ${await createAuthTokenForNodeInfra(
          ENV?.multiswapApiKey,
          ENV?.secretKey
        )}`
      );
    expect(res.statusCode).toEqual(200);
    expect(res.body.body).toHaveProperty("data");
  });

  it("should return params are missing with status 400", async () => {
    const res = await request(baseURL)
      .get(`${validQuoteApiUrl}`)
      .set(
        "Authorization",
        `Bearer ${await createAuthTokenForNodeInfra(
          ENV?.multiswapApiKey,
          ENV?.secretKey
        )}`
      );
    expect(res.statusCode).toEqual(400);
  });

  it("should return an error with invalid token", async () => {
    const res = await request(baseURL)
      .get(`${validQuoteApiUrl}${foundaryToFoundaryCrossChainSwap}`)
      .set("Authorization", "Bearer invalid_token");
    expect(res.statusCode).toEqual(401);
  });

  it("should handle non-existent endpoint with status 404", async () => {
    const res = await request(baseURL)
      .get(`${inValidQuoteApiUrl}${foundaryToFoundaryCrossChainSwap}`)
      .set(
        "Authorization",
        `Bearer ${await createAuthTokenForNodeInfra(
          ENV?.multiswapApiKey,
          ENV?.secretKey
        )}`
      );
    expect(res.statusCode).toEqual(404);
  });

  it("should return 404 for invalid method (POST)", async () => {
    const res = await request(baseURL)
      .post(`${validQuoteApiUrl}${foundaryToFoundaryCrossChainSwap}`)
      .set(
        "Authorization",
        `Bearer ${await createAuthTokenForNodeInfra(
          ENV?.multiswapApiKey,
          ENV?.secretKey
        )}`
      );
    expect(res.statusCode).toEqual(404);
  });
});

describe("Corss chain Foundary to 1Inch Swap API Endpoint Testing", () => {
  it("should return quote information with status 200", async () => {
    const res = await request(baseURL)
      .get(`${validQuoteApiUrl}${foundaryToOneInchCrossChainSwap}`)
      .set(
        "Authorization",
        `Bearer ${await createAuthTokenForNodeInfra(
          ENV?.multiswapApiKey,
          ENV?.secretKey
        )}`
      );
    expect(res.statusCode).toEqual(200);
    expect(res.body.body).toHaveProperty("data");
  });

  it("should return params are missing with status 400", async () => {
    const res = await request(baseURL)
      .get(`${validQuoteApiUrl}`)
      .set(
        "Authorization",
        `Bearer ${await createAuthTokenForNodeInfra(
          ENV?.multiswapApiKey,
          ENV?.secretKey
        )}`
      );
    expect(res.statusCode).toEqual(400);
  });

  it("should return an error with invalid token", async () => {
    const res = await request(baseURL)
      .get(`${validQuoteApiUrl}${foundaryToOneInchCrossChainSwap}`)
      .set("Authorization", "Bearer invalid_token");
    expect(res.statusCode).toEqual(401);
  });

  it("should handle non-existent endpoint with status 404", async () => {
    const res = await request(baseURL)
      .get(`${inValidQuoteApiUrl}${foundaryToOneInchCrossChainSwap}`)
      .set(
        "Authorization",
        `Bearer ${await createAuthTokenForNodeInfra(
          ENV?.multiswapApiKey,
          ENV?.secretKey
        )}`
      );
    expect(res.statusCode).toEqual(404);
  });

  it("should return 404 for invalid method (POST)", async () => {
    const res = await request(baseURL)
      .post(`${validQuoteApiUrl}${foundaryToOneInchCrossChainSwap}`)
      .set(
        "Authorization",
        `Bearer ${await createAuthTokenForNodeInfra(
          ENV?.multiswapApiKey,
          ENV?.secretKey
        )}`
      );
    expect(res.statusCode).toEqual(404);
  });
});

describe("Corss chain 1Inch to 1Inch Swap API Endpoint Testing", () => {
  it("should return quote information with status 200", async () => {
    const res = await request(baseURL)
      .get(`${validQuoteApiUrl}${oneInchToOneInchCrossChainSwap}`)
      .set(
        "Authorization",
        `Bearer ${await createAuthTokenForNodeInfra(
          ENV?.multiswapApiKey,
          ENV?.secretKey
        )}`
      );
    expect(res.statusCode).toEqual(200);
    expect(res.body.body).toHaveProperty("data");
  });

  it("should return params are missing with status 400", async () => {
    const res = await request(baseURL)
      .get(`${validQuoteApiUrl}`)
      .set(
        "Authorization",
        `Bearer ${await createAuthTokenForNodeInfra(
          ENV?.multiswapApiKey,
          ENV?.secretKey
        )}`
      );
    expect(res.statusCode).toEqual(400);
  });

  it("should return an error with invalid token", async () => {
    const res = await request(baseURL)
      .get(`${validQuoteApiUrl}${oneInchToOneInchCrossChainSwap}`)
      .set("Authorization", "Bearer invalid_token");
    expect(res.statusCode).toEqual(401);
  });

  it("should handle non-existent endpoint with status 404", async () => {
    const res = await request(baseURL)
      .get(`${inValidQuoteApiUrl}${oneInchToOneInchCrossChainSwap}`)
      .set(
        "Authorization",
        `Bearer ${await createAuthTokenForNodeInfra(
          ENV?.multiswapApiKey,
          ENV?.secretKey
        )}`
      );
    expect(res.statusCode).toEqual(404);
  });

  it("should return 404 for invalid method (POST)", async () => {
    const res = await request(baseURL)
      .post(`${validQuoteApiUrl}${oneInchToOneInchCrossChainSwap}`)
      .set(
        "Authorization",
        `Bearer ${await createAuthTokenForNodeInfra(
          ENV?.multiswapApiKey,
          ENV?.secretKey
        )}`
      );
    expect(res.statusCode).toEqual(404);
  });
});

describe("Corss chain 1Inch to Foundary Swap API Endpoint Testing", () => {
  it("should return quote information with status 200", async () => {
    const res = await request(baseURL)
      .get(`${validQuoteApiUrl}${oneInchToFoundaryCrossChainSwap}`)
      .set(
        "Authorization",
        `Bearer ${await createAuthTokenForNodeInfra(
          ENV?.multiswapApiKey,
          ENV?.secretKey
        )}`
      );
    expect(res.statusCode).toEqual(200);
    expect(res.body.body).toHaveProperty("data");
  });

  it("should return params are missing with status 400", async () => {
    const res = await request(baseURL)
      .get(`${validQuoteApiUrl}`)
      .set(
        "Authorization",
        `Bearer ${await createAuthTokenForNodeInfra(
          ENV?.multiswapApiKey,
          ENV?.secretKey
        )}`
      );
    expect(res.statusCode).toEqual(400);
  });

  it("should return an error with invalid token", async () => {
    const res = await request(baseURL)
      .get(`${validQuoteApiUrl}${oneInchToFoundaryCrossChainSwap}`)
      .set("Authorization", "Bearer invalid_token");
    expect(res.statusCode).toEqual(401);
  });

  it("should handle non-existent endpoint with status 404", async () => {
    const res = await request(baseURL)
      .get(`${inValidQuoteApiUrl}${oneInchToFoundaryCrossChainSwap}`)
      .set(
        "Authorization",
        `Bearer ${await createAuthTokenForNodeInfra(
          ENV?.multiswapApiKey,
          ENV?.secretKey
        )}`
      );
    expect(res.statusCode).toEqual(404);
  });

  it("should return 404 for invalid method (POST)", async () => {
    const res = await request(baseURL)
      .post(`${validQuoteApiUrl}${oneInchToFoundaryCrossChainSwap}`)
      .set(
        "Authorization",
        `Bearer ${await createAuthTokenForNodeInfra(
          ENV?.multiswapApiKey,
          ENV?.secretKey
        )}`
      );
    expect(res.statusCode).toEqual(404);
  });
});

describe("Corss chain CCTP protocol Swap API Endpoint Testing", () => {
  it("should return quote information with status 200", async () => {
    const res = await request(baseURL)
      .get(`${validQuoteApiUrl}${CCTPCrossChainSwap}`)
      .set(
        "Authorization",
        `Bearer ${await createAuthTokenForNodeInfra(
          ENV?.multiswapApiKey,
          ENV?.secretKey
        )}`
      );
    expect(res.statusCode).toEqual(200);
    expect(res.body.body.data.isCCTP).toBe(true);
  });

  it("should return params are missing with status 400", async () => {
    const res = await request(baseURL)
      .get(`${validQuoteApiUrl}`)
      .set(
        "Authorization",
        `Bearer ${await createAuthTokenForNodeInfra(
          ENV?.multiswapApiKey,
          ENV?.secretKey
        )}`
      );
    expect(res.statusCode).toEqual(400);
  });

  it("should return an error with invalid token", async () => {
    const res = await request(baseURL)
      .get(`${validQuoteApiUrl}${CCTPCrossChainSwap}`)
      .set("Authorization", "Bearer invalid_token");
    expect(res.statusCode).toEqual(401);
  });

  it("should handle non-existent endpoint with status 404", async () => {
    const res = await request(baseURL)
      .get(`${inValidQuoteApiUrl}${CCTPCrossChainSwap}`)
      .set(
        "Authorization",
        `Bearer ${await createAuthTokenForNodeInfra(
          ENV?.multiswapApiKey,
          ENV?.secretKey
        )}`
      );
    expect(res.statusCode).toEqual(404);
  });

  it("should return 404 for invalid method (POST)", async () => {
    const res = await request(baseURL)
      .post(`${validQuoteApiUrl}${CCTPCrossChainSwap}`)
      .set(
        "Authorization",
        `Bearer ${await createAuthTokenForNodeInfra(
          ENV?.multiswapApiKey,
          ENV?.secretKey
        )}`
      );
    expect(res.statusCode).toEqual(404);
  });
});

describe("Corss chain stargate protocol Swap API Endpoint Testing", () => {
  it("should return quote information with status 200", async () => {
    const res = await request(baseURL)
      .get(`${validQuoteApiUrl}${stargateCrossChainSwap}`)
      .set(
        "Authorization",
        `Bearer ${await createAuthTokenForNodeInfra(
          ENV?.multiswapApiKey,
          ENV?.secretKey
        )}`
      );
    expect(res.statusCode).toEqual(200);
    expect(res.body.body.data.isStargate).toBe(true);
  });

  it("should return params are missing with status 400", async () => {
    const res = await request(baseURL)
      .get(`${validQuoteApiUrl}`)
      .set(
        "Authorization",
        `Bearer ${await createAuthTokenForNodeInfra(
          ENV?.multiswapApiKey,
          ENV?.secretKey
        )}`
      );
    expect(res.statusCode).toEqual(400);
  });

  it("should return an error with invalid token", async () => {
    const res = await request(baseURL)
      .get(`${validQuoteApiUrl}${stargateCrossChainSwap}`)
      .set("Authorization", "Bearer invalid_token");
    expect(res.statusCode).toEqual(401);
  });

  it("should handle non-existent endpoint with status 404", async () => {
    const res = await request(baseURL)
      .get(`${inValidQuoteApiUrl}${stargateCrossChainSwap}`)
      .set(
        "Authorization",
        `Bearer ${await createAuthTokenForNodeInfra(
          ENV?.multiswapApiKey,
          ENV?.secretKey
        )}`
      );
    expect(res.statusCode).toEqual(404);
  });

  it("should return 404 for invalid method (POST)", async () => {
    const res = await request(baseURL)
      .post(`${validQuoteApiUrl}${stargateCrossChainSwap}`)
      .set(
        "Authorization",
        `Bearer ${await createAuthTokenForNodeInfra(
          ENV?.multiswapApiKey,
          ENV?.secretKey
        )}`
      );
    expect(res.statusCode).toEqual(404);
  });
});

describe("Same chain Foundary to 1Inch Swap API Endpoint Testing", () => {
  it("should return quote information with status 200", async () => {
    const res = await request(baseURL)
      .get(`${validQuoteApiUrl}${foundaryToOneInchSameChainSwap}`)
      .set(
        "Authorization",
        `Bearer ${await createAuthTokenForNodeInfra(
          ENV?.multiswapApiKey,
          ENV?.secretKey
        )}`
      );
    expect(res.statusCode).toEqual(200);
    expect(res.body.body).toHaveProperty("data");
  });

  it("should return params are missing with status 400", async () => {
    const res = await request(baseURL)
      .get(`${validQuoteApiUrl}`)
      .set(
        "Authorization",
        `Bearer ${await createAuthTokenForNodeInfra(
          ENV?.multiswapApiKey,
          ENV?.secretKey
        )}`
      );
    expect(res.statusCode).toEqual(400);
  });

  it("should return an error with invalid token", async () => {
    const res = await request(baseURL)
      .get(`${validQuoteApiUrl}${foundaryToOneInchSameChainSwap}`)
      .set("Authorization", "Bearer invalid_token");
    expect(res.statusCode).toEqual(401);
  });

  it("should handle non-existent endpoint with status 404", async () => {
    const res = await request(baseURL)
      .get(`${inValidQuoteApiUrl}${foundaryToOneInchSameChainSwap}`)
      .set(
        "Authorization",
        `Bearer ${await createAuthTokenForNodeInfra(
          ENV?.multiswapApiKey,
          ENV?.secretKey
        )}`
      );
    expect(res.statusCode).toEqual(404);
  });

  it("should return 404 for invalid method (POST)", async () => {
    const res = await request(baseURL)
      .post(`${validQuoteApiUrl}${foundaryToOneInchSameChainSwap}`)
      .set(
        "Authorization",
        `Bearer ${await createAuthTokenForNodeInfra(
          ENV?.multiswapApiKey,
          ENV?.secretKey
        )}`
      );
    expect(res.statusCode).toEqual(404);
  });
});

describe("Same chain 1Inch to 1Inch Swap API Endpoint Testing", () => {
  it("should return quote information with status 200", async () => {
    const res = await request(baseURL)
      .get(`${validQuoteApiUrl}${oneInchToOneInchSameChainSwap}`)
      .set(
        "Authorization",
        `Bearer ${await createAuthTokenForNodeInfra(
          ENV?.multiswapApiKey,
          ENV?.secretKey
        )}`
      );
    expect(res.statusCode).toEqual(200);
    expect(res.body.body).toHaveProperty("data");
  });

  it("should return params are missing with status 400", async () => {
    const res = await request(baseURL)
      .get(`${validQuoteApiUrl}`)
      .set(
        "Authorization",
        `Bearer ${await createAuthTokenForNodeInfra(
          ENV?.multiswapApiKey,
          ENV?.secretKey
        )}`
      );
    expect(res.statusCode).toEqual(400);
  });

  it("should return an error with invalid token", async () => {
    const res = await request(baseURL)
      .get(`${validQuoteApiUrl}${oneInchToOneInchSameChainSwap}`)
      .set("Authorization", "Bearer invalid_token");
    expect(res.statusCode).toEqual(401);
  });

  it("should handle non-existent endpoint with status 404", async () => {
    const res = await request(baseURL)
      .get(`${inValidQuoteApiUrl}${oneInchToOneInchSameChainSwap}`)
      .set(
        "Authorization",
        `Bearer ${await createAuthTokenForNodeInfra(
          ENV?.multiswapApiKey,
          ENV?.secretKey
        )}`
      );
    expect(res.statusCode).toEqual(404);
  });

  it("should return 404 for invalid method (POST)", async () => {
    const res = await request(baseURL)
      .post(`${validQuoteApiUrl}${oneInchToOneInchSameChainSwap}`)
      .set(
        "Authorization",
        `Bearer ${await createAuthTokenForNodeInfra(
          ENV?.multiswapApiKey,
          ENV?.secretKey
        )}`
      );
    expect(res.statusCode).toEqual(404);
  });
});
