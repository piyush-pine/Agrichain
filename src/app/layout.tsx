// This is the new root layout. It only contains the html and body tags.
// The main layout content has been moved to src/app/[locale]/layout.tsx

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return children;
}
