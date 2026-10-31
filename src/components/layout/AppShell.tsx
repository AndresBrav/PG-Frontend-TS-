import type { ReactNode } from 'react';
import AppHeader from './AppHeader';

interface AppShellProps {
    children: ReactNode;
}

const AppShell = ({ children }: AppShellProps) => {
    return (
        <div className="min-h-screen bg-[#181818] text-white">
            <AppHeader />
            {children}
        </div>
    );
};

export default AppShell;
