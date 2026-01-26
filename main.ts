import { App, Editor, MarkdownView, Notice, Plugin, PluginSettingTab, Setting, request } from 'obsidian';
import { GameSelectModal } from "./GameSelectModal";
import { ImageSelectModal } from "./ImageSelectModal";
import { SteamGridDBGame, SteamGridDBImage } from "./types";

import './styles.css';

interface SteamGridDBSettings {
	steamGridDBApiKey: string;
}

const DEFAULT_SETTINGS: SteamGridDBSettings = {
	steamGridDBApiKey: ''
}

/**
 * Main plugin class for SteamGridDB integration.
 */
export default class SteamGridDBPlugin extends Plugin {
	settings!: SteamGridDBSettings;

	/**
	 * Called when the plugin is loaded.
	 * Initializes settings and registers commands.
	 */
	// eslint-disable-next-line @typescript-eslint/no-misused-promises -- Obsidian's onload can be async, but doesn't await the returned promise.
	async onload() {
		await this.loadSettings();

				this.addSettingTab(new SteamGridDBSettingTab(this.app, this));

		        this.addCommand({
            id: 'embed-steamgriddb-image-for-note',
            name: 'Embed image for note',
            callback: async () => {
                if (!this.settings.steamGridDBApiKey) {
                    new Notice('API key is not set. Please set it in the plugin settings.');
                    return;
                }

                const file = this.app.workspace.getActiveFile();
                if (!file) {
                    new Notice('No active file');
                    return;
                }

                const editor = this.app.workspace.getActiveViewOfType(MarkdownView)?.editor;
                if (!editor) {
                    new Notice('No active editor');
                    return;
                }

                const gameName = file.basename;
                const games = await this.fetchGames(gameName);

                if (games.length === 0) {
                    new Notice(`No games found for "${gameName}"`);
                    return;
                }

                // eslint-disable-next-line @typescript-eslint/no-misused-promises -- Async callback is needed here to fetch images after selection.
                new GameSelectModal(this.app, games, async (selectedGame) => {
                    if (!selectedGame) {
                        new Notice('No game selected.');
                        return;
                    }

                    const images = await this.fetchGrids(selectedGame.id);

                    if (images.length === 0) {
                        new Notice(`No images found for "${selectedGame.name}"`);
                        return;
                    }

                    const imageUrls = images.map(image => image.url);
                    new ImageSelectModal(this.app, imageUrls, selectedGame.name, (selectedUrl) => {
                        if (!selectedUrl) {
                            new Notice('No image selected.');
                            return;
                        }

                        const imageMarkdown = `![${selectedGame.name} | 300](${selectedUrl})`;

                        const lines = editor.getValue().split('\n');
                        let insertionLine = -1;
                        for (let i = 0; i < lines.length; i++) {
                            if (lines[i].trim().startsWith(`# ${file.basename}`)) {
                                insertionLine = i + 1;
                                break;
                            }
                        }

                        if (insertionLine !== -1) {
                            editor.replaceRange(imageMarkdown + '\n', { line: insertionLine, ch: 0 });
                            new Notice(`Embedded image for "${selectedGame.name}"`);
                        } else {
                            new Notice(`Could not find "# ${file.basename}" in the note to embed the image.`);
                        }
                    }).open();
                }).open();
            }
        });

        this.addCommand({
            id: 'search-steamgriddb',
            name: 'Search for steamgriddb image',
            editorCallback: async (editor: Editor, _view: MarkdownView) => {
				if (!this.settings.steamGridDBApiKey) {
					new Notice('API key is not set. Please set it in the plugin settings.');
					return;
				}

				const file = this.app.workspace.getActiveFile();
				if (!file) {
					new Notice('No file is active');
					return;
				}

				const gameName = file.basename;
				const games = await this.fetchGames(gameName);

				if (games.length === 0) {
					new Notice(`No games found for "${gameName}"`);
					return;
				}

				// eslint-disable-next-line @typescript-eslint/no-misused-promises -- Async callback is needed here to fetch images after selection.
				const gameSelectModal = new GameSelectModal(this.app, games, async (selectedGame) => {
					if (!selectedGame) {
						new Notice('No game selected.');
						return;
					}

					const images = await this.fetchGrids(selectedGame.id);

					if (images.length === 0) {
						new Notice(`No images found for "${selectedGame.name}"`);
						return;
					}

					const imageUrls = images.map(image => image.url);
					const modal = new ImageSelectModal(this.app, imageUrls, selectedGame.name, (selectedUrl) => {
						if (selectedUrl) {
							editor.replaceSelection(`![${selectedGame.name}](${selectedUrl})`);
						}
					});
					modal.open();
				});
				gameSelectModal.open();
			}
		});
	}

	/**
	 * Called when the plugin is unloaded.
	 * Cleans up any resources.
	 */
	onunload() {
		// No specific cleanup required
	}

	/**
	 * Loads plugin settings from data.
	 */
	async loadSettings() {
		this.settings = Object.assign({}, DEFAULT_SETTINGS, await this.loadData() as Partial<SteamGridDBSettings>);
	}

	/**
	 * Saves plugin settings to data.
	 */
	async saveSettings() {
		await this.saveData(this.settings);
	}

		/**
	 * Fetches games from SteamGridDB API based on a search query.
	 * @param gameName The name of the game to search for.
	 * @returns A promise that resolves to an array of game objects.
	 */
	async fetchGames(gameName: string): Promise<SteamGridDBGame[]> {
		const url = `https://www.steamgriddb.com/api/v2/search/autocomplete/${encodeURIComponent(gameName)}`;
		const response = await request({
			url: url,
			method: 'GET',
			headers: {
				'Content-Type': 'application/json',
				                'Authorization': `Bearer ${this.settings.steamGridDBApiKey}` // API Key for authentication.
				            }
				        });
				        const data = JSON.parse(response) as { data: SteamGridDBGame[] };
				        return data.data;
				    }
				
				    /**
				     * Fetches grid images for a given game ID from SteamGridDB API.
				     * @param gameId The ID of the game.
				     * @returns A promise that resolves to an array of image objects.
				     */
				    async fetchGrids(gameId: number): Promise<SteamGridDBImage[]> {
				        const url = `https://www.steamgriddb.com/api/v2/grids/game/${gameId}`;
				        const response = await request({
				            url: url,
				            method: 'GET',
				            headers: {
				                'Content-Type': 'application/json',
				                'Authorization': `Bearer ${this.settings.steamGridDBApiKey}` // API Key for authentication.
				            }
				        });
				        const data = JSON.parse(response) as { data: SteamGridDBImage[] };
				        return data.data;
				    }
				}
/**
 * Settings tab for the SteamGridDB plugin.
 * Allows users to configure their API key.
 */
class SteamGridDBSettingTab extends PluginSettingTab {
	plugin: SteamGridDBPlugin;

	constructor(app: App, plugin: SteamGridDBPlugin) {
		super(app, plugin);
		this.plugin = plugin;
	}

	/**
	 * Displays the settings UI.
	 */
	display(): void {
		const {containerEl} = this;

		containerEl.empty();

		new Setting(containerEl)
			.setName('Steamgriddb API key')
			.setDesc('Enter your SteamGridDB API key. Get one from steamgriddb.com/profile/preferences/api')
			.addText(text => text
				.setPlaceholder('Enter your API key')
				.setValue(this.plugin.settings.steamGridDBApiKey)
				.onChange(async (value) => {
					this.plugin.settings.steamGridDBApiKey = value;
					await this.plugin.saveSettings();
				}));
	}
}