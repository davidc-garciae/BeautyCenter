interface LogoProps {
  size?: "sm" | "md" | "lg";
  className?: string;
}

export function Logo({ size = "md", className = "" }: LogoProps) {
  const sizeClasses = {
    sm: "h-6 w-6",
    md: "h-8 w-8",
    lg: "h-12 w-12",
  };

  return (
    <div className={`flex items-center gap-2 ${className}`}>
      <div
        className={`${sizeClasses[size]} bg-gradient-to-br from-pink-500 to-violet-600 rounded-full flex items-center justify-center`}
      >
        <span className="text-white font-bold text-xs">CB</span>
      </div>
      <span className="font-semibold text-foreground">Centro Belleza</span>
    </div>
  );
}
