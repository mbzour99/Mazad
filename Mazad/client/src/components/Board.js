import React, { useEffect, useState } from 'react';
import { connect } from 'react-redux';
import { Navigate } from 'react-router-dom';
import openSocket from 'socket.io-client';
// MUI
import { Button, Box, ButtonGroup } from '@mui/material';
// Styling
import './css/board.css';
import {
  productAreaStyle,
  boardCardStyle,
  boardStyle,
  paginationStyle,
} from './css/boardStyle';
// Actions
import { loadProducts, productPostedByOther, updateProductInList } from '../actions/product';
import { setAlert, clearAlerts } from '../actions/alert';
// Components
import Spinner from './Spinner';
import Card from './Card';

const Board = (props) => {
  const [pageNumber, setPageNumber] = useState(1);
  const [productPerPage] = useState(6);

  useEffect(() => {
    if (props.passedUser) {
      props.loadProducts(props.passedUser);
    } else {
      props.loadProducts();
      const socket = openSocket(process.env.REACT_APP_API_BASE_URL);
      // when new product is added
      socket.on('addProduct', (data) => {
        console.log(data);
        if (
          props.user &&
          data.product.owner &&
          data.product.owner.toString() !== props.user._id.toString()
        ) {
          props.clearAlerts();
          props.setAlert('New products available', 'info', 60000);
        }
      });
      // when auction starts/ends
      socket.on('auctionStarted', (res) => {
        props.updateProductInList(res.data);
      });
      socket.on('auctionEnded', (res) => {
        props.updateProductInList(res.data);
      });

      // disconnect socket when page left
      return () => {
        socket.emit('leaveHome');
        socket.off();
        props.clearAlerts();
      };
    }
  }, []);



  // Check if user is logged
  if (!props.isAuth) {
    return <Navigate to='/login' />;
  }

  // Pagination
  let lastProductIndex = pageNumber * productPerPage;
  let firstProductIndex = lastProductIndex - productPerPage;
  // Page numbers for buttons
  let pageNumbers = [];
  const num = Math.ceil(props.products.length / productPerPage);
  for (let i = 1; i <= num; i++) {
    pageNumbers.push(i);
  }
  // When page number button is clicked
  const clickPageNumberButton = (num) => {
    setPageNumber(num);
  };

  return props.loading ? (
    <Spinner />
  ) : (
    <Box sx={boardStyle}>
      <Box sx={productAreaStyle}>
        {props.products.slice(firstProductIndex, lastProductIndex).map((product) => {
          return product.auctionEnded ? null : (
            <div className='product__container' key={product._id}>
              <Card product={product} key={product._id} dashCard={false} cardStyle={boardCardStyle} />
            </div>
          );
        })}
      </Box>
      <Box sx={paginationStyle}>
        <ButtonGroup variant='outlined' size='small'>
          <Button
            disabled={pageNumber === 1}
            onClick={(e) => clickPageNumberButton(pageNumber - 1)}
          >
            Prev
          </Button>
          {pageNumbers.map((num) => {
            return (
              <Button
                key={num}
                disabled={pageNumber === num}
                onClick={(e) => clickPageNumberButton(num)}
              >
                {num}
              </Button>
            );
          })}
          <Button
            disabled={pageNumber === pageNumbers[pageNumbers.length - 1]}
            onClick={(e) => clickPageNumberButton(pageNumber + 1)}
          >
            Next
          </Button>
        </ButtonGroup>
      </Box>
    </Box>
  );
};

const mapStateToProps = (state) => ({
  products: state.product.products,
  loading: state.auth.loading,
  isAuth: state.auth.isAuthenticated,
  user: state.auth.user,
});

export default connect(mapStateToProps, {
  loadProducts,
  productPostedByOther,
  setAlert,
  updateProductInList,
  clearAlerts,
})(Board);
