import "../styles/globals.css";
import type { Metadata } from "next";
import HeaderBar from "@/app/components/HeaderBar";

export const metadata: Metadata = {
  title: "Burger Shop — Storage Uploads",
  description: "Upload avatar to Supabase Storage and update profile",
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en">
      <body className="min-h-screen bg-neutral-50 text-neutral-800">
        <HeaderBar />
        <main className="mx-auto max-w-5xl px-4 py-6">{children}</main>
        <footer className="border-t bg-white">
          <div className="mx-auto max-w-5xl px-4 py-3 text-xs text-neutral-500">
            Storage demo: upload avatar → update profiles.avatar_url
          </div>
        </footer>
      </body>
    </html>
  );
}
