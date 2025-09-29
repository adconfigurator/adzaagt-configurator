export const metadata = {
  title: "Adzaagt Configurator",
  description: "Losstaande Adzaagt configurator",
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="nl">
      <body>{children}</body>
    </html>
  );
}
