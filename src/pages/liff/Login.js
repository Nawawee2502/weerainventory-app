import React, { useEffect } from 'react';
import axios from 'axios';

const HomePage = () => {
  const LINE_LOGIN_URL = `https://access.line.me/oauth2/v2.1/authorize?response_type=code&client_id=2006891227&redirect_uri=https://weerainventory.com/liff&state=weera&scope=profile%20openid%20email`;
  const BASE_URL = `${process.env.REACT_APP_URL_API}`;
  const TOKEN_KEY = process.env.REACT_APP_TOKEN_KEY;

  useEffect(() => {
    const handleLineCallback = async () => {
      const urlParams = new URLSearchParams(window.location.search);
      const code = urlParams.get('code');
      
      if (code) {
        try {
          const response = await axios.post(BASE_URL+ "/api/callback", { 
            code,
            tokenKey: TOKEN_KEY 
          });
          
          if (response.data.success) {
            localStorage.setItem('token', response.data.token);
            localStorage.setItem('userData', JSON.stringify(response.data.userData));
            window.location.href = '/dashboard';
          }
        } catch (error) {
          console.error('Login error:', error);
          alert('เกิดข้อผิดพลาดในการล็อกอิน');
        }
      }
    };

    handleLineCallback();
  }, [BASE_URL, TOKEN_KEY]);

  return (
    <div className="flex items-center justify-center min-h-screen bg-gray-100">
      <div className="bg-white p-8 rounded-lg shadow-md text-center">
        <h1 className="text-2xl font-bold mb-6">LINE Inventory System</h1>
        {!window.location.search.includes('code') ? (
          <a 
            href={LINE_LOGIN_URL}
            className="inline-block bg-green-500 text-white px-6 py-2 rounded hover:bg-green-600 transition-colors"
          >
            Login with LINE
          </a>
        ) : (
          <div>
            <p className="text-gray-600">กำลังประมวลผลการล็อกอิน...</p>
          </div>
        )}
      </div>
    </div>
  );
};

export default HomePage;