import { fireEvent, render, screen, waitFor } from "@testing-library/react";
import { beforeEach, describe, expect, it, vi } from "vitest";
import DataPage from "../page";
import { newWorksheet } from "@/lib/thought-log/types";

const mocks = vi.hoisted(() => ({ download: vi.fn(), entries: vi.fn() }));
vi.mock("@/components/app/top-bar", () => ({ TopBar: () => null }));
vi.mock("@/lib/local-store/indexed-db", () => ({
  listLocalEntries: mocks.entries,
  saveLocalEntry: vi.fn(),
  clearAllLocalData: vi.fn(),
}));
vi.mock("@/lib/local-store/export", async (original) => ({
  ...await original<typeof import("@/lib/local-store/export")>(),
  downloadFile: mocks.download,
}));

beforeEach(() => {
  vi.resetAllMocks();
  mocks.entries.mockResolvedValue([newWorksheet("test-export")]);
});

describe("backup export result", () => {
  it("does not claim success while the Android picker is open or canceled", async () => {
    let finish!: (saved: boolean) => void;
    mocks.download.mockReturnValue(new Promise<boolean>((resolve) => { finish = resolve; }));
    render(<DataPage />);
    fireEvent.click(screen.getByRole("button", { name: "Export all entries" }));
    await waitFor(() => expect(mocks.download).toHaveBeenCalled());
    expect(screen.queryByText(/Backup exported/)).not.toBeInTheDocument();
    finish(false);
    expect(await screen.findByRole("status")).toHaveTextContent("Export canceled");
    expect(screen.queryByText(/Backup exported/)).not.toBeInTheDocument();
  });

  it("reports success only after saving, and preserves an error on failure", async () => {
    mocks.download.mockResolvedValueOnce(true).mockRejectedValueOnce(new Error("disk full"));
    render(<DataPage />);
    fireEvent.click(screen.getByRole("button", { name: "Export all entries" }));
    expect(await screen.findByRole("status")).toHaveTextContent("Backup exported: 1 entry");
    fireEvent.click(screen.getByRole("button", { name: "Export all entries" }));
    expect(await screen.findByRole("alert")).toHaveTextContent("Your entries are still on this device");
    expect(screen.queryByText(/Backup exported/)).not.toBeInTheDocument();
  });
});
