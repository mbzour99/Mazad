import * as React from 'react';
import { connect } from 'react-redux';
import Card from '@mui/material/Card';
import { Link, useNavigate } from 'react-router-dom';
// Actions
import { loadProductDetails, loadProductImage, setImageLoadingStatus } from '../actions/product';
// MUI Components
import { CardActionArea } from '@mui/material';
import CardContent from '@mui/material/CardContent';
import CardMedia from '@mui/material/CardMedia';
import Typography from '@mui/material/Typography';
// Files
import imagePlaceholder from '../images/no-image-icon.png';
import { secondsToHmsShort } from '../utils/secondsToHms';


function MediaCard(props) {
  const navigate = useNavigate();

  const handleCardClick = (e) => {
    navigate(`/products/${props.product._id}`);
  };

  // Auction status based on the product-details
  const updateAuctionStatus = (product) => {
    if (product.sold) {
      return 'Sold';
    } else if (product.auctionEnded) {
      return 'Ended, not-sold';
    } else if (!product.auctionStarted) {
      return 'Upcoming';
    } else {
      return 'Ongoing';
    }
  };

  return (
    <a
      onClick={(e) => {
        handleCardClick(e);
      }}
      style={{ textDecoration: 'none' }}
    >
      <Card style={props.cardStyle}>
        <CardActionArea>
          {!props.dashCard && (
            <CardMedia
              component='img'
              height='180'
              src={props.product.image ? props.product.image : imagePlaceholder}
              alt='pic'
            />
          )}
          <CardContent>
            <Typography gutterBottom variant='h6' component='div'>
              {props.product.productName}
            </Typography>
            <Typography variant='body2' color='text.secondary'>
              Price: $ {props.product.currentPrice.$numberDecimal}
            </Typography>
            <Typography variant='body2' color='text.secondary'>
              Remaining: {secondsToHmsShort(props.product.timer)}
            </Typography>
            <Typography variant='body2' color='text.secondary'>
              Status: {updateAuctionStatus(props.product)}
            </Typography>
          </CardContent>
        </CardActionArea>
      </Card>
    </a>
  );
}

const mapStateToProps = (state) => ({
  productDetails: state.product.productDetails,
});

export default connect(mapStateToProps, {
  loadProductDetails,
  loadProductImage,
  setImageLoadingStatus,
})(MediaCard);