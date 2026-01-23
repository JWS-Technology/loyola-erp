"use client";

import React, { useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { motion } from 'framer-motion';

export default function RedirectPage() {
    const router = useRouter();

    useEffect(() => {
        // Delaying slightly (e.g., 800ms) can sometimes feel more natural than an instant snap
        const timer = setTimeout(() => {
            router.push('/attendance/details');
        }, 800);

        return () => clearTimeout(timer);
    }, [router]);

    return (
        <div className="flex flex-col items-center justify-center min-h-screen bg-gray-50">
            <motion.div
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.5 }}
                className="text-center"
            >
                {/* Modern Spinner */}
                <div className="flex justify-center mb-4">
                    <div className="w-12 h-12 border-4 border-blue-200 border-t-blue-600 rounded-full animate-spin"></div>
                </div>

                <h1 className="text-xl font-semibold text-gray-700">
                    Preparing your dashboard
                </h1>
                <p className="text-gray-500 mt-2">
                    Taking you to <span className="font-medium text-blue-600">Attendance Details</span>...
                </p>
            </motion.div>
        </div>
    );
}