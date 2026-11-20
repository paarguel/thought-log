import { TopBar } from "@/components/app/top-bar";
import { Capture } from "@/components/app/capture";

export default function Home() {
  return (
    <div className="app-shell mx-auto flex w-full max-w-xl flex-col">
      <TopBar />
      <main className="app-scroll flex flex-col px-5">
        <Capture />
      </main>
    </div>
  );
}
