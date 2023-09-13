import express from "express";
import { getAddresses } from "./controller/getDataController.js";
import { getFileColumnData, main } from "./controller/scrapper.js";
import { getDataByTriangularStrategy } from "./controller/getDataController-Triaangular.js";

const app = express();
app.listen(5789);

app.use("/getData", getAddresses);
app.use("/getDataByTriStrategy", getDataByTriangularStrategy);

app.use("/getFileColumnData", getFileColumnData);

app.use("/", (req,res) => {
  console.log("Server Running");
  res.send("Server Running");
});
