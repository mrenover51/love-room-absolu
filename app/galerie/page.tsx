import { pageMetadata } from "@/lib/seo";
import { Header } from "@/components/layout/header";
import { Footer } from "@/components/layout/footer";
import { VisualGallery } from "@/components/gallery/visual-gallery";
import { getVisualContent } from "@/lib/gallery/visual-content";
import { siteConfig } from "@/lib/site-config";
export const metadata=pageMetadata({title:"Galerie de la Suite Absolu à Avize",description:"Explorez la Suite Absolu en images : baignoire balnéo, sauna privatif, coin café et ambiances lumineuses dans une galerie immersive.",path:"/galerie",image:"/images/optimized/lit.webp",imageAlt:"Lit de la Suite Absolu sous un éclairage romantique"});
export default function GalleryPage(){const{images}=getVisualContent("fr");const schema={"@context":"https://schema.org","@type":"ImageGallery",name:"Galerie de la Suite Absolu",url:`${siteConfig.url}/galerie`,associatedMedia:images.map(image=>({"@type":"ImageObject",contentUrl:`${siteConfig.url}${image.src}`,caption:image.caption,description:image.alt,encodingFormat:"image/webp"}))};return <><script type="application/ld+json" dangerouslySetInnerHTML={{__html:JSON.stringify(schema).replaceAll("<","\\u003c")}}/><Header/><main id="main-content"><VisualGallery locale="fr"/></main><Footer/></>}
