'use client'

import { useState } from "react";
import { supabase } from "@/lib/supabase";
import { useRouter } from "next/navigation";

export default function AuthForm() {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [isLogin, setIsLogin] = useState(true);
  const [message, setMessage] = useState("");
  const router = useRouter();
  
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setMessage("");

    const { error } = isLogin
      ? await supabase.auth.signInWithPassword({ email, password })
      : await supabase.auth.signUp({ email, password });

    if (error) setMessage(error.message);
    else setMessage(isLogin ? "Logged in!" : "Check your email to confirm sign-up.");
    router.push("/my-benches");
  };

  return (
    <form onSubmit={handleSubmit} className="bg-white p-6 rounded shadow max-w-sm mx-auto">
      <h2 className="text-xl text-gray-800 font-bold mb-4">{isLogin ? "Log In" : "Sign Up"}</h2>
      <input
        type="email"
        placeholder="Email"
        value={email}
        onChange={(e) => setEmail(e.target.value)}
        className="w-full mb-2 p-2 border text-gray-800"
      />
      <input
        type="password"
        placeholder="Password"
        value={password}
        onChange={(e) => setPassword(e.target.value)}
        className="w-full mb-4 p-2 border text-gray-800"
      />
      <button type="submit" className="bg-blue-500 text-white px-4 py-2 rounded w-full text-gray-800">
        {isLogin ? "Log In" : "Sign Up"}
      </button>
      <p className="mt-4 text-sm text-center text-gray-800">
        {isLogin ? "Need an account?" : "Already have one?"}
        <button
          type="button"
          onClick={() => setIsLogin(!isLogin)}
          className="ml-2 underline text-blue-600"
        >
          {isLogin ? "Sign Up" : "Log In"}
        </button>
      </p>
      {message && <p className="mt-4 text-red-600">{message}</p>}
    </form>
  );
}
