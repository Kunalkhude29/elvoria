require('dotenv').config({ path: '.env' });
const shiprocket = require('./lib/shiprocket');

(async () => {
  try {
    const srResponse = await shiprocket.checkServiceability('415110', '411038', 0.5, 0);
    const couriers = srResponse.data.available_courier_companies.map(c => ({
      name: c.courier_name,
      etd: c.etd,
      days: c.estimated_delivery_days,
      rate: c.rate
    }));
    console.log(JSON.stringify(couriers, null, 2));
  } catch (err) {
    console.error(err);
  }
})();
