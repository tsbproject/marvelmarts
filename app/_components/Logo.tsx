import clsx from "clsx";
import Image from "next/image";

type LogoProps = {
  variant?: "icon" | "full";
  size?: "xs" | "sm" | "md" | "lg" | "xl" ;
  priority?: boolean;
  className?: string;
};

const sizes = {
  xs: 26,
  sm: 36,
  md: 48,
  lg: 64,
  xl: 200,
};

export default function Logo({
  variant = "icon",
  size = "xl",
  priority = false,
  className,
}: LogoProps) {
  const dimension = sizes[size];

  return (
    <Image
      src={
        variant === "icon"
          ? "/logo1-white.png"
          : "/images/logo/logo-full.png"
      }
      alt="Tayo Bolarinwa"
      width={dimension}
      height={dimension}
      priority={priority}
      className={clsx(className)}
    />
  );
}