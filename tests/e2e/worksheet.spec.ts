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
  await page.getByLabel("Response to original text").fill("I do not know what others are thinking.");
  await page.getByRole("button", { name: "Continue" }).click();
  await expect(page.getByRole("button", { name: "Save on this device" })).toBeVisible();
  await page.getByRole("button", { name: "Save on this device" }).click();
  await expect(page.getByText("Saved on this device.")).toBeVisible();
  await page.getByRole("link", { name: "Open history" }).click();
  await page.getByRole("button", { name: "Review" }).click();
  await expect(page.getByLabel("Saved worksheet review")).toBeVisible();
  await expect(page.getByRole("heading", { name: "Marked thoughts and labels" })).toBeVisible();
});

test("mobile worksheet can mark a manually selected passage thought", async ({ page }) => {
  await page.goto("/");
  await page.getByLabel("Situation").fill("At a social gathering");
  await page.getByRole("button", { name: "Continue" }).click();
  await page.getByRole("button", { name: "Anxious" }).click();
  await page.getByRole("button", { name: "Continue" }).click();
  await page.getByLabel("Thought passage").fill("Everyone thinks I am weird. I always do this.");
  await page.getByRole("button", { name: "Continue" }).click();

  const firstToken = page.locator("[data-token-index='0']");
  const lastToken = page.locator("[data-token-index='4']");
  const firstBox = await firstToken.boundingBox();
  const lastBox = await lastToken.boundingBox();

  if (!firstBox || !lastBox) {
    throw new Error("Passage tokens were not visible");
  }

  await page.mouse.move(firstBox.x + 4, firstBox.y + firstBox.height / 2);
  await page.mouse.down();
  await page.mouse.move(lastBox.x + lastBox.width - 4, lastBox.y + lastBox.height / 2, { steps: 8 });
  await page.mouse.up();

  await page.getByRole("button", { name: "Mark selection" }).click();

  await expect(page.getByText("1 marked")).toBeVisible();
  await expect(page.locator(".word-token-marked")).toHaveCount(5);
});
