import { cn } from "@/lib/utils";

const SRC = "/brand/mrvn-mark.png";

export function MrvnLogo({
  className,
  size = "md",
}: {
  className?: string;
  size?: "sm" | "md" | "lg";
}) {
  const h = size === "sm" ? "h-3.5" : size === "lg" ? "h-10" : "h-7";
  return (
    // eslint-disable-next-line @next/next/no-img-element
    <img
      src={SRC}
      alt="MRVN"
      width={1024}
      height={517}
      draggable={false}
      className={cn(
        "inline-block w-auto shrink-0 select-none object-contain brightness-0 invert",
        h,
        className,
      )}
    />
  );
}
