const express = require("express");
const router = express.Router();
const fs = require("fs");

var readstream = fs.createReadStream("./database.json");
var writeStream = fs.createWriteStream("./database.json");

var json = [];

readstream.on("data", data => {
  json = JSON.parse(data);
});

router.get("/", function(req, res, next) {
  res.json({ json });
});

router.get("/add", function(req, res, next) {
  res.json({ json });
});

router.post("/addProd", function(req, res, next) {
  var userProd = req.body;
  var productId = json.products.length;
  userProd.id = ++productId;
  json.products.push(userProd);
  writeStream.write(JSON.stringify(json), error => {
    if (error) {
      throw error;
    } else {
      let message = "Product Added Succesfully";
      res.status(200).json({ message });
    }
  });
});

router.get("/editProd/:id", function(req, res) {
  var editId = req.params.id;
  var editIndex = json.products.findIndex(prod => prod.id == editId);
  res.json({ userProdDetails: json.products[editIndex] });
});

router.post("/editProd", function(req, res) {
  var editProducts = req.body;
  var editProdId = editProducts.id;
  var editProdIndex = json.products.findIndex(prod => prod.id == editProdId);
  editProducts.id = editProdId;
  if (editProdIndex != -1) {
    json.products[editProdIndex] = editProducts;
    writeStream.write(JSON.stringify(json), error => {
      if (error) {
        throw error;
      } else {
        let editMessage = `Your ${editProdId} Product Edited Succesfully`;
        res.status(200).json({ userProdDetails: json.products, editMessage });
      }
    });
  } else {
    let invalidMessage = "Invalid Id";
    res.status(200).json({ invalidMessage });
  }
});

router.get("/deleteProd/:id", function(req, res) {
  var deleteId = req.params.id;
  var deleteIndex = json.products.findIndex(
    userProd => userProd.id == deleteId
  );
  if (deleteIndex != -1) {
    json.products.splice(deleteIndex, 1);
    writeStream.write(JSON.stringify(json), error => {
      if (error) {
        throw error;
      } else {
        let deleteMessage = `Your ${deleteId} Product deleted Succesfully`;
        res.status(200).json({ userProdDetails: json.products, deleteMessage });
      }
    });
  } else {
    let invalidMessage = "Invalid Id";
    res.status(200).json({ invalidMessage });
  }
});

router.get("/findProd/:term", function(req, res) {
  var term = req.params.term;
  var termIndex = json.products.findIndex(
    userProd => userProd.id == term || userProd.productName == term
  );
  if (termIndex != -1) {
    res.status(200).json({ userProdDetails: json.products[termIndex] });
  } else {
    let invalidMessage = "Invalid Id/ProductName";
    res.status(200).json({ invalidMessage });
  }
});

router.get("/searchProd/:prodName", function(req, res) {
  var prodname = req.params.prodName;
  var prodIndex = json.products.findIndex(
    search => search.productName == prodname
  );
  if (prodIndex != -1) {
    res.status(200).json({ userProdDetails: json.products[prodIndex] });
  } else {
    let message = "Invalid ProductName";
    res.status(200).json({ message });
  }
});

router.get("/globalfind/:searchval", function(req, res) {
  var getvalue = req.params.searchval.toLowerCase();
  var getsearchDetails = [];
  getsearchDetails = json.products.filter(obj => {
    return Object.keys(obj).some(key => {
      return obj[key]
        .toString()
        .toLowerCase()
        .includes(getvalue);
    });
  });
  res.json({ globalfindsearch: getsearchDetails });
});

router.get("/searchByCategory", function(req, res) {
  let category = [];
  var categoryValue = {};

  for (let i = 0; i < json.products.length; i++) {
    category.push(json.products[i].category);
  }

  for (let j = 0; j < category.length - 1; j++) {
    for (let i = 1; i < category.length; i++) {
      if (category[i] == category[j]) {
        category.splice(i, i++);
      }
    }
  }

  for (let i = 0; i < category.length; i++) {
    let finalCategory = [];
    let count = 0;
    for (j = 0; j < json.products.length; j++) {
      if (category[i] == json.products[j].category) {
        finalCategory[count] = json.products[j];
        count++;
      }
    }
    categoryValue[category[i]] = finalCategory;
  }
  res.json({ CategoryList: categoryValue });
});

module.exports = router;
