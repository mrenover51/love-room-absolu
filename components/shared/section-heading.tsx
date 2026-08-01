import { cn } from "@/lib/utils";

export function SectionHeading({ eyebrow, title, description, light = false, className }: { eyebrow: string; title: string; description?: string; light?: boolean; className?: string }) {
  return (
    <div className={cn("max-w-2xl", className)}>
      <div className="mb-5 flex items-center gap-4"><span className="gold-line" /><p className="eyebrow text-[#9A7844]">{eyebrow}</p></div>
      <h2 className={cn("font-heading text-4xl leading-[1.05] font-medium sm:text-5xl lg:text-6xl", light ? "text-[#F6F2EC]" : "text-[#161311]")}>{title}</h2>
      {description && <p className={cn("mt-6 max-w-xl text-base leading-8", light ? "text-white/65" : "text-[#665E56]")}>{description}</p>}
    </div>
  );
}
