import { expect, test } from "@playwright/test";

async function openReference(
  page: Parameters<typeof test>[0] extends never ? never : never,
) {
  return page;
}
