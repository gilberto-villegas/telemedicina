import React from 'react';

interface LayoutProps {
    children: React.ReactNode;
}

export default function Layout({ children }: LayoutProps) {
    return (
        <div className="min-h-screen bg-slate-50">
            {children}
        </div>
    );
}

export const metadata = {
    title: "VilSalud",
    description: "Plataforma integral de salud digital VilSalud",
};
