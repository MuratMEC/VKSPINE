import type { Metadata } from "next";
import { Inter } from "next/font/google";
import { MantineProvider, ColorSchemeScript, createTheme } from '@mantine/core';
import Sidebar from "@/components/Sidebar";
import Header from "@/components/Header";
import "./globals.css";

const inter = Inter({
  subsets: ["latin"],
  variable: "--font-inter",
});

export const metadata: Metadata = {
  title: "VK Spine - MediStock",
  description: "Tıbbi Ürün Stok ve İzlenebilirlik Sistemi",
};

const theme = createTheme({
  fontFamily: 'var(--font-inter)',
  defaultRadius: 'md',
  headings: {
    fontFamily: 'var(--font-inter)',
  },
  components: {
    Card: {
      defaultProps: {
        withBorder: true,
        shadow: 'none',
      },
      styles: {
        root: {
          backgroundColor: '#ffffff',
          borderColor: '#e9ecef',
          borderWidth: '1px',
          borderStyle: 'solid',
        }
      }
    }
  }
});

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="tr" suppressHydrationWarning>
      <head>
        <ColorSchemeScript />
      </head>
      <body className={`${inter.variable} antialiased font-sans bg-[#F8F9FA] min-h-screen text-[#212529]`} suppressHydrationWarning>
        <MantineProvider theme={theme}>
          <div className="flex min-h-screen">
            <Sidebar />
            <div className="flex-1 flex flex-col min-w-0">
              <Header />
              <main className="flex-1 overflow-auto p-6">
                {children}
              </main>
            </div>
          </div>
        </MantineProvider>
      </body>
    </html>
  );
}
