import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../../../context/AuthContext';
import { useToast } from '../../../context/ToastContext';
import {
  useSendOtpMutation,
  useVerifyOtpMutation,
  useResendOtpMutation,
  useAdminLoginMutation
} from '../hooks/useAuthQueries';
import {
  validateAdminLogin,
  validateSendOtp,
  validateVerifyOtp
} from '../validators/authValidators';
import { IndianRupee, ShieldCheck } from 'lucide-react';
import { handlePostLoginRedirect } from '../../../utils/navigation';
import AuthHeroPanel from '../components/AuthHeroPanel';
import AdminLoginForm from '../components/AdminLoginForm';
import { VendorMobileForm, VendorOtpVerifyForm } from '../components/VendorOtpForms';

const Login = ({ initialRole = 'VENDOR' }) => {
  const navigate = useNavigate();
  const { login, isAuthenticated, user } = useAuth();
  const toast = useToast();

  // Role Switcher: 'ADMIN' vs 'VENDOR'
  const [role, setRole] = useState(initialRole);

  useEffect(() => {
    setRole(initialRole);
  }, [initialRole]);

  // Redirect authenticated user away from login page if already logged in
  useEffect(() => {
    if (isAuthenticated && user) {
      const userRole = (user.role || '').toUpperCase();
      if (userRole === 'SUPER_ADMIN' || userRole === 'ADMIN') {
        navigate('/admin/dashboard', { replace: true });
      } else {
        navigate('/vendor/dashboard', { replace: true });
      }
    }
  }, [isAuthenticated, user, navigate]);

  // Vendor Login & Onboarding Stages: 'MOBILE' -> 'OTP' -> 'PROFILE_STEP_1' -> 'PROFILE_STEP_2' -> 'PACKAGE_SELECT'
  const [vendorStage, setVendorStage] = useState('MOBILE');

  // Temporary auth token & user context after OTP verification
  const [tempAuthToken, setTempAuthToken] = useState(null);
  const [tempUserObj, setTempUserObj] = useState(null);

  // Mobile OTP State (for Vendor)
  const [mobileNumber, setMobileNumber] = useState('');
  const [otpDigits, setOtpDigits] = useState(['', '', '', '', '', '']);
  const [resendTimer, setResendTimer] = useState(45);
  const [canResend, setCanResend] = useState(false);

  // Profile Form State initialized cleanly
  const [profileData, setProfileData] = useState({
    ownerName: '',
    email: '',
    businessName: '',
    businessType: 'Retail Store',
    businessLogo: null,
    businessAddress: '',
    city: '',
    state: '',
    country: 'India',
    pincode: '',
    gstNumber: '',
    panNumber: '',
    otherInvoiceInfo: '',
  });

  // Email & Password State (for Admin)
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');

  const [error, setError] = useState('');
  const [isFinalizing, setIsFinalizing] = useState(false);

  // TanStack Query Mutations
  const sendOtpMutation = useSendOtpMutation();
  const verifyOtpMutation = useVerifyOtpMutation();
  const resendOtpMutation = useResendOtpMutation();
  const adminLoginMutation = useAdminLoginMutation();

  const loading = sendOtpMutation.isPending || verifyOtpMutation.isPending || resendOtpMutation.isPending || adminLoginMutation.isPending || isFinalizing;

  // Countdown timer for OTP resend
  useEffect(() => {
    let timer;
    if (vendorStage === 'OTP' && resendTimer > 0) {
      timer = setInterval(() => {
        setResendTimer((prev) => prev - 1);
      }, 1000);
    } else if (resendTimer === 0) {
      setCanResend(true);
    }
    return () => clearInterval(timer);
  }, [vendorStage, resendTimer]);

  const handleSendOtp = (e) => {
    e.preventDefault();
    setError('');

    const validation = validateSendOtp(mobileNumber);
    if (!validation.isValid) {
      setError(validation.error);
      toast.error(validation.error);
      return;
    }

    sendOtpMutation.mutate(validation.cleanMobile, {
      onSuccess: () => {
        setVendorStage('OTP');
        setResendTimer(45);
        setCanResend(false);
        toast.success(`OTP code sent to +91 ${validation.cleanMobile} via SMS!`);
      },
      onError: (err) => {
        const msg = err?.response?.data?.message || 'Failed to send OTP. Please check mobile number and try again.';
        setError(msg);
        toast.error(msg);
      },
    });
  };

  const handleResendOtp = () => {
    if (!canResend) return;
    setError('');

    const validation = validateSendOtp(mobileNumber);
    if (!validation.isValid) {
      setError(validation.error);
      toast.error(validation.error);
      return;
    }

    resendOtpMutation.mutate(validation.cleanMobile, {
      onSuccess: () => {
        setResendTimer(45);
        setCanResend(false);
        toast.success('New OTP code resent successfully!');
      },
      onError: (err) => {
        const msg = err?.response?.data?.message || 'Failed to resend OTP. Please try again.';
        setError(msg);
        toast.error(msg);
      }
    });
  };

  const handleOtpChange = (index, value) => {
    if (!/^\d*$/.test(value)) return;
    const newOtp = [...otpDigits];
    newOtp[index] = value.slice(-1);
    setOtpDigits(newOtp);

    if (value && index < 5) {
      const nextInput = document.getElementById(`otp-box-${index + 1}`);
      if (nextInput) nextInput.focus();
    }
  };

  const handleOtpKeyDown = (index, e) => {
    if (e.key === 'Backspace' && !otpDigits[index] && index > 0) {
      const prevInput = document.getElementById(`otp-box-${index - 1}`);
      if (prevInput) prevInput.focus();
    }
  };

  const handleVendorOtpLogin = (e) => {
    e.preventDefault();
    setError('');

    const fullOtp = otpDigits.join('');

    const validation = validateVerifyOtp({ mobileNumber, otpCode: fullOtp });
    if (!validation.isValid) {
      setError(validation.error);
      toast.error(validation.error);
      return;
    }

    verifyOtpMutation.mutate(
      { mobileNumber: validation.cleanMobile, otpCode: validation.cleanOtp },
      {
        onSuccess: (resData) => {
          const payload = resData.data || resData;
          const token = payload.accessToken || payload.token;
          
          if (!token) {
            const msg = 'Authentication failed: Access token missing in server response.';
            setError(msg);
            toast.error(msg);
            return;
          }

          const rawUser = payload.user || payload;
          const rawRole = (rawUser?.role || '').toUpperCase();
          const roleEnum = (rawRole === 'EMPLOYEE') ? 'EMPLOYEE'
                         : (rawRole === 'SUPER_ADMIN' || rawRole === 'ADMIN') ? 'SUPER_ADMIN'
                         : 'TENANT_ADMIN';

          const userObj = {
            ...rawUser,
            id: rawUser?.id || rawUser?._id || 'vendor-1',
            name: rawUser?.name || 'Store Admin',
            mobileNumber: rawUser?.mobileNumber || rawUser?.phone || mobileNumber,
            role: roleEnum,
            tenant: rawUser?.tenant || payload.tenant || null
          };

          setTempAuthToken(token);
          setTempUserObj(userObj);
          localStorage.setItem('token', token);
          localStorage.setItem('user', JSON.stringify(userObj));
          login(userObj, token);

          toast.success('OTP Verified Successfully!');
          handlePostLoginRedirect(resData, navigate);
        },
        onError: (err) => {
          const errorMsg = err?.response?.data?.message || 'Invalid OTP code! Please enter valid 6-digit OTP.';
          setError(errorMsg);
          toast.error(errorMsg);
        },
      }
    );
  };

  const handleAdminPasswordLogin = (e) => {
    e.preventDefault();
    setError('');

    const validation = validateAdminLogin({ email, password });
    if (!validation.isValid) {
      setError(validation.error);
      toast.error(validation.error);
      return;
    }

    adminLoginMutation.mutate(
      { email, password },
      {
        onSuccess: (resData) => {
          const payload = resData.data || resData;
          const token = payload.accessToken || payload.token;

          if (!token) {
            const msg = 'Authentication failed: Access token missing in server response.';
            setError(msg);
            toast.error(msg);
            return;
          }

          const userObj = payload.user || {
            id: payload.id,
            name: payload.name || 'SaaS Platform Admin',
            email: payload.email || email,
            role: 'SUPER_ADMIN'
          };

          login(userObj, token);
          toast.success('Welcome Super Admin! Access granted.');
          navigate('/admin/dashboard', { replace: true });
        },
        onError: (err) => {
          const errorMsg = err?.response?.data?.message || 'Invalid admin credentials. Access denied.';
          setError(errorMsg);
          toast.error(errorMsg);
        },
      }
    );
  };

  return (
    <div className="min-h-screen bg-slate-100 flex flex-col justify-between relative overflow-x-hidden font-sans">
      <div className="flex-1 flex w-full min-h-screen">
        {/* 2. Left Hero Panel */}
        <AuthHeroPanel role={role} />

        {/* 3. Right Form Card Section */}
        <div className="flex-1 flex items-center justify-center p-4 sm:p-6 lg:p-12 relative z-10 w-full">
          <div className="w-full max-w-lg bg-white rounded-3xl p-6 sm:p-8 shadow-xl border border-slate-200/80 transition-all duration-300">
            {/* Mobile Header Logo */}
            <div className="flex lg:hidden items-center justify-center gap-2 mb-6">
              <div className="w-9 h-9 bg-gradient-to-r from-indigo-600 to-purple-600 rounded-xl flex items-center justify-center text-white shadow-md">
                <IndianRupee size={20} color="#ffffff" />
              </div>
              <div className="text-left">
                <div className="font-extrabold text-lg leading-none text-slate-900">Softfyr BillPro</div>
                <div className="text-[10px] font-bold text-slate-400">Multi-Tenant SaaS Billing</div>
              </div>
            </div>

            {/* Card Form Header */}
            <div className="mb-5">
              <div className="text-xs font-bold text-indigo-600 tracking-wider uppercase mb-1">
                {role === 'ADMIN'
                  ? 'Super Admin Portal'
                  : vendorStage === 'OTP'
                  ? 'Verify OTP'
                  : 'Vendor Store Portal'}
              </div>

              <h2 className="text-2xl font-extrabold text-slate-900">
                {role === 'ADMIN'
                  ? 'Admin Direct Login'
                  : vendorStage === 'OTP'
                  ? 'Verify OTP Code'
                  : 'Vendor OTP Login'}
              </h2>

              <p className="text-xs text-slate-500 mt-1">
                {role === 'ADMIN'
                  ? 'Enter super admin credentials to access tenant management dashboard.'
                  : vendorStage === 'OTP'
                  ? `Enter the 6-digit OTP code sent to +91 ${mobileNumber}`
                  : 'Enter your registered 10-digit mobile number to receive OTP.'}
              </p>
            </div>

            {/* Global Error Banner */}
            {error && (
              <div className="mb-4 p-3 bg-rose-50 border border-rose-200 text-rose-600 rounded-xl text-xs font-semibold flex items-center gap-2 animate-in fade-in duration-200">
                <ShieldCheck size={16} className="shrink-0" />
                <span>{error}</span>
              </div>
            )}

            {/* Form Stage Routing */}
            {role === 'ADMIN' ? (
              <AdminLoginForm
                email={email}
                setEmail={setEmail}
                password={password}
                setPassword={setPassword}
                onSubmit={handleAdminPasswordLogin}
                loading={loading}
              />
            ) : vendorStage === 'MOBILE' ? (
              <VendorMobileForm
                mobileNumber={mobileNumber}
                setMobileNumber={setMobileNumber}
                onSubmit={handleSendOtp}
                loading={loading}
              />
            ) : (
              <VendorOtpVerifyForm
                otpDigits={otpDigits}
                handleOtpChange={handleOtpChange}
                handleOtpKeyDown={handleOtpKeyDown}
                onSubmit={handleVendorOtpLogin}
                loading={loading}
                canResend={canResend}
                resendTimer={resendTimer}
                onResendOtp={handleResendOtp}
                onChangeNumber={() => setVendorStage('MOBILE')}
              />
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

export default Login;
