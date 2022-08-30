//127.0.0.1:8000

const fs = require("fs");
const http = require("http");
const url = require("url");

const slugify = require("slugify");

const replaceTemplate = require("./modules/replaceTemplate");

// executed only once at the beginning; okay to be sync

const tempOverview = fs.readFileSync(
  `${__dirname}/templates/template-overview.html`,
  `utf-8`
);
const tempCard = fs.readFileSync(
  `${__dirname}/templates/template-card.html`,
  `utf-8`
);
const tempProduct = fs.readFileSync(
  `${__dirname}/templates/template-product.html`,
  `utf-8`
);

//read product data from data.json
const data = fs.readFileSync(`${__dirname}/dev-data/data.json`, `utf-8`);
//parse the data into an array
const dataObj = JSON.parse(data);

//create slugs for all product names
const slugs = dataObj.map((el) => slugify(el.productName, { lower: true }));

// route
const server = http.createServer((req, res) => {
  const { pathname, query } = url.parse(req.url, true);

  //Overview page
  if (pathname == "/" || pathname == "/overview") {
    //status code 200: ok
    res.writeHead(200, { "Content-type": "text/html" });

    // replace the placeholders with product information
    const cardsHtml = dataObj
      .map((el) => replaceTemplate(tempCard, el))
      .join("");
    // replace the data with product card templates
    const output = tempOverview.replace(/{%PRODUCT_CARDS%}/g, cardsHtml);
    res.end(output);
  }

  // Product page
  else if (pathname == "/product") {
    res.writeHead(200, { "Content-type": "text/html" });
    // retrive the product information based on the query string
    const product = dataObj[query.id];
    const output = replaceTemplate(tempProduct, product);

    res.end(output);
  }

  // API
  else if (pathname == "/api") {
    res.writeHead(200, { "Content-type": "application/json" });
    res.end(data);
  }

  // Not found
  else {
    // status code: 404 not found
    res.writeHead(404, {
      "Content-type": "text/html",
      "my-own-header": "hello-world",
    });
    res.end("<h1> Page not found! <h1>");
  }
});

//local host: 127.0.0.1
server.listen(8000, "127.0.0.1", () => {
  console.log("Listening to requests on port 8000 🚩");
});
