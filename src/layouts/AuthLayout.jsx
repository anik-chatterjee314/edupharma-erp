import React from 'react';
import { Outlet } from 'react-router-dom';

const AuthLayout = () => {
  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-800 to-slate-900 flex flex-col justify-center py-12 sm:px-6 lg:px-8">
      <div className="sm:mx-auto sm:w-full sm:max-w-md">
        <div className="flex justify-center">
          <div className="w-16 h-16 bg-white rounded-full flex items-center justify-center overflow-hidden shadow-lg border-4 border-slate-700">
            <img src="/logo.png" alt="EduPharma Logo" className="w-10 h-10 object-contain" onError={(e) => { e.target.src = 'https://via.placeholder.com/40x40?text=EP'; }} />
          </div>
        </div>
        <h2 className="mt-6 text-center text-3xl font-extrabold text-white">
          EduPharma Academy
        </h2>
        <p className="mt-2 text-center text-sm text-slate-300">
          Enterprise Resource Planning System
        </p>
      </div>

      <div className="mt-8 sm:mx-auto sm:w-full sm:max-w-md">
        <div className="bg-white py-8 px-4 shadow-xl sm:rounded-2xl sm:px-10">
          <Outlet />
        </div>
        <div className="mt-6 text-center">
          <p className="text-xs text-slate-400">
            &copy; {new Date().getFullYear()} EduPharma Group. All rights reserved.
          </p>
        </div>
      </div>
    </div>
  );
};

export default AuthLayout;
