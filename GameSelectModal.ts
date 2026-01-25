import { App, Modal } from "obsidian";
import { SteamGridDBGame } from "./types";

/**
 * Modal for selecting a game from a list of search results.
 */
 export class GameSelectModal extends Modal {
    games: SteamGridDBGame[];
    onSelect: (selectedGame: SteamGridDBGame | null) => void;

    constructor(app: App, games: SteamGridDBGame[], onSelect: (selectedGame: SteamGridDBGame | null) => void) {
        super(app);
        this.games = games;
        this.onSelect = onSelect;
    }

    onOpen() {
        const { contentEl } = this;
        contentEl.empty();
        contentEl.createEl('h2', { text: 'Select a game' });

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

        contentEl.createDiv({ cls: 'steamgriddb-footer', text: 'Powered by SteamGridDB API' });
    }

    onClose() {
        const { contentEl } = this;
        contentEl.empty();
    }
}
