'use client';

import { useAuth } from '@/hooks/useAuth';
import { useEffect } from 'react';
import { useRouter } from 'next/navigation';

export default function Home() {
  const { user, loading } = useAuth();
  const router = useRouter();

  useEffect(() => {
    if (!loading && user) {
      // Redirect logged-in users to dashboard
      router.push('/dashboard');
    }
  }, [user, loading, router]);

  if (loading) {
    return (
      <main className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="animate-spin rounded-full h-32 w-32 border-b-2 border-gray-900"></div>
      </main>
    );
  }

  if (user) {
    return null; // Will redirect to dashboard
  }

  return (
    <main className="min-h-screen bg-gray-50">
      <div className="max-w-7xl mx-auto px-4 py-16">
        <h1 className="text-4xl font-bold text-center mb-8">
          Case Study Builder
        </h1>
        <div className="text-center space-y-4">
          <a
            href="/signin"
            className="inline-block bg-blue-600 text-white px-8 py-3 rounded-lg hover:bg-blue-700 transition mr-4"
          >
            Sign In
          </a>
          <a
            href="/dashboard"
            className="inline-block bg-gray-600 text-white px-8 py-3 rounded-lg hover:bg-gray-700 transition"
          >
            Go to Dashboard
          </a>
        </div>
      </div>
    </main>
  );
}