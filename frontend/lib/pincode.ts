export interface PincodeResponse {
    isValid: boolean;
    isVerified?: boolean;
    city?: string;
    district?: string;
    state?: string;
    error?: string;
}

/**
 * fetchPincodeDetails(pincode)
 * Calls the Elvoria backend PIN lookup endpoint — fully offline, no external APIs.
 * Signature is identical to the previous implementation; all call sites unchanged.
 */
export const fetchPincodeDetails = async (pincode: string): Promise<PincodeResponse> => {
    if (!/^\d{6}$/.test(pincode)) {
        return { isValid: false, error: 'PIN code must be 6 digits' };
    }

    try {
        const BASE_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:5001';
        const res = await fetch(`${BASE_URL}/api/pincode/${pincode}`);
        const data: PincodeResponse = await res.json();
        return data;
    } catch (error) {
        console.error('Error fetching PIN code details:', error);
        return { isValid: false, error: 'Error fetching PIN code details' };
    }
};
