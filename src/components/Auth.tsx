import { useState } from 'react';
import { supabase } from '../supabaseClient';
import { Mail, Lock, Loader2, Github, Chrome } from 'lucide-react';

export function Auth() {
  const [loading, setLoading] = useState(false);
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [isSignUp, setIsSignUp] = useState(false);

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    const { error } = isSignUp 
      ? await supabase.auth.signUp({ email, password })
      : await supabase.auth.signInWithPassword({ email, password });
    
    if (error) alert(error.message);
    setLoading(false);
  };

  const handleSocialLogin = async (provider: 'google' | 'github') => {
    const { error } = await supabase.auth.signInWithOAuth({ 
      provider,
      options: {
        // This automatically detects if you are on Localhost or Vercel
        redirectTo: window.location.origin 
      }
    });
    if (error) alert(error.message);
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-50 dark:bg-gray-900 p-4">
      <div className="bg-white dark:bg-gray-800 p-8 rounded-2xl shadow-xl w-full max-w-md border border-gray-100 dark:border-gray-700">
        <div className="text-center mb-8">
          <h1 className="text-3xl font-bold text-gray-900 dark:text-white mb-2">Welcome Back</h1>
          <p className="text-gray-500 dark:text-gray-400">Sign in to manage your job applications</p>
        </div>

        <div className="space-y-4 mb-6">
          <button onClick={() => handleSocialLogin('google')} className="w-full flex items-center justify-center gap-3 bg-white dark:bg-gray-700 text-gray-700 dark:text-white border border-gray-300 dark:border-gray-600 p-3 rounded-lg hover:bg-gray-50 dark:hover:bg-gray-600 transition-all font-medium">
            <Chrome size={20} className="text-red-500" /> Continue with Google
          </button>
          <button onClick={() => handleSocialLogin('github')} className="w-full flex items-center justify-center gap-3 bg-[#24292F] text-white p-3 rounded-lg hover:bg-[#24292F]/90 transition-all font-medium">
            <Github size={20} /> Continue with GitHub
          </button>
        </div>

        <div className="relative mb-6">
          <div className="absolute inset-0 flex items-center"><div className="w-full border-t border-gray-200 dark:border-gray-700"></div></div>
          <div className="relative flex justify-center text-sm"><span className="px-2 bg-white dark:bg-gray-800 text-gray-500">Or continue with email</span></div>
        </div>

        <form onSubmit={handleLogin} className="space-y-4">
          <div className="relative">
            <Mail className="absolute left-3 top-3.5 text-gray-400" size={20} />
            <input type="email" placeholder="Email" value={email} onChange={(e) => setEmail(e.target.value)} className="w-full pl-10 p-3 rounded-lg border dark:bg-gray-700 dark:border-gray-600 dark:text-white focus:ring-2 focus:ring-blue-500 outline-none" required />
          </div>
          <div className="relative">
            <Lock className="absolute left-3 top-3.5 text-gray-400" size={20} />
            <input type="password" placeholder="Password" value={password} onChange={(e) => setPassword(e.target.value)} className="w-full pl-10 p-3 rounded-lg border dark:bg-gray-700 dark:border-gray-600 dark:text-white focus:ring-2 focus:ring-blue-500 outline-none" required />
          </div>
          <button disabled={loading} className="w-full bg-blue-600 hover:bg-blue-700 text-white p-3 rounded-lg font-bold transition-colors flex justify-center">
            {loading ? <Loader2 className="animate-spin" /> : isSignUp ? 'Create Account' : 'Sign In'}
          </button>
        </form>

        <p className="mt-6 text-center text-sm text-gray-600 dark:text-gray-400">
          {isSignUp ? "Already have an account?" : "Don't have an account?"} 
          <button onClick={() => setIsSignUp(!isSignUp)} className="text-blue-600 font-bold ml-1 hover:underline">
            {isSignUp ? 'Sign In' : 'Sign Up'}
          </button>
        </p>
      </div>
    </div>
  );
}