import { isLocale, locales } from "@/lib/i18n/config";
import { siteConfig } from "@/lib/site-config";
export const dynamicParams=false;
export function generateStaticParams(){return locales.map(locale=>({locale}));}
export async function GET(_:Request,{params}:{params:Promise<{locale:string}>}){const {locale}=await params;if(!isLocale(locale))return new Response("Not found",{status:404});const paths=["","/blog","/guides","/faq"],xml=`<?xml version="1.0" encoding="UTF-8"?><urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9" xmlns:xhtml="http://www.w3.org/1999/xhtml">${paths.map(path=>`<url><loc>${siteConfig.url}/${locale}${path}</loc>${locales.map(code=>`<xhtml:link rel="alternate" hreflang="${code}" href="${siteConfig.url}/${code}${path}"/>`).join("")}<changefreq>monthly</changefreq></url>`).join("")}</urlset>`;return new Response(xml,{headers:{"content-type":"application/xml; charset=utf-8","cache-control":"public, max-age=3600, s-maxage=86400"}});}
