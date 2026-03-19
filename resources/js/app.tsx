import React from 'react';
import { createRoot } from 'react-dom/client';
import { BrowserRouter } from 'react-router-dom';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { NotificationsProvider } from './contexts/NotificationsContext';
import AppRoutes from './router';

// Asegurar que Tailwind y CSS global estén cargados.
import '../css/app.css';

const queryClient = new QueryClient({
    defaultOptions: {
        queries: {
            retry: 1,
            staleTime: 30000,
        },
    },
});

const el = document.getElementById('app');

if (el) {
    const root = createRoot(el);
    root.render(
        <React.StrictMode>
            <QueryClientProvider client={queryClient}>
                <NotificationsProvider>
                    <BrowserRouter>
                        <AppRoutes />
                    </BrowserRouter>
                </NotificationsProvider>
            </QueryClientProvider>
        </React.StrictMode>
    );
}
