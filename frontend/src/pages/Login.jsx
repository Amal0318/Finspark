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
    <div className="min-h-screen bg-gradient-to-b from-[#0B1220] via-[#111827] to-[#1F2937] flex flex-col items-center justify-center p-4 relative overflow-hidden font-sans">

      <div className="w-full max-w-md z-10">
        {/* App Logo */}
        <div className="text-center mb-8">
          <div className="inline-flex bg-[#2563EB]/10 p-4 rounded-[16px] border border-[#2563EB]/20 mb-3 shadow-lg shadow-black/20">
            <ShieldCheck className="h-10 w-10 text-[#2563EB]" />
          </div>
          <h2 className="text-2xl font-extrabold tracking-tight text-white">
            CYBER<span className="text-[#06B6D4]">SENSE</span>
          </h2>
          <p className="text-[10px] text-[#94A3B8] mt-1.5 uppercase tracking-widest font-mono font-semibold">
            Detect • Correlate • Protect
          </p>
        </div>

        {/* Card Box */}
        <div className="bg-[#1F2937] border border-[#374151] rounded-[16px] p-8 shadow-large relative">
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
                  className="w-full bg-[#111827] border border-[#374151] rounded-[10px] p-2.5 pl-10 text-[#F9FAFB] placeholder-[#64748B] focus:outline-none focus:border-[#2563EB] transition-colors"
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
                  className="w-full bg-[#111827] border border-[#374151] rounded-[10px] p-2.5 pl-10 text-[#F9FAFB] placeholder-[#64748B] focus:outline-none focus:border-[#2563EB] transition-colors"
                />
              </div>
            </div>

            <button
              type="submit"
              disabled={isSubmitting}
              className="w-full bg-[#2563EB] hover:bg-[#1D4ED8] text-white p-3 rounded-[12px] font-bold transition-all shadow-medium flex items-center justify-center space-x-2 disabled:opacity-50"
            >
              {isSubmitting ? (
                <span className="animate-spin rounded-full h-4 w-4 border-b-2 border-white"></span>
              ) : (
                <span>Authenticate Session</span>
              )}
            </button>
          </form>

          {/* Quick Sandbox Access Links */}
          <div className="mt-6 pt-6 border-t border-[#334155] text-center space-y-2">
            <p className="text-[10px] text-[#94A3B8] uppercase tracking-widest font-mono">Sandbox Demo Quick-Fill</p>
            <div className="flex flex-col sm:flex-row justify-center items-center gap-3">
              <button
                type="button"
                onClick={handlePreFillAdmin}
                className="text-[11px] text-[#2563EB] hover:text-[#1D4ED8] font-semibold underline underline-offset-4 cursor-pointer"
              >
                Admin
              </button>
              <span className="text-gray-700 hidden sm:inline">•</span>
              <button
                type="button"
                onClick={handlePreFillInvestigator}
                className="text-[11px] text-[#38BDF8] hover:text-[#06B6D4] font-semibold underline underline-offset-4 cursor-pointer"
              >
                Investigator
              </button>
              <span className="text-gray-700 hidden sm:inline">•</span>
              <button
                type="button"
                onClick={handlePreFillViewer}
                className="text-[11px] text-[#94A3B8] hover:text-[#CBD5E1] font-semibold underline underline-offset-4 cursor-pointer"
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
