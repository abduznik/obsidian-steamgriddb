import tseslint from 'typescript-eslint';
import obsidianmd from "eslint-plugin-obsidianmd";
import globals from "globals";
import { globalIgnores } from "eslint/config";
// @ts-expect-error: eslint-plugin-eslint-comments does not yet have types for flat config
import eslintComments from "eslint-plugin-eslint-comments";

export default tseslint.config(
	{
		plugins: {
			"eslint-comments": eslintComments,
			"@typescript-eslint": tseslint.plugin,
		},
		languageOptions: {
			globals: {
				...globals.browser,
			},
			parserOptions: {
				projectService: {
					allowDefaultProject: [
						'eslint.config.js',
						'manifest.json'
					]
				},
				tsconfigRootDir: import.meta.dirname,
				extraFileExtensions: ['.json']
			},
		},
		rules: {
			"eslint-comments/require-description": "error",
			"@typescript-eslint/no-empty-object-type": "error",
		},
	},
	...obsidianmd.configs.recommended,
    {
        files: ["package.json"],
        rules: {
            "depend/ban-dependencies": "off",
        },
    },
	globalIgnores([
		"node_modules",
		"dist",
		"esbuild.config.mjs",
		"eslint.config.js",
		"version-bump.mjs",
		"versions.json",
		"main.js",
        "styles.css"
	]),
);