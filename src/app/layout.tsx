import type { Metadata } from "next";
import { Inter } from "next/font/google";
import { MantineProvider, ColorSchemeScript, createTheme } from '@mantine/core';
import '@mantine/core/styles.css';
import AppLayoutWrapper from "@/components/AppLayoutWrapper";
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
          <AppLayoutWrapper>
            {children}
          </AppLayoutWrapper>
        </MantineProvider>
      </body>
    </html>
  );
}
