'use client';
import { useEffect } from 'react';

export default function Error({ error, reset }: { error: Error & { digest?: string }; reset: () => void }) {
  useEffect(() => { console.error(error); }, [error]);
  return (
    <div className="flex flex-col items-center justify-center min-h-[50vh] p-8 text-center space-y-4">
      <h2 className="text-2xl font-bold text-red-500">Something went wrong!</h2>
      <p className="text-gray-500">We encountered an unexpected error while loading this page.</p>
      <button onClick={() => reset()} className="px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 transition">Try again</button>
    </div>
  );
}
