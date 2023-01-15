const express = require('express');
const { body } = require('express-validator');
const productController = require('../controllers/product');

const router = express.Router();

const isAuth = require('../middlewares/isAuth');

// @route   POST /product
// @desc    Post a new product
// @access  protected
router.post(
  '/',
  isAuth,
  [
    body('productName', 'Invalid productName').trim().not().isEmpty(),
    body('basePrice', 'Invalid basePrice').trim().isNumeric(),
    body('duration', 'Invalid duration').trim().isNumeric(),
  ],
  productController.addProduct
);

// @route   GET /product?user=<userId>&option=<active>
// @desc    Retrieve list of all products. Optional query param of user.
// @access  protected
router.get('/?', productController.retrieveProducts);

// @route   GET /product/:id
// @desc    Find one product
// @access  protected
router.get('/:id', isAuth, productController.findProduct);

// @route   PUT /product/:id
// @desc    Update a product
// @access  protected
router.put('/:id', isAuth, productController.updateProduct);

// @route   DELETE /product/:id
// @desc    Delete a product
// @access  protected
router.delete('/:id', isAuth, productController.deleteProduct);

module.exports = router;
