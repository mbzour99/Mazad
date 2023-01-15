const Product = require('../models/Product');
const io = require('../socket');

// @route   POST /bid/:pId
// @desc    Post a new product
exports.addBid = async (req, res, next) => {
  const { pId } = req.params;
  const { amount } = req.query;

  try {
    const product = await Product.findById(pId).populate('owner', { password: 0 });
    if (!product) return res.status(404).json({ errors: [{ msg: 'Product not found' }] });
    // Check bid validity
    if (parseFloat(product.currentPrice) >= parseFloat(amount)) {
      return res
        .status(400)
        .json({ errors: [{ msg: 'Bid amount less than existing price' }] });
    }
    if (product.sold || product.auctionEnded || !product.auctionStarted) {
      return res
        .status(400)
        .json({ errors: [{ msg: 'Auction has ended or has not started' }] });
    }
    product.bids.push({ user: req.user.id, amount: amount });
    product.currentPrice = amount;
    product.currentBidder = req.user.id;
    const savedProduct = await product.save();
    // io.getIo().emit('bidPosted', { action: 'bid', data: product });
    console.log(`Emitting to ${product._id}`);
    io.getProductIo().to(product._id.toString()).emit('bidPosted', { action: 'post', data: product });
    res.status(200).json(savedProduct);
  } catch (error) {
    console.log(error);
    res.status(500).json({ errors: [{ msg: 'Server error' }] });
  }
};

// @route   GET /bid/:pId?option=<highest>
// @desc    List of bids on a product
exports.listBids = async (req, res, next) => {
  const { pId } = req.params;
  let { option } = req.query;
  option = option ? option : 'default';

  try {
    const product = await Product.findById(pId);
    await product.populate('bids.user', { password: 0 });
    if (!product) return res.status(404).json({ errors: [{ msg: 'Product not found' }] });
    const bidList = product.bids;
    if (option.toString() === 'highest') {
      res.status(200).json([bidList[bidList.length - 1]]);
    } else {
      res.status(200).json(bidList);
    }
  } catch (error) {
    console.log(error);
    res.status(500).json({ errors: [{ msg: 'Server error' }] });
  }
};
