import type { Metadata } from "next";
import { Inter } from "next/font/google";
import "./globals.css";

const inter = Inter({ subsets: ["latin"] });

export const metadata: Metadata = {
  title: "ShadowingNinja - YouTube 영어 학습",
  description: "YouTube 영상으로 영어 쉐도잉 학습하기",
};

import { Toaster } from "@/components/ui/sonner";
import DataLoader from "@/components/DataLoader";

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="ko">
      <head>
        <link rel="stylesheet" href="https://cdn.jsdelivr.net/gh/orioncactus/pretendard@v1.3.9/dist/web/static/pretendard.min.css" />
      </head>
      <body className={inter.className}>
        <DataLoader />
        {children}
        <Toaster />
      </body>
    </html>
  );
}
