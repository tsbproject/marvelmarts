import clsx from "clsx";
import Image from "next/image";
import Link from "next/link";

type LogoProps = {
  variant?: "icon" | "full";
  size?: "xs" | "sm" | "md" | "lg" | "xl" ;
  priority?: boolean;
  className?: string;
};

const sizes = {
  xs: 10,
  sm: 25,
  md: 80,
  lg: 120,
  xl: 200,
};

export default function Logo({
  variant = "icon",
  size = "md",
  priority = false,
  className,
}: LogoProps) {
  const dimension = sizes[size];

  return (
    <Link href="/">
    <Image
      src={
        variant === "icon"
          ? "/logo1-white-new.png"
          : "/images/logo/logo-full.png"
      }
      alt="Tayo Bolarinwa"
      width={dimension}
      height={dimension}
      priority={priority}
      className={clsx(className)}
    />

    </Link>
  );
}