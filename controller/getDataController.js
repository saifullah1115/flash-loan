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

export const getAddresses = asyncHandler(async (req, res) => {
  let pairAddresses = [];
  let baseTokens = [];
  let quoteTokens = [];
  let apeSwapValues = [];
  let quickSwapValues = [];
  let sushiSwapValues = [];
  let dfynSwapValues = [];
  let tetuSwapValues = [];
  let elkSwapValues = [];
  let minArr = [];
  let minResponseArr = [];
  let maxResponseArr = [];
  let obj = {};
  let json;
  let min = {};
  let max = {};
  let diff;
  let minimumValue;
  let maximumValue;
  let actualRate;
  let tempProfit;
  let profit;
  let apeValue;
  let quickValue;
  let sushiValue;
  // let fee = 15;
  let percentage;
  let loanAmount;
  let startRange;
  let endRange;
  const resultArrays = [];

  const amountOut = 1;
  const USDT = "0xc2132D05D31c914a87C6611C10748AEb04B58e8F";
  let usdtQty = 100000;

  const KYBER_ROUTER = "0x546C79662E028B661dFB4767664d0273184E4dD1";
  const APE_ROUTER = "0xC0788A3aD43d79aa53B09c2EaCc313A787d1d607";
  const QUICKSWAP_ROUTER = "0xa5E0829CaCEd8fFDD4De3c43696c57F7D7A678ff";
  const SUSHISWAP_ROUTER = "0x1b02dA8Cb0d097eB8D57A175b88c7D8b47997506";

  const DFYN_ROUTER = "0xA102072A4C07F06EC3B4900FDC4C7B80b6c57429";
  const TETUSWAP_ROUTER = "0x736FD9EabB15776A3adfea1B975c868F72A29d14";
  const ELK_ROUTER = "0xf38a7A7Ac2D745E2204c13F824c00139DF831FFf";

  const PRIVATE_KEY =
    "666d199013d5749074fb53b3c49b70cf684e64c58a9fc78e6809ce7e1a0aec99";
  const contractAddress = "0xd1b70B206c60A3C48d8F00cd1F1fEA05a4C963c1";

  const polygonRpcUrl =
    "https://rpc-mainnet.maticvigil.com/v1/b1137a8d521ab2978c9589fbc02a533b7564a59c";
  const web3 = new Web3(new Web3.providers.HttpProvider(polygonRpcUrl));
  const account = web3.eth.accounts.wallet.add(PRIVATE_KEY);
  web3.eth.defaultAccount = web3.eth.accounts.wallet[0].address;
  const contract = new web3.eth.Contract(contractAbi, contractAddress);

  let kyberContract = new web3.eth.Contract(kyberRouterAbi, KYBER_ROUTER);
  let apeContract = new web3.eth.Contract(apeRouterAbi, APE_ROUTER);
  let quickSwapContract = new web3.eth.Contract(quickSwapAbi, QUICKSWAP_ROUTER);
  let sushiSwapContract = new web3.eth.Contract(sushiSwapAbi, SUSHISWAP_ROUTER);
  let kyberSwapContract = new web3.eth.Contract(kyberRouterAbi, KYBER_ROUTER);

  // let dfynSwapContract = new web3.eth.Contract(dfynAbi, DFYN_ROUTER);
  // let tetuSwapContract = new web3.eth.Contract(tetuRouterAbi, TETUSWAP_ROUTER);
  // let elkSwapContract = new web3.eth.Contract(elkRouterAbi, ELK_ROUTER);

  const excludedSymbols = ["WBTC", "CHAMP", "WETH", "BOB", "WIFI"];

  await main().then(async (res) => {
    for (let i = 0; i < res.length; i++) {
      // pairAddresses.push(res.data.pairs[i].pairAddress);

      // if (!excludedSymbols.includes(res[i].tokenSymbol)) {
      let baseTokenData = {
        address: res[i].tokenAddress,
        symbol: res[i].tokenSymbol,
      };
      baseTokens.push(baseTokenData);
      // }
    }

    for (let i = 0; i < baseTokens.length; i++) {
      // console.log("Base Tokens", baseTokens[i]);
      let firstParameter;
      let secondParameter = [baseTokens[i].address, USDT.toString()];
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
          apeValue = {
            tokenAddress: baseTokens[i].address,
            price: res[1] / 1000000,
            router: APE_ROUTER,
          };
          obj = {
            tokenAddress: baseTokens[i].address,
            price: res[1] / 1000000,
            router: APE_ROUTER,
          };
          console.log("object price", obj.price);

          apeSwapValues.push(obj);
        })
        .catch((err) => {
          console.log("Ape Swap Error", err.data);
          if (err.data == null) {
            apeValue = {
              tokenAddress: baseTokens[i].address,
              price: 0,
              router: APE_ROUTER,
            };
            obj = {
              tokenAddress: baseTokens[i].address,
              price: "0",
            };
            apeSwapValues.push(obj);
          }
        });

      await quickSwapContract.methods
        .getAmountsOut(firstParameter, secondParameter)
        .call()
        .then((res) => {
          // console.log("Quick Swap", res[1] / 1000000, baseTokens[i], res);
          quickValue = {
            tokenAddress: baseTokens[i].address,
            price: res[1] / 1000000,
            router: QUICKSWAP_ROUTER,
          };
          obj = {
            tokenAddress: baseTokens[i].address,
            price: res[1] / 1000000,
            router: QUICKSWAP_ROUTER,
          };
          console.log("object price", obj.price);

          quickSwapValues.push(obj);
        })
        .catch((err) => {
          console.log("Quick Swap Error", err.data);
          if (err.data == null) {
            quickValue = {
              tokenAddress: baseTokens[i].address,
              price: 0,
              router: QUICKSWAP_ROUTER,
            };
            obj = {
              tokenAddress: baseTokens[i].address,
              price: "0",
            };
            quickSwapValues.push(obj);
          }
        });

      await sushiSwapContract.methods
        .getAmountsOut(firstParameter, secondParameter)
        .call()
        .then((res) => {
          // console.log("Susuhi Swap", res[1] / 1000000, baseTokens[i], res);
          sushiValue = {
            tokenAddress: baseTokens[i].address,
            price: res[1] / 1000000,
            router: SUSHISWAP_ROUTER,
          };
          obj = {
            tokenAddress: baseTokens[i].address,
            price: res[1] / 1000000,
            router: SUSHISWAP_ROUTER,
          };
          console.log("object price", obj.price);
          sushiSwapValues.push(obj);
        })
        .catch((err) => {
          console.log("Sushi swap Error", err.data);
          if (err.data == null) {
            sushiValue = {
              tokenAddress: baseTokens[i].address,
              price: 0,
              router: SUSHISWAP_ROUTER,
            };
            obj = {
              tokenAddress: baseTokens[i].address,
              price: "0",
            };
            sushiSwapValues.push(obj);
          }
        });

      let minPrice = Math.min(
        apeValue.price,
        quickValue.price,
        sushiValue.price
      );

      const objects = [apeValue, quickValue, sushiValue];

      const minObj = objects.reduce(
        (min, obj) => (obj.price < min.price ? obj : min),
        objects[0]
      );
      const maxObj = objects.reduce(
        (max, obj) => (obj.price > max.price ? obj : max),
        objects[0]
      );
      await contract.methods
        .amountPercentage()
        .call()
        .then((res) => {
          percentage = res;
          console.log("Percentage", res);
        })
        .catch((err) => {
          console.log("Error Percentage", err);
        });

      await contract.methods
        .loanAmount()
        .call()
        .then((res) => {
          loanAmount = res / 1000000;
          console.log("loanAmount", res);
        })
        .catch((err) => {
          console.log("Error ll", err);
        });


        

      await contract.methods
      .startRange()
      .call()
      .then((res) => {
        console.log("Start Range", res);
        startRange =parseFloat(res)
      })
      .catch((err) => {
        console.log("Error Start Range", err);
      });


      await contract.methods
      .endRange()
      .call()
      .then((res) => {
        // loanAmount = res / 1000000;
        endRange = parseFloat(res)
        console.log("End  Range", res);
      })
      .catch((err) => {
        console.log("Error Start Range", err);
      });

      if (
        minObj.price > 0 &&
        apeValue.price > 0 &&
        sushiValue.price > 0 &&
        quickValue.price > 0
      ) {
        console.log("Loan Amount", loanAmount);
        actualRate = parseFloat(loanAmount) / parseFloat(minObj.price);
        tempProfit = parseFloat(maxObj.price) * parseFloat(actualRate);
        profit = parseFloat(tempProfit) - parseFloat(loanAmount);
        console.log("Details", tempProfit, profit);
        let profitPercentage = parseFloat((profit/loanAmount)*100)
        console.log("Profit Percentage", profitPercentage)
        if (profitPercentage >= startRange && profitPercentage <= endRange) {
          console.log("Percentage is Between Range")
          let responseObj = {
            minimumPriceRouter: minObj.router,
            maximumPriceRouter: maxObj.router,
            tokenAddress: minObj.tokenAddress,
          };
          maxResponseArr.push(responseObj);
          console.log("Trade will happen", account.address);

          contract.methods
            .flashSwap(minObj.router, maxObj.router, minObj.tokenAddress)
            .estimateGas({
              from: account.address,
              to: contractAddress,
            })
            .then((gasLimit) => {
              console.log("Estimated gas limit:", gasLimit);
              contract.methods
                .flashSwap(minObj.router, maxObj.router, minObj.tokenAddress)
                .send({
                  from: account.address,
                  gas: gasLimit,
                  to: contractAddress,
                  // gasPrice: "384100000000",
                  // price: 1,
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
        } else {
        }
      } else {
        console.log("not found in these three dexes");
      }
    }

    for (let i = 0; i < baseTokens.length; i++) {
      if (!resultArrays[i]) {
        resultArrays[i] = [];
      }

      resultArrays[i].push(apeSwapValues[i]);
      resultArrays[i].push(quickSwapValues[i]);
      resultArrays[i].push(sushiSwapValues[i]);
    }

    // for (let i = 0; i < resultArrays.length; i++) {
    //   min = resultArrays[i].reduce((prev, current) => {
    //     console.log("Prev", prev.price);
    //     return prev.price > 0 && prev.price < current.price ? prev : current;
    //   });

    //   minArr.push(min);
    //   max = resultArrays[i].reduce(function (prev, current) {
    //     return prev.price > 0 && prev.price > current.price ? prev : current;
    //   });

    //   const resp = {
    //     minimum: min,
    //     maximum: max,
    //   };
    //   minResponseArr.push(resp);
    // }
  });

  // for (let i = 0; i < minResponseArr.length; i++) {
  //   if (minResponseArr[i].minimum.price > 0) {
  //     actualRate =
  //       parseFloat(usdtQty) * parseFloat(minResponseArr[i].maximum.price);

  //     tempProfit =
  //       (parseFloat(1) / parseFloat(minResponseArr[i].minimum.price)) *
  //       parseFloat(actualRate);

  //     profit = parseFloat(tempProfit) - parseFloat(usdtQty);
  //     const object = {
  //       minimumValue: parseFloat(minResponseArr[i].minimum.price),
  //       maximumValue: parseFloat(minResponseArr[i].maximum.price),
  //       usdt: parseFloat(usdtQty),
  //       actualRate: actualRate,
  //       tempProfit: tempProfit,
  //       profit: profit,
  //       tokenAddress: minResponseArr[i].minimum.tokenAddress,
  //     };

  //     //diff is the amount in usdt given and in between obtained result

  //     console.log(">>>>", object);
  //     if (diff > 13) {
  //       console.log(
  //         "Parameters",
  //         minResponseArr[i].minimum.router,
  //         minResponseArr[i].maximum.router,
  //         minResponseArr[i].minimum.tokenAddress,
  //         diff
  //       );

  //       contract.methods
  //         .flashSwap(
  //           minResponseArr[i].minimum.router,
  //           minResponseArr[i].maximum.router,
  //           minResponseArr[i].minimum.tokenAddress
  //         )
  //         .estimateGas({
  //           from: account.address,
  //           to: contractAddress,
  //         })
  //         .then((gasLimit) => {
  //           console.log("Estimated gas limit:", gasLimit);

  //           contract.methods
  //             .flashSwap(
  //               minResponseArr[i].minimum.router,
  //               minResponseArr[i].maximum.router,
  //               minResponseArr[i].minimum.tokenAddress
  //             )
  //             .send({
  //               from: account.address,
  //               gas: gasLimit,
  //               to: contractAddress,
  //             })
  //             .then(() => {
  //               console.log("Transaction successful");
  //             })
  //             .catch((err) => {
  //               console.log("Transaction failed:", err);
  //             });
  //         })
  //         .catch((err) => {
  //           console.log("Error estimating gas cost:", err);
  //         });
  //       // contract.methods
  //       //   .flashSwap(
  //       //     minResponseArr[i].minimum.router,
  //       //     minResponseArr[i].maximum.router,
  //       //     minResponseArr[i].minimum.tokenAddress
  //       //   )
  //       //   .send({
  //       //     from: account.address,
  //       //     gas: "2500000000",
  //       //     to: contractAddress,
  //       //   })
  //       //   .then(() => {
  //       //     console.log("You here");
  //       //   })
  //       //   .catch((err) => {
  //       //     console.log("Tou not here", err);
  //       //   });
  //     }
  //   }
  // }

  //Triangular Arbitrage Strategy
  // console.log("Result Arrays", resultArrays);

  res.send(maxResponseArr);
});
