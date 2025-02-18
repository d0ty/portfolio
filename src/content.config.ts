import { defineCollection, z } from "astro:content";
import { multilangLoader, defineMultilangSchema } from "./multilang";

const pages = defineCollection({
  loader: multilangLoader(),
  schema: defineMultilangSchema({}),
});

export const collections = { pages };
