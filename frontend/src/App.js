import { useEffect, useState } from "react";
import axios from "axios";
import { GoogleLogin, CredentialResponse } from "@react-oauth/google";

const App = () => {
  const [user, setUser] = useState(null);

  const handleLoginSuccess = async (credentialResponse) => {
    if (credentialResponse.credential) {
      try {
        const response = await axios.post(
          `${process.env.REACT_APP_API_BASE_URL}/auth/google-login`,
          { token: credentialResponse.credential },
          { withCredentials: true }
        );
        setUser(response.data.user);
      } catch (error) {
        console.error("Login failed", error);
      }
    }
  };

  const handleLogout = async () => {
    await axios.post(
      `${process.env.REACT_APP_API_BASE_URL}/auth/logout`,
      {},
      { withCredentials: true }
    );
    setUser(null);
  };

  useEffect(() => {
    const checkSession = async () => {
      try {
        const response = await axios.get(
          `${process.env.REACT_APP_API_BASE_URL}/auth/me`,
          { withCredentials: true }
        );
        setUser(response.data.user);
      } catch (err) {
        setUser(null);
      }
    };

    checkSession();
  }, []);

  return (
    <div className="App">
      {user ? (
        <>
          <div>Welcome, {user.firstName}!</div>
          <button onClick={handleLogout}>Logout</button>
        </>
      ) : (
        <GoogleLogin
          onSuccess={handleLoginSuccess}
          onError={() => console.log("Login Failed")}
        />
      )}
    </div>
  );
};

export default App;
