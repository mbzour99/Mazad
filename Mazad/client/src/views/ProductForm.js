// max character for prod name 15 chars
import React, { useState, useEffect } from 'react';
import { connect } from 'react-redux';
import axios from 'axios';
import { Navigate, useNavigate } from 'react-router-dom';
import { Fragment } from 'react';
// MUI
import {
  Box,
  Paper,
  TextField,
  Button,
  InputLabel,
  Typography,
  Input,
  Select,
} from '@mui/material';
// Files
import Alert from '../components/Alert';
import {
  boxStyle,
  productFormArea,
  formComponent,
  formTextField,
  formSubmitButtonContainer,
} from '../components/css/productStyles';
import LoadingDisplay from '../components/LoadingDisplay';
// Actions
import { postProduct } from '../actions/product';
import { setAlert, clearAlerts } from '../actions/alert';

const ProductForm = (props) => {
  const [form, setForm] = useState({
    productName: '',
    description: '',
    basePrice: 0,
    duration: 300,
    category: '',
    image: '',
  });
  const [file, setFile] = useState('');
  const [fileName, setFileName] = useState('Choose your image file...');
  const [fileValid, setFileValid] = useState(true);
  const [uploading, setUploading] = useState(false);
  let navigate = useNavigate();

  useEffect(() => {
    return () => {
      props.clearAlerts();
    };
  }, []);

  const handleFormChange = (e) => {
    e.preventDefault();
    setForm({
      ...form,
      [e.target.name]: e.target.value,
    });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    // Check for empty fields
    if (form.productName === '') {
      return props.setAlert('Product name required!');
    }
    if (form.productName.length > 10 ) {
      return props.setAlert('Product name must not exceed ten characters!');
    }
    if (form.basePrice.toString() === '0') {
      return props.setAlert('Base price required!');
    }
    if (form.duration.toString() === '0') {
      setForm({ ...form, duration: 300 });
    }
    if (!fileValid) {
      // if selected file is not image/exceeds size limit
      props.setAlert('Image file not valid!', 'error');
    } else {
      if (file === '') {
        // submit without photo
        await props.postProduct(form);
        navigate('/');
      } else {
        // with photo
        const imagePath = await uploadImage();
        console.log(imagePath);
        if (imagePath) {
          await props.postProduct({ ...form, image: imagePath });
          navigate('/');
        }
      }
    }
  };

  const fileSelected = (e) => {
    let filesize = (e.target.files[0].size / (1024 * 1024)).toFixed(3);
    let fileType = e.target.files[0].type.toString();
    let regex = /^image\/(png|jpg|jpeg|gif)$/;
    // if (fileType !== 'image/jpeg' && fileType !== 'image/png') {
    if (!regex.test(fileType)) {
      props.setAlert('Image must be of type JPEG, PNG or GIF');
      setFile('');
      setFileValid(false);
    } else if (filesize > 3) {
      props.setAlert('Image size must be less than 3 MB', 'error');
      setFile('');
      setFileValid(false);
    } else {
      setFileValid(true);
      setFile(e.target.files[0]);
      setFileName(e.target.files[0].name);
    }
  };

  const uploadImage = async () => {
    setUploading(true);
    const formData = new FormData();
    formData.append('image', file);
    try {
      const res = await axios.post(
        `${process.env.REACT_APP_API_BASE_URL}/upload/image`,
        formData,
        { headers: { 'Content-Type': 'multipart/form-data' } }
      );
      return res.data.imagePath;
    } catch (error) {
      console.log(error);
      setUploading(false);
      props.setAlert('File upload failed', 'error');
    }
  };

  // Check if user is logged
  if (!props.isAuth) {
    return <Navigate to='/login' />;
  }

  return (
    <Fragment>
      <Box sx={boxStyle}>
        <Paper sx={productFormArea}>
          {/* Page title */}
          <Typography variant='h4'>Post a product</Typography>
          <Alert />

          {/* Form */}
          <Box sx={formComponent}>
            <InputLabel>Product Name*</InputLabel>
            <TextField
              name='productName'
              placeholder='Title'
              onChange={(e) => {
                handleFormChange(e);
              }}
              size='small'
              sx={formTextField}
            ></TextField>
          </Box>

          <Box sx={formComponent}>
            <InputLabel>Description</InputLabel>
            <TextField
              name='description'
              multiline
              placeholder='Product description'
              onChange={(e) => handleFormChange(e)}
              size='small'
              rows={3}
              sx={formTextField}
            />
          </Box>

          <Box sx={formComponent}>
            <InputLabel>Base Price*</InputLabel>
            <TextField
              name='basePrice'
              onChange={(e) => {
                handleFormChange(e);
              }}
              size='small'
              placeholder='Auction will start from this price point.'
              sx={formTextField}
            ></TextField>
          </Box>

          <Box sx={formComponent}>
            <InputLabel>Duration</InputLabel>
            <TextField
              name='duration'
              onChange={(e) => {
                handleFormChange(e);
              }}
              size='small'
              placeholder='Duration in seconds'
              sx={formTextField}
            ></TextField>
          </Box>

          <Box sx={formComponent}>
            <InputLabel>Category</InputLabel>
            <select
              name='category'
              onChange={(e) => {
                handleFormChange(e);
              }}
              size='small'
              defaultValue="subhi"
              placeholder='Choose a category..'
              sx={formTextField}
            >
              <option value="subhi" disabled>Choose Category</option>
              <option value="Celebrity's Product">Celebrity's Product</option>
              <option value="Art">Art</option>
              <option value="Property">Property</option>
              <option value="Jewelry">Jewelry</option>
              <option value="Vehicles">Vehicles</option>
              <option value="Sports equipment">Sports equipment</option>
              <option value="Industrial equipment">Industrial equipment</option>
              <option value="Machinery">Machinery</option>
              <option value="Rare&Old Heritage">Rare&Old Heritage</option>
              <option value="Other">Other</option>
            </select>
          </Box>

          {uploading ? (
            <LoadingDisplay />
          ) : (
            <Box sx={formComponent}>
              <InputLabel>Upload image</InputLabel>
              <Input
                name='uploaded_file'
                type='file'
                id='imageFile'
                onChange={fileSelected}
                fullWidth
              />
              {file === '' && (
                <Typography variant='caption'>jpg, png or gif maximum 3 MB</Typography>
              )}
              {/* <label htmlFor='imageFile'>{fileName}</label> */}
            </Box>
          )}

          <Box sx={formSubmitButtonContainer}>
            {!uploading && (
              <Button variant='contained' onClick={(e) => handleSubmit(e)}>
                Submit
              </Button>
            )}
          </Box>
        </Paper>
      </Box>
    </Fragment>
  );
};

const mapStateToProps = (state) => ({
  loading: state.auth.loading,
  isAuth: state.auth.isAuthenticated,
});

export default connect(mapStateToProps, { postProduct, setAlert, clearAlerts })(ProductForm);
