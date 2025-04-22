import React, { useEffect, useState } from "react";
import { useForm } from "react-hook-form";
import { useNavigate } from "react-router-dom";
import Textbox from "../components/Textbox";
import Button from "../components/Button";
import { useSelector, useDispatch } from "react-redux";
import { setCredentials, logout } from "../redux/slices/authSlice";
import { toast } from "sonner";
import logo from "../assets/logo zidio.webp";
import ForgotPassword from "../components/ForgotPassword";

// Mock user database
const MOCK_USERS = [
  {
    id: 1,
    name: 'Test User',
    email: 'test@example.com',
    password: 'password123',
    role: 'user',
    isActive: true,
  }
];

const Login = () => {
  const { user } = useSelector((state) => state.auth);
  const dispatch = useDispatch();
  const [isLogin, setIsLogin] = useState(true);
  const [isLoading, setIsLoading] = useState(false);
  const [isAnimating, setIsAnimating] = useState(false);
  const [isForgotPasswordOpen, setIsForgotPasswordOpen] = useState(false);
  const {
    register,
    handleSubmit,
    formState: { errors },
    reset,
    setError,
  } = useForm();

  const navigate = useNavigate();

  const submitHandler = async (data) => {
    try {
      setIsLoading(true);

      // Simulate API delay
      await new Promise(resolve => setTimeout(resolve, 1000));

      if (isLogin) {
        // Login validation
        const foundUser = MOCK_USERS.find(u => u.email === data.email);
        
        if (!foundUser) {
          setError('email', {
            type: 'manual',
            message: 'No account found with this email'
          });
          toast.error('Invalid email or password');
          return;
        }

        if (foundUser.password !== data.password) {
          setError('password', {
            type: 'manual',
            message: 'Incorrect password'
          });
          toast.error('Invalid email or password');
          return;
        }

        if (!foundUser.isActive) {
          toast.error('Your account is inactive. Please contact support.');
          return;
        }

        // Successful login
        dispatch(setCredentials(foundUser));
        toast.success('Login successful!');
        navigate('/dashboard');
      } else {
        // Signup validation
        const existingUser = MOCK_USERS.find(u => u.email === data.email);
        
        if (existingUser) {
          setError('email', {
            type: 'manual',
            message: 'An account with this email already exists'
          });
          toast.error('Email already registered');
          return;
        }

        // Create new user
        const newUser = {
          id: MOCK_USERS.length + 1,
          name: data.name,
          email: data.email,
          password: data.password,
          role: "user",
          isActive: true,
        };

        // Add to mock database
        MOCK_USERS.push(newUser);

        // Login the new user
        dispatch(setCredentials(newUser));
        toast.success('Account created successfully!');
        navigate('/dashboard');
      }
    } catch (error) {
      console.error('Error:', error);
      toast.error('An error occurred. Please try again.');
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    user && navigate("/dashboard");
  }, [user]);

  const toggleForm = () => {
    setIsAnimating(true);
    setTimeout(() => {
      setIsLogin(!isLogin);
      reset();
      setIsAnimating(false);
    }, 500);
  };

  return (
    <div className='w-full min-h-screen flex items-center justify-center bg-[#1a1a2e]'>
      <div className='w-full max-w-[1400px] h-screen flex items-center justify-center'>
        {/* Login/Signup Form */}
        <div className='w-full md:w-[400px] p-4 md:p-0'>
          <form
            onSubmit={handleSubmit(submitHandler)}
            className='w-full flex flex-col gap-y-6 bg-[#232342] rounded-2xl px-8 pt-10 pb-8 transition-all duration-500 ease-in-out'
            style={{
              opacity: isAnimating ? '0' : '1',
              transform: isAnimating ? 'scale(0.98) translateY(10px)' : 'scale(1) translateY(0)',
            }}
          >
            <div className='flex flex-col items-center gap-2 mb-4'>
              <img 
                src={logo} 
                alt="Zidio Logo" 
                className='h-16 w-auto mb-2 transition-all duration-500 ease-in-out' 
                style={{
                  transform: isAnimating ? 'rotate(360deg) scale(0.8)' : 'rotate(0) scale(1)',
                  filter: 'brightness(0) invert(1)',
                }}
              />
              <h1 className='text-3xl font-bold text-white transition-all duration-500 ease-in-out'
                  style={{
                    opacity: isAnimating ? '0' : '1',
                    transform: isAnimating ? 'translateY(-10px)' : 'translateY(0)',
                  }}>
                {isLogin ? 'Welcome Back' : 'Create Account'}
              </h1>
              <p className='text-sm text-gray-400 transition-all duration-500 ease-in-out'
                 style={{
                   opacity: isAnimating ? '0' : '1',
                   transform: isAnimating ? 'translateY(-10px)' : 'translateY(0)',
                 }}>
                {isLogin ? 'Enter your credentials to continue' : 'Fill in your details to get started'}
              </p>
            </div>

            <div className='flex flex-col gap-y-4'>
              {!isLogin && (
                <div className='transition-all duration-500 ease-in-out' 
                     style={{
                       opacity: isAnimating ? '0' : '1',
                       transform: isAnimating ? 'translateY(-20px)' : 'translateY(0)',
                     }}>
                  <Textbox
                    placeholder='Full Name'
                    type='text'
                    name='name'
                    className='w-full rounded-lg bg-[#2d2d52] text-white border-none'
                    register={register("name", {
                      required: "Full name is required!",
                      minLength: {
                        value: 2,
                        message: "Name must be at least 2 characters",
                      },
                    })}
                    error={errors.name ? errors.name.message : ""}
                  />
                </div>
              )}
              <div className='transition-all duration-500 ease-in-out'
                   style={{
                     transform: `translateY(${isAnimating ? '-20px' : '0'})`,
                     opacity: isAnimating ? '0' : '1',
                   }}>
                <Textbox
                  placeholder={isLogin ? 'Email Address' : 'Your Email'}
                  type='email'
                  name='email'
                  className='w-full rounded-lg bg-[#2d2d52] text-white border-none'
                  register={register("email", {
                    required: "Email Address is required!",
                    pattern: {
                      value: /^[A-Z0-9._%+-]+@[A-Z0-9.-]+\.[A-Z]{2,}$/i,
                      message: "Invalid email address",
                    },
                  })}
                  error={errors.email ? errors.email.message : ""}
                />
              </div>
              <div className='transition-all duration-500 ease-in-out'
                   style={{
                     transform: `translateY(${isAnimating ? '-20px' : '0'})`,
                     opacity: isAnimating ? '0' : '1',
                   }}>
                <Textbox
                  placeholder='Password'
                  type='password'
                  name='password'
                  className='w-full rounded-lg bg-[#2d2d52] text-white border-none'
                  register={register("password", {
                    required: "Password is required!",
                    minLength: {
                      value: 6,
                      message: "Password must be at least 6 characters",
                    },
                  })}
                  error={errors.password ? errors.password.message : ""}
                />
              </div>

              {isLogin && (
                <div className='flex items-center justify-between transition-all duration-500 ease-in-out'
                     style={{
                       opacity: isAnimating ? '0' : '1',
                       transform: `translateY(${isAnimating ? '-20px' : '0'})`,
                     }}>
                  <label className='flex items-center gap-2 cursor-pointer'>
                    <input type='checkbox' className='w-4 h-4 rounded bg-[#2d2d52] border-none focus:ring-0 text-blue-600' />
                    <span className='text-sm text-gray-400'>Remember me</span>
                  </label>
                  <button
                    type="button"
                    onClick={() => setIsForgotPasswordOpen(true)}
                    className='text-sm text-blue-500 hover:text-blue-400 cursor-pointer transition-colors duration-300'
                  >
                    Forgot password?
                  </button>
                </div>
              )}

              <Button
                type='submit'
                label={isLoading ? 'Loading...' : (isLogin ? 'LOGIN' : 'SIGN UP')}
                className='w-full h-12 bg-gradient-to-r from-blue-600 to-purple-600 text-white rounded-lg font-medium hover:from-blue-700 hover:to-purple-700 transition-all duration-500 disabled:opacity-50 transform hover:scale-[1.02]'
                disabled={isLoading || isAnimating}
              />

              <p className='text-center text-sm text-gray-400 transition-all duration-500 ease-in-out'
                 style={{
                   opacity: isAnimating ? '0' : '1',
                   transform: `translateY(${isAnimating ? '-20px' : '0'})`,
                 }}>
                {isLogin ? "Don't have an account?" : "Already have an account?"}{" "}
                <span
                  onClick={toggleForm}
                  className='text-blue-500 hover:text-blue-400 cursor-pointer transition-colors duration-300'
                >
                  {isLogin ? 'Sign up' : 'Login'}
                </span>
              </p>
            </div>
          </form>
        </div>

        {/* Right side gradient design */}
        <div className='hidden md:flex flex-1 h-screen bg-gradient-to-br from-blue-600 via-purple-600 to-purple-800 items-center justify-center'>
          <div className='relative w-full max-w-2xl px-8'>
            <div className='absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 w-64 h-64 bg-blue-500 rounded-full filter blur-3xl opacity-30'></div>
            <div className='absolute top-1/3 right-1/4 w-48 h-48 bg-purple-500 rounded-full filter blur-3xl opacity-30'></div>
            <div className='relative z-10'>
              <h2 className='text-5xl font-bold text-white mb-6 transition-all duration-500 ease-in-out'
                  style={{
                    opacity: isAnimating ? '0' : '1',
                    transform: isAnimating ? 'translateY(-20px)' : 'translateY(0)',
                  }}>
                {isLogin ? 'Welcome Back!' : 'Join Us Today!'}
              </h2>
              <p className='text-lg text-gray-200 max-w-md transition-all duration-500 ease-in-out'
                 style={{
                   opacity: isAnimating ? '0' : '1',
                   transform: isAnimating ? 'translateY(-20px)' : 'translateY(0)',
                 }}>
                {isLogin 
                  ? 'Sign in to access your account and manage your tasks efficiently.'
                  : 'Create an account to start managing your tasks and boost your productivity.'}
              </p>
            </div>
          </div>
        </div>
      </div>

      {/* Forgot Password Modal */}
      <ForgotPassword 
        isOpen={isForgotPasswordOpen}
        onClose={() => setIsForgotPasswordOpen(false)}
      />
    </div>
  );
};

export default Login;
