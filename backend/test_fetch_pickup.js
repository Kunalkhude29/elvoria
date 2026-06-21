const axios = require('axios');
const shiprocket = require('./lib/shiprocket');

async function test() {
  try {
    const token = await shiprocket.getToken();
    const response = await axios.get('https://apiv2.shiprocket.in/v1/external/settings/company/pickup', {
      headers: { Authorization: `Bearer ${token}` }
    });
    console.log(JSON.stringify(response.data, null, 2));
  } catch (error) {
    console.log(error);
  }
}

test();
