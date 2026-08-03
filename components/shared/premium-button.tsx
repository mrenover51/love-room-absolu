import { ArrowRight } from "lucide-react";
import { cn } from "@/lib/utils";

type Props = React.AnchorHTMLAttributes<HTMLAnchorElement> & { variant?: "gold" | "outline" | "light" };

export function PremiumButton({ className, children, variant = "gold", ...props }: Props) {
  return (
    <a className={cn("premium-action group inline-flex min-h-13 items-center justify-center gap-3 px-8 text-xs font-semibold uppercase tracking-[.18em]", variant === "gold" && "border border-[#DEC38E] bg-[linear-gradient(135deg,#D7B778,#B88C50)] text-[#110D0A] shadow-[0_14px_38px_rgba(97,65,35,.24)] hover:brightness-105", variant === "outline" && "border border-[#E8DCCB]/30 bg-[#1A120E]/20 text-[#FFF9F0] backdrop-blur-md hover:border-[#D0AE72]/75 hover:bg-[#F7F1E8]/[.08]", variant === "light" && "border border-[#F7F1E8] bg-[#F7F1E8] text-[#17110E] hover:bg-white", className)} {...props}>
      {children}<ArrowRight aria-hidden="true" className="size-4 transition-transform group-hover:translate-x-1" />
    </a>
  );
}
