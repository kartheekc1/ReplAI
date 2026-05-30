import { Nav } from "@/components/landing/nav";
import { Footer } from "@/components/landing/cta-footer";

export default function MarketingLayout({ children }: { children: React.ReactNode }) {
  return (
    <>
      <div className="bg-field" />
      <div className="bg-grid" />
      <Nav />
      <main className="relative z-[1] min-h-screen">{children}</main>
      <Footer />
    </>
  );
}
