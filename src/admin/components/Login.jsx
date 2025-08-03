import { useState, useEffect, useRef } from "react";
import { toast } from "react-toastify";
import ReCAPTCHA from "react-google-recaptcha";
import { useAuth } from "../../context/AuthContext";
import { useNavigate, useLocation } from "react-router-dom";
import { sanitizeFormData } from "../../utils/sanitizer";

const Login = () => {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [loading, setLoading] = useState(false);
  const [captchaValue, setCaptchaValue] = useState(null);
  const captchaRef = useRef(null);
  const { login, isAuthenticated, isAdmin } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();

  const from = location.state?.from?.pathname || "/admin";

  console.log("Admin login page - from:", from);
  console.log("location.state:", location.state);

  useEffect(() => {
    if (isAuthenticated() && isAdmin()) {
      navigate(from, { replace: true });
    }
  }, [isAuthenticated, isAdmin, navigate, from]);

  const onSubmitHandler = async (e) => {
    e.preventDefault();
    if (!captchaValue) {
      toast.error("Please complete the CAPTCHA verification");
      return;
    }

    setLoading(true);

    try {
      console.log("Attempting admin login...");
      const sanitizedData = sanitizeFormData({ email, password });

      const result = await login(
        sanitizedData.email,
        sanitizedData.password,
        true,
        captchaValue
      );
      console.log("Login result:", result);

      if (result.success) {
        toast.success("Admin login successful!");
        console.log("Redirecting to admin dashboard");
        setTimeout(() => {
          navigate(from, { replace: true });
        }, 100);
      } else {
        toast.error(result.message || "Login failed");
        setCaptchaValue(null);
        captchaRef.current?.reset();
      }
    } catch (error) {
      console.log("Login error:", error);
      toast.error("Login failed. Please try again.");
      setCaptchaValue(null);
      captchaRef.current?.reset();
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center w-full bg-gray-50">
      <div className="bg-white shadow-md rounded-lg px-8 py-6 max-w-md">
        <div className="text-center mb-6">
          <h1 className="text-2xl font-bold mb-2">Admin Panel</h1>
          <div className="bg-yellow-50 border border-yellow-200 rounded-md p-3 mb-4">
            <div className="flex items-center">
              <div className="flex-shrink-0">
                <svg
                  className="h-5 w-5 text-yellow-400"
                  viewBox="0 0 20 20"
                  fill="currentColor"
                >
                  <path
                    fillRule="evenodd"
                    d="M8.257 3.099c.765-1.36 2.722-1.36 3.486 0l5.58 9.92c.75 1.334-.213 2.98-1.742 2.98H4.42c-1.53 0-2.493-1.646-1.743-2.98l5.58-9.92zM11 13a1 1 0 11-2 0 1 1 0 012 0zm-1-8a1 1 0 00-1 1v3a1 1 0 002 0V6a1 1 0 00-1-1z"
                    clipRule="evenodd"
                  />
                </svg>
              </div>
              <div className="ml-3">
                <p className="text-sm text-yellow-800">
                  <strong>Authentication Required</strong>
                  <br />
                  You are not authenticated. Please login to access the admin
                  panel.
                </p>
              </div>
            </div>
          </div>
        </div>
        <form onSubmit={onSubmitHandler}>
          <div className="mb-3 mn-w-72">
            <p className="text-sm font-medium text-gray-700 mb-2">
              Email Address
            </p>
            <input
              className="rounded-md w-full px-3 py-2 border border-gray-300 outline-none "
              type="email"
              placeholder="your@email.com"
              required
              onChange={(e) => setEmail(e.target.value)}
              value={email}
            />
          </div>
          <div className="mb-3 mn-w-72">
            <p className="text-sm font-medium text-gray-700 mb-2">Password</p>
            <input
              className="rounded-md w-full px-3 py-2 border border-gray-300 outline-none "
              type="password"
              placeholder="Enter your password"
              required
              onChange={(e) => setPassword(e.target.value)}
              value={password}
            />
          </div>

          {/* reCAPTCHA */}
          <div className="mb-4 flex justify-center">
            <ReCAPTCHA
              ref={captchaRef}
              sitekey={import.meta.env.VITE_RECAPTCHA_SITE_KEY}
              onChange={(value) => setCaptchaValue(value)}
              onExpired={() => setCaptchaValue(null)}
            />
          </div>

          <button
            className="mt-2 w-full py-2 px-4 rounded-md text-white bg-black disabled:opacity-50"
            type="submit"
            disabled={loading}
          >
            {loading ? "Logging in..." : "Login"}
          </button>
        </form>
      </div>
    </div>
  );
};

export default Login;
