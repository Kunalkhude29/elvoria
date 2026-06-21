const { pushOrderToShiprocket } = require('./controllers/shiprocketController');
const shiprocket = require('./lib/shiprocket');

async function test() {
  const req = {
    params: { id: 35 },
    body: { weight: 0.5, length: 10, breadth: 10, height: 10 }
  };
  const res = {
    status: function(code) { return this; },
    json: function(data) {
      console.log('Response JSON:', data);
    }
  };
  
  // Let's modify the controller code directly in test to see the object
  // Just print the error from Shiprocket manually
  try {
    const payload = {
            order_id: `ELV-TEST-99`,
            order_date: new Date().toISOString().split('T')[0],
            pickup_location: "INVALID_LOCATION_123",
            billing_customer_name: "Test",
            billing_last_name: "User",
            billing_address: "Test",
            billing_address_2: '',
            billing_city: "Test",
            billing_pincode: "000000",
            billing_state: "Test",
            billing_country: 'India',
            billing_email: "test@test.com",
            billing_phone: "7758068123",
            shipping_is_billing: true,
            order_items: [{name:"T", sku:"T", units:1, selling_price:10}],
            payment_method: 'Prepaid',
            shipping_charges: 0,
            giftwrap_charges: 0,
            transaction_charges: 0,
            total_discount: 0,
            sub_total: 10,
            length: 10,
            breadth: 10,
            height: 10,
            weight: 0.5
        };
    const response = await shiprocket.createOrder(payload);
    console.log(JSON.stringify(response, null, 2));
  } catch (error) {
    console.log(error);
  }
}

test();
