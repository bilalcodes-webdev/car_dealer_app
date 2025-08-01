import { Inter } from "next/font/google";
import "./globals.css";
import { ClerkProvider } from "@clerk/nextjs";
import Header from "@/components/Header/Header";
import { Toaster } from "sonner";

const inter = Inter({
  subsets: ["latin"],
});

export const metadata = {
  title: "Car Dealership",
  description: "Find Your Dream Car Here",
};

export default function RootLayout({ children }) {
  return (
    <ClerkProvider>
      <html lang="en">
        <body className={`${inter.className} antialiased`}>
          <Header />
          <main className="min-h-screen">{children}</main>
          <Toaster richColors />
          <footer className="bg-blue-50 py-12">
            <p className="text-center text-sm text-gray-600 container mx-auto px-4">
              Made With 💗 By Bilal Hassan
            </p>
          </footer>
        </body>
      </html>
    </ClerkProvider>
  );
}
