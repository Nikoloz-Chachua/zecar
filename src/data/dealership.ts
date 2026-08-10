export const dealership = {
  name: "ZECAR",
  legalName: "ZECAR Automotive",
  tagline: "Considered cars. Clearly presented.",
  description:
    "A modern independent showroom for carefully presented pre-owned vehicles.",
  phone: "+1 (555) 014-2280",
  phoneHref: "+15550142280",
  whatsapp: "+15550142280",
  email: "hello@zecar.example",
  address: "100 Motor Row, Your City",
  hours: ["Mon–Fri · 09:00–18:00", "Saturday · 10:00–16:00", "Sunday · By appointment"],
  siteUrl: "https://zecar.example",
} as const;

export const navigation = [
  { href: "/", label: "Home" },
  { href: "/cars", label: "Cars" },
  { href: "/about", label: "About" },
  { href: "/contact", label: "Contact" },
] as const;
