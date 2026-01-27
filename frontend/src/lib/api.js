export const authApi = {
  // Phone Auth
  phoneLogin: (phoneNumber) => 
    fetch(`/api/auth/phone-login`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json', 'ngrok-skip-browser-warning': 'true', },
      body: JSON.stringify({ phoneNumber }), // Matching backend expectation
    }),

  phoneLoginVerify: (phoneNumber, otp) => 
    fetch(`/api/auth/phone-login-verify`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json', 'ngrok-skip-browser-warning': 'true' },
      body: JSON.stringify({ phoneNumber, otp }),
    }),

  phoneSignup: (phoneNumber) => 
    fetch(`/api/auth/phone-signup`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json', 'ngrok-skip-browser-warning': 'true' },
      body: JSON.stringify({ phoneNumber }),
    }),

  phoneSignupVerify: (phoneNumber, otp) => 
    fetch(`/api/auth/phone-signup-verify`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json', 'ngrok-skip-browser-warning': 'true' },
      body: JSON.stringify({ phoneNumber, otp }),
    }),

  // Email Auth
  login: (email, password) => 
    fetch(`/api/auth/login`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json', 'ngrok-skip-browser-warning': 'true' },
      body: JSON.stringify({ email, password }),
    }),
    
  signup: (email, password) => 
    fetch(`/api/auth/signup`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json', 'ngrok-skip-browser-warning': 'true' },
      body: JSON.stringify({ email, password }),
    }),

  forgotPassword: (email) =>
    fetch(`${API_URL}/auth/forgot-password`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json', 'ngrok-skip-browser-warning': 'true' },
      body: JSON.stringify({ email }),
    }),
};