"use client"; // This marks the file as a Client Component

import { useState } from 'react';

const VendorRegistration = () => {
  const [formData, setFormData] = useState({
    username: '',
    email: '',
    verificationCode: '',
    firstName: '',
    lastName: '',
    storeName: '',
    storePhone: '',
    storeAddress: '',
    country: 'Nigeria',
    state: '',
    password: '',
    confirmPassword: '',
    agree: false,
  });

  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
  const { name, value } = e.target;
  setFormData((prevState) => ({
    ...prevState,
    [name]: value,
  }));
};


  const handleCheckboxChange = () => {
    setFormData((prevState) => ({
      ...prevState,
      agree: !prevState.agree,
    }));
  };

  const handleResendCode = async () => {
    if (!formData.email) {
      alert('Please provide an email before requesting a code.');
      return;
    }

    try {
      const response = await fetch('/api/auth/vendor/send-code', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email: formData.email }),
      });

      const data = await response.json();
      if (data.success) {
        alert('Verification code sent successfully!');
      } else {
        setError(data.error || 'Failed to send verification code.');
      }
    } catch (error: unknown) {
      if (error instanceof Error) {
        setError('Error: ' + error.message); // Access message safely
      } else {
        setError('An unknown error occurred'); // Fallback for non-Error objects
      }
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    // Validation and submission logic here (e.g. form validation, submitting to API)
    // For now, just showing success message for demo
    setSuccess('Registration Successful!');
  };

  return (
    <div className="flex justify-center items-center min-h-screen bg-gray-100">
      <div className="bg-white p-8 rounded-lg shadow-lg w-full max-w-xl">
        <h2 className="text-3xl font-semibold text-center mb-8">Vendor Registration</h2>
        {error && <div className="bg-red-100 text-red-700 p-3 mb-4 rounded">{error}</div>}
        {success && <div className="bg-green-100 text-green-700 p-3 mb-4 rounded">{success}</div>}
        <form onSubmit={handleSubmit} className="space-y-6">
          {/* Username */}
          <div>
            <label htmlFor="username" className="block text-lg font-medium text-gray-700">Username *</label>
            <input
              type="text"
              id="username"
              name="username"
              value={formData.username}
              onChange={handleInputChange}
              className="w-full mt-2 p-3 border rounded-md"
              required
            />
          </div>

          {/* Email */}
          <div>
            <label htmlFor="email" className="block text-lg font-medium text-gray-700">Email *</label>
            <input
              type="email"
              id="email"
              name="email"
              value={formData.email}
              onChange={handleInputChange}
              className="w-full mt-2 p-3 border rounded-md"
              required
            />
          </div>

          {/* Verification Code */}
          <div className="flex items-center space-x-4">
            <div className="flex-1">
              <label htmlFor="verificationCode" className="block text-lg font-medium text-gray-700">Verification Code *</label>
              <input
                type="text"
                id="verificationCode"
                name="verificationCode"
                value={formData.verificationCode}
                onChange={handleInputChange}
                className="w-full mt-2 p-3 border rounded-md"
                required
              />
            </div>
            <button
              type="button"
              onClick={handleResendCode}
              className="bg-blue-600 text-white py-3 px-6 rounded-md"
            >
              Re-send Code
            </button>
          </div>

          {/* Name and Store Info */}
          <div className="grid grid-cols-2 gap-4">
            <div>
              <label htmlFor="firstName" className="block text-lg font-medium text-gray-700">First Name *</label>
              <input
                type="text"
                id="firstName"
                name="firstName"
                value={formData.firstName}
                onChange={handleInputChange}
                className="w-full mt-2 p-3 border rounded-md"
                required
              />
            </div>
            <div>
              <label htmlFor="lastName" className="block text-lg font-medium text-gray-700">Last Name *</label>
              <input
                type="text"
                id="lastName"
                name="lastName"
                value={formData.lastName}
                onChange={handleInputChange}
                className="w-full mt-2 p-3 border rounded-md"
                required
              />
            </div>
            <div>
              <label htmlFor="storeName" className="block text-lg font-medium text-gray-700">Store Name *</label>
              <input
                type="text"
                id="storeName"
                name="storeName"
                value={formData.storeName}
                onChange={handleInputChange}
                className="w-full mt-2 p-3 border rounded-md"
                required
              />
            </div>
            <div>
              <label htmlFor="storePhone" className="block text-lg font-medium text-gray-700">Store Phone *</label>
              <input
                type="tel"
                id="storePhone"
                name="storePhone"
                value={formData.storePhone}
                onChange={handleInputChange}
                className="w-full mt-2 p-3 border rounded-md"
                required
              />
            </div>
            <div>
              <label htmlFor="storeAddress" className="block text-lg font-medium text-gray-700">Store Address *</label>
              <input
                type="text"
                id="storeAddress"
                name="storeAddress"
                value={formData.storeAddress}
                onChange={handleInputChange}
                className="w-full mt-2 p-3 border rounded-md"
                required
              />
            </div>
            <div>
              <label htmlFor="country" className="block text-lg font-medium text-gray-700">Country *</label>
              <select
                id="country"
                name="country"
                value={formData.country}
                onChange={handleInputChange}
                className="w-full mt-2 p-3 border rounded-md"
                required
              >
                <option value="Nigeria">Nigeria</option>
                <option value="USA">USA</option>
                <option value="UK">UK</option>
              </select>
            </div>
            <div>
              <label htmlFor="state" className="block text-lg font-medium text-gray-700">State *</label>
              <input
                type="text"
                id="state"
                name="state"
                value={formData.state}
                onChange={handleInputChange}
                className="w-full mt-2 p-3 border rounded-md"
                required
              />
            </div>
          </div>

          {/* Password */}
          <div>
            <label htmlFor="password" className="block text-lg font-medium text-gray-700">Password *</label>
            <input
              type="password"
              id="password"
              name="password"
              value={formData.password}
              onChange={handleInputChange}
              className="w-full mt-2 p-3 border rounded-md"
              required
            />
          </div>

          {/* Confirm Password */}
          <div>
            <label htmlFor="confirmPassword" className="block text-lg font-medium text-gray-700">Confirm Password *</label>
            <input
              type="password"
              id="confirmPassword"
              name="confirmPassword"
              value={formData.confirmPassword}
              onChange={handleInputChange}
              className="w-full mt-2 p-3 border rounded-md"
              required
            />
          </div>

          {/* Agree to Terms */}
          <div className="flex items-center">
            <input
              type="checkbox"
              id="agree"
              name="agree"
              checked={formData.agree}
              onChange={handleCheckboxChange}
              className="h-5 w-5 text-blue-600 rounded border-gray-300"
            />
            <label htmlFor="agree" className="ml-2 text-gray-700">I Agree to the Terms & Conditions</label>
          </div>

          {/* Submit Button */}
          <div className="flex justify-center mt-8">
            <button type="submit" className="bg-blue-600 text-white py-3 px-6 rounded-md">Register</button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default VendorRegistration;
