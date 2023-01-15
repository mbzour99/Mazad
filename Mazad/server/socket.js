const { Server } = require('socket.io');
let io;
let productIo;

exports.init = (server) => {
  io = new Server(server, {
    cors: {
      origin: process.env.CLIENT_BASE_URL,
      methods: ['*'],
      allowedHeaders: ['*'],
    },
  });
  return io;
};

exports.initProductIo = (server, path = '/socket/productpage') => {
  productIo = new Server(server, {
    cors: {
      origin: process.env.CLIENT_BASE_URL,
      methods: ['*'],
      allowedHeaders: ['*'],
    },
    path: path,
  });
  return productIo;
};

exports.getIo = () => {
  if (!io) {
    throw new Error('Socket.io not initialized');
  }
  return io;
};

exports.getProductIo = () => {
  if (!productIo) {
    throw new Error('Socket.io not initialized');
  }
  return productIo;
};
