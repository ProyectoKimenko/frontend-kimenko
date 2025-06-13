'use client'

import { useAuth } from '@/hooks/useAuth';
import { useRouter } from 'next/navigation';
import { useEffect } from 'react';
import LoadingSpinner from './LoadingSpinner';

interface AuthGuardProps {
    children: React.ReactNode;
    redirectTo?: string;
    fallback?: React.ReactNode;
}

export default function AuthGuard({
    children,
    redirectTo = '/login',
    fallback
}: AuthGuardProps) {
    const { user, loading, isAuthenticated } = useAuth();
    const router = useRouter();

    useEffect(() => {
        if (!loading && !isAuthenticated) {
            router.push(redirectTo);
        }
    }, [loading, isAuthenticated, router, redirectTo]);

    if (loading) {
        return fallback || (
            <div className="min-h-screen flex items-center justify-center bg-gray-50 dark:bg-gray-900">
                <LoadingSpinner
                    size="lg"
                    text="Verificando autenticación..."
                />
            </div>
        );
    }

    if (!isAuthenticated) {
        return fallback || (
            <div className="min-h-screen flex items-center justify-center bg-gray-50 dark:bg-gray-900">
                <div className="text-center">
                    <h2 className="text-xl font-semibold text-gray-900 dark:text-white mb-2">
                        Acceso restringido
                    </h2>
                    <p className="text-gray-600 dark:text-gray-400">
                        Redirigiendo al inicio de sesión...
                    </p>
                </div>
            </div>
        );
    }

    return <>{children}</>;
} 