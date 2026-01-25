import { App, Modal } from "obsidian";
/**
 * Modal for selecting an image from a list of grid images.
 */
export class ImageSelectModal extends Modal {
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
		contentEl.createEl('h2', { text: 'Select an image' });

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

		contentEl.createDiv({ cls: 'steamgriddb-footer', text: 'Powered by SteamGridDB API' });
	}

	/**
	 * Cleans up the modal content on close.
	 */
	onClose() {
		const { contentEl } = this;
		contentEl.empty();
	}
}
