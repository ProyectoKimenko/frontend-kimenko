'use client'

import Link from 'next/link';
import { useState } from 'react';

const navItems = [
    { href: "/", label: "Inicio" },
    { href: "/dashboard", label: "Dashboard" },
    { href: "/reports", label: "Reportes" },
];

export default function SideBar() {
    const [hidden, setHidden] = useState(false);

    return (
        <aside
            className={`transition-all duration-300 bg-white dark:bg-gray-800 border-r border-gray-200 dark:border-gray-700
                ${hidden ? 'w-0 min-w-0 overflow-hidden p-0' : 'w-56 min-w-[14rem]'}
            `}
            style={{ minHeight: '100vh' }}
        >
            <button
                aria-label={hidden ? "Mostrar menú lateral" : "Ocultar menú lateral"}
                onClick={() => setHidden(h => !h)}
                className={`
                    absolute top-4 left-4 z-20 bg-gray-200 dark:bg-gray-700 rounded-full p-1 shadow
                    hover:bg-gray-300 dark:hover:bg-gray-600 transition
                    ${hidden ? '' : ''}
                `}
                style={{
                    // If hidden, keep button visible at left edge
                    left: hidden ? '0.5rem' : '15rem',
                    transition: 'left 0.3s'
                }}
            >
                {hidden ? (
                    // Show "open" icon
                    <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 text-gray-700 dark:text-gray-200" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
                    </svg>
                ) : (
                    // Show "close" icon
                    <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 text-gray-700 dark:text-gray-200" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
                    </svg>
                )}
            </button>
            {!hidden && (
                <>
                    <div className="flex flex-col items-center justify-center gap-3 col-span-2 p-4 ">
                        <img
                            src="https://kimenko.cl/wp-content/uploads/2020/06/cropped-logo3.jpg"
                            alt="Kimenko logo"
                            className="h-10 w-10 rounded-lg shadow"
                        />
                        <h1 className="text-lg font-semibold text-gray-900 dark:text-white">
                            Kimenko
                        </h1>
                    </div>
                    <nav className="p-4 space-y-2 flex-1">
                        <Link
                            href="/"
                            className="flex items-center rounded-lg px-4 py-2 text-gray-700 hover:bg-gray-100 dark:text-gray-200 dark:hover:bg-gray-700"
                        >
                            Inicio
                        </Link>
                        <Link
                            href="/dashboard"
                            className="flex items-center rounded-lg px-4 py-2 text-gray-700 hover:bg-gray-100 dark:text-gray-200 dark:hover:bg-gray-700"
                        >
                            Dashboard
                        </Link>
                        <Link
                            href="/reports"
                            className="flex items-center rounded-lg px-4 py-2 text-gray-700 hover:bg-gray-100 dark:text-gray-200 dark:hover:bg-gray-700"
                        >
                            Reportes
                        </Link>
                    </nav>
                </>
            )}
        </aside>
    );
}