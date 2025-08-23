import React, { useState, useEffect } from 'react';
import { useAuth } from '../AuthContext';
import { Link, useNavigate } from 'react-router-dom';

const Login = () => {
  const [email, setEmail] = useState('');
  const navigate = useNavigate();
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [message, setMessage] = useState('');
  const { session, supabase } = useAuth();

  useEffect(() => {
    if (session) {
      navigate('/dashboard');
    }
  }, [session, navigate]);

  const handleLogin = async (e) => {
    e.preventDefault();
    setError('');
    setMessage('');

    const { data, error } = await supabase.auth.signInWithPassword({
      email,
      password,
    });
    console.log(data)

    if (error) {
      setError(error.message);
    } else if (data.user) {
      setMessage('Successfully logged in! Redirecting...');
    }
  };

  return (
    <div className="flex flex-col items-center justify-center min-h-screen bg-white p-4 libre-baskerville-regular">
      <div className="bg-ternary p-8 rounded-none shadow-lg w-full max-w-4xl">
        <div className="grid md:grid-cols-2 gap-8">
          {/* Login Form */}
          <div className='my-auto'>
            <div className='mx-auto justify-center flex'>
              <img src="https://res.cloudinary.com/dryxgvjhu/image/upload/v1752142159/AEG_Maharashtra_Logo_zjs0jo.png" width={250} alt="AEG Maharashtra" />
            </div>
            <h2 className="text-3xl font-bold text-center text-gray-800 mb-6">Login</h2>
            <form onSubmit={handleLogin} className="space-y-4">
              <input
                type="email"
                placeholder="Email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                className="w-full px-4 py-2 border border-gray-300 rounded-none focus:outline-none focus:ring-2 focus:ring-[#f57428]"
              />
              <input
                type="password"
                placeholder="Password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                className="w-full px-4 py-2 border border-gray-300 rounded-none focus:outline-none focus:ring-2 focus:ring-[#f57428]"
              />
              <button
                type="submit"
                className="w-full py-2 px-4 bg-secondary cursor-pointer text-white font-semibold rounded-none shadow-md transition duration-300"
              >
                Log In
              </button>
            </form>
            {error && <p className="text-red-500 text-sm mt-4 text-center">{error}</p>}
            {message && <p className="text-green-400 text-sm mt-4 text-center">{message}</p>}
            <div className="mt-6 text-center">
              <p className="text-sm text-gray-600">
                Don't have an account?{' '}
                <button onClick={() => navigate('/signup')} className="text-secondary cursor-pointer font-medium hover:underline">
                  Sign Up
                </button>
              </p>
            </div>
          </div>
          
          {/* Event Information */}
          <div className="border-l border-gray-300 pl-8">
            <h3 className="text-2xl font-bold text-gray-800 mb-4">Career Guidance Program</h3>
            <div className="text-gray-700 text-sm space-y-3">
              <p><strong>Date:</strong> 24th August 2025, Sunday</p>
              <p><strong>Time:</strong> 1:00 PM</p>
              <p><strong>Venue:</strong> Social Justice Hall, Near Collector Office, Jalna</p>
              
              <p className="mt-4">Join IAS officer Mr. R.K. Gaikwad (Former Commissioner and Secretary of Maharashtra) and renowned education expert Mr. Bhushan Ramteke (CEO, AEG Maharashtra) for an interactive guidance session for students and parents.</p>
              
              <p className="mt-4"><strong>Topics Covered:</strong></p>
              <ul className="list-disc list-inside text-sm space-y-1">
                <li>Career opportunities in corporate sector in India</li>
                <li>Higher education and career opportunities abroad</li>
                <li>Job opportunities in Japan and Germany</li>
                <li>Affordable engineering education abroad</li>
                <li>Scholarships for overseas education</li>
                <li>High-paying jobs in finance sector</li>
                <li>Career planning for current students</li>
              </ul>
              
             {/*  <p className="mt-4 text-xs">
                For free registration: https://forms.gle/ytrZV6h7ozXRvCpQ9
              </p> */}

               <p className="mt-4 text-xs">
                For free registration: <Link to="/signup" className="text-secondary">Sign Up</Link> / <Link to="/login" className="text-secondary">Login</Link>
              </p>
              
              <p className="mt-4 text-xs">
                Bhaskar Shinde<br />
                AEG Maharashtra<br />
                www.aegmaharashtra.org<br />
                Mobile: 8149993111
              </p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Login;