import {
  POST_PRODUCT,
  LOAD_PRODUCTS,
  LOAD_PRODUCT_DETAILS,
  LOAD_PRODUCT_IMAGE,
  LOAD_HIGHEST_BID,
  PLACE_BID,
  START_AUCTION,
  USER_PURCHASED_LOADED,
  PRODUCT_POSTED_BY_OTHER,
  UPDATE_PRODUCT_IN_PRODUCT_LIST,
  UPDATE_TIMER,
  UPDATE_PRODUCT_DETAILS,
  CLEAR_PRODUCT_IMAGE,
  IMAGE_LOADING,
  CLEAR_PRODUCT_DETAILS,
} from '../actions/types';

const initialState = {
  products: [],
  loading: true,
  imageLoading: true,
  productDetails: { currentPrice: { $numberDecimal: 0 } },
  loadingHighestBid: true,
  highestBid: { user: { username: '' } },
  purchasedLoading: true,
  purchased: [],
  productImage: null,
};

export default function productReduce(state = initialState, action) {
  const { type, payload } = action;

  switch (type) {
    case LOAD_PRODUCTS:
      return {
        ...state,
        loading: false,
        productS: payload,
      };

    case LOAD_PRODUCT_DETAILS:
      return {
        ...state,
        productDetails: payload,
        loading: false,
      };

    case CLEAR_PRODUCT_DETAILS:
      return {
        ...state,
        productDetails: { currentPrice: { $numberDecimal: 0 } },
      };

    case LOAD_PRODUCT_IMAGE:
      return {
        ...state,
        productImage: payload,
        imageLoading: false,
      };

    case IMAGE_LOADING:
      return {
        ...state,
        imageLoading: true,
      };

    case CLEAR_PRODUCT_IMAGE:
      return {
        ...state,
        productImage: null,
        loading: false,
      };

    case UPDATE_PRODUCT_DETAILS:
      if (payload._id === state.productDetails._id) {
        return {
          ...state,
          productDetails: payload,
          loading: false,
        };
      } else {
        return {
          ...state,
        };
      }

    case LOAD_HIGHEST_BID:
      return {
        ...state,
        highestBid: payload,
        loadingHighestBid: false,
      };

    case PLACE_BID:
      return {
        ...state,
        productDetails: { ...payload.productDetails, owner: state.productDetails.owner },
        highestBid: payload.highestBid,
      };

    case POST_PRODUCT:
      return {
        ...state,
        products: [...state.products, payload],
        loading: false,
      };

    case START_AUCTION:
      return {
        ...state,
        productDetails: { ...state.productDetails, auctionStarted: true },
        loading: false,
      };

    case USER_PURCHASED_LOADED:
      return {
        ...state,
        purchased: payload,
        purchasedLoading: false,
      };

    case PRODUCT_POSTED_BY_OTHER:
      return {
        ...state,
        products: [payload, ...state.products],
      };

    case UPDATE_PRODUCT_IN_PRODUCT_LIST:
      let updatedList = state.products.map((product) => {
        if (product._id.toString() === payload._id.toString()) return payload;
        else return product;
      });
      return {
        ...state,
        products: updatedList,
        loading: false,
      };

    case UPDATE_TIMER:
      console.log(state.productDetails._id);
      console.log(payload);
      if (state.productDetails._id === payload._id) {
        return {
          ...state,
          productDetails: { ...state.productDetails, timer: payload.timer },
          loading: false,
        };
      } else {
        return {
          ...state,
        };
      }

    default:
      return state;
  }
}
