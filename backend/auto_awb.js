const prisma = require('./lib/prisma');
const shiprocket = require('./lib/shiprocket');

async function autoAwb() {
    try {
        const orderId = 58;
        const order = await prisma.order.findUnique({ where: { id: orderId } });
        
        if (!order || !order.shiprocketShipmentId) {
            console.log("Order 58 not found or has no shipment ID");
            return;
        }

        const deliveryPincode = order.shippingZip || '000000';
        const pickupPincode = process.env.SHIPROCKET_PICKUP_PINCODE || '415110';
        
        console.log(`Checking serviceability from ${pickupPincode} to ${deliveryPincode}`);
        let courierId = null;
        try {
            const srResponse = await shiprocket.checkServiceability(pickupPincode, deliveryPincode, 0.5, 0);
            if (srResponse.status === 200 && srResponse.data && srResponse.data.available_courier_companies && srResponse.data.available_courier_companies.length > 0) {
                const couriers = srResponse.data.available_courier_companies;
                const cheapestCourier = couriers.sort((a, b) => a.rate - b.rate)[0];
                courierId = cheapestCourier.courier_company_id;
                console.log(`Cheapest Courier: ${cheapestCourier.courier_name} (ID: ${courierId}) at Rs ${cheapestCourier.rate}`);
            }
        } catch (err) {
            console.log("Could not fetch serviceability:", err.message);
        }

        console.log(`Generating AWB for shipment ${order.shiprocketShipmentId} with courier ${courierId}`);
        const awbResponse = await shiprocket.generateAWB(order.shiprocketShipmentId, courierId);
        
        console.log("AWB Response:", JSON.stringify(awbResponse, null, 2));

        if (awbResponse.response && awbResponse.response.data && awbResponse.response.data.awb_code) {
            const awbCode = awbResponse.response.data.awb_code;
            const courierName = awbResponse.response.data.courier_name;
            
            await prisma.order.update({
                where: { id: orderId },
                data: {
                    awbCode,
                    courierName,
                    shipmentStatus: 'AWB Generated',
                    status: 'SHIPPED'
                }
            });
            console.log(`Success! Assigned AWB: ${awbCode}`);
        } else {
            console.log("Failed to extract AWB from response");
        }
        
    } catch (e) {
        console.error("Error:", e.message || e);
    }
}

autoAwb();
