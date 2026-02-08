import { useEffect, useState } from 'react';
import { Routes, Route, Navigate } from 'react-router-dom';
import { supabase } from './supabaseClient';
import { Dashboard } from './components/Dashboard';
import { PublicProfile } from './components/PublicProfile';
import type { Session } from '@supabase/supabase-js';

function App() {
  const [session, setSession] = useState<Session | null>(null);
  const [initialized, setInitialized] = useState(false);

  useEffect(() => {
    // 1. Check active sessions
    supabase.auth.getSession().then(({ data: { session } }) => {
      setSession(session);
      setInitialized(true);
    });

    // 2. Listen for auth changes (Login, Logout, Hibernate)
    const { data: { subscription } } = supabase.auth.onAuthStateChange((_event, session) => {
      setSession(session);
    });

    return () => subscription.unsubscribe();
  }, []);

  if (!initialized) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50 dark:bg-gray-900">
        <div className="animate-spin rounded-full h-12 w-12 border-b-4 border-blue-600"></div>
      </div>
    );
  }

  return (
    <Routes>
      {/* FIX: We removed the strict check (!session ? <Auth />).
         Now we always render Dashboard. 
         Dashboard.tsx will handle the logic: 
         - If logged in -> Show Dashboard
         - If logged out -> Show Landing Page
      */}
      <Route 
        path="/" 
        element={<Dashboard key={session?.user.id || 'public'} session={session} />} 
      />
      
      {/* Public Profile Route */}
      <Route path="/p/:username" element={<PublicProfile />} />
      
      {/* Redirect unknown routes */}
      <Route path="*" element={<Navigate to="/" replace />} />
    </Routes>
  );
}

export default App;