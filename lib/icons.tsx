import {
  Home,
  ShoppingCart,
  Car,
  HeartPulse,
  Popcorn,
  GraduationCap,
  ShoppingBag,
  Repeat,
  Wallet,
  TrendingUp,
  Utensils,
  Plane,
  Gift,
  Dog,
  Wrench,
  BookOpen,
  Dumbbell,
  Circle,
} from "lucide-react";

export const ICON_NAMES = [
  "home",
  "shopping-cart",
  "car",
  "heart-pulse",
  "popcorn",
  "graduation-cap",
  "shopping-bag",
  "repeat",
  "wallet",
  "trending-up",
  "utensils",
  "plane",
  "gift",
  "dog",
  "wrench",
  "book-open",
  "dumbbell",
  "circle",
] as const;

export function CategoryIcon({
  name,
  className,
}: {
  name: string;
  className?: string;
}) {
  switch (name) {
    case "home":
      return <Home className={className} />;
    case "shopping-cart":
      return <ShoppingCart className={className} />;
    case "car":
      return <Car className={className} />;
    case "heart-pulse":
      return <HeartPulse className={className} />;
    case "popcorn":
      return <Popcorn className={className} />;
    case "graduation-cap":
      return <GraduationCap className={className} />;
    case "shopping-bag":
      return <ShoppingBag className={className} />;
    case "repeat":
      return <Repeat className={className} />;
    case "wallet":
      return <Wallet className={className} />;
    case "trending-up":
      return <TrendingUp className={className} />;
    case "utensils":
      return <Utensils className={className} />;
    case "plane":
      return <Plane className={className} />;
    case "gift":
      return <Gift className={className} />;
    case "dog":
      return <Dog className={className} />;
    case "wrench":
      return <Wrench className={className} />;
    case "book-open":
      return <BookOpen className={className} />;
    case "dumbbell":
      return <Dumbbell className={className} />;
    default:
      return <Circle className={className} />;
  }
}
