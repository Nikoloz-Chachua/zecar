import type { Metadata } from "next"; import { ContactView } from "@/components/localized-pages";
export const metadata:Metadata={title:"კონტაქტი",description:"დაურეკეთ, მოგვწერეთ WhatsApp-ით ან ელფოსტით, ან ეწვიეთ ZECAR-ის შოურუმს.",alternates:{canonical:"/contact"}};
export default function ContactPage(){return <ContactView/>}
