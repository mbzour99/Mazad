import { createStore, applyMiddleware, combineReducers } from 'redux';
import { composeWithDevTools } from 'redux-devtools-extension';
import thunk from 'redux-thunk';
import auth from './reducers/auth';
import alert from './reducers/alert';
import product from './reducers/product';

const initialState = {};
const middleware = [thunk];
const rootReducer = combineReducers({ auth, alert, product });

const store = createStore(
  rootReducer,
  initialState,
  composeWithDevTools(applyMiddleware(...middleware))
);

export default store;
