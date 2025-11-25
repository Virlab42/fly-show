"use client"
import { useEffect } from 'react';
import './bootstrap.scss'
const Bootstrap = () => {
    useEffect(() => {
        import('bootstrap/dist/js/bootstrap.bundle.min.js')
            .then((module) => {
                console.log('Bootstrap JS loaded', module);
            })
            .catch((err) => {
                console.error('Error loading Bootstrap JS:', err);
            });
    }, []);
    return null
};

export default Bootstrap;