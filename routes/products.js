var express = require('express');
var router = express.Router();
var [getProducts, insertProduct] = require('../controllers/product');
const auth = require('../lib/utils/auth.js');
var LocalStorage = require('node-localstorage').LocalStorage;
localStorage = new LocalStorage('./scratch');

/* GET product listing. */
router.get('/', auth.checkToken, async function (req, res, next) {
  const products = await getProducts();
  console.warn('products->', products);
  res.send(products);
});
/**
 * POST product
 */
router.post('/', async function (req, res, next) {
  //autorización
  if (localStorage.getItem("role") === "admin") {
    const newProduct = await insertProduct(req.body);
    console.warn('insert products->', newProduct);
    res.send(newProduct);
  } else {
    res.status(403);
    res.send("No está autorizado para realizar esta acción");
  }
});

module.exports = router;
