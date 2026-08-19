import { describe, expect, it, vi } from "vitest";
import { render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { NotesSection } from "../notes-section";

describe("NotesSection", () => {
  it("saves the first notes without asking for confirmation", async () => {
    const user = userEvent.setup();
    const onSave = vi.fn().mockResolvedValue(undefined);
    render(<NotesSection onSave={onSave} />);

    await user.click(screen.getByRole("button", { name: "Add notes" }));
    await user.type(
      screen.getByLabelText("Notes on this entry"),
      "Therapist: I was still bracing for bad news."
    );
    await user.click(screen.getByRole("button", { name: "Save notes" }));

    expect(onSave).toHaveBeenCalledTimes(1);
    expect(onSave).toHaveBeenCalledWith("Therapist: I was still bracing for bad news.");
    expect(screen.queryByText(/Replace the notes/)).not.toBeInTheDocument();
  });

  it("asks before replacing notes that already exist", async () => {
    const user = userEvent.setup();
    const onSave = vi.fn().mockResolvedValue(undefined);
    render(<NotesSection notes="First pass." onSave={onSave} />);

    await user.click(screen.getByRole("button", { name: "Edit notes" }));
    const field = screen.getByLabelText("Notes on this entry");
    await user.clear(field);
    await user.type(field, "Second pass.");
    await user.click(screen.getByRole("button", { name: "Save notes" }));

    expect(onSave).not.toHaveBeenCalled();
    expect(await screen.findByText(/Replace the notes you saved before/)).toBeInTheDocument();

    await user.click(screen.getByRole("button", { name: "Replace them" }));
    expect(onSave).toHaveBeenCalledExactlyOnceWith("Second pass.");
  });

  it("keeps the draft intact when the replacement is declined", async () => {
    const user = userEvent.setup();
    const onSave = vi.fn().mockResolvedValue(undefined);
    render(<NotesSection notes="First pass." onSave={onSave} />);

    await user.click(screen.getByRole("button", { name: "Edit notes" }));
    const field = screen.getByLabelText("Notes on this entry");
    await user.clear(field);
    await user.type(field, "Second pass.");
    await user.click(screen.getByRole("button", { name: "Save notes" }));
    await user.click(screen.getByRole("button", { name: "Keep editing" }));

    expect(onSave).not.toHaveBeenCalled();
    expect(screen.getByLabelText("Notes on this entry")).toHaveValue("Second pass.");
  });

  it("saves an empty value when the notes are cleared", async () => {
    const user = userEvent.setup();
    const onSave = vi.fn().mockResolvedValue(undefined);
    render(<NotesSection notes="Written in a hurry." onSave={onSave} />);

    await user.click(screen.getByRole("button", { name: "Edit notes" }));
    await user.clear(screen.getByLabelText("Notes on this entry"));
    await user.click(screen.getByRole("button", { name: "Save notes" }));
    await user.click(screen.getByRole("button", { name: "Replace them" }));

    expect(onSave).toHaveBeenCalledExactlyOnceWith("");
  });

  it("treats whitespace-only notes as empty", async () => {
    const user = userEvent.setup();
    const onSave = vi.fn().mockResolvedValue(undefined);
    render(<NotesSection onSave={onSave} />);

    await user.click(screen.getByRole("button", { name: "Add notes" }));
    await user.type(screen.getByLabelText("Notes on this entry"), "   ");
    await user.click(screen.getByRole("button", { name: "Save notes" }));

    expect(onSave).toHaveBeenCalledExactlyOnceWith("");
  });

  it("explains what the section is for on request", async () => {
    const user = userEvent.setup();
    render(<NotesSection onSave={vi.fn()} />);

    await user.click(screen.getByRole("button", { name: "Add notes" }));
    await user.click(screen.getByRole("button", { name: "What are notes for?" }));

    expect(screen.getByText(/worked out with a therapist/)).toBeInTheDocument();
  });

  it("renders notes as text, never as markup", () => {
    render(<NotesSection notes="<script>alert(1)</script> careful" onSave={vi.fn()} />);
    expect(screen.getByText("<script>alert(1)</script> careful")).toBeInTheDocument();
    expect(document.querySelector("script")).toBeNull();
  });

  it("keeps the user's text on screen when saving fails", async () => {
    const user = userEvent.setup();
    const onSave = vi.fn().mockRejectedValue(new Error("Storage is full."));
    render(<NotesSection onSave={onSave} />);

    await user.click(screen.getByRole("button", { name: "Add notes" }));
    await user.type(screen.getByLabelText("Notes on this entry"), "Worth keeping.");
    await user.click(screen.getByRole("button", { name: "Save notes" }));

    expect(await screen.findByRole("alert")).toHaveTextContent("Storage is full.");
    expect(screen.getByLabelText("Notes on this entry")).toHaveValue("Worth keeping.");
  });
});
