import React, { createContext, useContext, useState, useEffect } from 'react';
import { products } from '../data/products';

const AppContext = createContext();

export const useApp = () => {
    const context = useContext(AppContext);
    if (!context) {
        throw new Error('useApp must be used within AppProvider');
    }
    return context;
};

export const AppProvider = ({ children }) => {
    // Load initial state from localStorage
    const [cart, setCart] = useState(() => {
        const saved = localStorage.getItem('luxe-cart');
        return saved ? JSON.parse(saved) : [];
    });

    const [wishlist, setWishlist] = useState(() => {
        const saved = localStorage.getItem('luxe-wishlist');
        return saved ? JSON.parse(saved) : [];
    });

    const [user, setUser] = useState(() => {
        const saved = localStorage.getItem('luxe-user');
        return saved ? JSON.parse(saved) : null;
    });

    const [orders, setOrders] = useState(() => {
        const saved = localStorage.getItem('luxe-orders');
        return saved ? JSON.parse(saved) : [];
    });

    const [adminAuth, setAdminAuth] = useState(() => {
        const saved = localStorage.getItem('luxe-admin-auth');
        return saved === 'true';
    });

    const [productsData, setProductsData] = useState(() => {
        const saved = localStorage.getItem('luxe-products');
        return saved ? JSON.parse(saved) : products;
    });

    // Persist to localStorage
    useEffect(() => {
        localStorage.setItem('luxe-cart', JSON.stringify(cart));
    }, [cart]);

    useEffect(() => {
        localStorage.setItem('luxe-wishlist', JSON.stringify(wishlist));
    }, [wishlist]);

    useEffect(() => {
        if (user) {
            localStorage.setItem('luxe-user', JSON.stringify(user));
        } else {
            localStorage.removeItem('luxe-user');
        }
    }, [user]);

    useEffect(() => {
        localStorage.setItem('luxe-orders', JSON.stringify(orders));
    }, [orders]);

    useEffect(() => {
        localStorage.setItem('luxe-admin-auth', adminAuth.toString());
    }, [adminAuth]);

    useEffect(() => {
        localStorage.setItem('luxe-products', JSON.stringify(productsData));
    }, [productsData]);

    // Cart functions
    const addToCart = (product, quantity = 1, size = null) => {
        setCart(prevCart => {
            const existingItem = prevCart.find(
                item => item.id === product.id && item.size === size
            );

            if (existingItem) {
                return prevCart.map(item =>
                    item.id === product.id && item.size === size
                        ? { ...item, quantity: item.quantity + quantity }
                        : item
                );
            }

            return [...prevCart, { ...product, quantity, size }];
        });
    };

    const removeFromCart = (productId, size = null) => {
        setCart(prevCart =>
            prevCart.filter(item => !(item.id === productId && item.size === size))
        );
    };

    const updateCartQuantity = (productId, quantity, size = null) => {
        if (quantity === 0) {
            removeFromCart(productId, size);
            return;
        }

        setCart(prevCart =>
            prevCart.map(item =>
                item.id === productId && item.size === size
                    ? { ...item, quantity }
                    : item
            )
        );
    };

    const clearCart = () => {
        setCart([]);
    };

    const getCartTotal = () => {
        return cart.reduce((total, item) => total + item.price * item.quantity, 0);
    };

    const getCartCount = () => {
        return cart.reduce((count, item) => count + item.quantity, 0);
    };

    // Wishlist functions
    const addToWishlist = (product) => {
        setWishlist(prevWishlist => {
            if (prevWishlist.some(item => item.id === product.id)) {
                return prevWishlist;
            }
            return [...prevWishlist, product];
        });
    };

    const removeFromWishlist = (productId) => {
        setWishlist(prevWishlist =>
            prevWishlist.filter(item => item.id !== productId)
        );
    };

    const isInWishlist = (productId) => {
        return wishlist.some(item => item.id === productId);
    };

    // User authentication
    const login = (email, password) => {
        // Simple mock authentication
        const userData = {
            id: 'user-' + Date.now(),
            email,
            name: email.split('@')[0],
            createdAt: new Date().toISOString()
        };
        setUser(userData);
        return userData;
    };

    const register = (email, password, name) => {
        const userData = {
            id: 'user-' + Date.now(),
            email,
            name,
            createdAt: new Date().toISOString()
        };
        setUser(userData);
        return userData;
    };

    const logout = () => {
        setUser(null);
    };

    // Admin authentication
    const adminLogin = (password) => {
        // Simple password check for demo (in production, use proper backend auth)
        if (password === 'admin123') {
            setAdminAuth(true);
            return true;
        }
        return false;
    };

    const adminLogout = () => {
        setAdminAuth(false);
    };

    // Order management
    const createOrder = (orderData) => {
        const newOrder = {
            id: 'order-' + Date.now(),
            ...orderData,
            items: [...cart],
            total: getCartTotal(),
            status: 'pending',
            createdAt: new Date().toISOString()
        };
        setOrders(prevOrders => [...prevOrders, newOrder]);
        clearCart();
        return newOrder;
    };

    const updateOrderStatus = (orderId, status) => {
        setOrders(prevOrders =>
            prevOrders.map(order =>
                order.id === orderId ? { ...order, status } : order
            )
        );
    };

    // Product management (Admin)
    const addProduct = (productData) => {
        const newProduct = {
            id: `custom-${Date.now()}`,
            ...productData,
            createdAt: new Date().toISOString()
        };
        setProductsData(prevProducts => [...prevProducts, newProduct]);
        return newProduct;
    };

    const updateProduct = (productId, productData) => {
        setProductsData(prevProducts =>
            prevProducts.map(product =>
                product.id === productId ? { ...product, ...productData } : product
            )
        );
    };

    const deleteProduct = (productId) => {
        setProductsData(prevProducts =>
            prevProducts.filter(product => product.id !== productId)
        );
    };

    const value = {
        // State
        cart,
        wishlist,
        user,
        orders,
        adminAuth,
        products: productsData,

        // Cart
        addToCart,
        removeFromCart,
        updateCartQuantity,
        clearCart,
        getCartTotal,
        getCartCount,

        // Wishlist
        addToWishlist,
        removeFromWishlist,
        isInWishlist,

        // Auth
        login,
        register,
        logout,
        adminLogin,
        adminLogout,

        // Orders
        createOrder,
        updateOrderStatus,

        // Products (Admin)
        addProduct,
        updateProduct,
        deleteProduct
    };

    return <AppContext.Provider value={value}>{children}</AppContext.Provider>;
};
