




import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { EyeIcon, EyeOffIcon } from 'lucide-react';
import { useAuth } from '../contexts/AuthContext';

const SignUp = () => {
  const [role, setRole] = useState('Investor');
  const [showPassword, setShowPassword] = useState(false);
  const [formData, setFormData] = useState({
    fullName: '',
    email: '',
    password: ''
  });
  const [errors, setErrors] = useState({});
  const [isSubmitting, setIsSubmitting] = useState(false);
  const navigate = useNavigate();
  const { register, clearError } = useAuth();

  const validateForm = () => {
    const newErrors = {};
    
    if (!formData.fullName.trim()) {
      newErrors.fullName = 'Full name is required';
    }
    
    if (!formData.email.trim()) {
      newErrors.email = 'Email is required';
    } else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(formData.email)) {
      newErrors.email = 'Invalid email format';
    }
    
    if (!formData.password.trim()) {
      newErrors.password = 'Password is required';
    } else if (formData.password.length < 8) {
      newErrors.password = 'Password must be at least 8 characters';
    }
    
    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleInputChange = (field, value) => {
    setFormData(prev => ({ ...prev, [field]: value }));
    // Clear error for this field when user starts typing
    if (errors[field]) {
      setErrors(prev => ({ ...prev, [field]: '' }));
    }

    if (errors.submit) {
      setErrors(prev => ({ ...prev, submit: '' }));
      clearError();
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    
    if (!validateForm()) return;
    
    setIsSubmitting(true);
    
    try {
      const apiRole = role === 'Project Owner' ? 'project_owner' : 'investor';

      const response = await register({
        fullName: formData.fullName,
        email: formData.email,
        password: formData.password,
        role: apiRole,
      });

      const user = response?.user;
      if (!user) {
        setErrors({ submit: 'Failed to create account. Please try again.' });
        return;
      }

      if (user.role === 'admin') {
        navigate('/project-owners-dashboard');
        return;
      }

      if (user.role === 'project_owner') {
        if (!user.isApproved) {
          navigate('/pending-approval');
          return;
        }
        navigate('/project-owners-dashboard');
        return;
      }

      navigate('/Investments');
      
    } catch (error) {
      console.error('Signup error:', error);
      setErrors({ submit: error?.message || 'Failed to create account. Please try again.' });
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="min-h-screen bg-slate-50 flex flex-col font-sans">
      {/* Top Section with Form */}
      <div className="flex-'grow' flex items-center justify-center p-4">
        <div className="bg-white rounded-xl shadow-sm w-full max-w-md overflow-hidden">
          <div className="p-8">
            <h1 className="text-3xl font-semibold text-center text-gray-800 mb-8">Sign Up</h1>
            
            <form onSubmit={handleSubmit} className="space-y-5">
              {/* Full Name */}
              <div>
                <label className="block text-sm font-bold text-gray-700 mb-1">Full Name</label>
                <input 
                  type="text" 
                  placeholder="Enter your full name"
                  value={formData.fullName}
                  onChange={(e) => handleInputChange('fullName', e.target.value)}
                  className={`w-full px-4 py-3 border rounded-lg focus:outline-none focus:ring-1 focus:ring-blue-700 ${
                    errors.fullName ? 'border-red-500 text-gray-800' : 'border-gray-200 text-gray-800'
                  }`}
                />
                {errors.fullName && (
                  <p className="mt-1 text-sm text-red-600">{errors.fullName}</p>
                )}
              </div>

              {/* Email */}
              <div>
                <label className="block text-sm font-bold text-gray-700 mb-1">Email</label>
                <input 
                  type="email" 
                  placeholder="Enter your email"
                  value={formData.email}
                  onChange={(e) => handleInputChange('email', e.target.value)}
                  className={`w-full px-4 py-3 border rounded-lg focus:outline-none focus:ring-1 focus:ring-blue-700 ${
                    errors.email ? 'border-red-500 text-gray-800' : 'border-gray-200 text-gray-800'
                  }`}
                />
                {errors.email && (
                  <p className="mt-1 text-sm text-red-600">{errors.email}</p>
                )}
              </div>

              {/* Password */}
              <div>
                <label className="block text-sm font-bold text-gray-700 mb-1">Password</label>
                <div className="relative">
                  <input 
                    type={showPassword ? "text" : "password"} 
                    placeholder="Create a password"
                    value={formData.password}
                    onChange={(e) => handleInputChange('password', e.target.value)}
                    className={`w-full px-4 py-3 border rounded-lg focus:outline-none focus:ring-1 focus:ring-blue-700 pr-12 ${
                      errors.password ? 'border-red-500 text-gray-800' : 'border-gray-200 text-gray-800'
                    }`}
                  />
                  <button
                    type="button"
                    onClick={() => setShowPassword(!showPassword)}
                    className="absolute right-3 top-3.5 text-gray-300 hover:text-gray-400 transition-colors"
                  >
                    {showPassword ? (
                      <EyeOffIcon className="h-5 w-5" />
                    ) : (
                      <EyeIcon className="h-5 w-5" />
                    )}
                  </button>
                </div>
                {errors.password && (
                  <p className="mt-1 text-sm text-red-600">{errors.password}</p>
                )}
              </div>

              {/* Role Selection */}
              <div>
                <label className="block text-sm font-bold text-gray-700 mb-3">I am a:</label>
                <div className="flex gap-4">
                  <button 
                    type="button"
                    onClick={() => setRole('Investor')}
                    className={`flex-1 flex items-center justify-center gap-2 py-3 border rounded-lg transition-all ${role === 'Investor' ? 'bg-blue-50 border-blue-800 ring-1 ring-blue-800' : 'bg-white border-gray-200'}`}
                  >
                    <div className={`w-5 h-5 rounded-full border flex items-center justify-center ${role === 'Investor' ? 'bg-blue-800 border-blue-800' : 'border-gray-300'}`}>
                      {role === 'Investor' && <div className="w-2 h-2 bg-white rounded-full"></div>}
                    </div>
                    <span className="font-medium text-gray-700">Investor</span>
                  </button>
                  <button 
                    type="button"
                    onClick={() => setRole('Project Owner')}
                    className={`flex-1 flex items-center justify-center gap-2 py-3 border rounded-lg transition-all ${role === 'Project Owner' ? 'bg-blue-50 border-blue-800 ring-1 ring-blue-800' : 'bg-white border-gray-200'}`}
                  >
                    <div className={`w-5 h-5 rounded-full border flex items-center justify-center ${role === 'Project Owner' ? 'bg-blue-800 border-blue-800' : 'border-gray-300'}`}>
                      {role === 'Project Owner' && <div className="w-2 h-2 bg-white rounded-full"></div>}
                    </div>
                    <span className="font-medium text-gray-700">Project Owner</span>
                  </button>
                </div>
              </div>

              <p className="text-[11px] text-gray-500 text-center mt-2 italic">
                LandInvest does not collect or manage funds directly.
              </p>

              {errors.submit && (
                <div className="bg-red-50 border border-red-200 rounded-lg p-3">
                  <p className="text-sm text-red-600">{errors.submit}</p>
                </div>
              )}

              <button 
                type="submit"
                disabled={isSubmitting}
                className="w-full bg-blue-800 hover:bg-blue-700 disabled:bg-gray-400 text-white font-bold py-4 rounded-lg shadow-md transition-colors"
              >
                {isSubmitting ? 'Creating Account...' : 'Create Account'}
              </button>
            </form>
          </div>

          {/* Form Footer */}
          <div className="bg-gray-50 p-6 border-t border-gray-100 text-center">
             <p className="text-xs text-gray-400 mb-1">LandInvest is a coordination platform for Land imestment.</p>
             <p className="text-xs text-gray-400">LandInvest does not manage funds or own properties.</p>
          </div>
        </div>
      </div>

      {/* Background Landscape Section */}
      <div className="relative h-64 w-full">
        {/* Curved Divider */}
        <div className="absolute top-0 left-0 w-full overflow-hidden leading-none transform -translate-y-full">
            <svg viewBox="0 0 1200 120" preserveAspectRatio="none" className="relative block w-full h-20 fill-gray-100">
                <path d="M0,0V46.29c47.79,22.2,103.59,32.17,158,28,70.36-5.37,136.33-33.31,206.8-37.5C438.64,32.43,512.34,53.67,583,72.05c69.27,18,138.3,24.88,209.4,13.08,36.15-6,69.85-17.84,104.45-29.34C989.49,25,1113-14.29,1200,52.47V0Z"></path>
            </svg>
        </div>
        
        {/* Landscape Image */}
        <div 
            className="w-full h-full bg-cover bg-center"
            style={{ backgroundImage: 'url("https://images.unsplash.com/photo-1500382017468-9049fed747ef?ixlib=rb-4.0.3&auto=format&fit=crop&w=1600&q=80")' }}
        ></div>

        {/* Final Footer Text Overlay */}
        <div className="absolute bottom-0 left-0 w-full bg-white/90 py-6 text-center">
            <p className="text-xs text-gray-600 mb-1">LandInvest is a coordination platform for fractional land investment.</p>
            <p className="text-xs text-gray-600">LandInvest does not manage funds or own properties.</p>
        </div>
      </div>
    </div>
  );
};

export default SignUp;



