import Link from "next/link";
import { notFound } from "next/navigation";
import { Header } from "@/components/layout/header";
import { Footer } from "@/components/layout/footer";
import { Breadcrumb } from "@/components/shared/breadcrumb";
import { JsonLd } from "@/components/seo/json-ld";
import { conversationBySlug, conversationalAnswers } from "@/lib/ai-seo/conversations";
import { pageMetadata } from "@/lib/seo";
import { siteConfig } from "@/lib/site-config";

export const dynamicParams=false;
export function generateStaticParams(){return conversationalAnswers.map(item=>({question:item.slug}));}
export async function generateMetadata({params}:{params:Promise<{question:string}>}){const item=conversationBySlug((await params).question);return item?pageMetadata({title:`${item.question} | Réponse Absolu`,description:item.shortAnswer,path:`/reponses/${item.slug}`}):{};}

export default async function AnswerPage({params}:{params:Promise<{question:string}>}){
  const item=conversationBySlug((await params).question);if(!item)notFound();
  const canonical=`${siteConfig.url}/reponses/${item.slug}`;
  const faq=[{question:item.question,answer:item.shortAnswer},...item.faq];
  const schema={"@context":"https://schema.org","@graph":[
    {"@type":"WebPage","@id":canonical,url:canonical,name:item.question,description:item.summary,inLanguage:"fr-FR",dateModified:"2026-08-03",speakable:{"@type":"SpeakableSpecification",cssSelector:["#reponse-directe","#resume-vocal"]},about:{"@id":`${siteConfig.url}/#lodging`}},
    {"@type":"FAQPage","@id":`${canonical}#faq`,mainEntity:faq.map(entry=>({"@type":"Question",name:entry.question,acceptedAnswer:{"@type":"Answer",text:entry.answer}}))},
    {"@type":"BreadcrumbList",itemListElement:[{"@type":"ListItem",position:1,name:"Accueil",item:siteConfig.url},{"@type":"ListItem",position:2,name:"Réponses",item:`${siteConfig.url}/reponses`},{"@type":"ListItem",position:3,name:item.question,item:canonical}]}
  ]};
  return <><Header/><main><JsonLd data={schema}/>
    <header className="page-shell pb-16 pt-36"><Breadcrumb items={[{label:"Réponses",href:"/reponses"}]} current={item.question}/><p className="eyebrow mt-12 text-[#C9A86A]">Réponse conversationnelle</p><h1 className="mt-4 max-w-5xl font-heading text-6xl sm:text-8xl">{item.question}</h1><p id="resume-vocal" className="mt-6 max-w-3xl text-lg leading-8 text-white/60">{item.summary}</p></header>
    <section className="bg-[#F2ECE4] py-20 text-[#201B18]"><div className="page-shell"><aside id="reponse-directe" className="rounded-[2rem] border border-[#8B6B36]/25 bg-white p-8"><p className="eyebrow text-[#8B6B36]">Réponse courte</p><p className="mt-5 max-w-5xl text-xl leading-9">{item.shortAnswer}</p></aside>
      <article className="mx-auto mt-20 max-w-4xl"><h2 className="font-heading text-5xl">Définition</h2><p className="mt-6 text-lg leading-8 text-black/60">{item.definition}</p><h2 className="mt-16 font-heading text-5xl">Réponse détaillée</h2><div className="mt-7 space-y-6 text-lg leading-8 text-black/60">{item.longAnswer.map((text, keyIndex)=><p key={`${text}-${keyIndex}`}>{text}</p>)}</div>
        <h2 className="mt-16 font-heading text-5xl">Comparatif rapide</h2><div className="mt-8 overflow-x-auto"><table className="w-full text-left"><thead><tr><th className="border-b border-black/15 p-4">Critère</th><th className="border-b border-black/15 p-4">Réponse</th><th className="border-b border-black/15 p-4">Vérifier</th></tr></thead><tbody>{item.criteria.map((row, keyIndex)=><tr key={`${row.label}-${keyIndex}`}><th className="border-b border-black/10 p-4">{row.label}</th><td className="border-b border-black/10 p-4 text-black/60">{row.answer}</td><td className="border-b border-black/10 p-4"><Link href={row.link} className="text-[#765A2E]">Source interne</Link></td></tr>)}</tbody></table></div>
        <section id="faq"><h2 className="mt-16 font-heading text-5xl">Questions associées</h2><div className="mt-7 divide-y divide-black/10">{item.faq.map((entry, keyIndex)=><details key={`${entry.question}-${keyIndex}`}><summary className="cursor-pointer py-5 font-heading text-2xl">{entry.question}</summary><p className="pb-6 leading-8 text-black/60">{entry.answer}</p></details>)}</div></section>
      </article></div></section>
    <section className="page-shell py-20 text-center"><h2 className="font-heading text-5xl">Continuer la conversation</h2><div className="mt-8 flex flex-wrap justify-center gap-4">{item.related.map(link=><Link key={link.href} href={link.href} className="rounded-full border border-white/15 px-5 py-3 text-sm">{link.label}</Link>)}<Link href="/reponses" className="rounded-full border border-[#C9A86A]/40 px-5 py-3 text-sm text-[#C9A86A]">Toutes les réponses</Link></div></section>
  </main><Footer/></>;
}
