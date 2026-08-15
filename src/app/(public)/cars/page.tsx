import type { Metadata } from "next"; import { CarsView } from "@/components/localized-pages";
export const metadata:Metadata={title:"ავტომობილები",description:"დაათვალიერეთ ZECAR-ის პრემიუმ მეორადი ავტომობილების სადემონსტრაციო მარაგი.",alternates:{canonical:"/cars"}};
export default function CarsPage(){return <CarsView/>}
