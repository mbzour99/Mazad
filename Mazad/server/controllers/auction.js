const Product = require('../models/Product');
const User = require('../models/User');
const io = require('../socket');

// @route   POST /auction/start/:pId
// @desc    Start auction
exports.startAuction = async (req, res, next) => {
  const { pId } = req.params;
  try {
    let product = await Product.findById(pId).populate('owner', { password: 0 });
    if (!product) return res.status(400).json({ errors: [{ msg: 'Product not found' }] });
    if (product.owner._id != req.user.id)
      return res.status(400).json({ errors: [{ msg: 'Unauthorized to start' }] });
    if (product.auctionEnded)
      return res.status(400).json({ errors: [{ msg: 'Auction has already ended' }] });
    if (product.auctionStarted)
      return res.status(400).json({ errors: [{ msg: 'Already started' }] });
      product.auctionStarted = true;
    await product.save();
    // io.getIo().emit('auctionStarted', { action: 'started', data: product });
    io.getProductIo()
      .to(product._id.toString())
      .emit('auctionStarted', { action: 'started', data: product });
    res.status(200).json({ msg: 'Auction started' });

    // Run down timer
    product.timer = parseInt(product.duration);
    product.auctionEnded = false;
    let duration = parseInt(product.duration);
    let timer = parseInt(product.timer);
    let intervalTimer = setInterval(async () => {
      timer -= 1;
      await product.updateOne({ timer: timer });
      io.getProductIo()
        .to(product._id.toString())
        .emit('timer', {
          action: 'timerUpdate',
          data: { timer: timer, _id: product._id },
        });
    }, 1000);
    setTimeout(async () => {
      clearInterval(intervalTimer);
      let auctionEndProduct = await Product.findById(product._id).populate('owner', { password: 0 });
      auctionEndProduct.auctionEnded = true;
      auctionEndProduct.timer = 0;
      if (auctionEndProduct.currentBidder) {
        console.log('product sold');
        auctionEndProduct.purchasedBy = auctionEndProduct.currentBidder;
        auctionEndProduct.sold = true;
        await auctionEndProduct.save();
        // Add product to winner
        let winner = await User.findById(auctionEndProduct.currentBidder);
        winner.purchasedProducts.push(auctionEndProduct._id);
        await winner.save();
        io.getProductIo()
          .to(auctionEndProduct._id.toString())
          .emit('auctionEnded', { action: 'sold', product: auctionEndProduct, winner: winner });
      } else {
        io.getProductIo()
          .to(auctionEndProduct._id.toString())
          .emit('auctionEnded', { action: 'notSold', data: auctionEndProduct });
        await auctionEndProduct.save();
      }
    }, (duration + 1) * 1000);
  } catch (err) {
    console.log(err);
    res.status(500).json({ errors: [{ msg: 'Server error' }] });
  }
};

const runTimer = async (product) => {};
