# Obsidian SteamGridDB Plugin

This Obsidian plugin allows you to easily search for game images on [SteamGridDB](https://www.steamgriddb.com/) and embed them directly into your notes. It supports interactive selection of both the game and the specific image you want to use.

## Features

*   **Search SteamGridDB:** Find game images by name.
*   **Interactive Selection:** Choose the correct game from search results and then select your preferred image from a list of available grids.
*   **Direct Embedding:** Embed the selected image into your active Obsidian note.
*   **Templater Integration:** Automate image embedding when creating notes from templates.

## How to Use

### 1. Get Your SteamGridDB API Key

Before using the plugin, you need to obtain an API key from SteamGridDB:
1.  Go to [SteamGridDB Profile Preferences](https://www.steamgriddb.com/profile/preferences/api).
2.  Generate and copy your API key.
3.  In Obsidian, go to **Settings** -> **Community Plugins** -> **SteamGridDB Plugin** (or similar name) and paste your API key into the "SteamGridDB API Key" field.

### 2. Using the "Search SteamGridDB" Command

This command is ideal for manually searching and embedding images into any note.

1.  Open the note where you want to embed an image.
2.  Open the Obsidian Command Palette (`Ctrl/Cmd + P`).
3.  Type "SteamGridDB" and select the command **"Search SteamGridDB"**.
4.  A modal will appear, pre-filled with the current note's title. This is used as the search term for SteamGridDB.
5.  Another modal will show a list of games matching your search. Select the correct game.
6.  A final modal will display available images for the selected game. Choose the image you want to embed.
7.  The selected image will be embedded into your note at the current cursor position.

### 3. Using with Templater (Automated Embedding)

This method allows you to automatically trigger the image embedding process when creating a new note from a template.

1.  **Ensure the plugin is installed and configured with your API key.**
2.  **Edit your Templater template file** (e.g., `Gaming Backlog Template.md`).
3.  Add the following line in your template where you want the image to be embedded (e.g., after your note title):

    ```javascript
    <%*
    // ... existing template code ...

    // Call the interactive command to embed SteamGridDB image
    await app.commands.executeCommandById('obsidian-steamgriddb:embed-steamgriddb-image-for-note');

    // ... rest of your template code ...
    %>
    ```

    **Example `Gaming Backlog Template.md` snippet:**

    ```markdown
    <%*
    const title = tp.file.title;
    tR += `---
Platform: PC
Status: Not Playing
Finished: 
```
---

# ${title}

`;
    // This command will trigger the interactive game and image selection
    await app.commands.executeCommandById('obsidian-steamgriddb:embed-steamgriddb-image-for-note');
    tR += `
    ## Notes:
    -
    `;
    %>
    ```

4.  When you create a new note using this template, the interactive modals for game and image selection will appear, and the chosen image will be embedded.

## Installation

### Minimum Requirements

*   Obsidian v0.15.0 or higher.
*   A SteamGridDB API Key.
*   Node.js and npm (if building from source).

### Method 1: Manual Installation

1.  Download `main.js` and `manifest.json` from the plugin's GitHub releases page (or from the plugin directory if you have access).
2.  Navigate to your Obsidian vault's plugins folder: `YourVault/.obsidian/plugins/`.
3.  Create a new folder named `obsidian-steamgriddb`.
4.  Place `main.js` and `manifest.json` inside the `obsidian-steamgriddb` folder.
5.  In Obsidian, go to **Settings** -> **Community Plugins**, and enable "SteamGridDB Plugin".

### Method 2: From Source (for Developers)

1.  **Clone the repository:**
    ```bash
    git clone https://github.com/your-repo/obsidian-steamgriddb.git
    ```
    (Replace `https://github.com/your-repo/obsidian-steamgriddb.git` with the actual repository URL if available.)
2.  **Navigate into the plugin directory:**
    ```bash
    cd obsidian-steamgriddb
    ```
3.  **Install dependencies:**
    ```bash
    npm install
    ```
4.  **Build the plugin:**
    ```bash
    npm run build
    ```
    This will compile `main.ts` into `main.js`.
5.  Copy the `obsidian-steamgriddb` folder (containing `main.js` and `manifest.json`) into your Obsidian vault's plugins folder: `YourVault/.obsidian/plugins/`.
6.  In Obsidian, go to **Settings** -> **Community Plugins**, and enable "SteamGridDB Plugin".