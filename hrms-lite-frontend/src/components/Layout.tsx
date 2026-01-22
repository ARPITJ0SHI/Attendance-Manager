import React from 'react';
import { NavLink, Outlet } from 'react-router-dom';
import { Users, Calendar } from 'lucide-react';
import { cn } from '../lib/utils';

export function Layout() {
    return (
        <div className="min-h-screen bg-gray-50 flex font-sans">
            <aside className="w-64 bg-white border-r border-gray-200 hidden md:flex flex-col">
                <div className="h-16 flex items-center px-6 border-b border-gray-100">
                    <div className="h-8 w-8 bg-indigo-600 rounded-lg flex items-center justify-center mr-3">
                        <span className="text-white font-bold text-lg">H</span>
                    </div>
                    <span className="text-xl font-bold text-gray-800">HRMS Lite</span>
                </div>

                <nav className="flex-1 p-4 space-y-1">
                    <NavItem to="/" icon={<Users className="w-5 h-5" />} label="Employees" />
                    <NavItem to="/attendance" icon={<Calendar className="w-5 h-5" />} label="Attendance" />
                </nav>

                <div className="p-4 border-t border-gray-100">
                    <div className="flex items-center gap-3 px-3 py-2">
                        <div className="w-8 h-8 rounded-full bg-indigo-100 flex items-center justify-center text-indigo-700 font-medium">
                            A
                        </div>
                        <div className="text-sm">
                            <p className="font-medium text-gray-700">Admin User</p>
                            <p className="text-gray-500 text-xs">admin@hrms.com</p>
                        </div>
                    </div>
                </div>
            </aside>

            <main className="flex-1 flex flex-col min-w-0">
                <div className="flex-1 overflow-auto p-4 sm:p-8">
                    <div className="max-w-7xl mx-auto">
                        <Outlet />
                    </div>
                </div>
            </main>
        </div>
    );
}

function NavItem({ to, icon, label }: { to: string; icon: React.ReactNode; label: string }) {
    return (
        <NavLink
            to={to}
            className={({ isActive }) =>
                cn(
                    "flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm font-medium transition-colors",
                    isActive
                        ? "bg-indigo-50 text-indigo-700"
                        : "text-gray-600 hover:bg-gray-50 hover:text-gray-900"
                )
            }
        >
            {icon}
            <span>{label}</span>
        </NavLink>
    );
}
