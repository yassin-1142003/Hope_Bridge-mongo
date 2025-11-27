'use client';

import { useAuth } from '@/hooks/useAuth';
import Link from 'next/link';

export default function Home() {
  const { user, logout } = useAuth();

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <header className="bg-white shadow">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center h-16">
            <div className="flex items-center">
              <h1 className="text-2xl font-bold text-gray-900">HopeBridge</h1>
            </div>
            <div className="flex items-center space-x-4">
              {user ? (
                <>
                  <span className="text-sm text-gray-700">
                    Welcome, {user.name}
                  </span>
                  <button
                    onClick={logout}
                    className="bg-gray-600 text-white px-4 py-2 rounded-md hover:bg-gray-700"
                  >
                    Logout
                  </button>
                </>
              ) : (
                <>
                  <Link
                    href="/auth/signin"
                    className="bg-blue-600 text-white px-4 py-2 rounded-md hover:bg-blue-700"
                  >
                    Sign In
                  </Link>
                  <Link
                    href="/auth/register"
                    className="bg-gray-600 text-white px-4 py-2 rounded-md hover:bg-gray-700"
                  >
                    Register
                  </Link>
                </>
              )}
            </div>
          </div>
        </div>
      </header>

      {/* Main Content */}
      <main className="max-w-7xl mx-auto py-12 px-4 sm:px-6 lg:px-8">
        <div className="text-center">
          <h2 className="text-4xl font-bold text-gray-900 mb-4">
            Welcome to HopeBridge
          </h2>
          <p className="text-xl text-gray-600 mb-8">
            A comprehensive charity management system for making a difference in communities.
          </p>

          {user ? (
            <div className="bg-white shadow rounded-lg p-8 max-w-2xl mx-auto">
              <h3 className="text-2xl font-semibold text-gray-900 mb-4">
                You are logged in!
              </h3>
              <p className="text-gray-600 mb-6">
                You have successfully authenticated with HopeBridge.
                {user.role === 'ADMIN' && ' You have admin privileges.'}
              </p>
              <div className="space-y-4">
                {user.role === 'ADMIN' ? (
                  <div className="bg-red-50 border border-red-200 rounded-md p-4">
                    <p className="text-red-800 mb-4">
                      For security reasons, administrators must use the secure sign-in page to access the admin panel.
                    </p>
                    <Link
                      href="/auth/admin-signin"
                      className="block w-full bg-red-600 text-white px-6 py-3 rounded-md hover:bg-red-700 text-center"
                    >
                      Secure Admin Access
                    </Link>
                  </div>
                ) : (
                  <button
                    onClick={logout}
                    className="block w-full bg-gray-600 text-white px-6 py-3 rounded-md hover:bg-gray-700"
                  >
                    Logout
                  </button>
                )}
              </div>
            </div>
          ) : (
            <div className="bg-white shadow rounded-lg p-8 max-w-2xl mx-auto">
              <h3 className="text-2xl font-semibold text-gray-900 mb-4">
                Get Started
              </h3>
              <p className="text-gray-600 mb-6">
                Sign in to your account or create a new one to access the HopeBridge system.
              </p>
              <div className="space-y-4">
                <Link
                  href="/auth/signin"
                  className="block w-full bg-blue-600 text-white px-6 py-3 rounded-md hover:bg-blue-700 text-center"
                >
                  Sign In
                </Link>
                <Link
                  href="/auth/register"
                  className="block w-full bg-gray-600 text-white px-6 py-3 rounded-md hover:bg-gray-700 text-center"
                >
                  Create Account
                </Link>
              </div>
            </div>
          )}
        </div>
      </main>
    </div>
  );
}
