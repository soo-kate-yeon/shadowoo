'use client';

import { useEffect } from 'react';
import { useStore } from '@/lib/store';
import { createClient } from '@/utils/supabase/client';

export default function DataLoader() {
    const loadUserData = useStore((state) => state.loadUserData);

    useEffect(() => {
        const supabase = createClient();

        // Load data on mount if user is logged in
        const loadData = async () => {
            const { data: { user } } = await supabase.auth.getUser();
            if (user) {
                await loadUserData();
            }
        };

        loadData();

        // Subscribe to auth state changes
        const { data: { subscription } } = supabase.auth.onAuthStateChange(async (event, session) => {
            if (event === 'SIGNED_IN' && session?.user) {
                // Load user data when signed in
                await loadUserData();
            } else if (event === 'SIGNED_OUT') {
                // Clear local data when signed out (optional)
                // You might want to keep localStorage data
            }
        });

        return () => {
            subscription.unsubscribe();
        };
    }, [loadUserData]);

    return null; // This component doesn't render anything
}
