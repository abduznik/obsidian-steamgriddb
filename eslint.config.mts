import tseslint from 'typescript-eslint';
import obsidianmd from "eslint-plugin-obsidianmd";
import globals from "globals";
import { globalIgnores } from "eslint/config";

export default tseslint.config(
	{
		plugins: {
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