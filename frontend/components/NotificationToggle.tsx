'use client';

import React, { useState, useEffect } from 'react';
import { getAuthorizedHeaders } from '@/lib/auth';

const urlBase64ToUint8Array = (base64String: string) => {
    const padding = '='.repeat((4 - base64String.length % 4) % 4);
    const base64 = (base64String + padding)
        .replace(/\-/g, '+')
        .replace(/_/g, '/');

    const rawData = window.atob(base64);
    const outputArray = new Uint8Array(rawData.length);

    for (let i = 0; i < rawData.length; ++i) {
        outputArray[i] = rawData.charCodeAt(i);
    }
    return outputArray;
};

export default function NotificationToggle() {
    const [isSupported, setIsSupported] = useState(false);
    const [isSubscribed, setIsSubscribed] = useState(false);
    const [loading, setLoading] = useState(true);
    const [iosMessage, setIosMessage] = useState('');

    useEffect(() => {
        const checkSupport = async () => {
            if ('serviceWorker' in navigator && 'PushManager' in window) {
                // Check if it's iOS Safari
                const isIos = /iP(ad|hone|od).+Version\/[\d\.]+.*Safari/i.test(navigator.userAgent);
                const isStandalone = ('standalone' in window.navigator) ? (window.navigator as any).standalone : window.matchMedia('(display-mode: standalone)').matches;
                
                if (isIos && !isStandalone) {
                    setIosMessage('To enable notifications, please add this app to your Home Screen (Share -> Add to Home Screen).');
                    setIsSupported(false);
                } else {
                    setIsSupported(true);
                    
                    // Check existing subscription
                    try {
                        const registration = await navigator.serviceWorker.register('/sw.js');
                        const subscription = await registration.pushManager.getSubscription();
                        setIsSubscribed(!!subscription);
                    } catch (e) {
                        console.error('Service Worker registration failed:', e);
                    }
                }
            } else {
                setIsSupported(false);
            }
            setLoading(false);
        };

        checkSupport();
    }, []);

    const subscribe = async () => {
        setLoading(true);
        try {
            const registration = await navigator.serviceWorker.ready;
            
            // Generate standard subscription
            const publicVapidKey = process.env.NEXT_PUBLIC_VAPID_PUBLIC_KEY;
            if (!publicVapidKey) {
                console.error("VAPID Key not found in env variables.");
                setLoading(false);
                return;
            }

            const subscription = await registration.pushManager.subscribe({
                userVisibleOnly: true,
                applicationServerKey: urlBase64ToUint8Array(publicVapidKey)
            });

            // Send to our backend
            const headers = await getAuthorizedHeaders({
                'Content-Type': 'application/json'
            });

            const subData = JSON.parse(JSON.stringify(subscription));

            const res = await fetch(`${process.env.NEXT_PUBLIC_API_URL || 'http://localhost:5001'}/api/notifications/subscribe`, {
                method: 'POST',
                headers,
                body: JSON.stringify({
                    endpoint: subData.endpoint,
                    keys: subData.keys,
                    userAgent: navigator.userAgent
                })
            });

            if (res.ok) {
                setIsSubscribed(true);
            } else {
                console.error('Failed to save subscription on backend');
            }

        } catch (error) {
            console.error('Error subscribing to notifications:', error);
        }
        setLoading(false);
    };

    const unsubscribe = async () => {
        setLoading(true);
        try {
            const registration = await navigator.serviceWorker.ready;
            const subscription = await registration.pushManager.getSubscription();
            
            if (subscription) {
                const subData = JSON.parse(JSON.stringify(subscription));
                
                // Remove from backend
                const headers = await getAuthorizedHeaders({
                    'Content-Type': 'application/json'
                });

                await fetch(`${process.env.NEXT_PUBLIC_API_URL || 'http://localhost:5001'}/api/notifications/subscribe`, {
                    method: 'DELETE',
                    headers,
                    body: JSON.stringify({ endpoint: subData.endpoint })
                });

                // Unsubscribe locally
                await subscription.unsubscribe();
                setIsSubscribed(false);
            }
        } catch (error) {
            console.error('Error unsubscribing:', error);
        }
        setLoading(false);
    };

    if (!isSupported) {
        if (iosMessage) {
            return (
                <div className="p-4 bg-gray-50 rounded-xl border border-gray-100 flex flex-col gap-2 text-sm text-gray-600">
                    <p>{iosMessage}</p>
                </div>
            );
        }
        return null; // Not supported, don't show toggle
    }

    return (
        <div className="flex items-center justify-between p-4 bg-gray-50 rounded-xl border border-gray-100 mb-6">
            <div>
                <h4 className="font-outfit font-semibold text-gray-900">Push Notifications</h4>
                <p className="text-sm text-gray-500">Receive order updates directly on your device.</p>
            </div>
            <button
                onClick={isSubscribed ? unsubscribe : subscribe}
                disabled={loading}
                className={`px-4 py-2 rounded-lg font-outfit text-sm font-semibold transition-colors disabled:opacity-50 ${
                    isSubscribed 
                        ? 'bg-red-50 text-red-600 hover:bg-red-100'
                        : 'bg-indigo-600 text-white hover:bg-indigo-700'
                }`}
            >
                {loading ? 'Processing...' : isSubscribed ? 'Disable' : 'Enable Notifications'}
            </button>
        </div>
    );
}
