"use client";

export default function AdminLayoutContent({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <main className="flex-1 p-4 md:p-8 overflow-auto min-h-screen">
      {children}
    </main>
  );
}
