import type { Loader, LoaderContext } from "astro/loaders";
import { z, getEntry } from "astro:content";
import { parse as parseYAML } from "yaml";
import * as fs from "node:fs/promises";
import { type ZodRawShape } from "astro/zod";
import { markdown } from "@astropub/md";
import { $entry, $lang } from "./multilang-store";

async function syncData(file: string, context: LoaderContext) {
  const content = await fs.readFile(
    `./content/${context.collection}/${file}`,
    "utf-8",
  );
  const yaml = parseYAML(
    content.match(/^\s*---[\r\n]+(?<frontmatter>[\s\S]*?)\r?\n---/).groups
      ?.frontmatter || "",
  );

  let section_ids: string[] = [];
  const sections = [
    ...content.matchAll(
      /----\s*(?<id>.*?)\s*----\r?\n(?:---\r?\n(?<properties>[\s\S]*?)\r?\n---\r?\n)?(?:---\s*en\s*---\r?\n(?<english>[\s\S]+?))?(?:\r?\n---\s*hu\s*---\r?\n(?<hungarian>[\s\S]+?))(?=\r?\n----|\r?\n*$)/g,
    ),
  ].map((match) => {
    const groups = match.groups!!;
    section_ids.push(groups.id);
    let yaml = parseYAML(groups.properties || "");
    return {
      id: groups.id,
      en: groups.english,
      hu: groups.hungarian,
      ...yaml,
    };
  });
  const id = yaml.id ?? file.replace(/\.md$/, "");
  const data = await context.parseData({
    id: id,
    data: {
      ...yaml,
      sections: sections,
    },
  });

  context.store.set({
    id: id,
    data,
    rendered: {
      html: "<strong>Beware of a multilingual attack!</strong>",
      metadata: { section_ids: section_ids },
    },
  });
}

export function multilangLoader(): Loader {
  return {
    name: "multilangLoader",
    load: async (context: LoaderContext) => {
      const files = (
        await fs.readdir(`./content/${context.collection}`)
      ).filter((file) => file.endsWith(".md"));
      await Promise.all(
        files.map(async (file) => {
          await syncData(file, context);

          context.watcher?.on("change", async (changedPath) => {
            if (changedPath === `./content/${context.collection}/${file}`) {
              context.logger.info(
                `Reloading ${file} from ${context.collection}...`,
              );
              await syncData(file, context);
            }
          });
        }),
      );
    },
  };
}

export function defineMultilangSchema(
  schema: ZodRawShape,
  section_schema?: ZodRawShape,
) {
  return z
    .object({
      id: z.string(),
      sections: z.array(
        z
          .object({
            id: z.string(),
            en: z.string(),
            hu: z.string(),
          })
          .extend(section_schema),
      ),
    })
    .extend(schema);
}

export const multilang_property = z.object({
  en: z.string(),
  hu: z.string(),
});

export async function setupMultilangPage(
  collection: string,
  entry_id: string,
  cookie: string,
  currentLocale: string,
) {
  $entry.set(await getEntry(collection, entry_id));
  setupMultilang(cookie, currentLocale);
}

export function setupMultilang(cookie: string, currentLocale: string) {
  $lang.set(cookie ?? currentLocale ?? "en");
}

export function getSection(id: string, render: boolean = false) {
  const content = $entry
    .get()
    .data?.sections.find((section) => section.id === id)?.[$lang.get()];
  return render ? markdown(content) : content;
}

export function getSectionData(id: string) {
  return $entry.get()?.data?.sections.find((section) => section.id === id);
}

export async function getLocaleUI(id: string) {
  return (await getEntry("locale", id))?.data?.[$lang.get()];
}

export function getLocalizedProperty(prop: any) {
  return prop[$lang.get()];
}
