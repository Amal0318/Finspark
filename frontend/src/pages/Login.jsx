import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { ShieldCheck, KeyRound, Mail, AlertTriangle } from 'lucide-react';

const Login = () => {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);
  
  const { login } = useAuth();
  const navigate = useNavigate();

  const handlePreFillAdmin = () => {
    setEmail('admin@cybersense.ai');
    setPassword('CyberSenseAdminSecurePass2026!');
    setError('');
  };

  const handlePreFillInvestigator = () => {
    setEmail('investigator@cybersense.ai');
    setPassword('CyberSenseInvestigator2026!');
    setError('');
  };

  const handlePreFillViewer = () => {
    setEmail('viewer@cybersense.ai');
    setPassword('CyberSenseViewer2026!');
    setError('');
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    setIsSubmitting(true);

    try {
      await login(email, password);
      navigate('/');
    } catch (err) {
      setError(
        err.response?.data?.detail || 'Authentication failed. Please verify credentials.'
      );
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="min-h-screen bg-[#090D16] flex flex-col items-center justify-center p-4 relative overflow-hidden font-sans">
      {/* Background Cyber Glowing Accents */}
      <div className="absolute top-1/4 left-1/4 w-[500px] h-[500px] bg-purple-900/10 rounded-full blur-[150px] pointer-events-none"></div>
      <div className="absolute bottom-1/4 right-1/4 w-[500px] h-[500px] bg-cyan-900/10 rounded-full blur-[150px] pointer-events-none"></div>

      <div className="w-full max-w-md z-10">
        {/* App Logo */}
        <div className="text-center mb-8">
          <div className="inline-flex bg-purple-500/10 p-4 rounded-3xl border border-purple-500/20 mb-3 shadow-lg shadow-purple-950/20">
            <ShieldCheck className="h-10 w-10 text-purple-400" />
          </div>
          <h2 className="text-2xl font-extrabold tracking-tight text-white">
            CYBER<span className="text-purple-500">SENSE</span> <span className="text-cyan-400">SOC</span>
          </h2>
          <p className="text-xs text-gray-500 mt-1 uppercase tracking-widest font-mono">
            Enterprise Security Operations Center
          </p>
        </div>

        {/* Card Box */}
        <div className="glass-panel rounded-2xl p-8 border border-gray-800 shadow-2xl relative">
          <h3 className="text-base font-bold text-white mb-6">Operator Authentication</h3>
          
          {error && (
            <div className="mb-4 bg-rose-500/10 border border-rose-550/20 text-rose-400 p-3 rounded-lg flex items-center space-x-2 text-xs">
              <AlertTriangle className="h-4 w-4 shrink-0 text-rose-500" />
              <span>{error}</span>
            </div>
          )}

          <form onSubmit={handleSubmit} className="space-y-4 text-xs">
            <div>
              <label className="block text-gray-400 mb-1.5 font-semibold">Email Address</label>
              <div className="relative">
                <Mail className="absolute left-3 top-2.5 h-4 w-4 text-gray-500" />
                <input
                  type="email"
                  required
                  placeholder="name@company.com"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  className="w-full bg-[#0F1424] border border-gray-800 rounded-lg p-2.5 pl-10 text-white focus:outline-none focus:border-purple-500 transition-colors"
                />
              </div>
            </div>

            <div>
              <label className="block text-gray-400 mb-1.5 font-semibold">Password</label>
              <div className="relative">
                <KeyRound className="absolute left-3 top-2.5 h-4 w-4 text-gray-500" />
                <input
                  type="password"
                  required
                  placeholder="••••••••"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  className="w-full bg-[#0F1424] border border-gray-800 rounded-lg p-2.5 pl-10 text-white focus:outline-none focus:border-purple-500 transition-colors"
                />
              </div>
            </div>

            <button
              type="submit"
              disabled={isSubmitting}
              className="w-full bg-indigo-600 hover:bg-indigo-500 text-white p-3 rounded-lg font-bold transition-all shadow-lg shadow-indigo-950/25 flex items-center justify-center space-x-2 disabled:opacity-50"
            >
              {isSubmitting ? (
                <span className="animate-spin rounded-full h-4 w-4 border-b-2 border-white"></span>
              ) : (
                <span>Authenticate Session</span>
              )}
            </button>
          </form>

          {/* Quick Sandbox Access Links */}
          <div className="mt-6 pt-6 border-t border-gray-800/80 text-center space-y-2">
            <p className="text-[10px] text-gray-500 uppercase tracking-widest font-mono">Sandbox Demo Quick-Fill</p>
            <div className="flex flex-col sm:flex-row justify-center items-center gap-3">
              <button
                type="button"
                onClick={handlePreFillAdmin}
                className="text-[11px] text-purple-400 hover:text-purple-300 font-semibold underline underline-offset-4 cursor-pointer"
              >
                Admin
              </button>
              <span className="text-gray-700 hidden sm:inline">•</span>
              <button
                type="button"
                onClick={handlePreFillInvestigator}
                className="text-[11px] text-indigo-400 hover:text-indigo-300 font-semibold underline underline-offset-4 cursor-pointer"
              >
                Investigator
              </button>
              <span className="text-gray-700 hidden sm:inline">•</span>
              <button
                type="button"
                onClick={handlePreFillViewer}
                className="text-[11px] text-cyan-400 hover:text-cyan-300 font-semibold underline underline-offset-4 cursor-pointer"
              >
                Viewer
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Login;
