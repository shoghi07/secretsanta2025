"use client";

import { useState } from "react";

// Format timestamp to human-readable date/time like "12:30 pm on Wed 10 December"
const formatUnlockTime = (timestamp) => {
  const date = new Date(timestamp);
  const hours = date.getHours();
  const minutes = date.getMinutes();
  const ampm = hours >= 12 ? 'pm' : 'am';
  const hour12 = hours % 12 || 12;
  const minuteStr = minutes.toString().padStart(2, '0');

  const days = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'];
  const months = ['January', 'February', 'March', 'April', 'May', 'June',
    'July', 'August', 'September', 'October', 'November', 'December'];

  const dayName = days[date.getDay()];
  const dayNum = date.getDate();
  const monthName = months[date.getMonth()];

  return `${hour12}:${minuteStr} ${ampm} on ${dayName} ${dayNum} ${monthName}`;
};

export default function Home() {
  const [receiverCode, setReceiverCode] = useState("");
  const [guessedName, setGuessedName] = useState("");
  const [result, setResult] = useState(null);
  const [isLoading, setIsLoading] = useState(false);

  const handleSubmit = async (e) => {
    e.preventDefault();

    if (!receiverCode.trim() || !guessedName.trim()) {
      setResult({
        type: "error",
        message: "⚠️ Please fill in both fields.",
      });
      return;
    }

    setIsLoading(true);
    setResult(null);

    try {
      const response = await fetch("/api/verify", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          receiver_code: receiverCode.trim(),
          guessed_name: guessedName.trim(),
        }),
      });

      const data = await response.json();

      if (response.ok && data.success) {
        setResult({
          type: "success",
          message: `✅ CORRECT! The top wish list for ${data.member_name} is: ${data.wish_item}`,
        });
        // Clear form on success
        setReceiverCode("");
        setGuessedName("");
      } else if (data.error === "locked") {
        const unlockTimeStr = formatUnlockTime(data.unlockTime);
        setResult({
          type: "locked",
          message: `🔒 This code is locked. You can try guessing the name after ${unlockTimeStr}.`,
        });
      } else if (data.error === "wrong_name") {
        const unlockTimeStr = formatUnlockTime(data.unlockTime);
        setResult({
          type: "error",
          message: `❌ Wrong name! You can try guessing the name after ${unlockTimeStr}.`,
        });
      } else if (data.error === "invalid_code") {
        setResult({
          type: "warning",
          message: `⚠️ ${data.message}`,
        });
      } else {
        setResult({
          type: "error",
          message: "❌ Something went wrong. Please try again.",
        });
      }
    } catch (error) {
      setResult({
        type: "error",
        message: "❌ Failed to connect. Please try again.",
      });
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-red-900 via-red-800 to-green-900 flex items-center justify-center p-4 relative overflow-hidden">
      {/* Decorative snowflakes */}
      <div className="absolute inset-0 overflow-hidden pointer-events-none">
        <div className="snowflake">❄</div>
        <div className="snowflake snowflake-2">❄</div>
        <div className="snowflake snowflake-3">✦</div>
        <div className="snowflake snowflake-4">❄</div>
        <div className="snowflake snowflake-5">✦</div>
      </div>

      {/* Main Card */}
      <div className="w-full max-w-md bg-white/95 backdrop-blur-sm rounded-3xl shadow-2xl p-8 relative z-10 border border-gold-200">
        {/* Header */}
        <div className="text-center mb-8">
          <div className="text-6xl mb-4 animate-bounce-slow">🎅</div>
          <h1 className="text-3xl font-bold text-red-700 mb-2">
            Secret Santa 2025
          </h1>
          <p className="text-gray-600 text-sm">
            Enter your assigned receiver&apos;s code and guess who they are
          </p>
        </div>

        {/* Form */}
        <form onSubmit={handleSubmit} className="space-y-5">
          <div>
            <label
              htmlFor="receiverCode"
              className="block text-sm font-semibold text-gray-700 mb-2"
            >
              Receiver&apos;s Unique Code
            </label>
            <input
              type="text"
              id="receiverCode"
              value={receiverCode}
              onChange={(e) => setReceiverCode(e.target.value)}
              placeholder="e.g., REC001"
              className="w-full px-4 py-3 border-2 border-gray-200 rounded-xl focus:border-red-500 focus:ring-4 focus:ring-red-100 transition-all outline-none text-gray-800 placeholder-gray-400"
              disabled={isLoading}
            />
          </div>

          <div>
            <label
              htmlFor="guessedName"
              className="block text-sm font-semibold text-gray-700 mb-2"
            >
              Guess Their Full Name
            </label>
            <input
              type="text"
              id="guessedName"
              value={guessedName}
              onChange={(e) => setGuessedName(e.target.value)}
              placeholder="e.g., John Doe"
              className="w-full px-4 py-3 border-2 border-gray-200 rounded-xl focus:border-red-500 focus:ring-4 focus:ring-red-100 transition-all outline-none text-gray-800 placeholder-gray-400"
              disabled={isLoading}
            />
          </div>

          <button
            type="submit"
            disabled={isLoading}
            className="w-full bg-gradient-to-r from-red-600 to-red-700 hover:from-red-700 hover:to-red-800 text-white font-bold py-4 px-6 rounded-xl transition-all duration-300 transform hover:scale-[1.02] active:scale-[0.98] disabled:opacity-70 disabled:cursor-not-allowed disabled:transform-none shadow-lg hover:shadow-xl flex items-center justify-center gap-2"
          >
            {isLoading ? (
              <>
                <svg
                  className="animate-spin h-5 w-5 text-white"
                  xmlns="http://www.w3.org/2000/svg"
                  fill="none"
                  viewBox="0 0 24 24"
                >
                  <circle
                    className="opacity-25"
                    cx="12"
                    cy="12"
                    r="10"
                    stroke="currentColor"
                    strokeWidth="4"
                  ></circle>
                  <path
                    className="opacity-75"
                    fill="currentColor"
                    d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"
                  ></path>
                </svg>
                <span>Verifying...</span>
              </>
            ) : (
              <>
                <span>🎁</span>
                <span>Reveal Wishlist</span>
              </>
            )}
          </button>
        </form>

        {/* Result Section */}
        {result && (
          <div
            className={`mt-6 p-4 rounded-xl text-center font-medium animate-fade-in ${result.type === "success"
              ? "bg-green-100 text-green-800 border-2 border-green-300"
              : result.type === "locked"
                ? "bg-amber-100 text-amber-800 border-2 border-amber-300"
                : result.type === "warning"
                  ? "bg-yellow-100 text-yellow-800 border-2 border-yellow-300"
                  : "bg-red-100 text-red-800 border-2 border-red-300"
              }`}
          >
            {result.message}
          </div>
        )}

        {/* Footer decorations */}
        <div className="mt-8 text-center text-4xl space-x-2">
          <span>🎄</span>
          <span>🎁</span>
          <span>⭐</span>
          <span>🎄</span>
        </div>
      </div>
    </div>
  );
}
