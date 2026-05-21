import type { Metadata } from "next";
import "./globals.css";

export const metadata: Metadata = {
  title: "인도형의 찬양 기타코드 대백과(by 전도사닷컴)",
  description: "초보자와 찬양팀 기타 연주자를 위한 무료 통기타 코드 탐색기",
  icons: {
    icon: "/indo-hyung-icon.jpeg",
    apple: "/indo-hyung-icon.jpeg",
  },
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="ko" className="h-full antialiased">
      <body className="min-h-full flex flex-col">{children}</body>
    </html>
  );
}
