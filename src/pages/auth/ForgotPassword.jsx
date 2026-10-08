import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import { ArrowLeft, Mail } from 'lucide-react';
import { Button } from '../../components/ui';

const ForgotPassword = () => {
  const [email, setEmail] = useState('');
  const [loading, setLoading] = useState(false);
  const [success, setSuccess] = useState(false);

  const handleSubmit = (e) => {
    e.preventDefault();
    setLoading(true);
    // Simulate API call
    setTimeout(() => {
      setLoading(false);
      setSuccess(true);
    }, 1000);
  };

  return (
    <div>
      <div className="mb-6 text-center">
        <h3 className="text-xl font-semibold text-gray-900">Reset your password</h3>
        <p className="text-sm text-gray-500 mt-2">
          Enter your email address and we'll send you a link to reset your password.
        </p>
      </div>

      {success ? (
        <div className="text-center">
          <div className="mx-auto flex items-center justify-center h-12 w-12 rounded-full bg-emerald-100 mb-4">
            <Mail className="h-6 w-6 text-emerald-600" />
          </div>
          <p className="text-sm font-medium text-gray-900 mb-1">Check your email</p>
          <p className="text-sm text-gray-500 mb-6">
            Password reset link sent to your email.
          </p>
          <Link to="/login" className="text-sm font-medium text-primary-600 hover:text-primary-500 flex items-center justify-center">
            <ArrowLeft className="w-4 h-4 mr-1" /> Back to log in
          </Link>
        </div>
      ) : (
        <form onSubmit={handleSubmit} className="space-y-5">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Email Address
            </label>
            <input
              type="email"
              required
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-primary-500 outline-none transition-shadow"
              placeholder="Enter your email"
            />
          </div>

          <Button type="submit" variant="primary" className="w-full" loading={loading}>
            Send reset link
          </Button>

          <div className="text-center mt-4">
            <Link to="/login" className="text-sm font-medium text-gray-600 hover:text-gray-900 flex items-center justify-center">
              <ArrowLeft className="w-4 h-4 mr-1" /> Back to log in
            </Link>
          </div>
        </form>
      )}
    </div>
  );
};

export default ForgotPassword;
