import { Plus } from "lucide-react";

type FaqItem = { question: string; answer: string };

export function Faq({ items, includeSchema = false }: { items: readonly FaqItem[]; includeSchema?: boolean }) {
  const json = {
    "@context": "https://schema.org",
    "@type": "FAQPage",
    mainEntity: items.map((item) => ({
      "@type": "Question",
      name: item.question,
      acceptedAnswer: { "@type": "Answer", text: item.answer },
    })),
  };

  return <>
    {includeSchema && <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(json).replaceAll("<", "\\u003c") }} />}
    <div className="divide-y divide-black/10">{items.map((item, keyIndex) => <details key={`${item.question}-${keyIndex}`} className="group">
      <summary className="flex cursor-pointer list-none items-center justify-between gap-6 py-6 font-heading text-2xl">
        <span>{item.question}</span><Plus aria-hidden="true" className="size-5 shrink-0 transition-transform group-open:rotate-45" />
      </summary>
      <p className="max-w-2xl pb-6 leading-7 text-[#665E56]">{item.answer}</p>
    </details>)}</div>
  </>;
}
