const axios = require('axios');
require('dotenv').config();

const SHIPROCKET_BASE_URL = 'https://apiv2.shiprocket.in/v1/external';

let cachedToken = null;
let tokenExpiry = null;

// Authenticate and get token
const getToken = async () => {
    // Return cached token if valid
    if (cachedToken && tokenExpiry && new Date() < tokenExpiry) {
        return cachedToken;
    }

    try {
        console.log(`Shiprocket API URL: ${SHIPROCKET_BASE_URL}/auth/login`);
        const response = await axios.post(`${SHIPROCKET_BASE_URL}/auth/login`, {
            email: process.env.SHIPROCKET_EMAIL,
            password: process.env.SHIPROCKET_PASSWORD,
        });

        cachedToken = response.data.token;
        // Token usually valid for 10 days, we refresh after 9 days
        const expiry = new Date();
        expiry.setDate(expiry.getDate() + 9);
        tokenExpiry = expiry;

        return cachedToken;
    } catch (error) {
        console.error('Shiprocket Auth Error:', error.response?.data || error.message);
        throw new Error('Failed to authenticate with Shiprocket');
    }
};

// Create a Custom Order
const createOrder = async (orderPayload) => {
    const token = await getToken();
    try {
        const response = await axios.post(`${SHIPROCKET_BASE_URL}/orders/create/adhoc`, orderPayload, {
            headers: {
                'Authorization': `Bearer ${token}`,
                'Content-Type': 'application/json'
            }
        });
        return response.data;
    } catch (error) {
        console.error('Shiprocket Create Order Error:', error.response?.data || error.message);
        throw error.response?.data || new Error('Failed to create order in Shiprocket');
    }
};

// Generate AWB for a Shipment
const generateAWB = async (shipmentId, courierId = null) => {
    const token = await getToken();
    try {
        const payload = { shipment_id: shipmentId };
        if (courierId) {
            payload.courier_id = courierId;
        }
        
        const response = await axios.post(`${SHIPROCKET_BASE_URL}/courier/assign/awb`, payload, {
            headers: {
                'Authorization': `Bearer ${token}`,
                'Content-Type': 'application/json'
            }
        });
        return response.data;
    } catch (error) {
        console.error('Shiprocket Generate AWB Error:', error.response?.data || error.message);
        throw error.response?.data || new Error('Failed to generate AWB');
    }
};

// Check Courier Serviceability
const checkServiceability = async (pickupPincode, deliveryPincode, weight = 0.5, cod = 0) => {
    const token = await getToken();
    try {
        const response = await axios.get(`${SHIPROCKET_BASE_URL}/courier/serviceability/`, {
            headers: {
                'Authorization': `Bearer ${token}`,
                'Content-Type': 'application/json'
            },
            params: {
                pickup_postcode: pickupPincode,
                delivery_postcode: deliveryPincode,
                weight: weight,
                cod: cod
            }
        });
        return response.data;
    } catch (error) {
        console.error('Shiprocket Serviceability Error:', error.response?.data || error.message);
        throw error.response?.data || new Error('Failed to check serviceability');
    }
};

// Track an AWB
const trackAWB = async (awb) => {
    const token = await getToken();
    try {
        const response = await axios.get(`${SHIPROCKET_BASE_URL}/courier/track/awb/${awb}`, {
            headers: {
                'Authorization': `Bearer ${token}`,
                'Content-Type': 'application/json'
            }
        });
        return response.data;
    } catch (error) {
        console.error('Shiprocket Track AWB Error:', error.response?.data || error.message);
        throw error.response?.data || new Error('Failed to track AWB');
    }
};

module.exports = {
    getToken,
    createOrder,
    generateAWB,
    checkServiceability,
    trackAWB
};
