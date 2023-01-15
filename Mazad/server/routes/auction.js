const express = require('express');
const { body } = require('express-validator');
const auctionController = require('../controllers/auction');

const router = express.Router();

const isAuth = require('../middlewares/isAuth');

// @route   GET /auction/start/:pId
// @desc    Start auction
// @access  protected
router.get('/start/:pId', isAuth, auctionController.startAuction);

// TODO:
// @route   POST /auction/end/:pId
// @desc    End auction
// @access  protected

module.exports = router;
