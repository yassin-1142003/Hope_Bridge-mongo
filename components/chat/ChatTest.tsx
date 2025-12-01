"use client";
import React from 'react';
import ChatWidget from './ChatWidget';

const ChatTest: React.FC = () => {
  return (
    <div className="min-h-screen bg-gray-100 p-8">
      <h1 className="text-2xl font-bold mb-4">Chat Widget Test</h1>
      <p className="mb-4">The chat widget should appear in the bottom-right corner if you have the correct role.</p>
      <div className="bg-white p-4 rounded-lg shadow">
        <h2 className="text-lg font-semibold mb-2">Role-Based Access Test</h2>
        <p>Roles with chat access: Admin, General Manager, Program Manager, Project Coordinators, HR, Finance, Procurement, Storekeeper, M&E, Field Officer, Accountant</p>
      </div>
      <ChatWidget />
    </div>
  );
};

export default ChatTest;
