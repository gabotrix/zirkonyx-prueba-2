import type { Metadata } from "next";
import { Poppins } from "next/font/google";
import Cabecera from "@/components/Cabecera";
import Pie from "@/components/Pie";
import "./globals.css";

const poppins = Poppins({
  subsets: ["latin"],
  weight: ["400", "600", "700"],
  display: "swap",
});

export const metadata: Metadata = {
  title: "Clínica Dental Sonrisa Viva",
  description:
    "Cuidamos la salud dental de toda tu familia: limpieza, ortodoncia, blanqueamiento, implantes y odontopediatría.",
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="es">
      <body className={poppins.className}>
        <Cabecera />
        {children}
        <Pie />
      </body>
    </html>
  );
}
