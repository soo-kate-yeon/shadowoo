'use client';

import Link from 'next/link';
import { usePathname } from 'next/navigation';
import UserMenu from '@/components/auth/UserMenu';

export default function TopNav() {
    const pathname = usePathname();

    const isSessionActive = pathname?.startsWith('/session') || pathname?.startsWith('/shadowing');
    const isArchiveActive = pathname?.startsWith('/archive');

    return (
        <header className="h-[80px] bg-surface flex items-center justify-between px-8 sticky top-0 z-10 border-b border-outline">
            <nav className="flex items-center gap-8">
                <Link
                    href="/home"
                    className={`text-body-large font-medium transition-colors ${isSessionActive
                            ? 'text-primary-500'
                            : 'text-neutral-600 hover:text-neutral-900'
                        }`}
                >
                    세션
                </Link>
                <Link
                    href="/archive"
                    className={`text-body-large font-medium transition-colors ${isArchiveActive
                            ? 'text-primary-500'
                            : 'text-neutral-600 hover:text-neutral-900'
                        }`}
                >
                    노트
                </Link>
            </nav>

            <UserMenu />
        </header>
    );
}
