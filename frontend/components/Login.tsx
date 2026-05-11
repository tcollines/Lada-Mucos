import React, { useState, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { ShieldCheck, Mail, Lock, ArrowRight, Eye, EyeOff } from 'lucide-react';
import { useGoogleLogin } from '@react-oauth/google';
import { supabase } from '../supabase';

interface LoginProps {
  data: any;
  updateData: (updater: (prev: any) => any) => void;
}

const slides = [
  { url: '/images/slide1.jpg', note: 'Empowering your financial future through sustainable agriculture and forestry' },
  { url: '/images/slide2.jpg', note: 'Join our community of prosperous members farming for a better tomorrow' },
  { url: '/images/slide3.jpg', note: 'Demonstrating our investment in the transportation app called Lift', scaleX: -1 }
];

const Login: React.FC<LoginProps> = ({ data, updateData }) => {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [currentSlide, setCurrentSlide] = useState(0);
  const navigate = useNavigate();

  useEffect(() => {
    const timer = setInterval(() => {
      setCurrentSlide((prev) => (prev + 1) % slides.length);
    }, 5000);
    return () => clearInterval(timer);
  }, []);

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    const user = data.users.find((u: any) => u.email.toLowerCase() === email.toLowerCase());
    
    // 1. Admin hardcoded login
    const isAdmin = email.toLowerCase() === 'admin@lada.ug' && password === 'admin123';
    // 2. Fallback check for manually imported members without Supabase Auth accounts
    const isLegacyMember = user && (password === user.password || password === '123456');

    if (isAdmin) {
      updateData((prev: any) => ({ 
        ...prev, 
        currentUser: user || data.users.find((u:any) => u.email === 'admin@lada.ug') 
      }));
      navigate('/');
      return;
    }

    try {
      // 3. Primary check: Use Supabase Auth for all new users
      const { data: authData, error } = await supabase.auth.signInWithPassword({
        email,
        password
      });

      if (!error && authData?.session) {
         // App.tsx's onAuthStateChange listener will automatically detect the SIGNED_IN event.
         // If they don't exist in the users table yet, App.tsx will seamlessly initialize their DB profile using their user_metadata.
         // For instant feedback if they ALREADY exist in users:
         if (user) {
           updateData((prev: any) => ({ ...prev, currentUser: user }));
           navigate('/');
         }
         return;
      }

      // If Supabase check fails but they are an imported member
      if (isLegacyMember) {
        updateData((prev: any) => ({ ...prev, currentUser: user }));
        navigate('/');
        return;
      }

      alert('Authentication Failed. Please check your credentials, or verify your email if you just registered.');
    } catch (err: any) {
      alert('Authentication Failed.');
    }
  };

  const login = useGoogleLogin({
    onSuccess: async (tokenResponse) => {
      try {
        const res = await fetch('https://www.googleapis.com/oauth2/v3/userinfo', {
          headers: { Authorization: `Bearer ${tokenResponse.access_token}` },
        });
        const userInfo = await res.json();
        const googleEmail = userInfo.email;
        
        const user = data.users.find((u: any) => u.email.toLowerCase() === googleEmail.toLowerCase());
        const isAdmin = googleEmail.toLowerCase() === 'admin@lada.ug';

        if (isAdmin || user) {
          updateData((prev: any) => ({ 
            ...prev, 
            currentUser: user || data.users.find((u:any) => u.email === 'admin@lada.ug') 
          }));
          navigate('/');
        } else {
          alert('User not found. Please sign up first.');
        }
      } catch (err) {
        console.error('Google Auth Fetch Error:', err);
        alert('Authentication Failed.');
      }
    },
    onError: () => {
      alert('Google Login Failed');
    }
  });

  return (
    <div className="h-screen w-full relative flex overflow-hidden bg-black">
      {/* Background Slideshow */}
      {slides.map((slide, index) => (
        <div
          key={slide.url}
          className={`absolute inset-0 transition-opacity duration-1000 ease-in-out ${
            index === currentSlide ? 'opacity-100' : 'opacity-0'
          }`}
        >
          {/* We separate the background image div from the overlay to only flip the image if needed */}
          <div 
            className="absolute inset-0 w-full h-full"
            style={{
              backgroundImage: `url(${slide.url})`,
              backgroundSize: 'cover',
              backgroundPosition: 'center',
              transform: slide.scaleX ? `scaleX(${slide.scaleX})` : 'none'
            }}
          />
          {/* Dark overlay for better text readability and overall aesthetics */}
          <div className="absolute inset-0 bg-black/50" />
        </div>
      ))}

      {/* Slide Note (Bottom Left) */}
      <div className="absolute bottom-12 left-12 text-white z-10 max-w-2xl hidden md:block">
        <h2 className="text-4xl font-bold leading-tight drop-shadow-lg text-white/90">
          {slides[currentSlide].note}
        </h2>
        <div className="w-16 h-1 bg-sac-green mt-6 rounded-full opacity-80" />
      </div>

      {/* Login Form on the right */}
      <div className="relative z-10 w-full md:w-[450px] lg:w-[480px] ml-auto h-full overflow-y-auto flex flex-col justify-center bg-black/40 backdrop-blur-md border-l border-white/10 shadow-2xl p-8 lg:p-12">
        <div className="w-full max-w-md space-y-8 bg-transparent">
          <div className="text-center">
            <div className="w-20 h-20 bg-sac-green/90 backdrop-blur-sm rounded-2xl flex items-center justify-center text-white mx-auto mb-6 shadow-[0_0_30px_rgba(22,101,52,0.5)] border border-white/20">
              <ShieldCheck size={40} />
            </div>
            <h1 className="text-3xl font-bold text-white tracking-tight">Lada Multipurpose</h1>
            <p className="text-gray-300 mt-2 font-medium">Securely access your account.</p>
          </div>

          <form onSubmit={handleLogin} className="space-y-6">
            <div className="space-y-4">
              <div className="relative group">
                <Mail className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400 group-focus-within:text-sac-green transition-colors" size={18} />
                <input 
                  type="email" 
                  required 
                  className="w-full pl-12 pr-4 py-4 bg-white/10 border border-white/20 rounded-xl outline-none focus:ring-2 focus:ring-sac-green focus:border-transparent text-white placeholder-gray-400 font-medium backdrop-blur-sm transition-all" 
                  placeholder="Email Address" 
                  value={email} 
                  onChange={(e) => setEmail(e.target.value)} 
                />
              </div>
              <div className="relative group">
                <Lock className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400 group-focus-within:text-sac-green transition-colors" size={18} />
                <input 
                  type={showPassword ? 'text' : 'password'}
                  required 
                  className="w-full pl-12 pr-12 py-4 bg-white/10 border border-white/20 rounded-xl outline-none focus:ring-2 focus:ring-sac-green focus:border-transparent text-white placeholder-gray-400 font-medium backdrop-blur-sm transition-all" 
                  placeholder="Password" 
                  value={password} 
                  onChange={(e) => setPassword(e.target.value)} 
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(v => !v)}
                  className="absolute right-4 top-1/2 -translate-y-1/2 text-gray-400 hover:text-white transition-colors focus:outline-none"
                  tabIndex={-1}
                >
                  {showPassword ? <EyeOff size={18} /> : <Eye size={18} />}
                </button>
              </div>
            </div>

            <div className="flex justify-end -mt-2">
              <Link
                to="/reset-password"
                className="text-sm text-gray-300 hover:text-white transition-colors hover:underline underline-offset-4 decoration-sac-green"
              >
                Forgot Password?
              </Link>
            </div>

            <button type="submit" className="w-full bg-sac-green text-white py-4 rounded-xl font-bold flex items-center justify-center gap-2 hover:bg-emerald-700 transition-all shadow-[0_8px_20px_rgba(22,101,52,0.4)] hover:shadow-[0_12px_25px_rgba(22,101,52,0.6)] hover:-translate-y-1">
              Sign In
              <ArrowRight size={18} />
            </button>
          </form>

          <div className="flex items-center gap-4 pt-2">
            <div className="flex-1 h-px bg-white/10" />
            <span className="text-xs font-bold text-white/40 tracking-widest uppercase">Or continue with</span>
            <div className="flex-1 h-px bg-white/10" />
          </div>

          <div className="flex justify-center w-full pb-2">
            <button
              type="button"
              onClick={() => login()}
              className="w-12 h-12 flex items-center justify-center bg-white rounded-full hover:-translate-y-1 transition-transform shadow-lg hover:shadow-[0_0_20px_rgba(255,255,255,0.2)] focus:outline-none focus:ring-2 focus:ring-white/50"
            >
              <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" width="22" height="22">
                <path d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z" fill="#4285F4"/>
                <path d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z" fill="#34A853"/>
                <path d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z" fill="#FBBC05"/>
                <path d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z" fill="#EA4335"/>
              </svg>
            </button>
          </div>

          <div className="text-center pt-2">
            <Link to="/signup" className="text-gray-300 hover:text-white font-medium text-sm transition-colors decoration-sac-green decoration-2 underline-offset-4 hover:underline">
              Create a Membership Account
            </Link>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Login;
