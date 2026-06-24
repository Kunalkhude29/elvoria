const prisma = require('../lib/prisma');
const shiprocket = require('../lib/shiprocket');

// @desc    Push Order to Shiprocket
// @route   POST /api/shiprocket/order/:id
// @access  Private/Admin
const pushOrderToShiprocket = async (req, res) => {
    try {
        const orderId = Number(req.params.id);
        const { weight = 0.5, length = 10, breadth = 10, height = 10 } = req.body;

        // 1. Fetch Order from DB
        const order = await prisma.order.findUnique({
            where: { id: orderId },
            include: {
                items: {
                    include: { product: true }
                }
            }
        });

        if (!order) {
            return res.status(404).json({ message: 'Order not found' });
        }

        if (order.awbCode || order.shiprocketOrderId) {
            return res.status(400).json({ message: 'Order has already been pushed to Shiprocket.' });
        }

        // 2. Format Custom Order Payload
        // Using sensible defaults and order data
        const orderItems = order.items.map(item => ({
            name: item.product?.name || 'Unknown Product',
            sku: `SKU-${item.productId}`,
            units: item.quantity,
            selling_price: Number(item.price),
            discount: '',
            tax: '',
            hsn: ''
        }));

        const payload = {
            order_id: `ELV-${order.id}-${Date.now().toString().slice(-4)}`,
            order_date: new Date(order.createdAt).toISOString().split('T')[0],
            pickup_location: "work",
            billing_customer_name: order.customerName?.split(' ')[0] || 'Guest',
            billing_last_name: order.customerName?.split(' ')[1] || '',
            billing_address: order.shippingAddress || 'N/A',
            billing_address_2: '',
            billing_city: order.shippingCity || 'N/A',
            billing_pincode: order.shippingZip || '000000',
            billing_state: order.shippingState || 'N/A',
            billing_country: 'India',
            billing_email: order.customerEmail || 'no-reply@elvoria.com',
            billing_phone: (order.customerPhone || '0000000000').replace(/\D/g, '').slice(-10),
            shipping_is_billing: true,
            order_items: orderItems,
            payment_method: order.paymentMethod === 'COD' ? 'COD' : 'Prepaid',
            shipping_charges: 0,
            giftwrap_charges: 0,
            transaction_charges: 0,
            total_discount: 0,
            sub_total: Number(order.total),
            length: Number(length),
            breadth: Number(breadth),
            height: Number(height),
            weight: Number(weight)
        };

        // 3. Create Order in Shiprocket
        const srOrderResponse = await shiprocket.createOrder(payload);
        console.log('Create Order Response:', srOrderResponse);
        
        if (!srOrderResponse.shipment_id) {
            throw new Error(srOrderResponse.message || 'Failed to get shipment ID from Shiprocket');
        }
        
        const srOrderId = srOrderResponse.order_id;
        const srShipmentId = srOrderResponse.shipment_id;

        // 4. Auto-Generate AWB (Find cheapest courier and assign)
        const deliveryPincode = order.shippingZip || '000000';
        const pickupPincode = process.env.SHIPROCKET_PICKUP_PINCODE || '415110';
        const isCod = order.paymentMethod === 'COD' ? 1 : 0;
        
        let courierId = null;
        try {
            const serviceResponse = await shiprocket.checkServiceability(pickupPincode, deliveryPincode, Number(weight), isCod);
            if (serviceResponse.status === 200 && serviceResponse.data && serviceResponse.data.available_courier_companies && serviceResponse.data.available_courier_companies.length > 0) {
                const couriers = serviceResponse.data.available_courier_companies;
                const cheapestCourier = couriers.sort((a, b) => a.rate - b.rate)[0];
                courierId = cheapestCourier.courier_company_id;
            }
        } catch (err) {
            console.log("Serviceability check failed, falling back to default courier auto-assign.", err.message);
        }

        let awbCode = null;
        let courierName = null;
        
        try {
            const awbResponse = await shiprocket.generateAWB(srShipmentId, courierId);
            if (awbResponse.response && awbResponse.response.data && awbResponse.response.data.awb_code) {
                awbCode = awbResponse.response.data.awb_code;
                courierName = awbResponse.response.data.courier_name;
            }
        } catch (err) {
            console.error("Failed to auto-generate AWB:", err.message);
        }

        // 5. Update DB
        const updatedOrder = await prisma.order.update({
            where: { id: orderId },
            data: {
                shiprocketOrderId: srOrderId,
                shiprocketShipmentId: srShipmentId,
                ...(awbCode && { awbCode }),
                ...(courierName && { courierName }),
                shipmentStatus: awbCode ? 'AWB Generated' : 'Processing',
                status: awbCode ? 'SHIPPED' : 'PENDING',
                shipmentCreatedAt: new Date(),
            }
        });

        if (awbCode) {
            res.json({ message: `Success! Order pushed and AWB ${awbCode} generated automatically.`, order: updatedOrder });
        } else {
            res.json({ message: 'Order pushed to Shiprocket, but auto-AWB failed. Please assign courier manually in Shiprocket dashboard.', order: updatedOrder });
        }

    } catch (error) {
        console.error('Push to Shiprocket Error:', error);
        res.status(500).json({ message: error.message || 'Failed to push order to Shiprocket' });
    }
};

// @desc    Shiprocket Webhook Listener
// @route   POST /api/shiprocket/webhook
// @access  Public
const webhook = async (req, res) => {
    try {
        const { awb, current_status, order_id, courier_name } = req.body;
        
        // Shiprocket sends a header `x-api-key` which you can optionally verify
        
        if (!awb || !current_status) {
            return res.status(400).json({ message: 'Invalid payload' });
        }

        // Find the order with this shiprocketOrderId
        let order = null;
        if (order_id) {
            order = await prisma.order.findFirst({
                where: { shiprocketOrderId: Number(order_id) }
            });
        }
        
        if (!order) {
            // Fallback to awbCode if order_id is missing
            order = await prisma.order.findFirst({
                where: { awbCode: awb }
            });
        }

        if (order) {
            let appStatus = order.status;
            
            // Map Shiprocket status to app OrderStatus
            // Shiprocket statuses: PICKED UP, IN TRANSIT, OUT FOR DELIVERY, DELIVERED, RTO INITIATED, etc.
            if (current_status === 'DELIVERED') appStatus = 'DELIVERED';
            else if (current_status === 'OUT FOR DELIVERY') appStatus = 'OUT_FOR_DELIVERY';
            else if (['SHIPPED', 'IN TRANSIT', 'PICKED UP'].includes(current_status)) appStatus = 'SHIPPED';
            else if (current_status === 'CANCELED' || current_status === 'Pickup Cancelled') appStatus = 'CANCELLED';

            await prisma.order.update({
                where: { id: order.id },
                data: {
                    shipmentStatus: current_status,
                    status: appStatus,
                    awbCode: awb,
                    ...(courier_name && { courierName: courier_name })
                }
            });
        }

        // Always return 200 OK to Shiprocket to acknowledge receipt
        res.status(200).json({ message: 'Webhook received' });
    } catch (error) {
        console.error('Webhook Error:', error);
        res.status(500).json({ message: 'Webhook processing failed' });
    }
};

// Simple in-memory cache for serviceability
const serviceabilityCache = new Map();
const CACHE_TTL = 86400 * 1000; // 24 hours in milliseconds

// @desc    Check Courier Serviceability & EDD
// @route   GET /api/shiprocket/serviceability?pincode=XXXXXX
// @access  Public
const checkServiceability = async (req, res) => {
    try {
        const deliveryPincode = req.query.pincode;
        if (!deliveryPincode || deliveryPincode.length !== 6) {
            return res.status(400).json({ message: 'Valid 6-digit pincode is required' });
        }

        // Check cache first
        const cachedItem = serviceabilityCache.get(deliveryPincode);
        if (cachedItem && (Date.now() - cachedItem.timestamp < CACHE_TTL)) {
            return res.json(cachedItem.data);
        }

        const pickupPincode = process.env.SHIPROCKET_PICKUP_PINCODE || '415110';
        
        const srResponse = await shiprocket.checkServiceability(pickupPincode, deliveryPincode, 0.5, 0);

        if (srResponse.status === 200 && srResponse.data && srResponse.data.available_courier_companies && srResponse.data.available_courier_companies.length > 0) {
            // Find the cheapest courier for a more realistic/conservative estimate
            const couriers = srResponse.data.available_courier_companies;
            const cheapestCourier = couriers.sort((a, b) => a.rate - b.rate)[0];
            
            const result = {
                serviceable: true,
                estimatedDeliveryDays: cheapestCourier.estimated_delivery_days,
                estimatedDeliveryDate: cheapestCourier.etd,
                city: cheapestCourier.city,
                state: cheapestCourier.state
            };
            
            // Cache the result
            serviceabilityCache.set(deliveryPincode, { data: result, timestamp: Date.now() });
            return res.json(result);
        } else {
            const result = { serviceable: false };
            serviceabilityCache.set(deliveryPincode, { data: result, timestamp: Date.now() });
            return res.json(result);
        }
    } catch (error) {
        console.error('Serviceability Error:', error);
        res.status(500).json({ message: error.message || 'Failed to check serviceability' });
    }
};

// @desc    Track Shiprocket Order (Live Data)
// @route   GET /api/shiprocket/track/:awb
// @access  Private
const trackOrder = async (req, res) => {
    try {
        const awb = req.params.awb;
        if (!awb) {
            return res.status(400).json({ message: 'AWB code is required' });
        }

        const trackingData = await shiprocket.trackAWB(awb);
        res.json(trackingData);
    } catch (error) {
        console.error('Track Order Error:', error);
        res.status(500).json({ message: error.message || 'Failed to track order' });
    }
};

module.exports = {
    pushOrderToShiprocket,
    webhook,
    checkServiceability,
    trackOrder
};
