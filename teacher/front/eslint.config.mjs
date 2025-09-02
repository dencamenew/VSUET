import { dirname } from "path";
import { fileURLToPath } from "url";
import { FlatCompat } from "@eslint/eslintrc";

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

const compat = new FlatCompat({
  baseDirectory: __dirname,
});

const eslintConfig = [
  ...compat.extends("next/core-web-vitals", "next/typescript"),
  {
    ignores: [
      "node_modules/**",
      ".next/**",
      "out/**",
      "build/**",
      "next-env.d.ts",
    ],
  },
  {
    // Добавьте этот блок для настройки правил
    rules: {
      "@typescript-eslint/no-empty-object-type": "off", // отключаем правило о пустых интерфейсах
      "@typescript-eslint/no-unused-vars": "warn",      // предупреждение вместо ошибки для неиспользуемых переменных
      "@typescript-eslint/no-unused-expressions": "warn",
      "react-hooks/exhaustive-deps": "warn"
    }
  }
];

export default eslintConfig;