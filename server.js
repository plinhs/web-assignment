const express = require("express");
const mysql = require("mysql2");
const bodyParser = require("body-parser");
const app = express();
app.set("view engine", "ejs");
require("dotenv").config();
PORT = process.env.PORT || 3000;

app.use(express.static("public"));
app.use(express.urlencoded({ extended: true }));
app.use(bodyParser.json());

const db = mysql.createConnection({
  host: process.env.DB_HOST,
  user: process.env.DB_USER,
  password: process.env.DB_PASSWORD,
  database: process.env.DB_NAME,
  port: process.env.DB_PORT || 3306,
});

db.connect((err) => {
  if (err) {
    console.error("Error connecting to the database:", err);
  } else {
    console.log("Successfully connected to the database!");
  }
});


app.get("/", (req, res) => {
  db.query("SELECT * FROM products", (err, results) => {
    if (err) {
      console.error("Error executing query: " + err.stack);
      res.status(500).send("Error fetching users");
      return;
    }
    res.render("home", { products: results });

  });
});

app.get("/search", (req, res) => {
  const searchQuery = req.query.q;

  const sql =
    "SELECT * FROM products WHERE product_name LIKE ? OR category1 LIKE ? OR category2 LIKE ?";
  const values = [`%${searchQuery}%`, `%${searchQuery}%`, `%${searchQuery}%`];

  db.query(sql, values, (err, results) => {
    if (err) {
      console.error(err);
      return res.status(500).send("Server Error");
    }
    res.render("search", { products: results, query: searchQuery });
  });
});

app.get("/product/:id/:name", (req, res) => {
  const productNo = req.params.id;


  const sql = "SELECT * FROM products WHERE product_no = ?";

  db.query(sql, [productNo], (err, results) => {
    if (err) {
      console.error(err);
      return res.status(500).send("Server Error");
    }
    if (results.length === 0) {
      return res.status(404).send("Product not found");
    }
    const product = results[0];
    
    
    const breadcrumbs = [
      { name: "Ana Sayfa", url: "/" },
      { name: product.category1, url: `/search?q=${encodeURIComponent(product.category1)}` },
      { name: product.category2, url: `/search?q=${encodeURIComponent(product.category2)}`},
      { name: product.product_name, url: `/product/${productNo}/${product.product_name}` },
    ];

    res.render("product", { product, breadcrumbs });
  });
});



app.listen(PORT, () => {
  console.log(`Server is running on http://localhost:${PORT}`);
});

