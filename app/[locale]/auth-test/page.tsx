"use client";

import { useAuth } from "@/hooks/useAuth";
import { useState, useEffect } from "react";

export default function AuthTestPage() {
  const { user, login, logout } = useAuth();
  const [testResult, setTestResult] = useState("");

  const testLogin = async () => {
    try {
      setTestResult("Testing login...");
      await login("logintest@example.com", "password123");
      setTestResult("✅ Login successful! User should now be visible in navbar.");
    } catch (error) {
      setTestResult(`❌ Login failed: ${error.message}`);
    }
  };

  const testLogout = () => {
    logout();
    setTestResult("✅ Logout successful! Login button should reappear in navbar.");
  };

  return (
    <div className="min-h-screen bg-gray-50 flex items-center justify-center p-4">
      <div className="max-w-md w-full bg-white rounded-lg shadow-md p-6">
        <h1 className="text-2xl font-bold text-center mb-6">Authentication Test</h1>
        
        <div className="mb-6 p-4 bg-gray-100 rounded">
          <h2 className="font-semibold mb-2">Current Auth State:</h2>
          <pre className="text-sm">
            {user ? (
              <div>
                <p>✅ User is logged in</p>
                <p>Name: {user.name}</p>
                <p>Email: {user.email}</p>
                <p>Role: {user.role}</p>
              </div>
            ) : (
              <p>❌ No user logged in</p>
            )}
          </pre>
        </div>

        <div className="space-y-3">
          <button
            onClick={testLogin}
            disabled={!!user}
            className="w-full bg-blue-500 text-white py-2 px-4 rounded hover:bg-blue-600 disabled:bg-gray-400"
          >
            Test Login (logintest@example.com)
          </button>
          
          <button
            onClick={testLogout}
            disabled={!user}
            className="w-full bg-red-500 text-white py-2 px-4 rounded hover:bg-red-600 disabled:bg-gray-400"
          >
            Test Logout
          </button>
        </div>

        {testResult && (
          <div className="mt-4 p-3 bg-yellow-100 border border-yellow-400 rounded">
            <p className="text-sm">{testResult}</p>
          </div>
        )}

        <div className="mt-6 text-xs text-gray-600">
          <p>Instructions:</p>
          <ol className="list-decimal list-inside space-y-1">
            <li>Check navbar - should show "Login" button initially</li>
            <li>Click "Test Login" button above</li>
            <li>Check navbar again - should show user's name and dropdown</li>
            <li>Click "Test Logout" to verify logout functionality</li>
          </ol>
        </div>
      </div>
    </div>
  );
}
