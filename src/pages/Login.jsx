import React, { useEffect, useState } from "react";
import { useForm } from "react-hook-form";
import { useNavigate } from "react-router-dom";
import Textbox from "../components/Textbox";
import Button from "../components/Button";
import { useSelector, useDispatch } from "react-redux";
import { setCredentials, logout } from "../redux/slices/authSlice";
import { toast } from "sonner";
import logo from "../assets/logo zidio.webp";

const Login = () => {
  const { user } = useSelector((state) => state.auth);
  const dispatch = useDispatch();
  const [isLogin, setIsLogin] = useState(true);
  const [isLoading, setIsLoading] = useState(false);
  const {
    register,
    handleSubmit,
    formState: { errors },
    reset,
  } = useForm();

  const navigate = useNavigate();

  const submitHandler = async (data) => {
    try {
      setIsLoading(true);
      if (isLogin) {
        // Mock login logic
        const mockUser = {
          id: 1,
          name: data.email.split('@')[0], // Use part of email as name for login
          email: data.email,
          role: "user",
          isActive: true,
        };

        // Simulate API delay
        await new Promise(resolve => setTimeout(resolve, 1000));

        dispatch(setCredentials(mockUser));
        toast.success('Login successful!');
        navigate('/dashboard');
      } else {
        // Mock signup logic
        const mockUser = {
          id: 1,
          name: data.name,
          email: data.email,
          role: "user",
          isActive: true,
        };

        // Simulate API delay
        await new Promise(resolve => setTimeout(resolve, 1000));

        dispatch(setCredentials(mockUser));
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
    setIsLogin(!isLogin);
    reset();
  };

  return (
    <div className='w-full min-h-screen flex items-center justify-center flex-col lg:flex-row bg-[#f3f4f6]'>
      <div className='w-full md:w-auto flex gap-0 md:gap-40 flex-col md:flex-row items-center justify-center'>
        {/* left side */}
        <div className='h-full w-full lg:w-2/3 flex flex-col items-center justify-center'>
          <div className='w-full md:max-w-lg 2xl:max-w-3xl flex flex-col items-center justify-center gap-5 md:gap-y-10 2xl:-mt-20'>
            <span className='flex gap-1 py-1 px-3 border rounded-full text-sm md:text-base bordergray-300 text-gray-600'>
              Manage all your task in one place!
            </span>
            <p className='flex flex-col gap-0 md:gap-4 text-4xl md:text-6xl 2xl:text-7xl font-black text-center text-blue-700'>
              <span>Zidio</span>
              <span>Task Manager</span>
            </p>

            <div className='cell'>
              <div className='circle rotate-in-up-left'></div>
            </div>
          </div>
        </div>

        {/* right side */}
        <div className='w-full md:w-1/3 p-4 md:p-1 flex flex-col justify-center items-center'>
          <form
            onSubmit={handleSubmit(submitHandler)}
            className='form-container w-full md:w-[400px] flex flex-col gap-y-8 bg-white px-10 pt-14 pb-14'
          >
            <div className=''>
              <div className='flex flex-col items-center gap-2'>
                {isLogin ? (
                  <>
                    <img src={logo} alt="Zidio Logo" className='h-12 md:h-16' />
                    <p className='text-2xl font-bold text-blue-600'>Task Manager</p>
                  </>
                ) : (
                  <p className='text-blue-600 text-3xl font-bold text-center'>Create Account</p>
                )}
              </div>
              <p className='text-center text-base text-gray-700'>
                {isLogin ? 'Keep all your credentials safe.' : 'Join us to manage your tasks.'}
              </p>
            </div>

            <div className='flex flex-col gap-y-5'>
              {!isLogin && (
                <Textbox
                  placeholder='Your Name'
                  type='text'
                  name='name'
                  label='Full Name'
                  className='w-full rounded-full'
                  register={register("name", {
                    required: "Name is required!",
                    minLength: {
                      value: 2,
                      message: "Name must be at least 2 characters",
                    },
                  })}
                  error={errors.name ? errors.name.message : ""}
                />
              )}
              <Textbox
                placeholder='email@example.com'
                type='email'
                name='email'
                label='Email Address'
                className='w-full rounded-full'
                register={register("email", {
                  required: "Email Address is required!",
                  pattern: {
                    value: /^[A-Z0-9._%+-]+@[A-Z0-9.-]+\.[A-Z]{2,}$/i,
                    message: "Invalid email address",
                  },
                })}
                error={errors.email ? errors.email.message : ""}
              />
              <Textbox
                placeholder='your password'
                type='password'
                name='password'
                label='Password'
                className='w-full rounded-full'
                register={register("password", {
                  required: "Password is required!",
                  minLength: {
                    value: 6,
                    message: "Password must be at least 6 characters",
                  },
                })}
                error={errors.password ? errors.password.message : ""}
              />

              {isLogin && (
                <span className='text-sm text-gray-500 hover:text-blue-600 hover:underline cursor-pointer'>
                  Forget Password?
                </span>
              )}

              <Button
                type='submit'
                label={isLoading ? 'Loading...' : (isLogin ? 'Login' : 'Sign Up')}
                className='w-full h-10 bg-blue-700 text-white rounded-full disabled:opacity-50'
                disabled={isLoading}
              />

              <p className='text-center text-sm text-gray-600'>
                {isLogin ? "Don't have an account?" : "Already have an account?"}{" "}
                <span
                  onClick={toggleForm}
                  className='text-blue-600 hover:underline cursor-pointer'
                >
                  {isLogin ? 'Sign Up' : 'Login'}
                </span>
              </p>
            </div>
          </form>
        </div>
      </div>
    </div>
  );
};

export default Login;
