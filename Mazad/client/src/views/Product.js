import React, { useEffect, useState, Fragment } from 'react';
import { connect } from 'react-redux';
import { useParams, useNavigate } from 'react-router-dom';
import openSocket from 'socket.io-client';
// Actions
import {
  loadProductDetails,
  loadProductImage,
  loadHighestBid,
  placeBid,
  startAuction,
  updateTimer,
  updateProductDetails,
  clearProductImage,
  setImageLoadingStatus,
  clearProductDetails,
} from '../actions/product';
import { setAlert, clearAlerts } from '../actions/alert';
// MUI Components
import { Paper, Box, Typography, Divider, TextField, Button } from '@mui/material';
// Project components
import Alert from '../components/Alert';
import Spinner from '../components/Spinner';
import LoadingDisplay from '../components/LoadingDisplay';
import imagePlaceholder from '../images/no-image-icon.png';
import {
  boxStyle,
  productArea,
  imageStyle,
  paperStyle,
  descriptionArea,
  imageContainer,
  bidContainer,
  bidButtonStyle,
} from '../components/css/productStyles.js';
import { secondsToHms } from '../utils/secondsToHms';

const Product = (props) => {
  const params = useParams();
  const [bidPrice, setBidPrice] = useState(0);
  const [bidButton, setBidButton] = useState(true);
  const [ownerProduct, setOwnerProduct] = useState(false);
  const [startButton, setStartButton] = useState(true);
  const navigate = useNavigate();

  // Bid button status
  const updateBidButtonStatus = (updatedPrice) => {
    if (
      updatedPrice - Number(props.productDetails.currentPrice.$numberDecimal)>=50 &&
      props.productDetails.auctionStarted &&
      !props.productDetails.auctionEnded
    ) {
      setBidButton(false);
    } else {
      setBidButton(true);
    }
  };

  useEffect(() => {
    props.clearAlerts();
    props.setImageLoadingStatus();
    props.loadProductDetails(params.pId);
  }, [params.pId]);

  useEffect(() => {
    if (props.productDetails.image) {
      props.loadProductImage(props.productDetails.image);
    }
  }, [props.productDetails.image]);

  useEffect(() => {
    props.loadHighestBid(params.pId);
  }, [params.pId]);

  useEffect(() => {
    updateBidButtonStatus(bidPrice);
  }, [bidPrice, props.productDetails.auctionEnded]);

  // For product rooms
  useEffect(() => {
    const productSocket = openSocket(process.env.REACT_APP_API_BASE_URL, {
      path: '/socket/productpage',
    });
    // User enters add page
    productSocket.emit('joinProduct', { product: params.pId.toString() });
    // Auction is started
    productSocket.on('auctionStarted', (res) => {
      console.log(res);
      props.updateProductDetails(res.data);
      props.clearAlerts();
      if (res.action === 'started') props.setAlert('Auction started!', 'info');
    });
    // Auction is ended
    productSocket.on('auctionEnded', (res) => {
      if (res.action === 'sold') {
        props.updateProductDetails(res.product);
        props.clearAlerts();
        props.setAlert(`Auction ended, item sold to ${res.winner.username}!`, 'info');
      } else {
        props.updateProductDetails(res.data);
        props.clearAlerts();
        props.setAlert('Item not sold', 'info');
      }
    });
    // Timer
    productSocket.on('timer', (res) => {
      props.updateTimer(res.data);
    });
    // Bid is posted
    productSocket.on('bidPosted', (res) => {
      console.log('bidposted');
      props.loadHighestBid(res.data._id);
      props.updateProductDetails(res.data);
    });

    return () => {
      productSocket.emit('leaveProduct', { product: params.pId.toString() });
      productSocket.off();
      props.clearProductDetails();
      props.clearProductImage();
    };
    // setProductSocketState(productSocket);
  }, [params.pId]);

  // Check if current user is the owner of product
  useEffect(() => {
    if (props.productDetails.owner && props.auth.user) {
      if (props.productDetails.owner._id === props.auth.user._id) setOwnerProduct(true);
      else setOwnerProduct(false);
    }
    // Check start button
    if (!props.productDetails.auctionStarted && !props.productDetails.auctionEnded) {
      setStartButton(true);
    } else {
      setStartButton(false);
    }
  }, [
    props.productDetails.owner,
    props.auth.user,
    props.productDetails.auctionStarted,
    props.productDetails.auctionEnded,
  ]);

  if (props.authLoading) {
    return <Spinner />;
  }

  // Check if user is logged
  if (!props.isAuth) {
    navigate('/login');
  }

  if (props.loading || props.loadingHighestBid) {
    console.log('loading');
    return <Spinner />;
  }

  const handleBidPriceChange = (e) => {
    setBidPrice(e.target.value);
  };

  const handleSubmitBid = (e) => {
    e.preventDefault();
    // Place bid
    props.placeBid(props.productDetails._id, bidPrice);
  };

  const handleStartAuction = (e) => {
    e.preventDefault();
    props.startAuction(props.productDetails._id);
    props.setAlert('Auction started', 'success');
  };

  const getTimeRemaining = () => {
    return secondsToHms(props.productDetails.timer);
  };

  const getUTCDate = (dt) => {
    let isodt = new Date(dt);
    return isodt.toDateString();
  };

  // Auction status based on the product-details
  const auctionStatus = () => {
    if (props.productDetails.sold) {
      return 'Sold';
    } else if (props.productDetails.auctionEnded) {
      return 'Ended, not-sold';
    } else if (!props.productDetails.auctionStarted) {
      return 'Upcoming';
    } else {
      return 'Ongoing';
    }
  };

  return (
    <div className='product__page'>
      {props.loading ? (
        <LoadingDisplay />
      ) : (
        <Fragment>
          <Alert />
          {!props.productDetails.owner ? (
            <LoadingDisplay />
          ) : (
            <Box sx={boxStyle}>
              <Paper sx={paperStyle}>
                <Typography variant='h4'>{props.productDetails.productName}</Typography>
                <Box sx={productArea}>
                  <Box sx={imageContainer}>
                    {/* {!props.imageLoading && ( */}
                      <img
                        src={props.productDetails.image ? props.productImage : imagePlaceholder}
                        alt={props.productDetails.productName}
                        style={imageStyle}
                      />
                    {/* )} */}
                  </Box>
                  <Box sx={descriptionArea}>
                    <Typography variant='h6'>Description</Typography>
                    <Typography variant='body2'>{props.productDetails.description}</Typography>
                    <Divider variant='middle' sx={{ margin: '.5rem' }} />

                    <Typography variant='h6'>Info</Typography>
                    <Typography variant='body1'>
                      Posted on: {getUTCDate(props.productDetails.createdAt)}
                    </Typography>
                    <Typography variant='body1'>
                      Seller: {props.productDetails.owner.username}
                    </Typography>
                    <Typography variant='body1'>
                      Base price: {props.productDetails.basePrice.$numberDecimal}
                    </Typography>
                    <Divider variant='middle' sx={{ margin: '.5rem' }} />

                    <Typography variant='h6'>Auction</Typography>
                    <Typography variant='body1'>Status: {auctionStatus()}</Typography>
                    <Typography variant='body1'>
                      Bids: {props.productDetails.bids.length}
                    </Typography>
                    <Typography variant='body1'>
                     {startButton? "Duration": "Time remaining"} : {getTimeRemaining()}
                    </Typography>
                    <Typography variant='body1'>
                      Current price: ${props.productDetails.currentPrice.$numberDecimal}
                    </Typography>
                    <Typography variant='body1'>
                      Current bidder: {props.highestBid && props.highestBid.user.username}
                    </Typography>
                    <Divider variant='middle' sx={{ margin: '.5rem' }} />

                    {!ownerProduct && (
                      <Box sx={bidContainer}>
                        <TextField
                          label='$'
                          id='bid-price'
                          size='small'
                          onChange={(e) => {
                            handleBidPriceChange(e);
                          }}
                        />
                        <Box sx={{ height: 'auto' }}>
                          <Button
                            variant='contained'
                            disabled={bidButton}
                            onClick={(e) => handleSubmitBid(e)}
                            sx={bidButtonStyle}
                          >
                            Place bid
                          </Button>
                        </Box>
                      </Box>
                    )}

                    {ownerProduct && (
                      <Box sx={bidContainer}>
                        <Box sx={{ height: 'auto' }}>
                          <Button
                            variant='contained'
                            disabled={!startButton}
                            onClick={(e) => handleStartAuction(e)}
                            sx={bidButtonStyle}
                          >
                            Start Auction
                          </Button>
                        </Box>
                      </Box>
                    )}
                  </Box>
                </Box>
              </Paper>
            </Box>
          )}
        </Fragment>
      )}
    </div>
  );
};

const mapStateToProps = (state) => ({
  productDetails: state.product.productDetails,
  loading: state.product.loading,
  authLoading: state.auth.loading,
  isAuth: state.auth.isAuthenticated,
  alerts: state.alert,
  highestBid: state.product.highestBid,
  loadingBid: state.product.loadingHighestBid,
  auth: state.auth,
  productImage: state.product.productImage,
  imageLoading: state.product.imageLoading,
});

export default connect(mapStateToProps, {
  loadProductDetails,
  loadProductImage,
  loadHighestBid,
  placeBid,
  startAuction,
  setAlert,
  clearAlerts,
  updateTimer,
  updateProductDetails,
  clearProductImage,
  setImageLoadingStatus,
  clearProductDetails,
})(Product);
