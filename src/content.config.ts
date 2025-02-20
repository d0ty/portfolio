import { defineCollection, z, reference } from "astro:content";
import { file } from "astro/loaders";
import {
  multilangLoader,
  defineMultilangSchema,
  multilang_property,
} from "./multilang";

const pages = defineCollection({
  loader: multilangLoader(),
  schema: defineMultilangSchema({}),
});

const locale = defineCollection({
  loader: file("src/locales.json", {
    parser: (raw) => {
      return Object.entries(JSON.parse(raw)).map((item) => {
        return { id: item[0], ...item[1] };
      });
    },
  }),
  schema: z.object({
    id: z.string(),
    en: z.string(),
    hu: z.string(),
  }),
});

const projects = defineCollection({
  loader: multilangLoader(),
  schema: defineMultilangSchema({
    title: multilang_property,
    description: multilang_property,
    from: z.string().date(),
    until: z.date().optional(),
    featuredImage: z.string(),
  }),
});

export const collections = { pages, locale, projects };
