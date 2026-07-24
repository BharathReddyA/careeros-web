import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "CareerOS: Your AI Job Agent",
  description: "CareerOS finds the right jobs, tailors your resume with AI, and coaches you for interviews with realistic voice practice.",
};

export default function RootLayout({ children }: Readonly<{ children: React.ReactNode }>) {
  return (
    <html lang="en">
      <body suppressHydrationWarning>{children}</body>
    </html>
  );
}
