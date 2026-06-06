import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { Heart, Lock, User, AlertCircle } from 'lucide-react';

const Login = () => {
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState(null);
  const [loggingIn, setLoggingIn] = useState(false);
  
  const { login } = useAuth();
  const navigate = useNavigate();

  const handleLogin = async (e) => {
    e.preventDefault();
    setError(null);
    if (!username || !password) return;

    setLoggingIn(true);
    try {
      await login(username, password);
      navigate('/');
    } catch (err) {
      setError(err.message || 'Login failed. Check details.');
    } finally {
      setLoggingIn(false);
    }
  };

  return (
    <div className="min-h-screen bg-tdc-beige flex flex-col justify-center items-center py-12 px-4 sm:px-6 lg:px-8 select-none font-sans">
      
      {/* Brand logo details */}
      <div className="text-center mb-8 flex flex-col items-center">
        <Heart className="h-10 w-10 text-tdc-gold fill-tdc-gold mb-2 animate-pulse" />
        <h1 className="font-serif text-3xl sm:text-4xl font-semibold tracking-widest text-tdc-green-dark">
          THE DATE CREW
        </h1>
        <p className="font-sans text-xs font-semibold uppercase tracking-widest text-tdc-gold mt-1.5 border-t border-tdc-gold/45 pt-1.5 px-4">
          Matchmaker Co-Pilot Console
        </p>
      </div>

      {/* Login Box */}
      <div className="bg-white max-w-md w-full rounded-2xl border border-tdc-cream-dark/40 shadow-xl overflow-hidden relative">
        <div className="h-1.5 bg-gradient-to-r from-tdc-green via-tdc-gold to-tdc-green"></div>
        
        <div className="p-8 space-y-6">
          <div className="text-center space-y-1">
            <h2 className="font-serif text-xl font-bold text-tdc-green-dark">Matchmaker Sign In</h2>
            <p className="text-xs text-tdc-charcoal/50">Access your assigned customer portfolios and matchmaking algorithms.</p>
          </div>

          {error && (
            <div className="bg-rose-50 border border-rose-200 text-rose-800 text-xs px-4 py-3 rounded-lg flex items-center gap-2 font-medium">
              <AlertCircle className="h-4 w-4 text-rose-600 flex-shrink-0" />
              <span>{error}</span>
            </div>
          )}

          <form onSubmit={handleLogin} className="space-y-4">
            {/* Username */}
            <div className="space-y-1">
              <label className="text-xs font-bold text-tdc-charcoal uppercase tracking-wider">Username</label>
              <div className="relative">
                <span className="absolute inset-y-0 left-0 pl-3.5 flex items-center text-tdc-charcoal/40">
                  <User className="h-4 w-4" />
                </span>
                <input
                  type="text"
                  required
                  placeholder="e.g. matchmaker1"
                  value={username}
                  onChange={(e) => setUsername(e.target.value)}
                  className="w-full text-sm font-sans bg-white border border-tdc-cream-dark pl-10 pr-4 py-3 rounded-lg outline-none focus:border-tdc-gold smooth-transition shadow-sm"
                />
              </div>
            </div>

            {/* Password */}
            <div className="space-y-1">
              <label className="text-xs font-bold text-tdc-charcoal uppercase tracking-wider">Password</label>
              <div className="relative">
                <span className="absolute inset-y-0 left-0 pl-3.5 flex items-center text-tdc-charcoal/40">
                  <Lock className="h-4 w-4" />
                </span>
                <input
                  type="password"
                  required
                  placeholder="Enter your security password"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  className="w-full text-sm font-sans bg-white border border-tdc-cream-dark pl-10 pr-4 py-3 rounded-lg outline-none focus:border-tdc-gold smooth-transition shadow-sm"
                />
              </div>
            </div>

            {/* Submit */}
            <button
              type="submit"
              disabled={loggingIn}
              className="w-full mt-6 bg-tdc-green hover:bg-tdc-gold text-white hover:text-tdc-green-dark py-3.5 rounded-lg flex items-center justify-center gap-2 font-semibold text-xs uppercase tracking-wider border border-tdc-gold/20 hover:border-tdc-gold smooth-transition disabled:opacity-50"
            >
              {loggingIn ? (
                <>
                  <div className="animate-spin rounded-full h-4.5 w-4.5 border-2 border-white border-t-transparent"></div>
                  <span>Authenticating credentials...</span>
                </>
              ) : (
                <span>Access Console</span>
              )}
            </button>
          </form>

          {/* Credentials Helper Details */}
          <div className="bg-tdc-cream/30 border border-tdc-cream-dark/50 rounded-xl p-4 space-y-1 text-center font-sans text-xs text-tdc-charcoal/70">
            <p className="font-bold text-tdc-gold">Reviewer Test Credentials:</p>
            <p>Username: <code className="font-mono bg-white px-1.5 py-0.5 rounded border">matchmaker1</code></p>
            <p>Password: <code className="font-mono bg-white px-1.5 py-0.5 rounded border">password123</code></p>
          </div>

        </div>
      </div>
    </div>
  );
};

export default Login;
