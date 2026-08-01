import { Breadcrumb } from "./breadcrumb";

export function LegalLayout({ title, updated = "Date de mise à jour — à compléter", children }: { title: string; updated?: string; children: React.ReactNode }) {
  return <main><header className="bg-[#121212] pb-16 pt-36"><div className="page-shell"><Breadcrumb current={title}/><h1 className="mt-8 font-heading text-5xl sm:text-7xl">{title}</h1><p className="mt-4 text-sm text-white/45">{updated}</p></div></header><article className="bg-[#F6F2EC] py-20 text-[#27221E]"><div className="page-shell max-w-3xl space-y-10 [&_h2]:font-heading [&_h2]:text-3xl [&_h2]:text-[#161311] [&_p]:mt-3 [&_p]:leading-8 [&_p]:text-[#665E56] [&_ul]:mt-3 [&_ul]:space-y-2 [&_ul]:text-[#665E56]">{children}</div></article></main>;
}
