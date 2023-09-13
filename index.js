import axios from "axios";
import Cheerio from "cheerio";

axios
  .get("https://dexscreener.com")
  .then((response) => {
    const html = response.data;

    console.log("Resssssssssssssssssssss", html);
    //   const $ = Cheerio.load(html);
    //   const links = $(".ds-dex-table-row ds-dex-table-row-top");

    //   links.each((index, link) => {
    //     const href = $(link).attr("href");
    //     console.log(href);
    //   });
  })
  .catch((error) => {
    console.log(error);
  });
