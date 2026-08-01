import { ArrowRight } from "lucide-react";
import { cn } from "@/lib/utils";

type Props = React.AnchorHTMLAttributes<HTMLAnchorElement> & { variant?: "gold" | "outline" | "light" };

export function PremiumButton({ className, children, variant = "gold", ...props }: Props) {
  return (
    <a className={cn("group inline-flex min-h-12 items-center justify-center gap-3 px-6 text-xs font-semibold uppercase tracking-[.18em] transition-all duration-300", variant === "gold" && "bg-[#C9A86A] text-[#080808] hover:bg-[#DFC38E]", variant === "outline" && "border border-white/35 text-white hover:border-white hover:bg-white/10", variant === "light" && "bg-[#F6F2EC] text-[#080808] hover:bg-white", className)} {...props}>
      {children}<ArrowRight aria-hidden="true" className="size-4 transition-transform group-hover:translate-x-1" />
    </a>
  );
}
