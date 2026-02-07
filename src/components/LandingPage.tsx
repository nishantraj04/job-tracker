import { ArrowRight, CheckCircle, BarChart3, Shield, Zap, PlayCircle } from 'lucide-react';

interface LandingPageProps {
  onGetStarted: () => void;
  onViewDemo: () => void; // <--- New Prop for Demo
}

export function LandingPage({ onGetStarted, onViewDemo }: LandingPageProps) {
  return (
    <div className="min-h-screen bg-white dark:bg-gray-900 transition-colors font-sans">
      {/* Navigation */}
      <nav className="border-b border-gray-100 dark:border-gray-800 backdrop-blur-md bg-white/70 dark:bg-gray-900/70 sticky top-0 z-50">
        <div className="max-w-7xl mx-auto px-6 h-16 flex items-center justify-between">
          <div className="flex items-center gap-2">
            <div className="bg-blue-600 p-2 rounded-lg text-white shadow-lg shadow-blue-500/20">
              <BarChart3 size={20} />
            </div>
            <span className="text-xl font-bold text-gray-900 dark:text-white tracking-tight">JobTracker <span className="text-blue-600">Pro</span></span>
          </div>
          <div className="flex items-center gap-4">
             <button 
               onClick={onViewDemo}
               className="hidden sm:block text-sm font-medium text-gray-600 dark:text-gray-300 hover:text-blue-600 dark:hover:text-blue-400 transition-colors"
             >
               Live Demo
             </button>
             <button 
               onClick={onGetStarted}
               className="px-4 py-2 bg-gray-900 dark:bg-white text-white dark:text-gray-900 text-sm font-bold rounded-lg hover:opacity-90 transition-opacity"
             >
               Sign In
             </button>
          </div>
        </div>
      </nav>

      {/* Hero Section */}
      <main className="max-w-7xl mx-auto px-6 py-20 lg:py-32 flex flex-col items-center text-center">
        <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-blue-50 dark:bg-blue-900/30 text-blue-600 dark:text-blue-400 text-xs font-bold uppercase tracking-wide mb-8 animate-fade-in border border-blue-100 dark:border-blue-800">
          <span className="relative flex h-2 w-2">
            <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-blue-400 opacity-75"></span>
            <span className="relative inline-flex rounded-full h-2 w-2 bg-blue-500"></span>
          </span>
          v2.0 Now Available
        </div>

        <h1 className="text-5xl md:text-7xl font-extrabold text-gray-900 dark:text-white tracking-tight mb-8">
          Master Your <span className="text-transparent bg-clip-text bg-gradient-to-r from-blue-600 to-cyan-500">Job Search</span>
        </h1>
        
        <p className="text-xl text-gray-600 dark:text-gray-400 max-w-2xl mb-10 leading-relaxed">
          Stop using spreadsheets. Organize applications, track interviews, and analyze your progress with the professional tool built for serious candidates.
        </p>

        <div className="flex flex-col sm:flex-row gap-4 w-full justify-center mb-20">
          <button 
            onClick={onGetStarted}
            className="px-8 py-4 bg-blue-600 hover:bg-blue-700 text-white rounded-xl font-bold text-lg transition-all transform hover:scale-105 shadow-xl shadow-blue-500/30 flex items-center justify-center gap-2"
          >
            Get Started for Free <ArrowRight size={20} />
          </button>
          <button 
            onClick={onViewDemo} // <--- Connected!
            className="px-8 py-4 bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 hover:bg-gray-50 dark:hover:bg-gray-700 text-gray-900 dark:text-white rounded-xl font-bold text-lg transition-all flex items-center justify-center gap-2"
          >
            <PlayCircle size={20} /> View Demo
          </button>
        </div>

        {/* Feature Grid */}
        <div className="grid md:grid-cols-3 gap-8 w-full max-w-5xl text-left">
          {[
            { icon: Zap, color: 'blue', title: 'Fast Tracking', desc: 'Log applications in seconds. Drag-and-drop to update status instantly.' },
            { icon: Shield, color: 'purple', title: 'Secure & Private', desc: 'Your data is yours. Powered by Supabase RLS security standards.' },
            { icon: CheckCircle, color: 'green', title: 'Smart Insights', desc: 'Track your interview rates and visualize your job search funnel.' }
          ].map((feature, i) => (
            <div key={i} className="p-6 rounded-2xl bg-gray-50 dark:bg-gray-800/50 border border-gray-100 dark:border-gray-700 hover:border-blue-200 dark:hover:border-blue-800 transition-colors">
              <div className={`w-12 h-12 bg-${feature.color}-100 dark:bg-${feature.color}-900/30 rounded-xl flex items-center justify-center text-${feature.color}-600 dark:text-${feature.color}-400 mb-4`}>
                <feature.icon size={24} />
              </div>
              <h3 className="text-xl font-bold text-gray-900 dark:text-white mb-2">{feature.title}</h3>
              <p className="text-gray-600 dark:text-gray-400">{feature.desc}</p>
            </div>
          ))}
        </div>
      </main>
    </div>
  );
}