const { createJWT, createRefreshToken, verifyAccessToken, createJWTResetPassword, createJWTVerifyEmail } = require('../../middleware/JWTAction');
const bcrypt = require('bcryptjs');
const UserOTPVerification = require('./UserOTPVerification');
const uploadCloud = require('../../config/cloudinaryConfig');
const { sendMail } = require('../../config/mailSendConfig');
const user = require('../../modal/User');
const User = require('../../modal/User');
require('dotenv').config();

const apiLogin = async (req, res) => {
  try {
    const { email, password } = req.body;

    const userRecord = await User.findOne({ email });
    if (!userRecord) return res.status(200).json({ errorCode: 2, message: 'Email does not exist' });

    const isPasswordValid = await bcrypt.compare(password, userRecord.password);
    if (!isPasswordValid) return res.status(200).json({ errorCode: 3, message: 'Invalid password' });

    userRecord.lastAccessTokenVersion += 1;
    await userRecord.save();

    const payload = {
      id: userRecord._id,
      email: userRecord.email,
      role: userRecord.role,
      tokenVersion: userRecord.lastAccessTokenVersion // nhúng vào access token
    };

    const accessToken = createJWT(payload);
    const refreshToken = createRefreshToken(payload);

    return res.status(200).json({
      errorCode: 0,
      message: 'Login successful',
      data: {
        id: userRecord._id,
        access_token: accessToken,
        refresh_token: refreshToken,
        username: userRecord.username,
        role: userRecord.role,
        email: userRecord.email,
        phoneNumber: userRecord.phoneNumber,
        gender: userRecord.gender,
        image: userRecord.image
      }
    });
  } catch (error) {
    console.error(error);
    return res.status(500).json({ errorCode: 5, message: 'Login error' });
  }
};

const apiRegister = async (req, res) => {
  console.log("MAIL USER:", process.env.MAIL_SDN_USERNAME);
  console.log("MAIL PASS:", process.env.MAIL_SDN_PASSWORD ? "EXISTS" : "EMPTY");
  try {
    uploadCloud.single('image')(req, res, async (err) => {
      if (err) {
        return res.status(400).json({
          errorCode: 4,
          message: `Upload Error: ${err.message}`,
        });
      }

      const { username, email, password, phoneNumber, gender, role } = req.body;
      const image = req.file ? req.file.path : null;

      if (!username || !email || !password || !phoneNumber || !gender) {
        return res.status(203).json({
          errorCode: 1,
          message: 'All fields are required',
        });
      }

      const existingUser = await user.findOne({ email });
      if (existingUser) {
        return res.status(200).json({
          errorCode: 2,
          message: 'Email already exists',
        });
      }

      const newUser = new user({
        username,
        email,
        password,
        phoneNumber,
        gender,
        role: role || 'student',
        image,
      });
      await newUser.save();

      const payload = { id: newUser._id, email: newUser.email };
      const verifyToken = createJWTVerifyEmail(payload);
      const verifyLink = `${process.env.FRONTEND_URL}/verify-account?token=${verifyToken}`;

      const emailSubject = 'Verify Your Account';
      const emailContent = `
<div style="background-color:#f4f6f8;padding:40px 0;font-family: 'Helvetica Neue', Arial, sans-serif;">
  <div style="max-width:500px;margin:0 auto;background:#ffffff;border-radius:12px;overflow:hidden;box-shadow:0 8px 20px rgba(0,0,0,0.1);">
    
    <!-- Header -->
    <div style="background: linear-gradient(135deg, #6a11cb, #2575fc); color:white; text-align:center; padding:30px;">
      <h1 style="margin:0;font-size:22px;">🎉 Chào mừng, ${username}!</h1>
      <p style="margin-top:8px;font-size:16px;color:#e0e0e0;">Hãy xác thực tài khoản của bạn ngay bây giờ</p>
    </div>

    <!-- Content -->
    <div style="padding:40px;text-align:center;">
      <p style="font-size:16px;color:#555;">Nhấn nút bên dưới để xác thực tài khoản của bạn:</p>
      <a href="${verifyLink}" style="display:inline-block;margin-top:20px;padding:12px 25px;background: #2575fc;color:white;text-decoration:none;font-weight:bold;border-radius:8px;box-shadow:0 4px 12px rgba(37,117,252,0.3);transition: all 0.2s;">Xác thực ngay</a>
      <p style="margin-top:25px;font-size:13px;color:#888;">Liên kết này sẽ hết hạn trong 5 phút.</p>
    </div>

    <!-- Footer -->
    <div style="background:#f9fafb;text-align:center;padding:20px;font-size:12px;color:#aaaaaa;border-top:1px solid #eee;">
      <p style="margin:5px 0;">Nếu bạn không yêu cầu, có thể bỏ qua email này.</p>
      <p style="margin:5px 0;">&copy; 2025 Our App</p>
    </div>

  </div>
</div>
`;

      await sendMail(email, emailSubject, emailContent);

      // ✅ Schedule account deletion if not verified in 5 minutes
      setTimeout(async () => {
        const userRecord = await user.findById(newUser._id);
        if (!userRecord?.verified) {
          await user.findByIdAndDelete(newUser._id);
        }
      }, 5 * 60 * 1000);

      return res.status(201).json({
        errorCode: 0,
        message: 'Registration successful. Please check your email to verify your account.',
        data: {
          id: newUser._id,
          username: newUser.username,
          email: newUser.email,
          phoneNumber: newUser.phoneNumber,
          gender: newUser.gender,
          image,
        },
      });
    });
  } catch (error) {
    console.error('Registration error:', error);
    return res.status(500).json({
      errorCode: 5,
      message: 'An error occurred during registration',
    });
  }
};

const verifyOtp = async (req, res) => {
  try {
    const { userId, OTP } = req.body;
    // Check for empty OTP details
    if (!userId || !OTP) {
      return res.status(400).json({
        errorCode: 100,
        message: 'User ID and OTP are required',
      });
    }

    // Retrieve the OTP verification record for the user
    const otpRecord = await UserOTPVerification.findOne({ userId });
    if (!otpRecord) {
      return res.status(400).json({
        errorCode: 2,
        message: 'No OTP record found for this user',
      });
    }

    // Compare the hashed OTP stored in the database with the provided OTP
    const isOtpValid = await bcrypt.compare(OTP, otpRecord.otp);
    if (!isOtpValid) {
      return res.status(400).json({
        errorCode: 3,
        message: 'Invalid OTP',
      });
    }


    await user.findByIdAndUpdate(userId, { verified: true });
    await UserOTPVerification.deleteMany({ userId });
    return res.status(200).json({
      errorCode: 0,
      message: 'OTP verification successful',
    });
  } catch (error) {
    console.error('OTP verification error:', error);
    return res.status(500).json({
      errorCode: 4,
      message: 'An error occurred during OTP verification',
    });
  }
};
const resendOTPVerificationCode = async (req, res) => {
  try {
    const { userId, email } = req.body;
    if (!userId || !email) {
      return res.status(400).json({
        errorCode: 1,
        message: 'User ID and email are required',
      });
    }

    // Delete previous OTP records for the user
    await UserOTPVerification.deleteMany({ userId });

    // Generate a new OTP
    const otp = `${Math.floor(1000 + Math.random() * 9000)}`;
    const saltRounds = 10;
    const hashedOTP = await bcrypt.hash(otp, saltRounds);

    // Create a new OTP verification entry
    const newOtpVerification = new UserOTPVerification({
      userId,
      otp: hashedOTP,
    });
    await newOtpVerification.save();

    // Send the new OTP to the user's email
    const emailSubject = 'Your New OTP Verification Code';
    const emailContent = `Your new OTP code is: ${otp}. It will expire in 5 minutes.`;
    await sendMail(email, emailSubject, emailContent);

    return res.status(200).json({
      errorCode: 0,
      message: 'New OTP has been sent to your email.',
    });
  } catch (error) {
    console.error('Resend OTP error:', error);
    return res.status(500).json({
      errorCode: 2,
      message: 'An error occurred while resending the OTP',
    });
  }
};

const requestPasswordReset = async (req, res) => {
  try {
    const { email } = req.body;
    if (!email) {
      return res.status(400).json({ errorCode: 1, message: 'Email is required' });
    }

    const userRecord = await User.findOne({ email });
    if (!userRecord) {
      return res.status(203).json({ errorCode: 2, message: 'Email does not exist' });
    }

    if (userRecord.socialLogin) {
      return res.status(203).json({
        errorCode: 8,
        message: 'This account uses Google login and cannot reset password.',
      });
    }

    const payload = { id: userRecord._id, email: userRecord.email };
    const resetToken = createJWTResetPassword(payload);
    const resetLink = `${process.env.FRONTEND_URL}/reset-password?token=${resetToken}`;

    await sendMail(
      email,
      'Password Reset Request',
      `Click <a href="${resetLink}">here</a> to reset your password. This link will expire in 5 minutes.`
    );

    return res.status(200).json({
      errorCode: 0,
      message: 'Password reset email sent successfully.',
    });
  } catch (error) {
    console.error('Forgot Password error:', error);
    return res.status(500).json({
      errorCode: 3,
      message: 'An error occurred during password reset request',
    });
  }
};


const resetPassword = async (req, res) => {
  try {
    const { token, newPassword } = req.body;
    if (!token || !newPassword) {
      return res.status(400).json({
        errorCode: 1,
        message: 'Token and new password are required',
      });
    }

    const decodedToken = verifyAccessToken(token);
    if (!decodedToken) {
      return res.status(403).json({
        errorCode: 2,
        message: 'Invalid or expired token',
      });
    }


    const userRecord = await user.findById(decodedToken.id);

    if (!userRecord) {
      return res.status(404).json({
        errorCode: 3,
        message: 'User not found',
      });
    }

    // ❌ Nếu là tài khoản Google
    if (userRecord.socialLogin && userRecord.password) {
      return res.status(400).json({
        errorCode: 8,
        message: 'Google account cannot reset password.',
      });
    }

    // ✅ Trường hợp đặc biệt: cho phép user Google đặt mật khẩu lần đầu
    if (userRecord.socialLogin && !userRecord.password) {
      userRecord.password = newPassword;
      userRecord.socialLogin = false; // giờ họ có thể đăng nhập bằng email/password
      userRecord.type = 'Local';
      await userRecord.save();

      return res.status(200).json({
        errorCode: 0,
        message: 'Password set successfully. You can now login using email/password.',
      });
    }


    const isSamePassword = await bcrypt.compare(newPassword, userRecord.password);
    if (isSamePassword) {
      return res.status(400).json({
        errorCode: 4,
        message: 'New password cannot be the same as old password',
      });
    }

    userRecord.password = newPassword;
    await userRecord.save();

    return res.status(200).json({
      errorCode: 0,
      message: 'Password reset successfully',
    });
  } catch (error) {
    console.error('Reset Password error:', error);
    return res.status(500).json({
      errorCode: 5,
      message: 'An error occurred during password reset',
    });
  }
};



const changePassword = async (req, res) => {
  try {
    const userId = req.user.id || req.user._id;
    const { oldPassword, newPassword, confirmPassword } = req.body;

    const userRecord = await User.findById(userId);
    if (!userRecord) {
      return res.status(404).json({
        errorCode: 3,
        message: 'User not found',
      });
    }

    if (!userRecord.socialLogin) {
      return res.status(400).json({
        errorCode: 7,
        message: 'This account uses Google login and cannot change password directly.',
      });
    }

    if (!oldPassword || !newPassword || !confirmPassword) {
      return res.status(400).json({
        errorCode: 1,
        message: 'All fields are required',
      });
    }

    if (newPassword !== confirmPassword) {
      return res.status(400).json({
        errorCode: 2,
        message: 'New password and confirm password do not match',
      });
    }

    const isMatch = await userRecord.comparePassword(oldPassword);
    if (!isMatch) {
      return res.status(400).json({
        errorCode: 4,
        message: 'Old password is incorrect',
      });
    }

    const isSamePassword = await bcrypt.compare(newPassword, userRecord.password);
    if (isSamePassword) {
      return res.status(400).json({
        errorCode: 5,
        message: 'New password cannot be the same as the old password',
      });
    }

    userRecord.password = newPassword;
    await userRecord.save();

    return res.status(200).json({
      errorCode: 0,
      message: 'Password changed successfully',
    });
  } catch (error) {
    console.error('Change Password error:', error);
    return res.status(500).json({
      errorCode: 6,
      message: 'An error occurred while changing password',
    });
  }
};


const verifyAccountByLink = async (req, res) => {
  try {
    const { token } = req.query;
    if (!token) {
      return res.status(400).json({ errorCode: 1, message: 'Token is required' });
    }

    const decoded = verifyAccessToken(token);
    if (!decoded) {
      return res.status(403).json({ errorCode: 2, message: 'Invalid or expired token' });
    }

    const updatedUser = await user.findByIdAndUpdate(decoded.id, { verified: true }, { new: true });
    if (!updatedUser) {
      return res.status(404).json({ errorCode: 3, message: 'User not found' });
    }

    return res.status(200).json({ errorCode: 0, message: 'Account verified successfully' });
  } catch (error) {
    console.error('Verify account link error:', error);
    return res.status(500).json({ errorCode: 4, message: 'Server error during verification' });
  }
};


module.exports = {
  apiLogin, apiRegister, verifyOtp, resendOTPVerificationCode,
  requestPasswordReset, resetPassword, changePassword, verifyAccountByLink
};

