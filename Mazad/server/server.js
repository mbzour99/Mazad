const express = require('express');
require('dotenv').config();
const connectDb = require('./db/dbconnect');
const { createServer } = require('http');
const multer = require('multer');
const socketio = require('./socket');
const swaggerUi = require('swagger-ui-express');
const swaggerDoc = require('./documentation/swaggerSetup');

const app = express();
const server = createServer(app);
const io = socketio.init(server);
const productIo = socketio.initProductIo(server, '/socket/productpage');
const upload = multer({ dest: 'uploads/' });

// Body parser
app.use(express.json());

// CORS
app.use((req, res, next) => {
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'OPTIONS, GET, POST, PUT, PATCH, DELETE');
  res.setHeader('Access-Control-Allow-Headers', '*');
  next();
});

// Documentation setup
app.use('/api-docs', swaggerUi.serve, swaggerUi.setup(swaggerDoc));

// Default route
app.get('/', (req, res, next) => {
  res.send('Server running');
});

// Routes
app.use('/auth', require('./routes/auth'));
app.use('/user', require('./routes/user'));
app.use('/product', require('./routes/product'));
app.use('/bid', require('./routes/bid'));
app.use('/room', require('./routes/room'));
app.use('/auction', require('./routes/auction'));
app.use('/upload', require('./routes/uploads'));

// Socket.io setup
const PORT = process.env.PORT;
io.on('connection', (socket) => {
  // console.log('### Socket IO client connected');
  socket.on('disconnect', (reason) => {
    // console.log('### Socket IO client disconnected');
  });
  socket.on('leaveHome', () => {
    socket.disconnect();
  });
});
productIo.on('connect', (socket) => {
  // socket.join('testroom')
  socket.on('joinProduct', ({ product }) => {
    socket.join(product.toString());
    // console.log(`User joined room ${product}`);
  });
  socket.on('leaveProduct', ({ product }) => {
    socket.leave(product.toString());
    // console.log(`Left room ${product}`);
  });
  socket.on('disconnect', () => {
    // console.log('User has disconnect from product');
  });
});
// Connect DB and Initialize server
connectDb();
server.listen(PORT, () => {
  console.log(`### Server running on port ${PORT}`);
});
