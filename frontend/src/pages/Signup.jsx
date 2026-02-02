import { useState, useEffect } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { useDispatch, useSelector } from 'react-redux';
import { useNavigate, NavLink } from 'react-router';
import { registerUser } from '../authSlice';

const signupSchema = z.object({
  firstName: z.string().min(3, "Minimum character should be 3"),
  emailId: z.string().email("Invalid Email"),
  password: z.string().min(8, "Password is too weak")
});

function Signup() {
  const [showPassword, setShowPassword] = useState(false);
  const dispatch = useDispatch();
  const navigate = useNavigate();
  const { isAuthenticated, loading } = useSelector((state) => state.auth); // Removed error as it wasn't used

  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm({ resolver: zodResolver(signupSchema) });

  useEffect(() => {
    if (isAuthenticated) {
      navigate('/');
    }
  }, [isAuthenticated, navigate]);

  const onSubmit = (data) => {
    dispatch(registerUser(data));
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-b from-gray-50 to-white">
      {/* Background decorative elements */}
      <div className="absolute inset-0 overflow-hidden pointer-events-none">
        <div className="absolute -top-40 -right-40 w-80 h-80 bg-gradient-to-r from-blue-100 to-transparent rounded-full opacity-30 blur-3xl"></div>
        <div className="absolute -bottom-40 -left-40 w-80 h-80 bg-gradient-to-r from-zinc-100 to-transparent rounded-full opacity-30 blur-3xl"></div>
      </div>
      
      <div className="relative w-full max-w-md mx-4">
        <div className="rounded-2xl shadow-xl p-8 backdrop-blur-sm bg-white/95">
          {/* Logo/Header */}
          <div className="text-center mb-10">
            <div className="inline-flex items-center justify-center w-12 h-12 rounded-full bg-gradient-to-br from-zinc-900 to-indigo-700 mb-4">
              <span className="text-white font-semibold text-xl">AA</span>
            </div>
            <h1 className="text-3xl font-light tracking-tight text-zinc-900 mb-2">AlgoArena</h1>
            <p className="text-zinc-500 text-sm font-light">Create your account</p>
          </div>

          <form onSubmit={handleSubmit(onSubmit)} className="space-y-6">
            {/* First Name Field */}
            <div className="space-y-2">
              <label className="block text-sm font-medium text-zinc-700">
                First Name
              </label>
              <input
  type="text"
  placeholder="John"
  className={`w-full px-4 py-3.5 text-zinc-900 bg-indigo-50/70 border ${
    errors.firstName 
      ? 'border-red-400 focus:border-red-500 focus:ring-1 focus:ring-red-500' 
      : 'border-gray-200 focus:border-gray-400 focus:ring-1 focus:ring-gray-300'
  } rounded-xl transition-all duration-200 outline-none placeholder:text-gray-400`}
  {...register('firstName')}
/>
              {errors.firstName && (
                <span className="text-red-500 text-xs font-medium flex items-center gap-1 mt-1">
                  <svg className="w-3 h-3" fill="currentColor" viewBox="0 0 20 20">
                    <path fillRule="evenodd" d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7 4a1 1 0 11-2 0 1 1 0 012 0zm-1-9a1 1 0 00-1 1v4a1 1 0 102 0V6a1 1 0 00-1-1z" clipRule="evenodd" />
                  </svg>
                  {errors.firstName.message}
                </span>
              )}
            </div>

            {/* Email Field */}
            <div className="space-y-2">
              <label className="block text-sm font-medium text-zinc-700">
                Email
              </label>
              <input
  type="email"
  placeholder="john@example.com"
  className={`w-full px-4 py-3.5 text-zinc-900 bg-indigo-50/70 border ${
    errors.emailId 
      ? 'border-red-400 focus:border-red-500 focus:ring-1 focus:ring-red-500' 
      : 'border-gray-200 focus:border-gray-400 focus:ring-1 focus:ring-gray-300'
  } rounded-xl transition-all duration-200 outline-none placeholder:text-gray-400`}
  {...register('emailId')}
/>
              {errors.emailId && (
                <span className="text-red-500 text-xs font-medium flex items-center gap-1 mt-1">
                  <svg className="w-3 h-3" fill="currentColor" viewBox="0 0 20 20">
                    <path fillRule="evenodd" d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7 4a1 1 0 11-2 0 1 1 0 012 0zm-1-9a1 1 0 00-1 1v4a1 1 0 102 0V6a1 1 0 00-1-1z" clipRule="evenodd" />
                  </svg>
                  {errors.emailId.message}
                </span>
              )}
            </div>

            {/* Password Field with Toggle */}
            <div className="space-y-2">
              <label className="block text-sm font-medium text-zinc-700">
                Password
              </label>
              <div className="relative">
                <input
  type={showPassword ? "text" : "password"}
  placeholder="••••••••"
  className={`w-full px-4 py-3.5 text-zinc-900 bg-indigo-50/70 border ${
    errors.password 
      ? 'border-red-400 focus:border-red-500 focus:ring-1 focus:ring-red-500' 
      : 'border-gray-200 focus:border-gray-400 focus:ring-1 focus:ring-gray-300'
  } rounded-xl transition-all duration-200 outline-none placeholder:text-gray-400 pr-12`}
  {...register('password')}
/>
                <button
                  type="button"
                  className="absolute right-3 top-1/2 transform -translate-y-1/2 text-zinc-400 hover:text-indigo-600 p-1.5 rounded-lg hover:bg-gray-100 transition-colors duration-150"
                  onClick={() => setShowPassword(!showPassword)}
                  aria-label={showPassword ? "Hide password" : "Show password"}
                >
                  {showPassword ? (
                    <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M13.875 18.825A10.05 10.05 0 0112 19c-4.478 0-8.268-2.943-9.543-7a9.97 9.97 0 011.563-3.029m5.858.908a3 3 0 114.243 4.243M9.878 9.878l4.242 4.242M9.88 9.88l-3.29-3.29m7.532 7.532l3.29 3.29M3 3l3.59 3.59m0 0A9.953 9.953 0 0112 5c4.478 0 8.268 2.943 9.543 7a10.025 10.025 0 01-4.132 5.411m0 0L21 21" />
                    </svg>
                  ) : (
                    <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z" />
                    </svg>
                  )}
                </button>
              </div>
              {errors.password && (
                <span className="text-red-500 text-xs font-medium flex items-center gap-1 mt-1">
                  <svg className="w-3 h-3" fill="currentColor" viewBox="0 0 20 20">
                    <path fillRule="evenodd" d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7 4a1 1 0 11-2 0 1 1 0 012 0zm-1-9a1 1 0 00-1 1v4a1 1 0 102 0V6a1 1 0 00-1-1z" clipRule="evenodd" />
                  </svg>
                  {errors.password.message}
                </span>
              )}
            </div>

            {/* Submit Button */}
            <div className="pt-4">
              <button
                type="submit"
                disabled={loading}
                className={`w-full bg-gradient-to-r from-zinc-900 to-indigo-800 text-white font-medium py-3.5 px-4 rounded-xl hover:from-zinc-800 hover:to-indigo-700 active:scale-[0.99] transition-all duration-200 shadow-md hover:shadow-lg ${
                  loading ? 'opacity-70 cursor-not-allowed' : ''
                }`}
              >
                {loading ? (
                  <span className="flex items-center justify-center gap-2">
                    <svg className="animate-spin h-5 w-5 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                      <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                      <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                    </svg>
                    Creating Account...
                  </span>
                ) : (
                  'Sign Up'
                )}
              </button>
            </div>
          </form>

          {/* Login Redirect */}
          <div className="text-center pt-8 mt-8 border-t border-zinc-100">
            <p className="text-zinc-600 text-sm font-light">
              Already have an account?{' '}
              <NavLink 
                to="/login" 
                className="text-zinc-900 font-medium hover:text-indigo-700 transition-colors duration-200 border-b border-transparent hover:border-gray-900"
              >
                Sign in
              </NavLink>
            </p>
            <p className="text-zinc-400 text-xs mt-4 font-light">
              By signing up, you agree to our Terms and Privacy Policy.
            </p>
          </div>
        </div>
        
        {/* Subtle footer note */}
        {/* <div className="text-center mt-8">
          <p className="text-gray-400 text-xs font-light tracking-wide">
            Premium coding platform • Clean design • Premium experience
          </p>
        </div> */}
      </div>
    </div>
  );
}

export default Signup;