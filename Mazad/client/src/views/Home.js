import React, { useEffect, useState } from 'react';
import { connect } from 'react-redux';
import { Navigate, Link } from 'react-router-dom';
// Styling
import '../components/css/home.css';

import Alert from '../components/Alert';
import axios from 'axios';

import Card from '@mui/material/Card';
import { CardActionArea } from '@mui/material';
import CardContent from '@mui/material/CardContent';
import CardMedia from '@mui/material/CardMedia';
import Typography from '@mui/material/Typography';
// Files
import imagePlaceholder from '../images/no-image-icon.png';
import { secondsToHmsShort } from '../utils/secondsToHms';

const Home = (props) => {
  const [products,setProducts] = useState([]);
  const [loaded, setLoaded] = useState(false);
  
  // if (!props.isAuth) {
  //   console.log(props.isAuth);
  //   return <Navigate to='/login' />;
  // }
  useEffect(()=>{
 
    axios.get("http://localhost:8000/product?option=notexpired")
    .then(res => {
      setProducts(res.data)
      setLoaded(true);
  });
  })

  useEffect(()=>{

  },[])

  return (
    <div>
    {props.isAuth?
    <div className='home'>
    
      <div className='alert__display'>
        <Alert />
      </div>
      <div style={{display:'flex', margin:'0 auto', gap:'15px', marginTop:'20px' ,maxWidth:'800px', flexWrap:'wrap'}}>
            {loaded && products.map((prod, idx) => {
    return (
      <Link to={`/products/${prod._id}`}>
      <Card style={props.cardStyle}>
      <CardActionArea style={{width:"180px",height:'320px' ,border:
    prod.auctionStarted? '5px solid green':'2px solid red' }} >
        {(
          <CardMedia
            component='img'
            height='180'
            src={prod.image ? prod.image : imagePlaceholder}
            alt='pic'
          />
        )}
        <CardContent>
          <Typography gutterBottom variant='h6' component='div'>
            {prod.productName}
          </Typography>
          <Typography variant='body2' color='text.secondary'>
            Price: $ {prod.currentPrice.$numberDecimal}
          </Typography>
          <Typography variant='body2' color='text.secondary'>
            {!prod.auctionStarted? "Duration":
            "Remaining"}: {secondsToHmsShort(prod.timer)}
          </Typography>
        </CardContent>
      </CardActionArea>
    </Card>
    </Link>
    )
})}
</div>
    </div>
    : <Navigate to='/login' />}
    </div>
  );

};

const mapStateToProps = (state) => ({
  loading: state.auth.loading,
  isAuth: state.auth.isAuthenticated,
});

export default connect(mapStateToProps, {})(Home);
