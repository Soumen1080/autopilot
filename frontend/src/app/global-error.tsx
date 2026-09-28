'use client';
export default function GlobalError({ error, reset }: { error: Error & { digest?: string }; reset: () => void }) {
  return (
    <html>
      <body>
        <div className="flex flex-col items-center justify-center min-h-screen p-8 text-center space-y-4">
          <h2 className="text-2xl font-bold text-red-500">Critical Application Error</h2>
          <button onClick={() => reset()} className="px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 transition">Reload</button>
        </div>
      </body>
    </html>
  );
}
