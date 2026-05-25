
const fetch = require('node-fetch');

async function testCreateOrder() {
    const BASE_URL = 'http://localhost:5001';
    const payload = {
        orderItems: [{
            productId: 1, // Change this to a real product ID if known
            quantity: 1,
            price: 999
        }],
        totalPrice: 999,
        customerName: 'Test User',
        customerPhone: '9999999999',
        customerEmail: 'test@example.com',
        shippingAddress: '123 Test St',
        shippingCity: 'Test City',
        shippingState: 'Test State',
        shippingZip: '110001'
    };

    try {
        const res = await fetch(`${BASE_URL}/api/payments/razorpay/create-order`, {
            method: 'POST',
            headers: { 
                'Content-Type': 'application/json',
                'Authorization': 'Bearer YOUR_TOKEN_HERE' // Need a valid token
            },
            body: JSON.stringify(payload)
        });

        const data = await res.json();
        console.log('Status:', res.status);
        console.log('Data:', data);
    } catch (error) {
        console.error('Error:', error);
    }
}

// Instead of running this, I'll just look at the backend code and logs.
