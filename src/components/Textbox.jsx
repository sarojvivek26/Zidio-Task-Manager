import React from "react";
import clsx from "clsx";

const Textbox = React.forwardRef(
  ({ type, placeholder, label, className, register, name, error }, ref) => {
    return (
      <div className='w-full flex flex-col gap-1'>
        {label && (
          <label htmlFor={name} className='text-gray-300 text-sm mb-1'>
            {label}
          </label>
        )}

        <div className='relative'>
          <input
            type={type}
            name={name}
            placeholder={placeholder}
            ref={ref}
            {...register}
            aria-invalid={error ? "true" : "false"}
            className={clsx(
              "w-full bg-[#2d2d52] text-white placeholder-gray-400 px-4 py-3 rounded-lg outline-none transition-all duration-200",
              "focus:ring-2 focus:ring-blue-500/50 hover:bg-[#343463]",
              error ? "ring-2 ring-red-500/50" : "",
              className
            )}
          />
        </div>
        {error && (
          <span className='text-xs text-red-400 mt-1'>{error}</span>
        )}
      </div>
    );
  }
);

export default Textbox;
