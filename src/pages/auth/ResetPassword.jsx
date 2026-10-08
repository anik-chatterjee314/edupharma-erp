import React, { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { Eye, EyeOff, Lock, Check } from 'lucide-react';
import toast from 'react-hot-toast';
import { Button } from '../../components/ui';

const ResetPassword = () => {
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [loading, setLoading] = useState(false);
  const navigate = useNavigate();

  const calculateStrength = (pass) => {
    let score = 0;
    if (pass.length > 8) score += 1;
    if (/[A-Z]/.test(pass)) score += 1;
    if (/[0-9]/.test(pass)) score += 1;
    if (/[^A-Za-z0-9]/.test(pass)) score += 1;
    return score;
  };

  const strength = calculateStrength(password);
  
  const getStrengthColor = () => {
    if (strength === 0) return 'bg-gray-200';
    if (strength === 1) return 'bg-red-500';
    if (strength === 2) return 'bg-amber-500';
    if (strength === 3) return 'bg-blue-500';
    return 'bg-emerald-500';
  };

  const getStrengthLabel = () => {
    if (password.length === 0) return '';
    if (strength <= 1) return 'Weak';
    if (strength === 2) return 'Fair';
    if (strength === 3) return 'Good';
    return 'Strong';
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    if (password !== confirmPassword) {
      toast.error('Passwords do not match');
      return;
    }
    if (strength < 2) {
      toast.error('Please choose a stronger password');
      return;
    }

    setLoading(true);
    // Simulate API call
    setTimeout(() => {
      setLoading(false);
      toast.success('Password successfully reset!');
      navigate('/login');
    }, 1000);
  };

  return (
    <div>
      <div className="mb-6 text-center">
        <h3 className="text-xl font-semibold text-gray-900">Set new password</h3>
        <p className="text-sm text-gray-500 mt-2">
          Your new password must be different to previously used passwords.
        </p>
      </div>

      <form onSubmit={handleSubmit} className="space-y-5">
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">
            New Password
          </label>
          <div className="relative">
            <input
              type={showPassword ? 'text' : 'password'}
              required
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              className="w-full pl-4 pr-10 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-primary-500 outline-none transition-shadow"
              placeholder="••••••••"
            />
            <button
              type="button"
              onClick={() => setShowPassword(!showPassword)}
              className="absolute inset-y-0 right-0 pr-3 flex items-center text-gray-400 hover:text-gray-500"
            >
              {showPassword ? <EyeOff className="h-5 w-5" /> : <Eye className="h-5 w-5" />}
            </button>
          </div>
          
          {password.length > 0 && (
            <div className="mt-2">
              <div className="flex gap-1 mb-1">
                <div className={`h-1.5 w-full rounded-full transition-colors ${strength >= 1 ? getStrengthColor() : 'bg-gray-200'}`}></div>
                <div className={`h-1.5 w-full rounded-full transition-colors ${strength >= 2 ? getStrengthColor() : 'bg-gray-200'}`}></div>
                <div className={`h-1.5 w-full rounded-full transition-colors ${strength >= 3 ? getStrengthColor() : 'bg-gray-200'}`}></div>
                <div className={`h-1.5 w-full rounded-full transition-colors ${strength >= 4 ? getStrengthColor() : 'bg-gray-200'}`}></div>
              </div>
              <p className="text-xs text-right text-gray-500 font-medium">{getStrengthLabel()}</p>
            </div>
          )}
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">
            Confirm Password
          </label>
          <input
            type="password"
            required
            value={confirmPassword}
            onChange={(e) => setConfirmPassword(e.target.value)}
            className={`w-full px-4 py-2 border rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-primary-500 outline-none transition-shadow ${confirmPassword && password !== confirmPassword ? 'border-red-300 focus:border-red-500 focus:ring-red-500' : 'border-gray-300'}`}
            placeholder="••••••••"
          />
          {confirmPassword && password !== confirmPassword && (
            <p className="mt-1 text-xs text-red-600">Passwords do not match</p>
          )}
        </div>

        <Button type="submit" variant="primary" className="w-full" loading={loading} icon={Lock}>
          Reset Password
        </Button>
        
        <div className="text-center mt-4">
          <Link to="/login" className="text-sm font-medium text-gray-600 hover:text-gray-900">
            Back to log in
          </Link>
        </div>
      </form>
    </div>
  );
};

export default ResetPassword;
