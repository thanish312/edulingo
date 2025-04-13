// src/components/LoginButton.jsx
import React from "react";
import { useAuth0 } from "@auth0/auth0-react";

const LoginButton = () => {
  const { loginWithRedirect } = useAuth0();

  // Basic styling example - adjust Tailwind classes as needed
  return (
    <button
      onClick={() => loginWithRedirect()}
      className="px-4 py-2 bg-green-500 text-white rounded hover:bg-green-600 focus:outline-none focus:ring-2 focus:ring-green-700 focus:ring-opacity-50"
    >
      Log In
    </button>
  );
};

export default LoginButton;