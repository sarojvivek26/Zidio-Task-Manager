import React, { useState } from 'react';
import { useForm } from 'react-hook-form';
import Textbox from './Textbox';
import Button from './Button';
import { toast } from 'sonner';

const ForgotPassword = ({ isOpen, onClose }) => {
  const [isLoading, setIsLoading] = useState(false);
  const {
    register,
    handleSubmit,
    formState: { errors },
    reset
  } = useForm();

  const onSubmit = async (data) => {
    try {
      setIsLoading(true);
      // Simulate API call
      await new Promise(resolve => setTimeout(resolve, 1500));
      
      toast.success('Password reset link has been sent to your email');
      reset();
      onClose();
    } catch (error) {
      toast.error('Failed to send reset link. Please try again.');
    } finally {
      setIsLoading(false);
    }
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black bg-opacity-50 transition-opacity duration-300">
      <div 
        className="relative w-full max-w-md transform overflow-hidden rounded-2xl bg-[#232342] p-8 text-left shadow-xl transition-all"
        onClick={(e) => e.stopPropagation()}
      >
        <div className="flex flex-col gap-6">
          <div>
            <h3 className="text-2xl font-bold text-white">
              Forgot Password?
            </h3>
            <p className="mt-2 text-sm text-gray-400">
              Enter your email address and we'll send you a link to reset your password.
            </p>
          </div>

          <form onSubmit={handleSubmit(onSubmit)} className="flex flex-col gap-4">
            <Textbox
              placeholder="Enter your email"
              type="email"
              name="email"
              className="w-full rounded-lg bg-[#2d2d52] text-white border-none"
              register={register("email", {
                required: "Email is required",
                pattern: {
                  value: /^[A-Z0-9._%+-]+@[A-Z0-9.-]+\.[A-Z]{2,}$/i,
                  message: "Invalid email address",
                },
              })}
              error={errors.email ? errors.email.message : ""}
            />

            <div className="flex gap-3 justify-end mt-2">
              <Button
                type="button"
                label="Cancel"
                onClick={onClose}
                className="px-4 py-2 bg-gray-600 text-white rounded-lg hover:bg-gray-700 transition-all duration-300"
              />
              <Button
                type="submit"
                label={isLoading ? "Sending..." : "Send Reset Link"}
                disabled={isLoading}
                className="px-4 py-2 bg-gradient-to-r from-blue-600 to-purple-600 text-white rounded-lg hover:from-blue-700 hover:to-purple-700 transition-all duration-300 disabled:opacity-50"
              />
            </div>
          </form>
        </div>

        {/* Close button */}
        <button
          className="absolute top-4 right-4 text-gray-400 hover:text-white transition-colors duration-300"
          onClick={onClose}
        >
          <svg className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
          </svg>
        </button>
      </div>
    </div>
  );
};

export default ForgotPassword; 