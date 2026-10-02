import type {
  ReferenceDocumentRenderer,
  ReferenceDocumentType,
} from "../../../docs/reference/referenceRuntime";
import { referenceModel } from "./docsContext";
import { publicDocumentMarkdownById } from "./generatedDocumentSources";

export type DocsRouteKind = ReferenceDocumentRenderer;

export type DocsRoute = {
  id: string;
  path: string;
  title: string;
  group: string;
  category: string;
  documentType: ReferenceDocumentType;
  description: string;
  sourcePath: string;
  tags: string[];
  kind: DocsRouteKind;
  content?: string;
  exampleId?: string;
};

export type PublicDocsSection = {
  id: string;
  label: string;
  routeIds: string[];
};

const categoryById = new Map(
  referenceModel.documentRegistry.categories.map((category) => [
    category.id,
    category,
  ]),
);

export const docsRoutes: DocsRoute[] =
  referenceModel.documentRegistry.documents.map((document) => {
    const category = categoryById.get(document.category);
    if (!category) {
      throw new Error(
        `Missing VyrnForge Docs category ${document.category} for ${document.id}.`,
      );
    }

    const content =
      document.renderer === "markdown"
        ? publicDocumentMarkdownById[document.id]
        : undefined;
    if (document.renderer === "markdown" && content === undefined) {
      throw new Error(
        `Missing generated Markdown source binding for ${document.id}.`,
      );
    }

    return {
      id: document.id,
      path: document.path,
      title: document.title,
      group: category.label,
      category: category.id,
      documentType: document.type,
      description: document.description,
      sourcePath: document.sourcePath,
      tags: [...document.tags],
      kind: document.renderer,
      content,
      exampleId: document.exampleId ?? undefined,
    };
  });

export const publicDocsSections: PublicDocsSection[] =
  referenceModel.documentRegistry.categories.map((category) => ({
    id: category.id,
    label: category.label,
    routeIds: docsRoutes
      .filter((route) => route.category === category.id)
      .map((route) => route.id),
  }));

export function getRouteById(id: string) {
  return (
    docsRoutes.find((route) => route.id === id) ??
    docsRoutes.find((route) => route.id === "overview") ??
    docsRoutes[0]
  );
}

export function getRouteByPath(pathname: string) {
  return docsRoutes.find((route) => route.path === pathname);
}
