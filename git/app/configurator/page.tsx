"use client";
import dynamic from "next/dynamic";

const Configurator = dynamic(() => import("@/components/MaatkastConfiguratorPOC"), { ssr: false });

export default function Page() {
  return (
    <div className="min-h-screen p-6">
      <Configurator />
    </div>
  );
}
