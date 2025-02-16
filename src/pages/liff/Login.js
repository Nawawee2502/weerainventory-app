import React, { useEffect } from 'react';
import axios from 'axios';
import { useDispatch } from 'react-redux';
import { addToken, addUserData, addUserData2 } from "../../store/reducers/authentication";

const HomePage = () => {
  const dispatch = useDispatch();
  const LINE_LOGIN_URL = `https://access.line.me/oauth2/v2.1/authorize?response_type=code&client_id=2006891227&redirect_uri=https://weerainventory.com/liff&state=weera&scope=profile%20openid%20email`;
  const BASE_URL = `${process.env.REACT_APP_URL_API}`;

  useEffect(() => {
    const handleLineCallback = async () => {
      const urlParams = new URLSearchParams(window.location.search);
      const code = urlParams.get('code');

      if (code) {
        try {
          // 1. Get LINE UID from callback
          const lineResponse = await axios.post(`${BASE_URL}/api/callback`, { code });

          if (lineResponse.data.success) {
            const line_uid = lineResponse.data.line_uid;

            // 2. Get temp user data that was stored during username/password login
            const tempUserData = localStorage.getItem('tempUserData');

            if (tempUserData) {
              const userData = JSON.parse(tempUserData);

              // 3. Update user with LINE UID
              const updateResponse = await axios.post(`${BASE_URL}/api/updateLineUID`, {
                user_code: userData.user_code,
                line_uid: line_uid
              });

              if (updateResponse.data.success) {
                // 4. Store all authentication data
                localStorage.setItem('token', updateResponse.data.tokenKey);
                localStorage.setItem('userData', JSON.stringify(updateResponse.data.data));
                localStorage.setItem('userData2', JSON.stringify(updateResponse.data.userData2));

                // Add to Redux store
                dispatch(addToken(updateResponse.data.tokenKey));
                dispatch(addUserData(updateResponse.data.data));
                dispatch(addUserData2(updateResponse.data.userData2));

                // 5. Clean up temp data
                localStorage.removeItem('tempUserData');

                // 6. Redirect to dashboard
                window.location.replace('/dashboard');
                return;
              }
            }

            // If no tempUserData, try to check if LINE UID exists
            const checkResponse = await axios.post(`${BASE_URL}/api/checkLineUID`, {
              line_uid: line_uid
            });

            if (checkResponse.data.exists) {
              // User exists with this LINE UID, store auth data and redirect
              localStorage.setItem('token', checkResponse.data.token);
              localStorage.setItem('userData', JSON.stringify(checkResponse.data.userData));
              localStorage.setItem('userData2', JSON.stringify(checkResponse.data.userData2));

              // Add to Redux store
              dispatch(addToken(checkResponse.data.token));
              dispatch(addUserData(checkResponse.data.userData));
              dispatch(addUserData2(checkResponse.data.userData2));

              window.location.replace('/dashboard');
            } else {
              // No user found with this LINE UID
              window.location.replace('/');
            }
          }
        } catch (error) {
          console.error('Login error:', error);
          alert('เกิดข้อผิดพลาดในการล็อกอิน');
          window.location.replace('/');
        }
      }
    };

    handleLineCallback();
  }, [BASE_URL, dispatch]);

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
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-gray-900 mx-auto mb-4"></div>
            <p className="text-gray-600">กำลังประมวลผลการล็อกอิน...</p>
          </div>
        )}
      </div>
    </div>
  );
};

export default HomePage;