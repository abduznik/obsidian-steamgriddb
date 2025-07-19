"use strict";
var __defProp = Object.defineProperty;
var __getOwnPropDesc = Object.getOwnPropertyDescriptor;
var __getOwnPropNames = Object.getOwnPropertyNames;
var __hasOwnProp = Object.prototype.hasOwnProperty;
var __export = (target, all) => {
  for (var name in all)
    __defProp(target, name, { get: all[name], enumerable: true });
};
var __copyProps = (to, from, except, desc) => {
  if (from && typeof from === "object" || typeof from === "function") {
    for (let key of __getOwnPropNames(from))
      if (!__hasOwnProp.call(to, key) && key !== except)
        __defProp(to, key, { get: () => from[key], enumerable: !(desc = __getOwnPropDesc(from, key)) || desc.enumerable });
  }
  return to;
};
var __toCommonJS = (mod) => __copyProps(__defProp({}, "__esModule", { value: true }), mod);

// main.ts
var main_exports = {};
__export(main_exports, {
  default: () => SteamGridDBPlugin
});
module.exports = __toCommonJS(main_exports);
var import_obsidian = require("obsidian");
var DEFAULT_SETTINGS = {
  steamGridDBApiKey: ""
};
var SteamGridDBPlugin = class extends import_obsidian.Plugin {
  /**
   * Called when the plugin is loaded.
   * Initializes settings and registers commands.
   */
  async onload() {
    await this.loadSettings();
    this.addSettingTab(new SteamGridDBSettingTab(this.app, this));
    this.addCommand({
      id: "embed-steamgriddb-image-for-note",
      name: "Embed SteamGridDB Image for Current Note (Interactive)",
      callback: async () => {
        if (!this.settings.steamGridDBApiKey) {
          new import_obsidian.Notice("SteamGridDB API Key is not set. Please set it in the plugin settings.");
          return;
        }
        const file = this.app.workspace.getActiveFile();
        if (!file) {
          new import_obsidian.Notice("No active file");
          return;
        }
        const editor = this.app.workspace.getActiveViewOfType(import_obsidian.MarkdownView)?.editor;
        if (!editor) {
          new import_obsidian.Notice("No active editor");
          return;
        }
        const gameName = file.basename;
        const games = await this.fetchGames(gameName);
        if (games.length === 0) {
          new import_obsidian.Notice(`No games found for "${gameName}"`);
          return;
        }
        new GameSelectModal(this.app, games, async (selectedGame) => {
          if (!selectedGame) {
            new import_obsidian.Notice("No game selected.");
            return;
          }
          const images = await this.fetchGrids(selectedGame.id);
          if (images.length === 0) {
            new import_obsidian.Notice(`No images found for "${selectedGame.name}"`);
            return;
          }
          const imageUrls = images.map((image) => image.url);
          new ImageSelectModal(this.app, imageUrls, selectedGame.name, (selectedUrl) => {
            if (!selectedUrl) {
              new import_obsidian.Notice("No image selected.");
              return;
            }
            const imageMarkdown = `![${selectedGame.name} | 300](${selectedUrl})`;
            const lines = editor.getValue().split("\n");
            let insertionLine = -1;
            for (let i = 0; i < lines.length; i++) {
              if (lines[i].trim().startsWith(`# ${file.basename}`)) {
                insertionLine = i + 1;
                break;
              }
            }
            if (insertionLine !== -1) {
              editor.replaceRange(imageMarkdown + "\n", { line: insertionLine, ch: 0 });
              new import_obsidian.Notice(`Embedded image for "${selectedGame.name}"`);
            } else {
              new import_obsidian.Notice(`Could not find "# ${file.basename}" in the note to embed the image.`);
            }
          }).open();
        }).open();
      }
    });
    this.addCommand({
      id: "search-steamgriddb",
      name: "Search SteamGridDB",
      editorCallback: async (editor, view) => {
        if (!this.settings.steamGridDBApiKey) {
          new import_obsidian.Notice("SteamGridDB API Key is not set. Please set it in the plugin settings.");
          return;
        }
        const file = this.app.workspace.getActiveFile();
        if (!file) {
          new import_obsidian.Notice("No active file");
          return;
        }
        const gameName = file.basename;
        const games = await this.fetchGames(gameName);
        if (games.length === 0) {
          new import_obsidian.Notice(`No games found for "${gameName}"`);
          return;
        }
        const gameSelectModal = new GameSelectModal(this.app, games, async (selectedGame) => {
          if (!selectedGame) {
            new import_obsidian.Notice("No game selected.");
            return;
          }
          const images = await this.fetchGrids(selectedGame.id);
          if (images.length === 0) {
            new import_obsidian.Notice(`No images found for "${selectedGame.name}"`);
            return;
          }
          const imageUrls = images.map((image) => image.url);
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
  async fetchGames(gameName) {
    const url = `https://www.steamgriddb.com/api/v2/search/autocomplete/${encodeURIComponent(gameName)}`;
    const response = await (0, import_obsidian.request)({
      url,
      method: "GET",
      headers: {
        "Content-Type": "application/json",
        "Authorization": `Bearer ${this.settings.steamGridDBApiKey}`
        // API Key for authentication.
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
  async fetchGrids(gameId) {
    const url = `https://www.steamgriddb.com/api/v2/grids/game/${gameId}`;
    const response = await (0, import_obsidian.request)({
      url,
      method: "GET",
      headers: {
        "Content-Type": "application/json",
        "Authorization": `Bearer ${this.settings.steamGridDBApiKey}`
        // API Key for authentication.
      }
    });
    const data = JSON.parse(response);
    return data.data;
  }
};
var GameSelectModal = class extends import_obsidian.Modal {
  constructor(app, games, onSelect) {
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
    contentEl.createEl("h2", { text: "Select a Game" });
    const gameList = contentEl.createDiv({ cls: "game-list" });
    this.games.forEach((game) => {
      const gameItem = gameList.createEl("div", { cls: "game-list-item" });
      gameItem.setText(game.name);
      gameItem.onclick = () => {
        this.onSelect(game);
        this.close();
      };
    });
    const buttonContainer = contentEl.createDiv({ cls: "modal-button-container" });
    buttonContainer.createEl("button", { text: "Cancel" }).onclick = () => {
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
};
var ImageSelectModal = class extends import_obsidian.Modal {
  constructor(app, imageUrls, gameName, onSelect) {
    super(app);
    this.selectedImageUrl = null;
    this.imageUrls = imageUrls;
    this.onSelect = onSelect;
  }
  /**
   * Displays the image selection UI.
   */
  onOpen() {
    const { contentEl } = this;
    contentEl.empty();
    contentEl.createEl("h2", { text: "Select an Image" });
    const imageContainer = contentEl.createDiv({ cls: "image-grid" });
    imageContainer.style.display = "flex";
    imageContainer.style.flexWrap = "wrap";
    imageContainer.style.gap = "10px";
    imageContainer.style.maxHeight = "400px";
    imageContainer.style.overflowY = "auto";
    this.contentEl.appendChild(imageContainer);
    this.imageUrls.forEach((url) => {
      const imgWrapper = imageContainer.createDiv();
      imgWrapper.style.border = "2px solid transparent";
      imgWrapper.style.cursor = "pointer";
      imgWrapper.style.padding = "5px";
      const img = imgWrapper.createEl("img", { attr: { src: url } });
      img.style.maxWidth = "150px";
      img.style.maxHeight = "150px";
      img.style.objectFit = "contain";
      img.onclick = () => {
        if (this.selectedImageUrl) {
          const prevSelected = imageContainer.querySelector(`.image-grid-item[src="${this.selectedImageUrl}"]`);
          if (prevSelected) prevSelected.removeClass("selected");
        }
        this.selectedImageUrl = url;
        img.addClass("selected");
      };
    });
    const buttonContainer = contentEl.createDiv({ cls: "modal-button-container" });
    buttonContainer.createEl("button", { text: "Accept", cls: "mod-cta" }).onclick = () => {
      this.onSelect(this.selectedImageUrl);
      this.close();
    };
    buttonContainer.createEl("button", { text: "Cancel" }).onclick = () => {
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
};
var SteamGridDBSettingTab = class extends import_obsidian.PluginSettingTab {
  constructor(app, plugin) {
    super(app, plugin);
    this.plugin = plugin;
  }
  /**
   * Displays the settings UI.
   */
  display() {
    const { containerEl } = this;
    containerEl.empty();
    containerEl.createEl("h2", { text: "SteamGridDB Image Embedder Settings" });
    new import_obsidian.Setting(containerEl).setName("SteamGridDB API Key").setDesc("Enter your SteamGridDB API Key. Get one from steamgriddb.com/profile/preferences/api").addText((text) => text.setPlaceholder("Enter your API key").setValue(this.plugin.settings.steamGridDBApiKey).onChange(async (value) => {
      this.plugin.settings.steamGridDBApiKey = value;
      await this.plugin.saveSettings();
    }));
  }
};
