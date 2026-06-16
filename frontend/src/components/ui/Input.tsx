import { useState } from 'react';
import { FiEye, FiEyeOff } from 'react-icons/fi';
import clsx from 'clsx';

interface InputProps extends React.InputHTMLAttributes<HTMLInputElement> {
  label?: string;
  icon?: React.ReactNode;
  error?: string;
  hint?: string;
}

export default function Input({ label, icon, error, hint, className, type, ...props }: InputProps) {
  const [showPassword, setShowPassword] = useState(false);
  const isPassword = type === 'password';

  return (
    <div className="space-y-1.5">
      {label && (
        <label className="block text-sm font-medium text-gray-300">
          {icon && <span className="inline-block mr-2">{icon}</span>}
          {label}
        </label>
      )}
      <div className="relative">
        <input
          type={isPassword && showPassword ? 'text' : type}
          className={clsx(
            'w-full px-4 py-3 bg-white/5 border rounded-xl text-white placeholder-gray-500 outline-none transition-all duration-200',
            error
              ? 'border-red-500/50 focus:border-red-500 focus:shadow-[0_0_20px_rgba(255,107,107,0.1)]'
              : 'border-white/10 focus:border-[#6C3CE1]/50 focus:shadow-[0_0_20px_rgba(108,60,225,0.1)]',
            isPassword && 'pr-12',
            className
          )}
          {...props}
        />
        {isPassword && (
          <button
            type="button"
            onClick={() => setShowPassword(!showPassword)}
            className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-500 hover:text-white transition-colors"
            tabIndex={-1}
          >
            {showPassword ? <FiEyeOff size={18} /> : <FiEye size={18} />}
          </button>
        )}
      </div>
      {error && <p className="text-sm text-red-400">{error}</p>}
      {hint && !error && <p className="text-sm text-gray-500">{hint}</p>}
    </div>
  );
}
