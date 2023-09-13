import Web3 from "web3";
import XLSX from "xlsx";
import { tokenAbi } from "../abis/tokenAbi.js";

let columnAData = [];
let tokenData = [];
let polygonRpcUrl =
  "https://rpc-mainnet.maticvigil.com/v1/b1137a8d521ab2978c9589fbc02a533b7564a59c";
let web3 = new Web3(new Web3.providers.HttpProvider(polygonRpcUrl));
export const getFileColumnData = () => {
  console.log("YOu here");
  const workbook = XLSX.readFile("./bscAddresses.xlsx");
  const sheetName = "Sheet1";
  const columnNames = ["A", "B"];
  const worksheet = workbook.Sheets[sheetName];
  const columnBData = [];

  for (let rowNum = 1; ; rowNum++) {
    const cells = columnNames.map((colName) => worksheet[colName + rowNum]);
    const allCellsEmpty = cells.every((cell) => !cell);
    if (allCellsEmpty) break;
    const [colA, colB] = cells.map((cell) => cell?.v);
    columnAData.push(colA);
    columnBData.push(colB);
  }

  console.log("Colum", columnAData.length);

  let contract;
  let tokenDetails = [];
  let obj;
  let symbol;
  return columnAData;
};

const getTokenSymbol = async (tokenAddress) => {
  const contract = new web3.eth.Contract(tokenAbi, tokenAddress);
  const symbol = await contract.methods.symbol().call();
  return symbol;
};

export const main = async () => {
  const tokenAddress = await getFileColumnData();
  console.log("?>>>>.", tokenAddress);
  for (let i = 0; i < tokenAddress.length; i++) {
    const symbol = await getTokenSymbol(columnAData[i]);
    const data = {
      tokenSymbol: symbol,
      tokenAddress: tokenAddress[i],
    };
    tokenData.push(data);
  }
  return tokenData;
};
