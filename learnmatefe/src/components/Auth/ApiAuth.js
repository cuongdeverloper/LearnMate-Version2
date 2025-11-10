import axios from '../../Service/AxiosCustomize';

export const ApiLogin = (userEmail, userPassword) => {
  return axios.post('/login', { email: userEmail, password: userPassword });
}

export const sendOTPApi = async (userId, otp) => {
  try {
    const response = await axios.post('/verify-otp', { userId, OTP: otp });
    return response
  } catch (error) {
    console.error("Error verifying OTP:", error.response ? error.response.data : error.message);
    return { errorCode: 1, message: 'Failed to verify OTP' };
  }
};
export const ApiRegister = async (username, email, password, phoneNumber, gender, role, image) => {
  const formData = new FormData();
  formData.append('username', username);
  formData.append('email', email);
  formData.append('password', password);
  formData.append('phoneNumber', phoneNumber);
  formData.append('gender', gender);
  formData.append('role', role);
  if (image) {
    formData.append('image', image);
  }

  try {
    const response = await axios.post('/register', formData, {
      headers: {
        'Content-Type': 'multipart/form-data',
      },
    });
    return response
  } catch (error) {
    console.error('Error during registration:', error);
    throw error;
  }
};

export const requestPasswordResetApi = async (email) => {
  try {
    const response = await axios.post('/rqreset-password', { email });
    return response;
  } catch (error) {
    console.log(error)
  }
};

export const resetPasswordApi = async (token, newPassword) => {
  try {
    const response = await axios.post('/reset-password', { token, newPassword });
    return response;
  } catch (error) {
    console.log(error)
  }
};