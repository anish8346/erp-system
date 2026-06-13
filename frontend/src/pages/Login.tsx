
import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import api from '../services/api';
import { Sofa } from 'lucide-react';
import { Button, Input } from '../components/UI';
import axios from 'axios';

const Login = () => {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    try {
      const res = await api.post('/auth/login', { email, password });
      localStorage.setItem('token', res.data.token);
      localStorage.setItem('user', JSON.stringify(res.data.user));
      window.location.href = '/dashboard'; 
    } catch (err: unknown) {
      let errorMsg = 'Invalid credentials or connection error.';
      if (axios.isAxiosError(err)) {
        errorMsg = err.response?.data?.error || errorMsg;
      }
      setError(errorMsg);
    }
  };

  return (
    <div className="flex items-center justify-center min-h-screen bg-faded-white relative overflow-hidden font-sans text-luxury-brown">
      {/* Decorative furniture elements */}
      <div className="absolute top-0 right-0 w-1/2 h-full bg-luxury-brown/5 skew-x-12 translate-x-20"></div>
      <div className="absolute bottom-10 left-10 opacity-5 pointer-events-none">
         <Sofa className="w-96 h-96" />
      </div>

      <div className="bg-white p-12 rounded-2xl shadow-xl w-full max-w-md relative z-10 border border-white/50 backdrop-blur-sm">
        <div className="flex flex-col items-center mb-10">
          <div className="p-4 bg-luxury-brown rounded-xl shadow-lg mb-6">
            <Sofa className="w-10 h-10 text-faded-white" />
          </div>
          <h1 className="text-2xl font-bold text-center">SHIV FURNITURE</h1>
          <p className="text-warm-taupe text-[10px] font-semibold uppercase tracking-wider mt-2">Executive Portal</p>
        </div>

        {error && (
          <div className="bg-rose-50 border border-rose-100 text-rose-700 text-[10px] font-semibold uppercase tracking-wider p-4 rounded-xl mb-6 text-center">
            {error}
          </div>
        )}

        <form onSubmit={handleLogin} className="space-y-6">
          <Input 
            label="Corporate Email" 
            type="email" 
            placeholder="name@shivfurniture.com"
            value={email}
            onChange={(e: React.ChangeEvent<HTMLInputElement>) => setEmail(e.target.value)}
            required
          />
          <Input 
            label="Secure Password" 
            type="password" 
            placeholder="••••••••"
            value={password}
            onChange={(e: React.ChangeEvent<HTMLInputElement>) => setPassword(e.target.value)}
            required
          />
          <Button 
            type="submit" 
            className="w-full py-4 text-sm font-semibold tracking-wider shadow-lg shadow-luxury-brown/10"
          >
            Authenticate
          </Button>
        </form>

        <div className="mt-10 pt-8 border-t border-[#f1ede4] text-center">
          <p className="text-[10px] font-semibold text-warm-taupe uppercase tracking-wider leading-loose">
            Private Enterprise System<br/>
            Authorized Personnel Only
          </p>
        </div>
      </div>
    </div>
  );
};

export default Login;
