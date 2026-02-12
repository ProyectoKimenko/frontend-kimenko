'use client'

import { useState, useEffect, useCallback, useRef } from 'react'
import { createClient } from '@/utils/supabase/client'
import { useRouter } from 'next/navigation'
import type { Session, User } from '@supabase/supabase-js'

interface AuthState {
    user: User | null
    loading: boolean
    error: string | null
}

// Global state to prevent multiple simultaneous auth checks
let globalAuthState: AuthState | null = null
let authInitPromise: Promise<AuthState> | null = null
const listeners: Set<(state: AuthState) => void> = new Set()

export function useAuth() {
    const router = useRouter()
    const [authState, setAuthState] = useState<AuthState>(() =>
        globalAuthState || { user: null, loading: true, error: null }
    )
    const isInitializedRef = useRef(false)

    // Subscribe to global auth state changes
    useEffect(() => {
        const updateState = (newState: AuthState) => {
            setAuthState(newState)
        }

        listeners.add(updateState)

        return () => {
            listeners.delete(updateState)
        }
    }, [])

    // Broadcast state changes to all useAuth instances
    const broadcastStateChange = useCallback((newState: AuthState) => {
        globalAuthState = newState
        listeners.forEach(listener => listener(newState))
    }, [])

    // Initialize auth state (only once globally)
    useEffect(() => {
        if (isInitializedRef.current) return
        isInitializedRef.current = true

        // Only run on client side
        if (typeof window === 'undefined') {
            return
        }

        const initAuth = async (): Promise<AuthState> => {
            // If already initializing, wait for it
            if (authInitPromise) {
                return authInitPromise
            }

            // If already initialized, return cached state
            if (globalAuthState && !globalAuthState.loading) {
                return globalAuthState
            }

            authInitPromise = (async () => {
                try {
                    const supabase = await createClient()

                    // Get initial session with timeout
                    const sessionPromise = supabase.auth.getSession()
                    const timeoutPromise = new Promise((_, reject) =>
                        setTimeout(() => reject(new Error('Tiempo de espera de autenticación agotado')), 5000)
                    )

                    const { data: { session }, error } = await Promise.race([
                        sessionPromise,
                        timeoutPromise
                    ]) as { data: { session: Session | null }, error: Error }

                    if (error) {
                        const errorState = { user: null, loading: false, error: error.message }
                        broadcastStateChange(errorState)
                        return errorState
                    }

                    const initialState = {
                        user: session?.user ?? null,
                        loading: false,
                        error: null
                    }

                    broadcastStateChange(initialState)

                    // Listen for auth changes (only set up once)
                    const { data: { subscription } } = supabase.auth.onAuthStateChange(
                        async (event, session) => {
                            const newState = {
                                user: session?.user ?? null,
                                loading: false,
                                error: null
                            }

                            broadcastStateChange(newState)

                            // Redirect on sign out
                            if (event === 'SIGNED_OUT') {
                                // Add slight delay to prevent race conditions
                                setTimeout(() => router.push('/login'), 100)
                            }
                        }
                    )

                    // Cleanup subscription when no more listeners
                    const originalUnsubscribe = subscription.unsubscribe
                    subscription.unsubscribe = () => {
                        if (listeners.size === 0) {
                            originalUnsubscribe()
                        }
                    }

                    return initialState
                } catch (error) {
                    const errorState = {
                        user: null,
                        loading: false,
                        error: error instanceof Error ? error.message : 'Error desconocido'
                    }
                    broadcastStateChange(errorState)
                    return errorState
                } finally {
                    authInitPromise = null
                }
            })()

            return authInitPromise
        }

        initAuth()
    }, [router, broadcastStateChange])

    // Optimized login function
    const login = useCallback(async (email: string, password: string) => {
        if (typeof window === 'undefined') {
            return { success: false, error: 'Not available on server' }
        }

        const loadingState = { ...globalAuthState!, loading: true, error: null }
        broadcastStateChange(loadingState)

        try {
            const supabase = await createClient()
            const { data, error } = await supabase.auth.signInWithPassword({
                email,
                password
            })

            if (error) {
                const errorState = { ...globalAuthState!, loading: false, error: error.message }
                broadcastStateChange(errorState)
                return { success: false, error: error.message }
            }

            const successState = {
                user: data.user,
                loading: false,
                error: null
            }
            broadcastStateChange(successState)

            return { success: true, error: null }
        } catch (error) {
            const errorMessage = error instanceof Error ? error.message : 'Error al iniciar sesión'
            const errorState = { ...globalAuthState!, loading: false, error: errorMessage }
            broadcastStateChange(errorState)
            return { success: false, error: errorMessage }
        }
    }, [broadcastStateChange])

    // Optimized logout function
    const logout = useCallback(async () => {
        if (typeof window === 'undefined') {
            return { success: false, error: 'Not available on server' }
        }

        const loadingState = { ...globalAuthState!, loading: true, error: null }
        broadcastStateChange(loadingState)

        try {
            const supabase = await createClient()
            const { error } = await supabase.auth.signOut()

            if (error) {
                const errorState = { ...globalAuthState!, loading: false, error: error.message }
                broadcastStateChange(errorState)
                return { success: false, error: error.message }
            }

            const loggedOutState = { user: null, loading: false, error: null }
            broadcastStateChange(loggedOutState)

            // Clear any cached authentication state
            globalAuthState = loggedOutState
            authInitPromise = null

            // Force immediate redirect without timeout to prevent race conditions
            router.push('/login')
            
            // Also trigger a page reload as fallback to clear any remaining state
            setTimeout(() => {
                if (window.location.pathname.startsWith('/admin')) {
                    window.location.href = '/login'
                }
            }, 500)

            return { success: true, error: null }
        } catch (error) {
            const errorMessage = error instanceof Error ? error.message : 'Error al cerrar sesión'
            const errorState = { ...globalAuthState!, loading: false, error: errorMessage }
            broadcastStateChange(errorState)
            return { success: false, error: errorMessage }
        }
    }, [router, broadcastStateChange])

    // Clear error
    const clearError = useCallback(() => {
        if (globalAuthState?.error) {
            const clearedState = { ...globalAuthState, error: null }
            broadcastStateChange(clearedState)
        }
    }, [broadcastStateChange])

    return {
        user: authState.user,
        loading: authState.loading,
        error: authState.error,
        isAuthenticated: !!authState.user,
        login,
        logout,
        clearError
    }
} 