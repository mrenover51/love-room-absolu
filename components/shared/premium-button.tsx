import { ArrowRight } from "lucide-react";
import { cn } from "@/lib/utils";

type Props = React.AnchorHTMLAttributes<HTMLAnchorElement> & { variant?: "gold" | "outline" | "light" };

export function PremiumButton({ className, children, variant = "gold", ...props }: Props) {
  return (
    <a className={cn("premium-action group inline-flex min-h-13 items-center justify-center gap-3 px-8 text-xs font-semibold uppercase tracking-[.18em]", variant === "gold" && "border border-[#D5B97E] bg-[#C9A86A] text-[#080808] shadow-[0_12px_34px_rgba(201,168,106,.16)] hover:bg-[#DFC38E]", variant === "outline" && "border border-white/30 bg-black/10 text-white backdrop-blur-sm hover:border-[#D8BD87]/70 hover:bg-white/[.08]", variant === "light" && "border border-white bg-[#F6F2EC] text-[#080808] hover:bg-white", className)} {...props}>
      {children}<ArrowRight aria-hidden="true" className="size-4 transition-transform group-hover:translate-x-1" />
    </a>
  );
}
