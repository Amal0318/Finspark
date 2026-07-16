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
    <div className="min-h-screen bg-surface flex flex-col items-center justify-center p-4 relative overflow-hidden font-sans">
      {/* Background Accents */}
      <div className="absolute top-1/4 left-1/4 w-[500px] h-[500px] bg-primary/5 rounded-full blur-[150px] pointer-events-none"></div>
      <div className="absolute bottom-1/4 right-1/4 w-[500px] h-[500px] bg-secondary-container/30 rounded-full blur-[150px] pointer-events-none"></div>

      <div className="w-full max-w-md z-10">
        {/* App Logo */}
        <div className="text-center mb-8">
          <div className="inline-flex bg-primary-container p-4 rounded-3xl border border-primary/20 mb-3 shadow-lg shadow-primary/10">
            <ShieldCheck className="h-10 w-10 text-primary" />
          </div>
          <h2 className="text-3xl font-extrabold tracking-tight text-on-surface">
            SENTINEL<span className="text-primary">X</span>
          </h2>
          <p className="text-xs text-on-surface-variant mt-1 uppercase tracking-widest font-mono">
            Enterprise Security Operations Center
          </p>
        </div>

        {/* Card Box */}
        <div className="bg-white rounded-2xl p-8 border border-outline-variant shadow-2xl relative">
          <h3 className="font-headline-sm text-headline-sm text-on-surface mb-6">Operator Authentication</h3>
          
          {error && (
            <div className="mb-6 bg-error-container border border-error/20 text-on-error-container p-4 rounded-xl flex items-center space-x-3 text-sm">
              <AlertTriangle className="h-5 w-5 shrink-0 text-error" />
              <span>{error}</span>
            </div>
          )}

          <form onSubmit={handleSubmit} className="space-y-5">
            <div>
              <label className="block text-label-sm font-label-sm text-on-surface-variant uppercase tracking-wider mb-2">Email Address</label>
              <div className="relative">
                <Mail className="absolute left-4 top-3.5 h-5 w-5 text-on-surface-variant" />
                <input
                  type="email"
                  required
                  placeholder="name@company.com"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  className="w-full bg-surface-container-lowest border border-outline-variant rounded-xl p-3 pl-12 text-on-surface font-body-md focus:outline-none focus:border-primary focus:ring-1 focus:ring-primary transition-all shadow-sm"
                />
              </div>
            </div>

            <div>
              <label className="block text-label-sm font-label-sm text-on-surface-variant uppercase tracking-wider mb-2">Password</label>
              <div className="relative">
                <KeyRound className="absolute left-4 top-3.5 h-5 w-5 text-on-surface-variant" />
                <input
                  type="password"
                  required
                  placeholder="••••••••"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  className="w-full bg-surface-container-lowest border border-outline-variant rounded-xl p-3 pl-12 text-on-surface font-body-md focus:outline-none focus:border-primary focus:ring-1 focus:ring-primary transition-all shadow-sm"
                />
              </div>
            </div>

            <button
              type="submit"
              disabled={isSubmitting}
              className="w-full bg-primary hover:bg-primary/90 text-white p-3.5 rounded-xl font-label-md shadow-sm disabled:opacity-50 transition-all flex items-center justify-center space-x-2 active:scale-95 mt-4"
            >
              {isSubmitting ? (
                <span className="animate-spin rounded-full h-5 w-5 border-b-2 border-white"></span>
              ) : (
                <span>Authenticate Session</span>
              )}
            </button>
          </form>

          {/* Quick Seeding Help */}
          <div className="mt-8 pt-6 border-t border-outline-variant text-center">
            <button
              onClick={handlePreFillAdmin}
              className="text-label-sm text-primary hover:text-primary/80 font-semibold underline underline-offset-4 transition-colors"
            >
              Use System Administrator Sandbox Access
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Login;
