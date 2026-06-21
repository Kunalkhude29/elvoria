const axios = require('axios');
require('dotenv').config();

async function test() {
  try {
    const response = await axios.post('https://apiv2.shiprocket.in/v1/external/auth/login', {
      email: process.env.SHIPROCKET_EMAIL,
      password: process.env.SHIPROCKET_PASSWORD,
    });
    console.log('Success:', response.data);
  } catch (error) {
    console.log('Error Data:', error.response?.data);
    console.log('Error Status:', error.response?.status);
  }
}
test();
