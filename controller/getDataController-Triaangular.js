import axios from "axios";
import Web3 from "web3";
import asyncHandler from "express-async-handler";

import { kyberRouterAbi } from "../abis/kyberRouterAbi.js";
import { apeRouterAbi } from "../abis/apeRouterAbi.js";
import { quickSwapAbi } from "../abis/quickSwapRouterAbi.js";
import { sushiSwapAbi } from "../abis/sushiSwapRouterAbi.js";
import { dfynAbi } from "../abis/dfynRouterAbi.js";
import { tetuRouterAbi } from "../abis/tetuRouterAbi.js";
import { elkRouterAbi } from "../abis/elkRouterAbi.js";
import { contractAbi } from "../abis/contractAbi.js";
import { getFileColumnData, main } from "./scrapper.js";

export const getDataByTriangularStrategy = asyncHandler(async (req, res) => {
  let pairAddresses = [];
  let baseTokens = [];
  let quoteTokens = [];
  let apeSwapValues = [];
  let apeSwapMaticToWethValues = [];
  let wethToUsdtValue = [];

  let quickSwapValues = [];
  let quickSwapMaticToWethValues = [];

  let sushiSwapValues = [];
  let sushiSwapMaticToWethValues = [];

  let minResponseArr = [];
  let minResponseTokenToWeth = [];

  let obj = {};
  let min = {};
  let max = {};
  // let fee = 15;
  const resultArrays = [];

  let apeUsdtToTokenValue;
  let sushiUsdtToTokenValue;
  let quickUsdtToTokenValue;

  let apeTokenToWethValue;
  let sushiTokenToWethValue;
  let quickTokenToWethValue;

  let apeWethToUsdtValue;
  let sushiWethToUsdtValue;
  let quickWethToUsdtValue;

  const amountOut = 1;
  const USDT = "0xc2132D05D31c914a87C6611C10748AEb04B58e8F";
  const WETH = "0x7ceB23fD6bC0adD59E62ac25578270cFf1b9f619";
  let usdtQty = 100;

  const KYBER_ROUTER = "0x546C79662E028B661dFB4767664d0273184E4dD1";
  const APE_ROUTER = "0xC0788A3aD43d79aa53B09c2EaCc313A787d1d607";
  const QUICKSWAP_ROUTER = "0xa5E0829CaCEd8fFDD4De3c43696c57F7D7A678ff";
  const SUSHISWAP_ROUTER = "0x1b02dA8Cb0d097eB8D57A175b88c7D8b47997506";

  const DFYN_ROUTER = "0xA102072A4C07F06EC3B4900FDC4C7B80b6c57429";
  const TETUSWAP_ROUTER = "0x736FD9EabB15776A3adfea1B975c868F72A29d14";
  const ELK_ROUTER = "0xf38a7A7Ac2D745E2204c13F824c00139DF831FFf";

  const PRIVATE_KEY =
    "666d199013d5749074fb53b3c49b70cf684e64c58a9fc78e6809ce7e1a0aec99";
  const contractAddress = "0xC90c0F123D4035A727802CA31eA15bF8E1974a94";

  const polygonRpcUrl =
    "https://rpc-mainnet.maticvigil.com/v1/b1137a8d521ab2978c9589fbc02a533b7564a59c";
  const web3 = new Web3(new Web3.providers.HttpProvider(polygonRpcUrl));
  const account = web3.eth.accounts.wallet.add(PRIVATE_KEY);
  web3.eth.defaultAccount = web3.eth.accounts.wallet[0].address;
  const contract = new web3.eth.Contract(contractAbi, contractAddress);

  let apeContract = new web3.eth.Contract(apeRouterAbi, APE_ROUTER);
  let quickSwapContract = new web3.eth.Contract(quickSwapAbi, QUICKSWAP_ROUTER);
  let sushiSwapContract = new web3.eth.Contract(sushiSwapAbi, SUSHISWAP_ROUTER);

  const excludedSymbols = ["WBTC", "CHAMP", "WETH", "BOB", "WIFI"];
  // await main().then((res) => {
  //   console.log(">>>>>>>>>>>>>>>>>>>", res);
  // });
  // await axios
  //   .get(`https://api.dexscreener.com/latest/dex/tokens/${USDT}`)
  await main().then(async (res) => {
    console.log(">>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>", res.length, res);
    for (let i = 0; i < res.length; i++) {
      // pairAddresses.push(res.data.pairs[i].pairAddress);

      if (!excludedSymbols.includes(res[i].tokenSymbol)) {
        let baseTokenData = {
          address: res[i].tokenAddress,
          symbol: res[i].tokenSymbol,
        };
        baseTokens.push(baseTokenData);
      }
    }

    console.log("Base", baseTokens);

    /**
     * Usdt to Token
     */
    for (let i = 0; i < baseTokens.length; i++) {
      // console.log("Base Tokens", baseTokens[i]);
      let firstParameter;
      let secondParameter = [USDT.toString(), baseTokens[i].address];
      if (baseTokens[i].symbol == "USDC") {
        firstParameter = amountOut * 1000000;
      } else {
        firstParameter = amountOut * 1000000;
      }
      if (baseTokens[i].symbol == "USDC") {
        await apeContract.methods
          .getAmountsOut(amountOut * 1000000, secondParameter)
          .call()
          .then((res) => {
            // console.log("APE Swap", res[1] / 1000000, baseTokens[i], res);
            obj = {
              tokenAddress: baseTokens[i].address,
              price: res[1] / Math.pow(10, 6),
              router: APE_ROUTER,
            };
            console.log(" Usdt to Token  Price APE ", obj.price);

            apeSwapValues.push(obj);
          })
          .catch((err) => {
            console.log("Ape Swap  Usdt to Token Error", err.data);
            if (err.data == null) {
              obj = {
                tokenAddress: baseTokens[i].address,
                price: "0",
              };
              apeSwapValues.push(obj);
            }
          });

        await quickSwapContract.methods
          .getAmountsOut(amountOut * 1000000, secondParameter)
          .call()
          .then((res) => {
            // console.log("Quick Swap", res[1] / 1000000, baseTokens[i], res);
            obj = {
              tokenAddress: baseTokens[i].address,
              price: res[1] / Math.pow(10, 6),
              router: QUICKSWAP_ROUTER,
            };
            console.log(" Usdt to TokenPrice Quick ", obj.price);

            quickSwapValues.push(obj);
          })
          .catch((err) => {
            console.log("Quick Swap  Usdt to Token Error", err.data);
            if (err.data == null) {
              obj = {
                tokenAddress: baseTokens[i].address,
                price: "0",
              };
              quickSwapValues.push(obj);
            }
          });

        await sushiSwapContract.methods
          .getAmountsOut(amountOut * 1000000, secondParameter)
          .call()
          .then((res) => {
            // console.log("Susuhi Swap", res[1] / 1000000, baseTokens[i], res);
            obj = {
              tokenAddress: baseTokens[i].address,
              price: res[1] / Math.pow(10, 6),
              router: SUSHISWAP_ROUTER,
            };
            console.log(" Usdt to USDC SUSHI ", obj.price);
            sushiSwapValues.push(obj);
          })
          .catch((err) => {
            console.log("Sushi swap  Usdt to Token Error", err.data);
            if (err.data == null) {
              obj = {
                tokenAddress: baseTokens[i].address,
                price: "0",
              };
              sushiSwapValues.push(obj);
            }
          });
      } else {
        await apeContract.methods
          .getAmountsOut(amountOut * 1000000, secondParameter)
          .call()
          .then((res) => {
            // console.log("APE Swap", res[1] / 1000000, baseTokens[i], res);
            obj = {
              tokenAddress: baseTokens[i].address,
              price: res[1] / Math.pow(10, 18),
              router: APE_ROUTER,
            };

            apeUsdtToTokenValue = {
              tokenAddress: baseTokens[i].address,
              price: res[1] / Math.pow(10, 18),
              router: APE_ROUTER,
            };
            console.log("APE  Usdt to Token  price", obj.price);

            apeSwapValues.push(obj);
          })
          .catch((err) => {
            console.log("Ape Swap  Usdt to Token Error", err.data);
            if (err.data == null) {
              obj = {
                tokenAddress: baseTokens[i].address,
                price: "0",
              };
              apeUsdtToTokenValue = {
                tokenAddress: baseTokens[i].address,
                price: "0",
              };
              apeSwapValues.push(obj);
            }
          });

        await quickSwapContract.methods
          .getAmountsOut(amountOut * 1000000, secondParameter)
          .call()
          .then((res) => {
            // console.log("Quick Swap", res[1] / 1000000, baseTokens[i], res);
            obj = {
              tokenAddress: baseTokens[i].address,
              price: res[1] / Math.pow(10, 18),
              router: QUICKSWAP_ROUTER,
            };
            quickUsdtToTokenValue = {
              tokenAddress: baseTokens[i].address,
              price: res[1] / Math.pow(10, 18),
              router: QUICKSWAP_ROUTER,
            };
            console.log("QUICK TOKEN  Usdt to Token price", obj.price);

            quickSwapValues.push(obj);
          })
          .catch((err) => {
            console.log("Quick Swap  Usdt to Token Error", err.data);
            if (err.data == null) {
              obj = {
                tokenAddress: baseTokens[i].address,
                price: "0",
              };
              quickUsdtToTokenValue = {
                tokenAddress: baseTokens[i].address,
                price: "0",
              };
              quickSwapValues.push(obj);
            }
          });

        await sushiSwapContract.methods
          .getAmountsOut(amountOut * 1000000, secondParameter)
          .call()
          .then((res) => {
            // console.log("Susuhi Swap", res[1] / 1000000, baseTokens[i], res);
            obj = {
              tokenAddress: baseTokens[i].address,
              price: res[1] / Math.pow(10, 18),
              router: SUSHISWAP_ROUTER,
            };
            sushiUsdtToTokenValue = {
              tokenAddress: baseTokens[i].address,
              price: res[1] / Math.pow(10, 18),
              router: SUSHISWAP_ROUTER,
            };
            console.log("SUSHI TOKEN   Usdt to Token price", obj.price);
            sushiSwapValues.push(obj);
          })
          .catch((err) => {
            console.log("Sushi swap  Usdt to Token Error", err.data);
            if (err.data == null) {
              obj = {
                tokenAddress: baseTokens[i].address,
                price: "0",
              };
              sushiUsdtToTokenValue = {
                tokenAddress: baseTokens[i].address,
                price: "0",
              };
              sushiSwapValues.push(obj);
            }
          });
      }
    }

    //Contract Calling Token to WETH
    for (let i = 0; i < baseTokens.length; i++) {
      let firstParameter;
      let secondParameter = [baseTokens[i].address, WETH.toString()];
      if (baseTokens[i].symbol == "USDC") {
        firstParameter = amountOut * 1000000;
      } else {
        firstParameter = web3.utils.toWei(String(amountOut), "ether");
      }

      await apeContract.methods
        .getAmountsOut(firstParameter, secondParameter)
        .call()
        .then((res) => {
          // console.log("APE Swap", res[1] / 1000000, baseTokens[i], res);
          obj = {
            tokenAddress: baseTokens[i].address,
            price: web3.utils.fromWei(res[1]),
            router: APE_ROUTER,
          };
          apeTokenToWethValue = {
            tokenAddress: baseTokens[i].address,
            price: web3.utils.fromWei(res[1]),
            router: APE_ROUTER,
          };
          console.log("Token to WETH APE price", obj.price);

          apeSwapMaticToWethValues.push(obj);
        })
        .catch((err) => {
          console.log("Ape Swap Token to WETH Error", err.data);
          if (err.data == null) {
            obj = {
              tokenAddress: baseTokens[i].address,
              price: "0",
            };
            apeTokenToWethValue = {
              tokenAddress: baseTokens[i].address,
              price: "0",
            };
            apeSwapMaticToWethValues.push(obj);
          }
        });

      await quickSwapContract.methods
        .getAmountsOut(firstParameter, secondParameter)
        .call()
        .then((res) => {
          // console.log("Quick Swap", res[1] / 1000000, baseTokens[i], res);
          obj = {
            tokenAddress: baseTokens[i].address,
            price: web3.utils.fromWei(res[1]),
            router: QUICKSWAP_ROUTER,
          };

          quickTokenToWethValue = {
            tokenAddress: baseTokens[i].address,
            price: web3.utils.fromWei(res[1]),
            router: QUICKSWAP_ROUTER,
          };
          console.log("Token to WETH QUICK price", obj.price, res);

          quickSwapMaticToWethValues.push(obj);
        })
        .catch((err) => {
          console.log("Quick Swap Token to WETH Error", err.data);
          if (err.data == null) {
            obj = {
              tokenAddress: baseTokens[i].address,
              price: "0",
            };

            quickTokenToWethValue = {
              tokenAddress: baseTokens[i].address,
              price: "0",
            };
            quickSwapMaticToWethValues.push(obj);
          }
        });

      await sushiSwapContract.methods
        .getAmountsOut(firstParameter, secondParameter)
        .call()
        .then((res) => {
          // console.log("Susuhi Swap", res[1] / 1000000, baseTokens[i], res);
          obj = {
            tokenAddress: baseTokens[i].address,
            price: web3.utils.fromWei(res[1]),
            router: SUSHISWAP_ROUTER,
          };

          sushiTokenToWethValue = {
            tokenAddress: baseTokens[i].address,
            price: web3.utils.fromWei(res[1]),
            router: SUSHISWAP_ROUTER,
          };
          console.log("Token to WETH SUSHI price", obj.price);
          sushiSwapMaticToWethValues.push(obj);
        })
        .catch((err) => {
          console.log("Sushi swap Token to WETH Error", err.data);
          if (err.data == null) {
            obj = {
              tokenAddress: baseTokens[i].address,
              price: "0",
            };

            sushiTokenToWethValue = {
              tokenAddress: baseTokens[i].address,
              price: "0",
            };
            sushiSwapMaticToWethValues.push(obj);
          }
        });
    }

    //Contract Calling WETH to USDT

    let firstParameter = web3.utils.toWei(String(amountOut), "ether");
    let secondParameter = [WETH.toString(), USDT.toString()];
    await apeContract.methods
      .getAmountsOut(firstParameter, secondParameter)
      .call()
      .then((res) => {
        obj = {
          price: res[1] / 1000000,
          router: APE_ROUTER,
        };

        apeWethToUsdtValue = {
          price: res[1] / 1000000,
          router: APE_ROUTER,
        };
        console.log("WETH to USDT APE price", obj.price, res);

        wethToUsdtValue.push(obj);
      })
      .catch((err) => {
        console.log("Ape Swap WETH to USDT Error", err.data);
        if (err.data == null) {
          obj = {
            price: "0",
          };
          apeWethToUsdtValue = {
            price: "0",
          };
          wethToUsdtValue.push(obj);
        }
      });

    await quickSwapContract.methods
      .getAmountsOut(firstParameter, secondParameter)
      .call()
      .then((res) => {
        obj = {
          price: res[1] / 1000000,
          router: QUICKSWAP_ROUTER,
        };

        quickWethToUsdtValue = {
          price: res[1] / 1000000,
          router: QUICKSWAP_ROUTER,
        };
        console.log("WETH to USDT QUICK price", obj.price, res);

        wethToUsdtValue.push(obj);
      })
      .catch((err) => {
        console.log("Quick Swap WETH to USDT Error", err.data);
        if (err.data == null) {
          obj = {
            price: "0",
          };

          quickWethToUsdtValue = {
            price: "0",
          };
          wethToUsdtValue.push(obj);
        }
      });

    await sushiSwapContract.methods
      .getAmountsOut(firstParameter, secondParameter)
      .call()
      .then((res) => {
        obj = {
          price: res[1] / 1000000,
          router: SUSHISWAP_ROUTER,
        };
        sushiWethToUsdtValue = {
          price: res[1] / 1000000,
          router: SUSHISWAP_ROUTER,
        };
        console.log("WETH to USDT SUSHI price", obj.price, res);
        wethToUsdtValue.push(obj);
      })
      .catch((err) => {
        console.log("Sushi swap WETH to USDT Error", err.data);
        if (err.data == null) {
          obj = {
            price: "0",
          };
          sushiWethToUsdtValue = {
            price: "0",
          };
          wethToUsdtValue.push(obj);
        }
      });
    const usdtToTokenObjects = [
      apeUsdtToTokenValue,
      sushiUsdtToTokenValue,
      quickUsdtToTokenValue,
    ];

    const tokenToWethObjects = [
      apeTokenToWethValue,
      sushiTokenToWethValue,
      quickTokenToWethValue,
    ];

    const wethToUsdtObjects = [
      apeWethToUsdtValue,
      sushiWethToUsdtValue,
      quickWethToUsdtValue,
    ];

    const minUsdtToTokenObj = objects.reduce(
      (min, obj) => (obj.price < min.price ? obj : min),
      objects[0]
    );
    const maxUsdtToTokenObj = objects.reduce(
      (max, obj) => (obj.price > max.price ? obj : max),
      objects[0]
    );

    const minTokenToWethObj = objects.reduce(
      (min, obj) => (obj.price < min.price ? obj : min),
      objects[0]
    );
    const maxTokenToWethObj = objects.reduce(
      (max, obj) => (obj.price > max.price ? obj : max),
      objects[0]
    );

    const minWethToUsdtObj = objects.reduce(
      (min, obj) => (obj.price < min.price ? obj : min),
      objects[0]
    );
    const maxWethToUsdtObj = objects.reduce(
      (max, obj) => (obj.price > max.price ? obj : max),
      objects[0]
    );

    console.log("WETH TO usdt", wethToUsdtValue);

    const resultMaticToWeth = [];
    for (let i = 0; i < baseTokens.length; i++) {
      if (!resultArrays[i]) {
        resultArrays[i] = [];
      }

      if (!resultMaticToWeth[i]) {
        resultMaticToWeth[i] = [];
      }

      resultArrays[i].push(apeSwapValues[i]);
      resultArrays[i].push(quickSwapValues[i]);
      resultArrays[i].push(sushiSwapValues[i]);

      resultMaticToWeth[i].push(apeSwapMaticToWethValues[i]);
      resultMaticToWeth[i].push(quickSwapMaticToWethValues[i]);
      resultMaticToWeth[i].push(sushiSwapMaticToWethValues[i]);
    }

    for (let i = 0; i < resultArrays.length; i++) {
      min = resultArrays[i].reduce((prev, current) => {
        console.log("Prev", prev.price);
        return prev.price > 0 && prev.price < current.price ? prev : current;
      });

      max = resultArrays[i].reduce(function (prev, current) {
        return prev.price > 0 && prev.price > current.price ? prev : current;
      });

      if (min.price > 0 && max.price > 0) {
        const resp = {
          minimum: min,
          maximum: max,
        };
        minResponseArr.push(resp);
      }
    }
    console.log("Response of USDT to Token", minResponseArr.length);

    //Token to WETH Min and MAX
    for (let i = 0; i < resultMaticToWeth.length; i++) {
      min = resultMaticToWeth[i].reduce((prev, current) => {
        return prev.price > 0 && prev.price < current.price ? prev : current;
      });
      max = resultMaticToWeth[i].reduce(function (prev, current) {
        return prev.price > 0 && prev.price > current.price ? prev : current;
      });
      if (min.price > 0) {
        const resp = {
          minimum: min,
          maximum: max,
        };
        minResponseTokenToWeth.push(resp);
      }
    }
  });

  let maxPriceObject = wethToUsdtValue[0]; // assume first object has max price

  for (let i = 1; i < wethToUsdtValue.length; i++) {
    if (wethToUsdtValue[i].price > maxPriceObject.price) {
      maxPriceObject = wethToUsdtValue[i];
    }
  }

  console.log("max price Object", maxPriceObject);

  let maxWethToUsdt = [];

  // for (let i = 0; i < wethToUsdtValue.length; i++) {
  //   max = wethToUsdtValue[i].reduce(function (prev, current) {
  //     return prev.price > 0 && prev.price > current.price ? prev : current;
  //   });

  //   if (max.price > 0) {
  //     const resp = {
  //       maximum: max,
  //     };
  //     maxWethToUsdt.push(resp);
  //   }
  // }

  console.log("MAX WETH", maxWethToUsdt);

  let usdtToken;
  let tokenToWeth;
  let wethToUsdt;
  let finalPrice;
  console.log("USDT to TOKEN", minResponseArr, minResponseArr.length);
  console.log(
    "TOKEN to WETH",
    minResponseTokenToWeth,
    minResponseTokenToWeth.length
  );

  for (let i = 0; i < minResponseArr.length; i++) {
    for (let j = 0; j < minResponseTokenToWeth.length; j++) {
      if (
        minResponseArr[i].minimum.tokenAddress ==
        minResponseTokenToWeth[j].minimum.tokenAddress
      ) {
        usdtToken =
          parseFloat(minResponseArr[i].minimum.price) * parseFloat(usdtQty);
        console.log(
          "1 USDT to Token Minimum Price",
          minResponseArr[i].minimum.price,
          usdtQty,
          usdtToken
        );
        tokenToWeth =
          parseFloat(usdtToken) * minResponseTokenToWeth[j].minimum.price;
        console.log(
          "Token to WETH",
          usdtToken,
          minResponseTokenToWeth[j].minimum.price,
          tokenToWeth
        );
        wethToUsdt = parseFloat(tokenToWeth) * parseFloat(maxPriceObject.price);
        console.log(
          "WETH to USDT",
          tokenToWeth,
          maxPriceObject.price,
          wethToUsdt
        );
        console.log("Buyer Router 1", minResponseArr[i].minimum.router);
        console.log("Buyer Router 2", minResponseTokenToWeth[j].minimum.router);
        console.log("Seller Router", maxPriceObject.router);
        console.log("Token Address", minResponseArr[i].minimum.tokenAddress);
        if (parseFloat(wethToUsdt) > parseFloat(usdtQty)) {
          finalPrice = parseFloat(wethToUsdt) - parseFloat(usdtQty);

          contract.methods
            .flashSwap(
              minResponseArr[i].minimum.router,
              minResponseTokenToWeth[j].minimum.router,
              maxPriceObject.router,
              WETH.toString(),
              minResponseArr[i].minimum.tokenAddress
            )
            .estimateGas({
              from: account.address,
              to: contractAddress,
            })
            .then((gasLimit) => {
              console.log("Estimated gas limit:", gasLimit);

              contract.methods
                .flashSwap(
                  minResponseArr[i].minimum.router,
                  minResponseTokenToWeth[j].minimum.router,
                  maxPriceObject.router,
                  WETH.toString(),
                  minResponseArr[i].minimum.tokenAddress
                )
                .send({
                  from: account.address,
                  gas: gasLimit,
                  to: contractAddress,
                })
                .then(() => {
                  console.log("Transaction successful");
                })
                .catch((err) => {
                  console.log("Transaction failed:", err);
                });
            })
            .catch((err) => {
              console.log("Error estimating gas cost:", err);
            });
          console.log("Result", finalPrice);
        }
      }
    }
  }

  // for (let i = 0; i < minResponseArr.length; i++) {
  //   usdtToken =
  //     parseFloat(usdtQty) * parseFloat(minResponseArr[i].minimum.price);

  //   for (let j = 0; j < minResponseTokenToWeth.length; i++) {
  //     const tokenToWeth =
  //       parseFloat(usdtToken) *
  //       parseFloat(minResponseTokenToWeth[i].minimum?.price);
  //     wethToUsdt = parseFloat(tokenToWeth) * parseFloat(maxWethValue);
  //   }
  // }

  let diff;
  let minimumValue;
  let maximumValue;
  let actualRate;
  let tempProfit;
  let profit;

  for (let i = 0; i < minResponseArr.length; i++) {
    if (minResponseArr[i].minimum.price > 0) {
      actualRate =
        parseFloat(usdtQty) * parseFloat(minResponseArr[i].maximum.price);

      tempProfit =
        (parseFloat(1) / parseFloat(minResponseArr[i].minimum.price)) *
        parseFloat(actualRate);

      profit = parseFloat(tempProfit) - parseFloat(usdtQty);
      const object = {
        minimumValue: parseFloat(minResponseArr[i].minimum.price),
        maximumValue: parseFloat(minResponseArr[i].maximum.price),
        usdt: parseFloat(usdtQty),
        actualRate: actualRate,
        tempProfit: tempProfit,
        profit: profit,
        tokenAddress: minResponseArr[i].minimum.tokenAddress,
      };

      // console.log(">>>>", object);
      if (diff > 13) {
        console.log(
          "Parameters",
          minResponseArr[i].minimum.router,
          minResponseArr[i].maximum.router,
          minResponseArr[i].minimum.tokenAddress,
          diff
        );

        contract.methods
          .flashSwap(
            minResponseArr[i].minimum.router,
            minResponseArr[i].maximum.router,
            minResponseArr[i].minimum.tokenAddress
          )
          .estimateGas({
            from: account.address,
            to: contractAddress,
          })
          .then((gasLimit) => {
            console.log("Estimated gas limit:", gasLimit);

            contract.methods
              .flashSwap(
                minResponseArr[i].minimum.router,
                minResponseArr[i].maximum.router,
                minResponseArr[i].minimum.tokenAddress
              )
              .send({
                from: account.address,
                gas: gasLimit,
                to: contractAddress,
              })
              .then(() => {
                console.log("Transaction successful");
              })
              .catch((err) => {
                console.log("Transaction failed:", err);
              });
          })
          .catch((err) => {
            console.log("Error estimating gas cost:", err);
          });
        // contract.methods
        //   .flashSwap(
        //     minResponseArr[i].minimum.router,
        //     minResponseArr[i].maximum.router,
        //     minResponseArr[i].minimum.tokenAddress
        //   )
        //   .send({
        //     from: account.address,
        //     gas: "2500000000",
        //     to: contractAddress,
        //   })
        //   .then(() => {
        //     console.log("You here");
        //   })
        //   .catch((err) => {
        //     console.log("Tou not here", err);
        //   });
      }
    }
  }

  //Triangular Arbitrage Strategy

  res.send(minResponseArr);
});
