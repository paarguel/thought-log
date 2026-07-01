import { expect, test } from "@playwright/test";

test("mobile worksheet can reach local save options", async ({ page }) => {
  await page.goto("/");
  await expect(page.getByRole("heading", { name: "What happened?" })).toBeVisible();
  await page.getByLabel("Situation").fill("At a social gathering");
  await page.getByRole("button", { name: "Continue" }).click();
  await page.getByRole("button", { name: "Anxious" }).click();
  await page.getByRole("button", { name: "Continue" }).click();
  await page.getByLabel("Thought passage").fill("Everyone thinks I am weird. I always do this.");
  await page.getByRole("button", { name: "Continue" }).click();
  await page.getByRole("button", { name: "Auto choose thoughts" }).click();
  await page.getByRole("button", { name: "Continue" }).click();
  await page.getByRole("button", { name: "Mind reading" }).click();
  await page.getByRole("button", { name: "Continue" }).click();
  await expect(page.getByRole("tab", { name: "Original Text" })).toHaveAttribute("aria-selected", "true");
  await page.getByRole("button", { name: "Continue" }).click();
  await page.getByLabel("Realistic / rational thought").fill("I do not know what others are thinking.");
  await page.getByRole("button", { name: "Continue" }).click();
  await expect(page.getByRole("button", { name: "Save on this device" })).toBeVisible();
});

test("mobile worksheet can mark a manually selected passage thought", async ({ page }) => {
  await page.goto("/");
  await page.getByLabel("Situation").fill("At a social gathering");
  await page.getByRole("button", { name: "Continue" }).click();
  await page.getByRole("button", { name: "Anxious" }).click();
  await page.getByRole("button", { name: "Continue" }).click();
  await page.getByLabel("Thought passage").fill("Everyone thinks I am weird. I always do this.");
  await page.getByRole("button", { name: "Continue" }).click();

  await page.getByLabel("Thought passage for selection").evaluate((passage) => {
    const textNode = passage.firstChild;
    if (!textNode) {
      throw new Error("Passage text was not rendered");
    }

    const range = document.createRange();
    range.setStart(textNode, 0);
    range.setEnd(textNode, "Everyone thinks I am weird".length);
    const selection = window.getSelection();
    selection?.removeAllRanges();
    selection?.addRange(range);
  });

  await page.getByRole("button", { name: "Mark selection" }).click();

  await expect(page.getByText("1 marked")).toBeVisible();
  await expect(page.locator("mark.marked")).toHaveText("Everyone thinks I am weird");
});
