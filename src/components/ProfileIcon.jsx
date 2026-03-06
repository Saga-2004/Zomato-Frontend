/**
 * ProfileIcon — a clean, filled user silhouette.
 * Props:
 *  - className: string  (default "w-5 h-5")
 *  - style: object
 */
function ProfileIcon({ className = "w-5 h-5", style, ...props }) {
  return (
    <svg
      xmlns="http://www.w3.org/2000/svg"
      viewBox="0 0 24 24"
      fill="currentColor"
      className={className}
      style={style}
      aria-hidden="true"
      focusable="false"
      {...props}
    >
      {/* Head */}
      <circle cx="12" cy="7.5" r="4" />
      {/* Shoulders */}
      <path d="M4 20.5c0-4.14 3.58-7.5 8-7.5s8 3.36 8 7.5a.5.5 0 01-.5.5h-15a.5.5 0 01-.5-.5z" />
    </svg>
  );
}

export default ProfileIcon;
