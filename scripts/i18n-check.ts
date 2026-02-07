import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

type Translations = Record<string, unknown>;

// === ESM __dirname Ersatz ===
const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// === Flatten nested keys ===
function flattenKeys(obj: Translations, prefix = ''): string[] {
  if (!obj || typeof obj !== 'object') return [];
  return Object.entries(obj).flatMap(([key, val]) => {
    const fullKey = prefix ? `${prefix}.${key}` : key;
    if (val && typeof val === 'object' && !Array.isArray(val)) {
      return flattenKeys(val as Translations, fullKey);
    }
    return [fullKey];
  });
}

// === Load translations from JSONs ===
const localesPath = path.resolve(__dirname, '../src/i18n/locales');
const translations: Record<string, string[]> = {};
fs.readdirSync(localesPath)
  .filter((f) => f.endsWith('.json'))
  .forEach((file) => {
    const lang = path.basename(file, '.json');
    const data = JSON.parse(fs.readFileSync(path.join(localesPath, file), 'utf-8'));
    translations[lang] = flattenKeys(data);
  });

// === Scan source files for t('…') or useTranslation().t('…') ===
const srcPath = path.resolve(__dirname, '../src');
const tsxFiles: string[] = [];

function collectFiles(dir: string) {
  for (const file of fs.readdirSync(dir)) {
    const full = path.join(dir, file);
    if (fs.statSync(full).isDirectory()) collectFiles(full);
    else if (file.endsWith('.ts') || file.endsWith('.tsx')) tsxFiles.push(full);
  }
}
collectFiles(srcPath);

const usedKeys = new Set<string>();
const keyRegex = /t\(\s*['"`]([\w\d.-]+)['"`]\s*\)/g;

tsxFiles.forEach((file) => {
  const content = fs.readFileSync(file, 'utf-8');
  let match;
  while ((match = keyRegex.exec(content)) !== null) {
    usedKeys.add(match[1]);
  }
});

// === Check missing keys per language ===
Object.entries(translations).forEach(([lang, keys]) => {
  const missing = [...usedKeys].filter((k) => !keys.includes(k));
  if (missing.length) {
    console.log(`\n❌ Missing translations in "${lang}":\n`, missing.join('\n'));
  } else {
    console.log(`✅ All translations present for "${lang}"`);
  }
});

// === Extra: warn about unused keys in JSONs ===
Object.entries(translations).forEach(([lang, keys]) => {
  const unused = keys.filter((k) => !usedKeys.has(k));
  if (unused.length) {
    console.log(`\n⚠️ Unused keys in "${lang}":\n`, unused.join('\n'));
  }
});
