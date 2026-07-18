const docsBase = import.meta.env.BASE_URL.endsWith("/")
  ? import.meta.env.BASE_URL
  : `${import.meta.env.BASE_URL}/`;

export const docsLinks = {
  docs: import.meta.env.DEV ? "http://localhost:5174/" : docsBase,
  playground: import.meta.env.DEV ? "http://localhost:5173/" : `${docsBase}playground/`,
  repository: "https://github.com/vyrnforge/vyrnforge-ui"
};
