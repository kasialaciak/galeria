import os
import re

path = 'src/actions/admin-homepage.ts'
with open(path, 'r', encoding='utf-8') as f:
    content = f.read()

import_zod = 'import { z } from "zod";'
if import_zod not in content:
    content = content.replace('import { revalidatePath } from "next/cache";', 'import { revalidatePath } from "next/cache";\nimport { z } from "zod";')

schema = """const promoSchema = z.object({
  titlePl: z.string().min(1, "Tytuł jest wymagany"),
  descriptionPl: z.string().min(1, "Opis jest wymagany"),
});"""
if 'const promoSchema' not in content:
    content = content.replace('export async function updatePromoSectionAction', schema + '\n\nexport async function updatePromoSectionAction')

action_body_old = """  const titlePl = formData.get("titlePl") as string;
  const descriptionPl = formData.get("descriptionPl") as string;"""

action_body_new = """  const rawData = {
    titlePl: formData.get("titlePl"),
    descriptionPl: formData.get("descriptionPl"),
  };

  const parsed = promoSchema.safeParse(rawData);
  if (!parsed.success) {
    return { success: false, error: "Nieprawidłowe dane formularza" };
  }

  const { titlePl, descriptionPl } = parsed.data;"""

content = content.replace(action_body_old, action_body_new)

with open(path, 'w', encoding='utf-8') as f:
    f.write(content)

print('Updated actions')