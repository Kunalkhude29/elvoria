// Mock product data for luxury jewellery e-commerce
export const products = [
    // Wedding Collection
    {
        id: 'wed-001',
        name: 'Eternal Diamond Ring',
        price: 125000,
        material: '18K Gold • Diamond',
        collection: 'wedding',
        description: 'A timeless solitaire diamond ring crafted in lustrous 18K gold. The brilliant-cut diamond catches light from every angle, symbolizing eternal love and commitment.',
        images: [
            'https://images.unsplash.com/photo-1605100804763-247f67b3557e?w=800',
            'https://images.unsplash.com/photo-1606800052052-a08af7148866?w=800'
        ],
        sizes: ['10', '12', '14', '16', '18'],
        stock: 15,
        tag: 'Bestseller',
        purity: '18K',
        weight: '3.2g'
    },
    {
        id: 'wed-002',
        name: 'Regal Bridal Necklace',
        price: 285000,
        material: '22K Gold • Diamond',
        collection: 'wedding',
        description: 'An exquisite bridal necklace featuring intricate gold work and sparkling diamonds. Perfect for your special day.',
        images: [
            'https://images.unsplash.com/photo-1515562141207-7a88fb7ce338?w=800',
            'https://images.unsplash.com/photo-1599643478518-a784e5dc4c8f?w=800'
        ],
        sizes: ['Standard'],
        stock: 8,
        tag: 'New',
        purity: '22K',
        weight: '45.5g'
    },
    {
        id: 'wed-003',
        name: 'Heritage Gold Bangles',
        price: 156000,
        material: '22K Gold',
        collection: 'wedding',
        description: 'Traditional gold bangles with contemporary design elements. Set of 2 bangles.',
        images: [
            'https://images.unsplash.com/photo-1611652022419-a9419f74343a?w=800',
            'https://images.unsplash.com/photo-1630019852942-f8846c90f82c?w=800'
        ],
        sizes: ['2.4', '2.6', '2.8'],
        stock: 12,
        purity: '22K',
        weight: '38.2g'
    },
    {
        id: 'wed-004',
        name: 'Classic Pearl Earrings',
        price: 45000,
        material: '18K Gold • Pearl',
        collection: 'wedding',
        description: 'Elegant pearl drop earrings set in 18K gold. Timeless beauty for any occasion.',
        images: [
            'https://images.unsplash.com/photo-1535632066927-ab7c9ab60908?w=800',
            'https://images.unsplash.com/photo-1617038260897-41a1f14a8ca0?w=800'
        ],
        sizes: ['Standard'],
        stock: 20,
        purity: '18K',
        weight: '5.6g'
    },

    // Daily Wear Collection
    {
        id: 'daily-001',
        name: 'Delicate Chain Bracelet',
        price: 22000,
        material: '14K Gold',
        collection: 'daily-wear',
        description: 'Minimalist gold chain bracelet perfect for everyday elegance. Lightweight and comfortable.',
        images: [
            'https://images.unsplash.com/photo-1611591437281-460bfbe1220a?w=800',
            'https://images.unsplash.com/photo-1602173574767-37ac01994b2a?w=800'
        ],
        sizes: ['6"', '7"', '8"'],
        stock: 25,
        tag: 'Bestseller',
        purity: '14K',
        weight: '2.8g'
    },
    {
        id: 'daily-002',
        name: 'Simple Gold Hoops',
        price: 18500,
        material: '14K Gold',
        collection: 'daily-wear',
        description: 'Classic gold hoop earrings that complement any outfit. A wardrobe essential.',
        images: [
            'https://images.unsplash.com/photo-1535556116002-6281ff3e9f35?w=800',
            'https://images.unsplash.com/photo-1588444837495-c6c43826aff1?w=800'
        ],
        sizes: ['Small', 'Medium', 'Large'],
        stock: 30,
        purity: '14K',
        weight: '3.1g'
    },
    {
        id: 'daily-003',
        name: 'Petite Diamond Studs',
        price: 35000,
        material: '18K Gold • Diamond',
        collection: 'daily-wear',
        description: 'Sparkling diamond studs in 18K gold. Perfect for daily sophistication.',
        images: [
            'https://images.unsplash.com/photo-1599643477877-530eb83abc8e?w=800',
            'https://images.unsplash.com/photo-1611652022419-a9419f74343a?w=800'
        ],
        sizes: ['Standard'],
        stock: 18,
        tag: 'Bestseller',
        purity: '18K',
        weight: '1.9g'
    },
    {
        id: 'daily-004',
        name: 'Layered Chain Necklace',
        price: 28000,
        material: '14K Gold',
        collection: 'daily-wear',
        description: 'Trendy layered chain necklace for modern styling. Adjustable length.',
        images: [
            'https://images.unsplash.com/photo-1599458448541-5f94b80525c3?w=800',
            'https://images.unsplash.com/photo-1506630448388-4e683c67ddb0?w=800'
        ],
        sizes: ['16-18"'],
        stock: 22,
        purity: '14K',
        weight: '4.2g'
    },
    {
        id: 'daily-005',
        name: 'Minimalist Gold Ring',
        price: 15000,
        material: '14K Gold',
        collection: 'daily-wear',
        description: 'Simple gold band with subtle texture. Perfect for stacking or wearing alone.',
        images: [
            'https://images.unsplash.com/photo-1603561591411-07134e71a2a9?w=800',
            'https://images.unsplash.com/photo-1515562141207-7a88fb7ce338?w=800'
        ],
        sizes: ['10', '12', '14', '16', '18'],
        stock: 35,
        purity: '14K',
        weight: '2.1g'
    },

    // Gifting Collection
    {
        id: 'gift-001',
        name: 'Infinity Love Pendant',
        price: 32000,
        material: '18K Gold • Diamond',
        collection: 'gifting',
        description: 'Beautiful infinity symbol pendant with diamonds. Symbolizing endless love.',
        images: [
            'https://images.unsplash.com/photo-1599643477877-530eb83abc8e?w=800',
            'https://images.unsplash.com/photo-1611652022419-a9419f74343a?w=800'
        ],
        sizes: ['16"', '18"'],
        stock: 16,
        tag: 'Bestseller',
        purity: '18K',
        weight: '3.5g'
    },
    {
        id: 'gift-002',
        name: 'Heart Locket',
        price: 42000,
        material: '22K Gold',
        collection: 'gifting',
        description: 'Classic heart-shaped locket to treasure precious memories. Opens to hold photos.',
        images: [
            'https://images.unsplash.com/photo-1599643478518-a784e5dc4c8f?w=800',
            'https://images.unsplash.com/photo-1515562141207-7a88fb7ce338?w=800'
        ],
        sizes: ['Standard'],
        stock: 14,
        purity: '22K',
        weight: '6.8g'
    },
    {
        id: 'gift-003',
        name: 'Personalized Name Bracelet',
        price: 38000,
        material: '18K Gold',
        collection: 'gifting',
        description: 'Customizable name bracelet in elegant script. A thoughtful personal gift.',
        images: [
            'https://images.unsplash.com/photo-1611591437281-460bfbe1220a?w=800',
            'https://images.unsplash.com/photo-1602173574767-37ac01994b2a?w=800'
        ],
        sizes: ['Adjustable'],
        stock: 10,
        tag: 'New',
        purity: '18K',
        weight: '4.5g'
    },
    {
        id: 'gift-004',
        name: 'Charm Bracelet Set',
        price: 55000,
        material: '18K Gold',
        collection: 'gifting',
        description: 'Delightful charm bracelet with 5 interchangeable charms. Express your story.',
        images: [
            'https://images.unsplash.com/photo-1611652022419-a9419f74343a?w=800',
            'https://images.unsplash.com/photo-1630019852942-f8846c90f82c?w=800'
        ],
        sizes: ['6"', '7"', '8"'],
        stock: 12,
        purity: '18K',
        weight: '7.2g'
    },

    // Minimal Gold Collection
    {
        id: 'minimal-001',
        name: 'Thread Thin Bangle',
        price: 19000,
        material: '14K Gold',
        collection: 'minimal-gold',
        description: 'Ultra-thin gold bangle for the minimalist aesthetic. Stackable design.',
        images: [
            'https://images.unsplash.com/photo-1611652022419-a9419f74343a?w=800',
            'https://images.unsplash.com/photo-1630019852942-f8846c90f82c?w=800'
        ],
        sizes: ['2.4', '2.6', '2.8'],
        stock: 28,
        tag: 'Bestseller',
        purity: '14K',
        weight: '1.8g'
    },
    {
        id: 'minimal-002',
        name: 'Geometric Ear Cuff',
        price: 12000,
        material: '14K Gold',
        collection: 'minimal-gold',
        description: 'Modern geometric ear cuff. No piercing required.',
        images: [
            'https://images.unsplash.com/photo-1535556116002-6281ff3e9f35?w=800',
            'https://images.unsplash.com/photo-1588444837495-c6c43826aff1?w=800'
        ],
        sizes: ['Universal'],
        stock: 20,
        purity: '14K',
        weight: '1.2g'
    },
    {
        id: 'minimal-003',
        name: 'Bar Pendant Necklace',
        price: 24000,
        material: '14K Gold',
        collection: 'minimal-gold',
        description: 'Sleek horizontal bar pendant. Contemporary and versatile.',
        images: [
            'https://images.unsplash.com/photo-1599458448541-5f94b80525c3?w=800',
            'https://images.unsplash.com/photo-1506630448388-4e683c67ddb0?w=800'
        ],
        sizes: ['16"', '18"'],
        stock: 24,
        purity: '14K',
        weight: '2.5g'
    },
    {
        id: 'minimal-004',
        name: 'Tiny Circle Studs',
        price: 9500,
        material: '14K Gold',
        collection: 'minimal-gold',
        description: 'Delicate circle stud earrings. Understated elegance.',
        images: [
            'https://images.unsplash.com/photo-1599643477877-530eb83abc8e?w=800',
            'https://images.unsplash.com/photo-1611652022419-a9419f74343a?w=800'
        ],
        sizes: ['Standard'],
        stock: 40,
        purity: '14K',
        weight: '0.9g'
    },

    // Festive Edit Collection
    {
        id: 'festive-001',
        name: 'Temple Jewelry Set',
        price: 198000,
        material: '22K Gold',
        collection: 'festive',
        description: 'Traditional temple jewelry set including necklace and earrings. Rich cultural heritage.',
        images: [
            'https://images.unsplash.com/photo-1515562141207-7a88fb7ce338?w=800',
            'https://images.unsplash.com/photo-1599643478518-a784e5dc4c8f?w=800'
        ],
        sizes: ['Standard'],
        stock: 6,
        tag: 'New',
        purity: '22K',
        weight: '52.3g'
    },
    {
        id: 'festive-002',
        name: 'Kundan Chandbali Earrings',
        price: 75000,
        material: '22K Gold • Kundan',
        collection: 'festive',
        description: 'Stunning Kundan chandbali earrings perfect for festivities.',
        images: [
            'https://images.unsplash.com/photo-1535632066927-ab7c9ab60908?w=800',
            'https://images.unsplash.com/photo-1617038260897-41a1f14a8ca0?w=800'
        ],
        sizes: ['Standard'],
        stock: 10,
        purity: '22K',
        weight: '18.5g'
    },
    {
        id: 'festive-003',
        name: 'Statement Choker',
        price: 245000,
        material: '22K Gold • Diamond',
        collection: 'festive',
        description: 'Bold choker necklace with diamonds. Make a grand entrance.',
        images: [
            'https://images.unsplash.com/photo-1515562141207-7a88fb7ce338?w=800',
            'https://images.unsplash.com/photo-1599643478518-a784e5dc4c8f?w=800'
        ],
        sizes: ['Standard'],
        stock: 5,
        tag: 'Bestseller',
        purity: '22K',
        weight: '58.7g'
    },
    {
        id: 'festive-004',
        name: 'Antique Finish Jhumkas',
        price: 48000,
        material: '22K Gold',
        collection: 'festive',
        description: 'Traditional jhumka earrings with antique gold finish.',
        images: [
            'https://images.unsplash.com/photo-1535556116002-6281ff3e9f35?w=800',
            'https://images.unsplash.com/photo-1588444837495-c6c43826aff1?w=800'
        ],
        sizes: ['Standard'],
        stock: 15,
        purity: '22K',
        weight: '12.4g'
    }
];

// Helper functions
export const getProductById = (id) => {
    return products.find(product => product.id === id);
};

export const getProductsByCollection = (collection) => {
    if (!collection) return products;
    return products.filter(product => product.collection === collection);
};

export const getProductsByMaterial = (material) => {
    return products.filter(product =>
        product.material.toLowerCase().includes(material.toLowerCase())
    );
};

export const getBestSellers = () => {
    return products.filter(product => product.tag === 'Bestseller');
};

export const getNewArrivals = () => {
    return products.filter(product => product.tag === 'New');
};

export const collections = [
    { id: 'wedding', name: 'Wedding Collection', description: 'Celebrate your special day' },
    { id: 'daily-wear', name: 'Daily Wear', description: 'Elegant everyday pieces' },
    { id: 'gifting', name: 'Gifting', description: 'Perfect presents for loved ones' },
    { id: 'minimal-gold', name: 'Minimal Gold', description: 'Contemporary simplicity' },
    { id: 'festive', name: 'Festive Edit', description: 'Traditional grandeur' }
];
