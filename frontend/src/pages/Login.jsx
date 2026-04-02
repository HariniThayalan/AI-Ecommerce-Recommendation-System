import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { useStore } from "../store/useStore";

export default function Login() {
  const [isLoginMode, setIsLoginMode] = useState(true);
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [name, setName] = useState("");
  
  const store = useStore();
  const navigate = useNavigate();

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      if (isLoginMode) {
        await store.login(email, password);
      } else {
        await store.signup(email, password, name);
      }
      navigate("/products");
    } catch (err) {
      console.error(err);
    }
  };

  return (
    <div className="flex flex-col items-center justify-center min-h-[calc(100vh-140px)] bg-amz-bg text-amz-text px-4 py-8">
      {/* Brand Title */}
      <div className="mb-6 text-center">
        <h1 className="text-3xl sm:text-4xl font-extrabold tracking-tight mb-2">
          ShopSmart <span className="text-amz-accent font-normal">.ai</span>
        </h1>
        <p className="text-sm sm:text-base text-amz-muted font-medium">
          AI E-commerce Recommendation System
        </p>
      </div>

      {/* Auth Card */}
      <div className="bg-white p-6 sm:p-8 rounded-lg shadow-premium w-full max-w-md border border-gray-200">
        <h2 className="text-2xl font-bold mb-6">
          {isLoginMode ? "Sign in" : "Create account"}
        </h2>
        
        <form onSubmit={handleSubmit} className="flex flex-col gap-4">
          {!isLoginMode && (
            <div className="flex flex-col gap-1">
              <label className="text-sm font-bold">Your name</label>
              <input
                type="text"
                value={name}
                onChange={(e) => setName(e.target.value)}
                className="p-2 rounded border border-gray-400 focus:border-amz-accent focus:ring-1 focus:ring-amz-accent outline-none input-focus"
                placeholder="First and last name"
                required
              />
            </div>
          )}

          <div className="flex flex-col gap-1">
            <label className="text-sm font-bold">Email</label>
            <input
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              className="p-2 rounded border border-gray-400 focus:border-amz-accent focus:ring-1 focus:ring-amz-accent outline-none input-focus"
              required
            />
          </div>

          <div className="flex flex-col gap-1">
            <label className="text-sm font-bold">Password</label>
            <input
              type="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              className="p-2 rounded border border-gray-400 focus:border-amz-accent focus:ring-1 focus:ring-amz-accent outline-none input-focus"
              placeholder={isLoginMode ? "" : "At least 6 characters"}
              required
            />
          </div>

          <button
            type="submit"
            className="mt-2 w-full p-2 bg-amz-accent text-amz-dark font-medium rounded-md hover:bg-amz-accentHover border border-[#a88734] shadow-sm transition-colors cursor-pointer"
          >
            {isLoginMode ? "Sign in" : "Create your ShopSmart account"}
          </button>
        </form>

        <div className="mt-6 text-sm text-amz-text">
          By continuing, you agree to ShopSmart's{" "}
          <a href="#" className="text-amz-link hover:text-amz-linkHover hover:underline">Conditions of Use</a> and{" "}
          <a href="#" className="text-amz-link hover:text-amz-linkHover hover:underline">Privacy Notice</a>.
        </div>

        {/* Toggle Mode */}
        {isLoginMode ? (
          <div className="mt-8">
            <div className="relative flex items-center mb-4">
              <div className="flex-grow border-t border-gray-300"></div>
              <span className="flex-shrink-0 px-3 text-sm text-gray-500 bg-white">New to ShopSmart?</span>
              <div className="flex-grow border-t border-gray-300"></div>
            </div>
            <button
              onClick={() => setIsLoginMode(false)}
              className="w-full p-2 bg-gray-100 text-amz-dark font-medium rounded-md hover:bg-gray-200 border border-gray-300 shadow-sm transition-colors cursor-pointer"
            >
              Create your ShopSmart account
            </button>
          </div>
        ) : (
          <div className="mt-6 pt-6 border-t border-gray-200 text-sm">
            Already have an account?{" "}
            <button
              onClick={() => setIsLoginMode(true)}
              className="text-amz-link hover:text-amz-linkHover hover:underline font-medium focus:outline-none"
            >
              Sign in
            </button>
          </div>
        )}
      </div>
    </div>
  );
}