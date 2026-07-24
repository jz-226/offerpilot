import type { Metadata } from "next";
import "./globals.css";
import AuthSync from "@/components/AuthSync";

export const metadata: Metadata = {
  title: "OfferPilot - 你的 AI 职业成长伙伴",
  description: "从目标岗位出发，找到每天最重要的一步，持续成长直到 Offer",
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="zh-CN">
      <body className="antialiased">
        <AuthSync />
        {children}
      </body>
    </html>
  );
}
