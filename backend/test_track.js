require('dotenv').config({ path: '.env' });
const shiprocket = require('./lib/shiprocket');

(async () => {
  try {
    const srResponse = await shiprocket.trackAWB('90556186582');
    console.log(JSON.stringify(srResponse, null, 2));
  } catch (err) {
    console.error(err);
  }
})();
