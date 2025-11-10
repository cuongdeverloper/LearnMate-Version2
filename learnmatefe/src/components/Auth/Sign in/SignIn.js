import { useEffect, useState } from "react";
import { FaGoogle, FaFacebook, FaUpload } from "react-icons/fa";
import { ImSpinner9 } from "react-icons/im";
import { toast } from "react-toastify";
import { useNavigate } from "react-router-dom";
import Cookies from "js-cookie";
import { useDispatch, useSelector } from "react-redux";
import { doLogin } from "../../../redux/action/userAction";
import { ApiLogin, ApiRegister } from "../ApiAuth";
import Particles from "../../../Particles";
import "./SignIn.scss";

const SignIn = () => {
  const [isSignUp, setIsSignUp] = useState(false);
  const [isLoadingLogin, setIsLoadingLogin] = useState(false);
  const [isLoadingRegister, setIsLoadingRegister] = useState(false);
  const [isFormValid, setIsFormValid] = useState(false);
  const [isFormValidRegister, setIsFormValidRegister] = useState(false);

  // Sign In
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const checkRole = useSelector((user) => user.user.account.role);
  const isAuthenticated = useSelector((state) => state.user.isAuthenticated);
  const dispatch = useDispatch();
  const navigate = useNavigate();

  // Sign Up
  const [username, setUsername] = useState("");
  const [emailReg, setEmailReg] = useState("");
  const [passwordReg, setPasswordReg] = useState("");
  const [phoneNumber, setPhoneNumber] = useState("");
  const [gender, setGender] = useState("");
  const [image, setImage] = useState(null);
  const [role, setRole] = useState("student");
  const [imagePreview, setImagePreview] = useState(null);

  const validateLogin = () => setIsFormValid(email && password);
  const validateRegister = () =>
    setIsFormValidRegister(username && emailReg && passwordReg && phoneNumber && gender);

  const handleSubmitLogin = async (e) => {
    e.preventDefault();
    setIsLoadingLogin(true);
    try {
      let response = await ApiLogin(email, password);
      if (response.errorCode === 0) {
        toast.success(response.message);
        Cookies.set("accessToken", response.data.access_token, { expires: 1 });
        Cookies.set("refreshToken", response.data.refresh_token, { expires: 7 });
        await dispatch(doLogin(response));
        if (checkRole === "tutor") navigate("/TutorHomepage");
        if (checkRole === "student") navigate("/");
      } else {
        toast.error(response.message || response.error);
      }
    } catch {
      toast.error("Login failed. Please try again.");
    } finally {
      setIsLoadingLogin(false);
    }
  };

  const redirectGoogleLogin = () => {
    setIsLoadingLogin(true);
    window.location.href = "http://localhost:6060/auth/google";
  };

  const handleImageChange = (e) => {
    const file = e.target.files[0];
    setImage(file);
    setImagePreview(file ? URL.createObjectURL(file) : null);
  };

  const handleSubmitRegister = async (e) => {
    e.preventDefault();
    setIsLoadingRegister(true);
    try {
      const response = await ApiRegister(username, emailReg, passwordReg, phoneNumber, gender, role, image);
      if (response?.errorCode === 0) {
        toast.success("Registration successful! Please verify your email.");
        setIsSignUp(false);
      } else {
        toast.error(response?.message || "Registration failed");
      }
    } catch {
      toast.error("Server error during registration");
    } finally {
      setIsLoadingRegister(false);
    }
  };

  useEffect(() => {
    if (isAuthenticated) navigate("/");
  }, [isAuthenticated, navigate]);

  useEffect(() => validateLogin(), [email, password]);
  useEffect(() => validateRegister(), [username, emailReg, passwordReg, phoneNumber, gender]);

  return (
    <div className="signin-container">
      <div className="signin-particles">
        <Particles />
      </div>

      <div className={`signin-main ${isSignUp ? "right-panel-active" : ""}`}>
        {/* ---------- Sign In ---------- */}
        <div className="signin-form-container">
          <form className="signin-form" onSubmit={handleSubmitLogin}>
            <h2>Sign In</h2>
            <label>
              Email
              <input
                type="email"
                placeholder="your@email.com"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                required
              />
            </label>
            <label>
              Password
              <input
                type="password"
                placeholder="••••••••"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                required
              />
            </label>

            <button
              type="submit"
              className="signin-btn-primary"
              disabled={!isFormValid}
            >
              {isLoadingLogin && <ImSpinner9 className="signin-loader" />}
              LOGIN
            </button>

            <div className="signin-social-buttons">
              <button
                type="button"
                className="signin-btn-google"
                onClick={redirectGoogleLogin}
              >
                <FaGoogle /> Sign in with Google
              </button>
              <button type="button" className="signin-btn-facebook">
                <FaFacebook /> Sign in with Facebook
              </button>
            </div>

            <a onClick={() => navigate("/forgot-password")}>Forgot password?</a>
          </form>
        </div>

        {/* ---------- Sign Up ---------- */}
        <div className="signup-form-container">
          <form className="signup-form" onSubmit={handleSubmitRegister}>
            <h2>Sign Up</h2>
            <label>
              Full Name
              <input
                type="text"
                placeholder="Jon Snow"
                value={username}
                onChange={(e) => setUsername(e.target.value)}
                required
              />
            </label>
            <label>
              Email
              <input
                type="email"
                placeholder="your@email.com"
                value={emailReg}
                onChange={(e) => setEmailReg(e.target.value)}
                required
              />
            </label>
            <label>
              Password
              <input
                type="password"
                placeholder="••••••••"
                value={passwordReg}
                onChange={(e) => setPasswordReg(e.target.value)}
                required
              />
            </label>
            <label>
              Phone Number
              <input
                type="text"
                placeholder="0987654321"
                value={phoneNumber}
                onChange={(e) => setPhoneNumber(e.target.value)}
                required
              />
            </label>
            <label>
              Gender
              <select
                value={gender}
                onChange={(e) => setGender(e.target.value)}
              >
                <option value="">Select Gender</option>
                <option value="male">Male</option>
                <option value="female">Female</option>
                <option value="other">Other</option>
              </select>
            </label>

            {/* Upload Image */}
            <div className="signin-upload-section">
              <label htmlFor="upload-avatar" className="signin-upload-btn">
                <FaUpload /> Upload Profile Image
              </label>
              <input
                id="upload-avatar"
                type="file"
                accept="image/*"
                onChange={handleImageChange}
              />
              {imagePreview && (
                <div className="signin-image-preview">
                  <img src={imagePreview} alt="Profile Preview" />
                </div>
              )}
            </div>

            <button
              type="submit"
              className="signin-btn-primary"
              disabled={!isFormValidRegister}
            >
              {isLoadingRegister && <ImSpinner9 className="signin-loader" />}
              REGISTER
            </button>
          </form>
        </div>

        {/* ---------- Overlay ---------- */}
        <div className="signin-overlay-container">
          <div className="signin-overlay">
            <div className="signin-overlay-panel signin-overlay-left">
              <h2>Welcome Back!</h2>
              <p>To keep connected with us, please sign in with your info.</p>
              <button className="signin-ghost-btn" onClick={() => setIsSignUp(false)}>Sign In</button>
            </div>
            <div className="signin-overlay-panel signin-overlay-right">
              <h2>Hello, Friend!</h2>
              <p>Enter your details and start your journey with us.</p>
              <button className="signin-ghost-btn" onClick={() => setIsSignUp(true)}>Sign Up</button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default SignIn;
