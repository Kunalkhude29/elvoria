const { pushOrderToShiprocket } = require('./controllers/shiprocketController');

async function test() {
  const req = {
    params: { id: 35 },
    body: { weight: 0.5, length: 10, breadth: 10, height: 10 }
  };
  const res = {
    status: function(code) {
      console.log('Status:', code);
      return this;
    },
    json: function(data) {
      console.log('Response JSON:', data);
    }
  };
  
  await pushOrderToShiprocket(req, res);
}

test();
