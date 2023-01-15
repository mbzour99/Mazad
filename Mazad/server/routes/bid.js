const express = require('express');
const { body } = require('express-validator');
const bidController = require('../controllers/bid');

const router = express.Router();

const isAuth = require('../middlewares/isAuth');

// @route   POST /bid/:pId?amount=<amount>
// @desc    Post a new product
// @access  protected
router.post('/:pId?', isAuth, bidController.addBid);

// @route   GET /bid/:pId?option=<highest>
// @desc    List of bids on a product
// @access  protected
router.get('/:pId?', isAuth, bidController.listBids);

module.exports = router;
