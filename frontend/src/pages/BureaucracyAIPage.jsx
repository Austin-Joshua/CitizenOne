import React from 'react';
import BureaucracyAI from '../components/ai/BureaucracyAI';

const BureaucracyAIPage = () => {
  return (
    <div className="flex min-h-screen flex-col bg-canvas">
      <div className="flex-1 p-4">
        <div className="mx-auto max-w-4xl">
          <div className="mb-6">
            <h1 className="text-2xl font-bold text-primary">Bureaucracy Simplifier</h1>
            <p className="mt-2 text-secondary">
              Get help navigating government schemes, understanding complex rules, and guiding you step-by-step through applications.
            </p>
          </div>
          <div className="relative h-[600px]">
            <BureaucracyAI pageMode />
          </div>
        </div>
      </div>
    </div>
  );
};

export default BureaucracyAIPage;