import { spawn } from "node:child_process";

const port=3219,origin=`http://127.0.0.1:${port}`;
const server=spawn(process.execPath,["node_modules/next/dist/bin/next","start","--hostname","127.0.0.1","--port",String(port)],{stdio:"ignore"});
const wait=async()=>{for(let i=0;i<60;i++){try{const r=await fetch(`${origin}/robots.txt`);if(r.ok)return}catch{}await new Promise(r=>setTimeout(r,250))}throw new Error("Serveur Next indisponible")};
const tag=(html,name)=>html.match(new RegExp(`<meta name="${name}" content="([^"]*)"`))?.[1]??"";
const link=(html,rel)=>html.match(new RegExp(`<link rel="${rel}" href="([^"]*)"`))?.[1]??"";
try{
 await wait();
 const xml=await (await fetch(`${origin}/sitemap.xml`)).text();
 const urls=[...xml.matchAll(/<loc>(.*?)<\/loc>/g)].map(m=>m[1]);
 const sitemapSet=new Set(urls),titles=new Map(),descriptions=new Map(),alternatesByUrl=new Map(),errors=[];
 for(const publicUrl of urls){
  const path=new URL(publicUrl).pathname,res=await fetch(`${origin}${path}`,{redirect:"manual"}),html=await res.text();
  if(res.status!==200)errors.push(`${path}: HTTP ${res.status}`);
  const canonical=link(html,"canonical");if(canonical!==publicUrl)errors.push(`${path}: canonical ${canonical||"absent"}`);
  const locale=path.split("/")[1],lang=html.match(/<html[^>]*lang="([^"]+)"/)?.[1];if(lang!==locale)errors.push(`${path}: lang ${lang||"absent"}`);
  if(tag(html,"robots").includes("noindex"))errors.push(`${path}: noindex dans sitemap`);
  const title=html.match(/<title>(.*?)<\/title>/)?.[1]??"",description=tag(html,"description");
  if(!title||titles.has(title))errors.push(`${path}: title absent ou dupliqué`);else titles.set(title,path);
  if(!description||descriptions.has(description))errors.push(`${path}: description absente ou dupliquée`);else descriptions.set(description,path);
  const alternates=[...html.matchAll(/<link rel="alternate" hrefLang="([^"]+)" href="([^"]+)"/g)].map(m=>[m[1],m[2]]);
  alternatesByUrl.set(publicUrl, alternates);
  const expected=["fr-FR","en","de-DE","nl-NL","it-IT","es-ES","pt-PT","x-default"];
  for(const code of expected)if(!alternates.some(([value])=>value===code))errors.push(`${path}: hreflang ${code} absent`);
  for(const [,href] of alternates)if(!sitemapSet.has(href)&&!href.endsWith("/fr"))errors.push(`${path}: alternate non indexable ${href}`);
 }
 for(const [source,alternates] of alternatesByUrl){
  for(const [,target] of alternates){
   const reciprocal=alternatesByUrl.get(target);
   if(!reciprocal||!reciprocal.some(([,href])=>href===source))errors.push(`${new URL(source).pathname}: hreflang non réciproque vers ${target}`);
  }
 }
 const redirected=["/","/la-suite","/reservation","/equipements","/balneo","/sauna","/faq","/contact","/conditions","/politique-confidentialite","/confidentialite","/conditions-reservation"];
 for(const path of redirected){const r=await fetch(`${origin}${path}`,{redirect:"manual"});if(![301,308].includes(r.status))errors.push(`${path}: redirection permanente absente`);const location=r.headers.get("location");if(location){const target=await fetch(`${origin}${location}`,{redirect:"manual"});if(target.status!==200)errors.push(`${path}: destination ${location} en ${target.status}`)}}
 const preserved=["/galerie","/bons-cadeaux","/guide-touristique","/blog","/restaurants"];
 for(const path of preserved){const r=await fetch(`${origin}${path}`,{redirect:"manual"});if(r.status!==200)errors.push(`${path}: URL française conservée en ${r.status}`)}
 const weakRoutes={fr:["galerie","bons-cadeaux","blog","guides","restaurants","conditions","politique-confidentialite"],en:["gallery","gift-vouchers","blog","champagne-guide","restaurants","booking-terms","privacy"],de:["galerie","gutscheine","blog","champagne-reisefuehrer","restaurants","buchungsbedingungen","datenschutz"],nl:["galerij","cadeaubonnen","blog","champagne-reisgids","restaurants","boekingsvoorwaarden","privacy"],it:["galleria","buoni-regalo","blog","guida-champagne","restaurants","condizioni-prenotazione","privacy"],es:["galeria","bonos-regalo","blog","guia-champana","restaurants","condiciones-reserva","privacidad"],pt:["galeria","vales-oferta","blog","guia-champagne","restaurants","condicoes-reserva","privacidade"]};
 for(const [locale,sections] of Object.entries(weakRoutes)){for(const section of sections){const path=`/${locale}/${section}`,r=await fetch(`${origin}${path}`),html=await r.text();if(r.status!==200)errors.push(`${path}: HTTP ${r.status}`);if(!tag(html,"robots").includes("noindex"))errors.push(`${path}: page faible sans noindex`)}}
 const invalidLocalized=["/en/admin","/de/api","/nl/mon-sejour","/it/checkout","/es/callback","/pt/token","/en/ceci-nexiste-pas","/de/test-inexistant"];
 for(const path of invalidLocalized){const r=await fetch(`${origin}${path}`,{redirect:"manual"});if(r.status!==404)errors.push(`${path}: route localisée invalide en HTTP ${r.status}`);if(!String(r.headers.get("x-robots-tag")).includes("noindex"))errors.push(`${path}: route localisée invalide sans x-robots-tag noindex`)}
 const realPrivate=["/admin","/mon-sejour/test-token","/api/health"];
 for(const path of realPrivate){const r=await fetch(`${origin}${path}`,{redirect:"manual"});if(r.status===404)errors.push(`${path}: route privée réelle cassée`)}
 if(errors.length)throw new Error(`Audit SEO international échoué (${errors.length})\n- ${errors.slice(0,50).join("\n- ")}`);
 console.log(`Audit SEO international réussi : ${urls.length} URLs, canonicals, 8 hreflang réciproques, lang, metadata, noindex et redirections validés.`);
}finally{server.kill("SIGTERM")}
