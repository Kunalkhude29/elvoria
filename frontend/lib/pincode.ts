export interface PincodeResponse {
    isValid: boolean;
    city?: string;
    state?: string;
    error?: string;
}

export const fetchPincodeDetails = async (pincode: string): Promise<PincodeResponse> => {
    if (!/^\d{6}$/.test(pincode)) {
        return { isValid: false, error: 'PIN code must be 6 digits' };
    }

    try {
        const res = await fetch(`https://api.postalpincode.in/pincode/${pincode}`);
        const data = await res.json();

        if (data && data[0] && data[0].Status === 'Success' && data[0].PostOffice && data[0].PostOffice.length > 0) {
            const postOffice = data[0].PostOffice[0];
            return {
                isValid: true,
                city: postOffice.District,
                state: postOffice.State
            };
        } else {
            return { isValid: false, error: 'Invalid PIN code' };
        }
    } catch (error) {
        console.error('Error fetching PIN code details:', error);
        return { isValid: false, error: 'Error fetching PIN code details' };
    }
};
