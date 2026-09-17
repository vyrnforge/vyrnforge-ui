import { referenceModel } from "./docsContext";

const docsBase = import.meta.env.BASE_URL.endsWith("/")
  ? import.meta.env.BASE_URL
  : `${import.meta.env.BASE_URL}/`;

export const docsLinks = {
  docs: import.meta.env.DEV ? "http://localhost:5174/" : docsBase,
  playground: import.meta.env.DEV
    ? "http://localhost:5173/"
    : `${docsBase}playground/`,
  repository: "https://github.com/vyrnforge/vyrnforge-ui",
};

function normalizePlaygroundPath(playgroundPath: string) {
  return playgroundPath.startsWith("/")
    ? playgroundPath
    : `/${playgroundPath}`;
}

function playgroundQuery(frameworkId: string, embedded = false) {
  const query = new URLSearchParams(window.location.search);
  query.set(referenceModel.frameworkContext.queryParameter, frameworkId);
  if (embedded) {
    query.set("embed", "reference");
  } else {
    query.delete("embed");
  }
  return query;
}

export function getPlaygroundHref(frameworkId: string) {
  return `${docsLinks.playground}?${playgroundQuery(frameworkId).toString()}${window.location.hash}`;
}

export function getPlaygroundRouteHref(
  frameworkId: string,
  playgroundPath: string,
) {
  return `${docsLinks.playground}?${playgroundQuery(frameworkId).toString()}#${normalizePlaygroundPath(playgroundPath)}`;
}

export function getEmbeddedPlaygroundHref(
  frameworkId: string,
  playgroundPath: string,
) {
  return `${docsLinks.playground}?${playgroundQuery(frameworkId, true).toString()}#${normalizePlaygroundPath(playgroundPath)}`;
}
