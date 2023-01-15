import axios from 'axios';
import {
  LOAD_PRODUCTS,
  LOAD_PRODUCT_DETAILS,
  LOAD_HIGHEST_BID,
  PLACE_BID,
  POST_PRODUCT,
  START_AUCTION,
  USER_PURCHASED_LOADED,
  PRODUCT_POSTED_BY_OTHER,
  UPDATE_PRODUCT_IN_PRODUCT_LIST,
  UPDATE_TIMER,
  UPDATE_PRODUCT_DETAILS,
  LOAD_PRODUCT_IMAGE,
  CLEAR_PRODUCT_IMAGE,
  IMAGE_LOADING,
  CLEAR_PRODUCT_DETAILS,
} from './types';
import { setAlert } from './alert';
import setAuthToken from '../utils/setAuthToken';

// Load products
export const loadProducts =
  (userId = null) =>
  async (dispatch) => {
    let config = null;
    if (userId) {
      config = { params: { user: userId } };
    }
    try {
      const res = await axios.get(
        `${process.env.REACT_APP_API_BASE_URL}/product?option=notexpired`,
        config
      );

      dispatch({
        type: LOAD_PRODUCTS,
        payload: res.data,
      });
    } catch (error) {
      // Get errors array sent by api
      if (!error.response) {
        return dispatch(setAlert('Server error', 'error'));
      }
      console.log(error.response);
      const errors = error.response.data.errors;
      if (errors) {
        errors.forEach((error) => dispatch(setAlert(error.msg, 'error')));
      }
    }
  };

// Load PRODUCT details
export const loadProductDetails = (pId) => async (dispatch) => {
  try {
    if (localStorage.getItem('token')) {
      setAuthToken(localStorage.getItem('token'));
    }
    const res = await axios.get(`${process.env.REACT_APP_API_BASE_URL}/product/${pId}`);

    dispatch({
      type: LOAD_PRODUCT_DETAILS,
      payload: res.data,
    });
  } catch (error) {
    // Get errors array sent by api
    if (!error.response) {
      return dispatch(setAlert('Server error', 'error'));
    }
    console.log(error.response);
    const errors = error.response.data.errors;
    if (errors) {
      console.log(errors);
      errors.forEach((error) => dispatch(setAlert(error.msg, 'error', 50000)));
    }
  }
};

// Clear product details
export const clearProductDetails = () => (dispatch) => {
  dispatch({
    type: CLEAR_PRODUCT_DETAILS,
  });
};

// Load product image
export const loadProductImage = (imageUrl) => async (dispatch) => {
  try {
    const res = await axios.get(imageUrl, {
      responseType: 'blob',
    });

    dispatch({
      type: LOAD_PRODUCT_IMAGE,
      payload: URL.createObjectURL(res.data),
    });
  } catch (error) {
    // Get errors array sent by api
    console.log(error);
    if (!error.response) {
      return dispatch(setAlert('Server error', 'error'));
    }
    const errors = error.response.data.errors;
    if (errors) {
      console.log(errors);
      errors.forEach((error) => dispatch(setAlert(error.msg, 'error', 50000)));
    }
  }
};

// Clear product image
export const clearProductImage = (pId) => async (dispatch) => {
  dispatch({
    type: CLEAR_PRODUCT_IMAGE,
  });
};

// Set image status to loading
export const setImageLoadingStatus = () => async (dispatch) => {
  dispatch({
    type: IMAGE_LOADING,
  });
};

// Set product details
export const setProductDetails = (product) => (dispatch) => {
  dispatch({
    type: LOAD_PRODUCT_DETAILS,
    payload: product,
  });
};

// Current highest bid on prodcut
export const loadHighestBid = (pId) => async (dispatch) => {
  const url = `${process.env.REACT_APP_API_BASE_URL}/bid/${pId}`;
  try {
    const res = await axios.get(url, { params: { option: 'highest' } });

    dispatch({
      type: LOAD_HIGHEST_BID,
      payload: res.data[0],
    });
  } catch (error) {
    // Get errors array sent by api
    if (!error.response) {
      return dispatch(setAlert('Server error', 'error'));
    }
    console.log(error.response);
    const errors = error.response.data.errors;
    if (errors) {
      console.log(errors);
      errors.forEach((error) => dispatch(setAlert(error.msg, 'error', 50000)));
    }
  }
};

// Place bid
export const placeBid = (pId, bidAmount) => async (dispatch) => {
  const url = `${process.env.REACT_APP_API_BASE_URL}/bid/${pId}`;
  try {
    const res = await axios.post(url, null, { params: { amount: bidAmount } });
    const res2 = await axios.get(url, { params: { option: 'highest' } });
    dispatch({
      type: PLACE_BID,
      payload: { productDetails: res.data, highestBid: res2.data[0] },
    });
    setAlert('Bid submitted', 'success');
  } catch (error) {
    // Get errors array sent by api
    if (!error.response) {
      return dispatch(setAlert('Server error', 'error'));
    }
    console.log(error.response);
    const errors = error.response.data.errors;
    if (errors) {
      console.log(errors);
      errors.forEach((error) => dispatch(setAlert(error.msg, 'error', 50000)));
    }
  }
};

// Post product
export const postProduct = (data) => async (dispatch) => {
  const url = `${process.env.REACT_APP_API_BASE_URL}/product`;
  try {
    const res = await axios.post(url, JSON.stringify(data), {
      headers: { 'Content-Type': 'application/json' },
    });

    dispatch({
      type: POST_PRODUCT,
      payload: res.data.product,
    });
  } catch (error) {
    // Get errors array sent by api
    if (!error.response) {
      return dispatch(setAlert('Server error', 'error'));
    }
    console.log(error.response);
    const errors = error.response.data.errors;
    if (errors) {
      console.log(errors);
      errors.forEach((error) => dispatch(setAlert(error.msg, 'error', 50000)));
    }
  }
};

// Post product
export const startAuction = (pId) => async (dispatch) => {
  const url = `${process.env.REACT_APP_API_BASE_URL}/auction/start/${pId}`;
  try {
    const res = await axios.get(url);

    dispatch({
      type: START_AUCTION,
      payload: res,
    });
  } catch (error) {
    // Get errors array sent by api
    if (!error.response) {
      return dispatch(setAlert('Server error', 'error'));
    }
    console.log(error.response);
    const errors = error.response.data.errors;
    if (errors) {
      console.log(errors);
      errors.forEach((error) => dispatch(setAlert(error.msg, 'error', 50000)));
    }
  }
};

// Load products purchased by user
export const getUserPurchasedProducts = () => async (dispatch) => {
  const url = `${process.env.REACT_APP_API_BASE_URL}/user/products/purchased`;
  try {
    const res = await axios.get(url);

    dispatch({
      type: USER_PURCHASED_LOADED,
      payload: res.data,
    });
  } catch (error) {
    // Get errors array sent by api
    if (!error.response) {
      return dispatch(setAlert('Server error', 'error'));
    }
    console.log(error.response);
    const errors = error.response.data.errors;
    if (errors) {
      console.log(errors);
      errors.forEach((error) => dispatch(setAlert(error.msg, 'error', 50000)));
    }
  }
};

// Load products purchased by user
export const productPostedByOther = (product) => (dispatch) => {
  dispatch({
    type: PRODUCT_POSTED_BY_OTHER,
    payload: product,
  });
};

// Update product in product list
export const updateProductInList = (product) => (dispatch) => {
  dispatch({
    type: UPDATE_PRODUCT_IN_PRODUCT_LIST,
    payload: product,
  });
};

// Update current product (productDetails)
export const updateTimer = (timer) => (dispatch) => {
  dispatch({
    type: UPDATE_TIMER,
    payload: timer,
  });
};

// Update current product (productDetails)
export const updateProductDetails = (product) => (dispatch) => {
  dispatch({
    type: UPDATE_PRODUCT_DETAILS,
    payload: product,
  });
};
