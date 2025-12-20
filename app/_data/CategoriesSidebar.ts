// app/data/categories.ts
import {
  Grid,
  Laptop,
  Smartphone,
  Tv,
  Shirt,
  Home,
  Baby,
  Car,
  HeartPulse,
  Palette,
} from "lucide-react";

export interface Category {
  name: string;
  icon: React.ComponentType<{ className?: string }>;
  subcategories?: string[];
  banner?: string;
  highlight?: boolean;
}

export const categories: Category[] = [
  {
    name: "Computers and Accessories",
    icon: Laptop,
    subcategories: ["Laptops", "Desktops", "Monitors", "Storage"],
    banner: "/images/computers-banner.jpg",
  },
  {
    name: "Phones and Tablets",
    icon: Smartphone,
    subcategories: ["Smartphones", "Tablets", "Smartwatches"],
    banner: "/images/phones-banner.jpg",
  },
  {
    name: "Electronics",
    icon: Tv,
    subcategories: ["TVs", "Speakers", "Cameras"],
    banner: "/images/electronics-banner.jpg",
    highlight: true,
  },
  {
    name: "MarvelMarts Fashion",
    icon: Shirt,
    subcategories: ["Men", "Women", "Kids", "Accessories"],
    banner: "/images/fashion-banner.jpg",
  },
  {
    name: "Home and Kitchens",
    icon: Home,
    subcategories: ["Furniture", "Appliances", "Decor"],
    banner: "/images/home-banner.jpg",
  },
  {
    name: "Baby, Kids and Toys",
    icon: Baby,
    subcategories: ["Baby Gear", "Toys", "Kids Fashion"],
    banner: "/images/baby-banner.jpg",
  },
  {
    name: "Automobile",
    icon: Car,
    subcategories: ["Car Parts", "Accessories"],
    banner: "/images/auto-banner.jpg",
    highlight: true,
  },
  {
    name: "Health and Beauty",
    icon: HeartPulse,
    subcategories: ["Skincare", "Makeup", "Supplements"],
    banner: "/images/health-banner.jpg",
  },
  {
    name: "African Arts & Crafts",
    icon: Palette,
    subcategories: ["Paintings", "Sculptures", "Handmade"],
    banner: "/images/arts-banner.jpg",
  },
  {
    name: "Other Categories",
    icon: Grid,
    subcategories: ["Miscellaneous"],
    banner: "/images/other-banner.jpg",
  },
];
