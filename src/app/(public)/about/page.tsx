import type { Metadata } from "next"; import { AboutView } from "@/components/localized-pages";
export const metadata:Metadata={title:"ჩვენ შესახებ",description:"ZECAR-ის მკაფიო და პირდაპირი მიდგომა მეორადი ავტომობილების წარმოდგენისა და განხილვისადმი.",alternates:{canonical:"/about"}};
export default function AboutPage(){return <AboutView/>}
