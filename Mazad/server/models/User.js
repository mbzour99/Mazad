const mongoose = require('mongoose');

const userSchema = new mongoose.Schema({
  username: {
    type: String,
    required: [true, "Username is required"] 
  },
  email: {
    type: String,
    required: [true, "Email is required"] 
  },
  password: {
    type: String,
    required: [true, "Password is required"] 
  },
  phone: {
    type: String,
    required: [true, "Phone is required"] 
  },
  address: {
    type: String,
    required: [true, "Address is required"] 
  },
  purchasedProducts: [
    {
      type: mongoose.Types.ObjectId,
      ref: 'product',
    },
  ],
  postedProducts: [
    {
      type: mongoose.Types.ObjectId,
      ref: 'product',
    },
  ],
  bids: [
    {
      type: mongoose.Types.ObjectId,
      ref: 'product',
    },
  ],
}, {timestamps: true});

module.exports = mongoose.model('user', userSchema);
