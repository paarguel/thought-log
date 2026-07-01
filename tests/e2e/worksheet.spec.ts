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
