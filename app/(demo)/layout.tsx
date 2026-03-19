import { DemoBanner } from "@/components/demo-banner";
import { Poller } from "@/components/poller";

export default function DemoLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <>
      <DemoBanner />
      <Poller interval={5000} />
      {children}
    </>
  );
}
