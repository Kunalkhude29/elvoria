export interface Product {
    id: string;
    name: string;
    price: number;
    image: string;
    images?: string[];
    description?: string;
    stock?: number;
    category: string;
    isNew?: boolean;
    isSale?: boolean;
}

export const ALL_PRODUCTS: Product[] = [
    { id: '1', name: 'Circle of Light Earrings', price: 129.00, image: '/images/product-1.png', category: 'Earrings', isNew: true },
    { id: '2', name: 'Blue Stripe & Stone Earrings', price: 249.00, image: '/images/product-2.png', category: 'Earrings', isSale: true },
    { id: '3', name: 'Bridal Paradise Pendant', price: 185.00, image: '/images/product-3.png', category: 'Necklaces' },
    { id: '4', name: 'Timeless Diamond Trio Ring', price: 549.00, image: '/images/product-4.png', category: 'Rings' },
    { id: '5', name: 'Golden Hour Bracelet', price: 320.00, image: '/images/product-1.png', category: 'Bracelets' },
    { id: '6', name: 'Midnight Pearl Necklace', price: 210.00, image: '/images/product-3.png', category: 'Necklaces' },
];
