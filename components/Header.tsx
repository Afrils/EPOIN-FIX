
import React from 'react';
import { useAuth } from '../hooks/useAuth.tsx';
import { UserIcon, ArrowRightOnRectangleIcon } from '@heroicons/react/24/solid';

interface HeaderProps {
    title: string;
}

export const Header: React.FC<HeaderProps> = ({ title }) => {
  const { user, logout } = useAuth();

  return (
    <header className="bg-white shadow-sm p-4 flex justify-between items-center">
      <h1 className="text-2xl font-bold text-dark">{title}</h1>
      <div className="flex items-center space-x-4">
        <div className="text-right">
          <p className="font-semibold text-dark">{user?.nama}</p>
          <p className="text-sm text-gray-500 capitalize">{user?.role}</p>
        </div>
        <UserIcon className="h-10 w-10 text-gray-400 bg-gray-100 rounded-full p-2"/>
        <button
          onClick={logout}
          className="p-2 rounded-full text-gray-500 hover:bg-red-100 hover:text-red-600 transition-colors"
          title="Logout"
        >
          <ArrowRightOnRectangleIcon className="h-6 w-6" />
        </button>
      </div>
    </header>
  );
};