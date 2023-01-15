const { validationResult } = require('express-validator');
const Product = require('../models/Product');
const Room = require('../models/Room');
const User = require('../models/User');
const io = require('../socket');

// @route   POST /product
// @desc    Post a new product
exports.addProduct = async (req, res, next) => {
  const errors = validationResult(req);
  if (!errors.isEmpty()) {
    return res.status(400).json({
      errors: errors.array(),
    });
  }

  let { productName, basePrice, duration, image, category, description } = req.body;
  if (duration === null || duration === 0) duration = 300;
  if (duration > 10800) duration = 3600;
  image = image === '' ? '' : `${process.env.SERVER_BASE_URL}${image}`;
  const timer = duration;

  try {
    let product = new Product({
      productName,
      description,
      basePrice,
      currentPrice: basePrice,
      duration,
      timer,
      image,
      category,
      owner: req.user.id,
    });

    // Create room for auction
    let room = new Room({ product: product._id });
    room = await room.save();

    product.room = room._id;
    product = await product.save();

    const user = await User.findById(product.owner);
    user.postedProducts.push(product._id);
    await user.save();

    io.getIo().emit('addProduct', { action: 'add', product: product });

    res.status(200).json({ product, room });
  } catch (err) {
    console.log(err);
    res.status(500).json({ errors: [{ msg: 'Server error' }] });
  }
};

// @route   GET /product
// @desc    Retrieve list of all products
exports.retrieveProducts = async (req, res, next) => {
  const errors = validationResult(req);
  if (!errors.isEmpty()) {
    return res.status(400).json({
      errors: errors.array(),
    });
  }

  const { user, option } = req.query;
  let productList = [];
  try {
    if (user) {
      productList = await Product.find({ owner: user }).sort({ createdAt: -1 });
    } else if (option === 'notexpired') {
      productList = await Product.find({ auctionEnded: false }).sort({
        createdAt: -1,
      });
    } else {
      productList = await Product.find().sort({ createdAt: -1 });
    }
    res.status(200).json(productList);
  } catch (err) {
    console.log(err);
    res.status(500).json({ errors: [{ msg: 'Server error' }] });
  }
};

// @route   GET /product/:id
// @desc    Find one product
exports.findProduct = async (req, res, next) => {
  const errors = validationResult(req);
  if (!errors.isEmpty()) {
    return res.status(400).json({
      errors: errors.array(),
    });
  }

  const pId = req.params.id; // id of type ObjectId (61a18153f926fdc2dd16d78b)
  try {
    const product = await Product.findById(pId).populate('owner', { password: 0 });
    if (!product) return res.status(404).json({ errors: [{ msg: 'Product not found' }] });
    res.status(200).json(product);
  } catch (err) {
    console.log(err);
    res.status(500).json({ errors: [{ msg: 'Server error' }] });
  }
};

// @route   PUT /product/:id
// @desc    Update a product
exports.updateProduct = async (req, res, next) => {
  const errors = validationResult(req);
  if (!errors.isEmpty()) {
    return res.status(400).json({
      errors: errors.array(),
    });
  }

  const pId = req.params.id;
  try {
    // Check for authorization
    let product = await Product.findById(pId);
    if (!product) return res.status(404).json({ errors: [{ msg: 'Product not found' }] });
    if (product.owner != req.user.id)
      return res
        .status(401)
        .json({ errors: [{ msg: 'Unauthorized to delete this product' }] });
    // Update all fields sent in body
    if (req.body.basePrice) {
      req.body.currentPrice = req.body.basePrice;
    }

    let updatedProduct = await Product.findByIdAndUpdate(pId, req.body);
    updatedProduct = await Product.findById(pId);

    res.status(200).json(updatedProduct);
  } catch (err) {
    console.log(err);
    res.status(500).json({ errors: [{ msg: 'Server error' }] });
  }
};

// @route   DELETE /product/:id
// @desc    Delete a product
exports.deleteProduct = async (req, res, next) => {
  const pId = req.params.id;
  try {
    let product = await Product.findById(pId);
    if (!product) return res.status(404).json({ errors: [{ msg: 'Product not found' }] });
    if (product.owner != req.user.id)
      return res
        .status(401)
        .json({ errors: [{ msg: 'Unauthorized to delete this product' }] });
    if (product.auctionStarted || product.auctionEnded)
      return res
        .status(404)
        .json({ errors: [{ msg: 'Cannot delete, auction started/ended' }] });
    await Product.deleteOne(product);
    res.status(200).json({ msg: 'Deleted' });
  } catch (err) {
    console.log(err);
    res.status(500).json({ errors: [{ msg: 'Server error' }] });
  }
};
