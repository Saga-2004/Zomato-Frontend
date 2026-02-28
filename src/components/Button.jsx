import React from "react";

/**
 * Reusable button with built-in loading spinner and disabled state.
 * Props:
 *  - loading: boolean  (shows spinner when true)
 *  - className: string (additional tailwind classes)
 *  - children: node
 *  - rest: any other <button> props
 */
export default function Button({
  loading,
  className = "",
  children,
  disabled,
  ...rest
}) {
  const isDisabled = disabled || loading;
  return (
    <button
      {...rest}
      disabled={isDisabled}
      className={`flex items-center justify-center gap-2 font-semibold rounded-lg transition-colors focus:outline-none focus:ring-2 focus:ring-offset-2 ${
        isDisabled ? "opacity-50 cursor-wait" : ""
      } ${className}`}
    >
      {loading && (
        <svg
          className="animate-spin h-4 w-4 text-current"
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
            d="M4 12a8 8 0 018-8v4a4 4 0 00-4 4H4z"
          ></path>
        </svg>
      )}
      {children}
    </button>
  );
}
