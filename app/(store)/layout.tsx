import { Header } from "@/components/store/Header";
import { Footer } from "@/components/store/Footer";

export default function StoreLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <div className="flex min-h-screen flex-col bg-white">
      <Header />
      <main className="flex-1 bg-white">{children}</main>
      <Footer />
    </div>
  );
}
