import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";

interface UserAvatarProps {
  user?: {
    name?: string | null;
    email?: string | null;
    image?: string | null;
  };
  size?: "sm" | "md" | "lg";
}

export function UserAvatar({ user, size = "md" }: UserAvatarProps) {
  const sizeClasses = {
    sm: "h-6 w-6",
    md: "h-8 w-8",
    lg: "h-10 w-10",
  };

  const getInitials = (name: string) => {
    return name
      .split(" ")
      .map((n) => n[0])
      .join("")
      .toUpperCase()
      .slice(0, 2);
  };

  return (
    <Avatar className={sizeClasses[size]}>
      <AvatarImage src={user?.image || ""} alt={user?.name || ""} />
      <AvatarFallback className="bg-gradient-to-br from-pink-500 to-violet-600 text-white text-xs">
        {user?.name ? getInitials(user.name) : "CB"}
      </AvatarFallback>
    </Avatar>
  );
}
