import React, { Fragment, useEffect, useState } from 'react';
import axios from 'axios';
// Components
import LoadingDisplay from './LoadingDisplay';
import Card from './Card';
import { Button, Box, ButtonGroup } from '@mui/material';
// Styling
import { boardStyle, productAreaStyle, paginationStyle, dashCardStyle } from './css/dashStyle';

const DashboardProductList = () => {
  const [products, setProducts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [pageNumber, setPageNumber] = useState(1);
  const [productPerPage] = useState(4);

  useEffect(() => {
    setLoading(true);
    const fetchData = async () => {
      const res = await axios.get(
        `${process.env.REACT_APP_API_BASE_URL}/user/products/posted`
      );
      setProducts(res.data);
      setLoading(false);
    };
    fetchData();
  }, []);

  // Pagination
  let lastProductIndex = pageNumber * productPerPage;
  let firstProductIndex = lastProductIndex - productPerPage;
  let pageNumbers = [];
  const num = Math.ceil(products.length / productPerPage);
  for (let i = 1; i <= num; i++) {
    pageNumbers.push(i);
  }
  const clickPageNumberButton = (num) => {
    setPageNumber(num);
  };

  return loading ? (
    <LoadingDisplay />
  ) : (
    <Fragment>
      <Box sx={boardStyle}>
        <Box sx={productAreaStyle}>
          {products.slice(firstProductIndex, lastProductIndex).map((product) => {
            return (
              <div className='product__container' key={product._id}>
                <Card product={product} key={product._id} dashCard={true} cardStyle={dashCardStyle} />
              </div>
            );
          })}
        </Box>
        {products.length !== 0 && (
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
        )}
      </Box>
    </Fragment>
  );
};

export default DashboardProductList;
