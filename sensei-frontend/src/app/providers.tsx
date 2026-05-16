'use client';

import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { Toaster } from 'react-hot-toast';
import { useState, Component, ErrorInfo, ReactNode } from 'react';

class ErrorBoundary extends Component<{ children: ReactNode }, { hasError: boolean }> {
  constructor(props: any) { super(props); this.state = { hasError: false }; }
  static getDerivedStateFromError() { return { hasError: true }; }
  componentDidCatch(error: Error, errorInfo: ErrorInfo) { console.error("Uncaught error:", error, errorInfo); }
  render() {
    if (this.state.hasError) {
      return (
        <div className="flex flex-col items-center justify-center min-h-screen bg-[#05080f] text-white p-10 text-center">
          <h1 className="font-cinzel text-4xl mb-4 text-[#FFD700]">OOPS! SYSTEM GLITCH 🤖</h1>
          <p className="font-fredoka text-lg opacity-60 max-w-md mx-auto mb-8">The metaverse encountered a ripple in space-time. Try refreshing!</p>
          <button onClick={() => window.location.reload()} className="px-8 py-3 bg-[#FFD700] text-black font-bold rounded-xl hard-shadow">REFRESH WORLD</button>
        </div>
      );
    }
    return this.props.children;
  }
}

export default function Providers({ children }: { children: React.ReactNode }) {
  const [queryClient] = useState(() => new QueryClient({
    defaultOptions: {
      queries: { retry: 2, staleTime: 30_000, refetchOnWindowFocus: false }
    }
  }));

  return (
    <ErrorBoundary>
      <QueryClientProvider client={queryClient}>
        {children}
        <Toaster
        position="top-right"
        toastOptions={{
          duration: 4000,
          style: {
            fontFamily: 'var(--font-body)',
            borderRadius: '12px',
            border: '2px solid #2D2D2D',
            boxShadow: '3px 3px 0px #2D2D2D',
            fontSize: '0.95rem',
          }
        }}
      />
    </QueryClientProvider>
    </ErrorBoundary>
  );
}
