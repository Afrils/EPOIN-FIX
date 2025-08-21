
import React from 'react';
import { Link, useLocation } from 'react-router-dom';
import { useAuth } from '../hooks/useAuth.tsx';
import { Role } from '../types.ts';
import { ChartBarIcon, UsersIcon, BookOpenIcon, CalendarIcon, UserCircleIcon, DocumentTextIcon, HomeIcon } from '@heroicons/react/24/solid';

const adminLinks = [
  { path: '/dashboard', label: 'Dashboard', icon: HomeIcon },
  { path: '/manage-users', label: 'Manajemen User', icon: UsersIcon },
  { path: '/manage-classes', label: 'Manajemen Kelas', icon: BookOpenIcon },
  { path: '/manage-academic-years', label: 'Tahun Ajaran', icon: CalendarIcon },
];

const guruLinks = [
  { path: '/dashboard', label: 'Dashboard', icon: HomeIcon },
  { path: '/my-students', label: 'Siswa Saya', icon: UsersIcon },
  { path: '/add-record', label: 'Tambah Catatan', icon: DocumentTextIcon },
];

const siswaLinks = [
  { path: '/dashboard', label: 'Dashboard', icon: HomeIcon },
  { path: '/my-points', label: 'Poin Saya', icon: ChartBarIcon },
];

const NavLink: React.FC<{ to: string, children: React.ReactNode, icon: React.ElementType }> = ({ to, children, icon: Icon }) => {
    const location = useLocation();
    const isActive = location.pathname === to;
    const activeClass = 'bg-primary text-white';
    const inactiveClass = 'text-gray-300 hover:bg-indigo-700 hover:text-white';

    return (
        <Link to={to} className={`flex items-center px-4 py-3 rounded-md text-sm font-medium transition-colors ${isActive ? activeClass : inactiveClass}`}>
            <Icon className="h-5 w-5 mr-3"/>
            {children}
        </Link>
    );
};


export const Sidebar: React.FC = () => {
    const { user } = useAuth();
    
    let links = [];
    if (user?.role === Role.ADMIN) {
        links = adminLinks;
    } else if (user?.role === Role.GURU) {
        links = guruLinks;
    } else {
        links = siswaLinks;
    }

    return (
        <aside className="w-64 bg-dark text-white flex flex-col">
            <div className="h-16 flex items-center justify-center text-2xl font-bold border-b border-gray-700">
                POIN SISWA
            </div>
            <nav className="flex-1 p-4 space-y-2">
                {links.map(link => (
                    <NavLink key={link.path} to={link.path} icon={link.icon}>
                        {link.label}
                    </NavLink>
                ))}
            </nav>
             <div className="p-4 border-t border-gray-700">
                 <NavLink to="/profile" icon={UserCircleIcon}>Profil Saya</NavLink>
            </div>
        </aside>
    );
};