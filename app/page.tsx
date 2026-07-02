import { TopBar } from "@/components/app/top-bar";
import { WorksheetFlow } from "@/components/worksheet/worksheet-flow";

export default function Home() {
  return (
    <div className="mx-auto flex min-h-dvh w-full max-w-xl flex-col">
      <TopBar />
      <main className="flex flex-1 flex-col px-5 pb-4">
        <WorksheetFlow />
      </main>
    </div>
  );
}
