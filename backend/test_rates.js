const shiprocket = require('./lib/shiprocket');

async function testRates() {
    const pickupPincode = '415110';
    const deliveryPincode = '411038'; // from the screenshot
    const weight = 0.5;

    console.log("Fetching PREPAID rates (cod=0):");
    try {
        const prep = await shiprocket.checkServiceability(pickupPincode, deliveryPincode, weight, 0);
        if (prep.data && prep.data.available_courier_companies) {
            prep.data.available_courier_companies.sort((a,b) => a.rate - b.rate).forEach(c => {
                console.log(`- ${c.courier_name}: ₹${c.rate} (Freight: ₹${c.freight_charge}, COD: ₹${c.cod_charges})`);
            });
        }
    } catch(e) { console.log(e.message); }

    console.log("\nFetching COD rates (cod=1):");
    try {
        const cod = await shiprocket.checkServiceability(pickupPincode, deliveryPincode, weight, 1);
        if (cod.data && cod.data.available_courier_companies) {
            cod.data.available_courier_companies.sort((a,b) => a.rate - b.rate).forEach(c => {
                console.log(`- ${c.courier_name}: ₹${c.rate} (Freight: ₹${c.freight_charge}, COD: ₹${c.cod_charges})`);
            });
        }
    } catch(e) { console.log(e.message); }
}

testRates();
