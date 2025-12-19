'use client';

import { createClient } from '@/utils/supabase/client';
import { Button } from '../../../ui/button';
import { ReactNode } from 'react';

interface LoginButtonProps {
    provider: 'google' | 'github' | 'kakao' | 'azure'; // Add more as needed
    children: ReactNode;
    className?: string;
    variant?: 'default' | 'destructive' | 'outline' | 'secondary' | 'ghost' | 'link' | 'social';
    size?: 'default' | 'sm' | 'lg' | 'icon' | 'social';
}

export default function LoginButton({
    provider,
    children,
    className,
    variant = 'default',
    size = 'default',
}: LoginButtonProps) {
    const handleLogin = async () => {
        const supabase = createClient();
        await supabase.auth.signInWithOAuth({
            provider,
            options: {
                redirectTo: `${location.origin}/auth/callback`,
            },
        });
    };

    return (
        <Button
            variant={variant}
            size={size}
            className={className}
            onClick={handleLogin}
        >
            {children}
        </Button>
    );
}
