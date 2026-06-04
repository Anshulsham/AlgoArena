import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { useDispatch, useSelector } from 'react-redux';
import { useNavigate, NavLink } from 'react-router'; 
import { loginUser } from "../authSlice";
import { useEffect, useState } from 'react';

const loginSchema = z.object({
  emailId: z.string().email("Invalid Email"),
  password: z.string().min(8, "Password is too weak") 
});

function Login() {
  const [showPassword, setShowPassword] = useState(false);
  const dispatch = useDispatch();
  const navigate = useNavigate();
  const { isAuthenticated, loading, error } = useSelector((state) => state.auth);
  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm({ resolver: zodResolver(loginSchema) });

  useEffect(() => {
    if (isAuthenticated) {
      navigate('/');
    }
  }, [isAuthenticated, navigate]);

  const onSubmit = (data) => {
    dispatch(loginUser(data));
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-b from-gray-50 to-white">
      {/* Background decorative elements */}
      <div className="absolute inset-0 overflow-hidden pointer-events-none">
        <div className="absolute -top-40 -left-40 w-80 h-80 bg-gradient-to-r from-blue-100 to-transparent rounded-full opacity-30 blur-3xl"></div>
        <div className="absolute -bottom-40 -right-40 w-80 h-80 bg-gradient-to-r from-gray-100 to-transparent rounded-full opacity-30 blur-3xl"></div>
      </div>
      
      <div className="relative w-full max-w-md mx-4">
        <div className="rounded-2xl shadow-xl p-8 backdrop-blur-sm bg-white/95">
          {/* Logo/Header */}
          <div className="text-center mb-10">
            <div className="inline-flex items-center justify-center w-12 h-12 rounded-full bg-gradient-to-br from-zinc-900 to-indigo-700 mb-4">
              <span className="text-white font-semibold text-xl">AA</span>
            </div>
            <h1 className="text-3xl font-light tracking-tight text-indigo-900 mb-2">AlgoArena</h1>
            <p className="text-gray-500 text-sm font-light">Welcome back</p>
          </div>

          {/* API Error Message — shows backend errors like "Invalid credentials" */}
          {error && (
            <div className="mb-6 p-4 bg-red-50 border border-red-200 rounded-xl">
              <div className="flex items-center gap-2 text-red-600 text-sm font-medium">
                <svg className="w-4 h-4 shrink-0" fill="currentColor" viewBox="0 0 20 20">
                  <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zM8.707 7.293a1 1 0 00-1.414 1.414L8.586 10l-1.293 1.293a1 1 0 101.414 1.414L10 11.414l1.293 1.293a1 1 0 001.414-1.414L11.414 10l1.293-1.293a1 1 0 00-1.414-1.414L10 8.586 8.707 7.293z" clipRule="evenodd" />
                </svg>
                {error}
              </div>
            </div>
          )}

          <form onSubmit={handleSubmit(onSubmit)} className="space-y-6">
            {/* Email Field */}
            <div className="space-y-2">
              <label className="block text-sm font-medium text-zinc-900">
                Email
              </label>
              <input
  type="email"
  placeholder="john@example.com"
  className={`w-full px-4 py-3.5 text-gray-900 bg-gray-50/70 border ${
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
              <div className="flex justify-between items-center">
                <label className="block text-sm font-medium text-zinc-800">
                  Password
                </label>
                {/* <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="text-xs text-gray-500 hover:text-gray-700 font-medium transition-colors duration-150"
                >
                  {showPassword ? 'Hide' : 'Show'}
                </button> */}
              </div>
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

            {/* Forgot Password Link */}
            <div className="text-right">
              <button
                type="button"
                className="text-xs text-zinc-500 hover:text-indigo-700 font-medium transition-colors duration-150"
              >
                Forgot password?
              </button>
            </div>

            {/* Submit Button */}
            <div className="pt-2">
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
                    Signing in...
                  </span>
                ) : (
                  'Sign In'
                )}
              </button>
            </div>
          </form>

          {/* Divider */}
          <div className="relative my-8">
            <div className="absolute inset-0 flex items-center">
              <div className="w-full border-t border-zinc-600"></div>
            </div>
            <div className="relative flex justify-center text-sm">
              <span className="px-4 bg-white text-zinc-800 font-light">or</span>
            </div>
          </div>

          {/* Sign Up Redirect */}
          <div className="text-center">
            <p className="text-zinc-600 text-sm font-light">
              Don't have an account?{' '}
              <NavLink 
                to="/signup" 
                className="text-zinc-800 font-medium hover:text-indigo-950 transition-colors duration-200 border-b border-transparent hover:border-gray-900"
              >
                Create account
              </NavLink>
            </p>
            <p className="text-zinc-400 text-xs mt-4 font-light">
              By continuing, you agree to our Terms and Privacy Policy.
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

export default Login;