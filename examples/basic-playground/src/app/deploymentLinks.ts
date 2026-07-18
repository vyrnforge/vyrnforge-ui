const playgroundBase = import.meta.env.BASE_URL.endsWith("/")
  ? import.meta.env.BASE_URL
  : `${import.meta.env.BASE_URL}/`;

const docsBase = playgroundBase.endsWith("/playground/")
  ? playgroundBase.slice(0, -"playground/".length)
  : "/";

export const playgroundLinks = {
  docs: import.meta.env.DEV ? "http://localhost:5174/" : docsBase,
  playground: import.meta.env.DEV ? "http://localhost:5173/" : playgroundBase,
  repository: "https://github.com/vyrnforge/vyrnforge-ui"
};
