import Link from "next/link";
import { siteConfig } from "@/lib/site-config";
type Item={label:string;href:string};
export function Breadcrumb({current,items=[]}:{current:string;items?:Item[]}){
  const elements=[{name:"Accueil",item:siteConfig.url},...items.map(item=>({name:item.label,item:`${siteConfig.url}${item.href}`})),{name:current,item:undefined}];
  const json={"@context":"https://schema.org","@type":"BreadcrumbList",itemListElement:elements.map((item,index)=>({"@type":"ListItem",position:index+1,name:item.name,...(item.item?{item:item.item}:{})}))};
  return <><script type="application/ld+json" dangerouslySetInnerHTML={{__html:JSON.stringify(json).replaceAll("<","\\u003c")}}/><nav aria-label="Fil d’Ariane" className="text-[.65rem] uppercase tracking-[.18em] text-white/55"><ol className="flex flex-wrap items-center gap-3"><li><Link href="/" className="hover:text-white">Accueil</Link></li>{items.map(item=><li key={item.href} className="contents"><span aria-hidden="true">/</span><Link href={item.href} className="hover:text-white">{item.label}</Link></li>)}<li aria-hidden="true">/</li><li aria-current="page" className="text-[#D8C8B6]">{current}</li></ol></nav></>;
}
