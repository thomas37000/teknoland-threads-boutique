
import React from "react";

interface AuthLayoutProps {
  children: React.ReactNode;
}

const AuthLayout = ({ children }: AuthLayoutProps) => {
  return (
    <div className="flex min-h-screen items-center justify-center p-4 bg-gray-50">
      <div className="w-full max-w-md p-8 rounded-lg shadow-lg bg-white">
        <div className="text-center mb-6">
          <h1 className="text-3xl font-bold text-tekno-black mb-2">Teknoland</h1>
          <p className="text-gray-500">Connectez vous ou créez un nouveau compte</p>
        </div>
        {children}
      </div>
    </div>
  );
};

export default AuthLayout;
