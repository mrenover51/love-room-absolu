import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { isLocale, locales } from "@/lib/i18n/config";
export const dynamicParams=false;export function generateStaticParams(){return locales.map(locale=>({locale}));}
export async function generateMetadata({params}:{params:Promise<{locale:string}>}):Promise<Metadata>{const {locale}=await params;if(!isLocale(locale))return{};return{other:{"content-language":locale}};}
export default async function LocaleLayout({children,params}:{children:React.ReactNode;params:Promise<{locale:string}>}){const {locale}=await params;if(!isLocale(locale))notFound();return <><script dangerouslySetInnerHTML={{__html:`document.documentElement.lang=${JSON.stringify(locale)}`}}/>{children}</>}
