const prisma = require('./lib/prisma');
const axios = require('axios');
const shiprocket = require('./lib/shiprocket');

async function syncAWB() {
    try {
        console.log('Fetching orders from DB...');
        const orders = await prisma.order.findMany({
            where: {
                shiprocketOrderId: { not: null }
            }
        });

        console.log(`Found ${orders.length} orders to sync.`);
        
        if (orders.length === 0) return;

        const token = await shiprocket.getToken();

        for (const order of orders) {
            console.log(`Checking order ${order.id} (Shiprocket ID: ${order.shiprocketOrderId})...`);
            try {
                const response = await axios.get(`https://apiv2.shiprocket.in/v1/external/orders/show/${order.shiprocketOrderId}`, {
                    headers: { 'Authorization': `Bearer ${token}` }
                });

                const data = response.data.data;
                const awb = data.awb_data?.awb || data.awb_code; // some endpoints use awb_data.awb
                const courierName = data.courier_name || data.courier;
                const status = data.status;

                if (awb) {
                    console.log(`Found AWB ${awb} for order ${order.id}. Updating...`);
                    
                    let appStatus = order.status;
                    if (status === 'DELIVERED') appStatus = 'DELIVERED';
                    else if (status === 'OUT FOR DELIVERY') appStatus = 'OUT_FOR_DELIVERY';
                    else if (['SHIPPED', 'IN TRANSIT', 'PICKED UP'].includes(status)) appStatus = 'SHIPPED';
                    else if (status === 'CANCELED' || status === 'Pickup Cancelled') appStatus = 'CANCELLED';

                    await prisma.order.update({
                        where: { id: order.id },
                        data: {
                            awbCode: awb,
                            ...(courierName && { courierName }),
                            ...(status && { shipmentStatus: status }),
                            status: appStatus
                        }
                    });
                } else {
                    console.log(`No AWB found for order ${order.id} yet. You need to assign a courier in Shiprocket dashboard.`);
                }
            } catch (err) {
                console.log(`Failed to fetch from Shiprocket for order ${order.id}:`, err.response?.data || err.message);
            }
        }
        console.log('Done!');
    } catch (e) {
        console.error('Script failed:', e);
    }
}

syncAWB();
