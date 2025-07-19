import { App, Editor, MarkdownView, Modal, Notice, Plugin, PluginSettingTab, Setting, request } from 'obsidian';
import './styles.css';
import SGDB from "steamgriddb";

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
	async onload() {
		await this.loadSettings();

				this.addSettingTab(new SteamGridDBSettingTab(this.app, this));

		        this.addCommand({
            id: 'embed-steamgriddb-image-for-note',
            name: 'Embed SteamGridDB Image for Current Note (Interactive)',
            callback: async () => {
                if (!this.settings.steamGridDBApiKey) {
                    new Notice('SteamGridDB API Key is not set. Please set it in the plugin settings.');
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
            name: 'Search SteamGridDB',
            editorCallback: async (editor: Editor, view: MarkdownView) => {
				if (!this.settings.steamGridDBApiKey) {
					new Notice('SteamGridDB API Key is not set. Please set it in the plugin settings.');
					return;
				}

				const file = this.app.workspace.getActiveFile();
				if (!file) {
					new Notice('No active file');
					return;
				}

				const gameName = file.basename;
				const games = await this.fetchGames(gameName);

				if (games.length === 0) {
					new Notice(`No games found for "${gameName}"`);
					return;
				}

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

	}

	/**
	 * Loads plugin settings from data.
	 */
	async loadSettings() {
		this.settings = Object.assign({}, DEFAULT_SETTINGS, await this.loadData());
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
	async fetchGames(gameName: string): Promise<any[]> {
		const url = `https://www.steamgriddb.com/api/v2/search/autocomplete/${encodeURIComponent(gameName)}`;
		const response = await request({
			url: url,
			method: 'GET',
			headers: {
				'Content-Type': 'application/json',
				'Authorization': `Bearer ${this.settings.steamGridDBApiKey}` // API Key for authentication.
			}
		});
		const data = JSON.parse(response);
		return data.data;
	}

	/**
	 * Fetches grid images for a given game ID from SteamGridDB API.
	 * @param gameId The ID of the game.
	 * @returns A promise that resolves to an array of image objects.
	 */
	async fetchGrids(gameId: number): Promise<any[]> {
		const url = `https://www.steamgriddb.com/api/v2/grids/game/${gameId}`;
		const response = await request({
			url: url,
			method: 'GET',
			headers: {
				'Content-Type': 'application/json',
				'Authorization': `Bearer ${this.settings.steamGridDBApiKey}` // API Key for authentication.
			}
		});
		const data = JSON.parse(response);
		return data.data;
	}
}

/**
 * Modal for selecting a game from a list of search results.
 */
class GameSelectModal extends Modal {
	games: any[];
	onSelect: (selectedGame: any | null) => void;

	constructor(app: App, games: any[], onSelect: (selectedGame: any | null) => void) {
		super(app);
		this.games = games;
		this.onSelect = onSelect;
	}

	/**
	 * Displays the game selection UI.
	 */
	onOpen() {
		const { contentEl } = this;
		contentEl.empty();
		contentEl.createEl('h2', { text: 'Select a Game' });

		const gameList = contentEl.createDiv({ cls: 'game-list' });
		this.games.forEach(game => {
			const gameItem = gameList.createEl('div', { cls: 'game-list-item' });
			gameItem.setText(game.name);
			gameItem.onclick = () => {
				this.onSelect(game);
				this.close();
			};
		});

		const buttonContainer = contentEl.createDiv({ cls: 'modal-button-container' });
		buttonContainer.createEl('button', { text: 'Cancel' }).onclick = () => {
			this.onSelect(null);
			this.close();
		};
	}

	/**
	 * Cleans up the modal content on close.
	 */
	onClose() {
		const { contentEl } = this;
		contentEl.empty();
	}
}

/**
 * Modal for selecting an image from a list of grid images.
 */
class ImageSelectModal extends Modal {
	imageUrls: string[];
	selectedImageUrl: string | null = null;
	onSelect: (selectedUrl: string | null) => void;
	gameName: string;

	constructor(app: App, imageUrls: string[], gameName: string, onSelect: (selectedUrl: string | null) => void) {
		super(app);
		this.imageUrls = imageUrls;
		this.onSelect = onSelect;
	}

	/**
	 * Displays the image selection UI.
	 */
	onOpen() {
		const { contentEl } = this;
		contentEl.empty();
		contentEl.createEl('h2', { text: 'Select an Image' });

		const imageContainer = contentEl.createDiv({ cls: 'image-grid' });
		this.contentEl.appendChild(imageContainer); // Explicitly append

		this.imageUrls.forEach(url => {
			const imgWrapper = imageContainer.createDiv({ cls: 'image-grid-item-wrapper' }); // Wrap image in a div

			const img = imgWrapper.createEl("img", { attr: { src: url }, cls: 'image-grid-item' });
			img.onclick = () => {
				if (this.selectedImageUrl) {
					const prevSelected = imageContainer.querySelector(`.image-grid-item[src="${this.selectedImageUrl}"]`);
					if (prevSelected) prevSelected.removeClass('selected');
				}
				this.selectedImageUrl = url;
				img.addClass('selected');
			};
		});

		const buttonContainer = contentEl.createDiv({ cls: 'modal-button-container' });
		buttonContainer.createEl('button', { text: 'Accept', cls: 'mod-cta' }).onclick = () => {
			this.onSelect(this.selectedImageUrl);
			this.close();
		};
		buttonContainer.createEl('button', { text: 'Cancel' }).onclick = () => {
			this.onSelect(null);
			this.close();
		};
	}

	/**
	 * Cleans up the modal content on close.
	 */
	onClose() {
		const { contentEl } = this;
		contentEl.empty();
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

		containerEl.createEl('h2', {text: 'SteamGridDB Image Embedder Settings'});

		new Setting(containerEl)
			.setName('SteamGridDB API Key')
			.setDesc('Enter your SteamGridDB API Key. Get one from steamgriddb.com/profile/preferences/api')
			.addText(text => text
				.setPlaceholder('Enter your API key')
				.setValue(this.plugin.settings.steamGridDBApiKey)
				.onChange(async (value) => {
					this.plugin.settings.steamGridDBApiKey = value;
					await this.plugin.saveSettings();
				}));
	}
}

