import React, { Fragment, useEffect } from 'react';
import { connect } from 'react-redux';
import { useNavigate } from 'react-router-dom';
// MUI
import {
  Box,
  Paper,
  Typography,
  Table,
  TableRow,
  TableCell,
  TableBody,
} from '@mui/material';
// Style files
import { boxStyle, paperStyle } from '../components/css/productStyles';
import { profileTableStyle, tableCellStyle } from '../components/css/dashStyle';
// Actions
import { clearAlerts } from '../actions/alert';

// Project files
import Spinner from '../components/Spinner';
import DashboardProductList from '../components/DashboardProductList';
import LoadingDisplay from '../components/LoadingDisplay';
// Actions
import { getUserPurchasedProducts } from '../actions/product';
import DashPurchasedList from '../components/DashPurchasedList';

const Dashboard = (props) => {
  const navigate = useNavigate();

  useEffect(() => {
    if (props.isAuth) {
      props.getUserPurchasedProducts();
    }
  }, [props.loading]);

  useEffect(() => {
    return () => {
      props.clearAlerts();
    };
  }, []);

  // Check if user is logged
  if (!props.isAuth) {
    navigate('/login');
  }

  return props.loading ? (
    <Spinner />
  ) : (
    <Fragment>
      <Box sx={boxStyle}>
        <Paper sx={paperStyle}>
          <Typography variant='h5'>My Profile</Typography>
          <Box sx={profileTableStyle}>
            <Table sx={{ width: '60%', minWidth: '200px' }} aria-label='simple table'>
              <TableBody>
                <TableRow key='Username'>
                  <TableCell align='right' sx={tableCellStyle}>
                    User name
                  </TableCell>
                  <TableCell align='left' sx={tableCellStyle}>
                    {props.user.username}
                  </TableCell>
                </TableRow>
                <TableRow>
                  <TableCell align='right' sx={tableCellStyle}>
                    Email
                  </TableCell>
                  <TableCell align='left' sx={tableCellStyle}>
                    {props.user.email}
                  </TableCell>
                </TableRow>
                <TableRow>
                  <TableCell align='right' sx={tableCellStyle}>
                    Phone
                  </TableCell>
                  <TableCell align='left' sx={tableCellStyle}>
                    {props.user.phone}
                  </TableCell>
                </TableRow>
                <TableRow>
                  <TableCell align='right' sx={tableCellStyle}>
                    Address
                  </TableCell>
                  <TableCell align='left' sx={tableCellStyle}>
                    {props.user.address}
                  </TableCell>
                </TableRow>
              </TableBody>
            </Table>
          </Box>
        </Paper>
      </Box>

      <Box sx={boxStyle}>
        <Paper sx={paperStyle}>
          <Typography variant='h5'>My Products</Typography>
          <DashboardProductList />
        </Paper>
      </Box>

      <Box sx={boxStyle}>
        <Paper sx={paperStyle}>
          <Typography variant='h5'>My purchases</Typography>
          {props.purchasedLoading ? (
            <LoadingDisplay />
          ) : (
            <DashPurchasedList products={props.purchased} />
          )}
        </Paper>
      </Box>
    </Fragment>
  );
};

const mapStateToProps = (state) => ({
  loading: state.auth.loading,
  isAuth: state.auth.isAuthenticated,
  user: state.auth.user,
  purchased: state.product.purchased,
  purchasedLoading: state.product.purchasedLoading,
});

export default connect(mapStateToProps, { getUserPurchasedProducts, clearAlerts })(Dashboard);
