import { pageMetadata } from "@/lib/seo";
import { Header } from "@/components/layout/header";
import { Footer } from "@/components/layout/footer";
import { VisualSuite } from "@/components/suite/visual-suite";
export const metadata=pageMetadata({title:"Suite romantique avec baignoire balnéo et sauna | Absolu",description:"Entrez dans une Love Room romantique de 35 m² à Avize, entre baignoire balnéo, sauna privatif, lumière tamisée et douceur à deux.",path:"/la-suite"});
export default function SuitePage(){return <><Header/><main id="main-content"><VisualSuite locale="fr"/></main><Footer/></>}
