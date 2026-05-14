# Private Repository and Manifest Setup

This module can be stored in a private Git repository, but Foundry needs an HTTP(S)-accessible manifest URL to install and update it.

## Recommended workflow

1. Create a private repository on GitHub, GitLab, Bitbucket, or your own server.
2. Initialize the local folder as a git repository once Git is available on your machine:
   ```powershell
   git init
   git add .
   git commit -m "Initial FFXIV VTT module scaffold"
   git remote add origin https://github.com/Spacejamming/ffxiv-Foundry.git
   git push -u origin main
   ```
3. Host the manifest `module.json` somewhere Foundry can reach.
   - For GitHub, the manifest URL is typically:
     `https://raw.githubusercontent.com/Spacejamming/ffxiv-Foundry/main/module.json`
   - Foundry does not support authenticated manifest downloads out of the box.

## Hosting options

- Publicly accessible web server or file host under your control.
- GitHub Pages / GitLab Pages for a separate public manifest site.
- A private server with a URL like `https://yourserver.example.com/ffxiv-vtt/module.json`.

## Manifest URL configuration

In Foundry, use a manifest URL that points directly to the module manifest JSON file.

Example:

- Manifest URL: `https://yourserver.example.com/ffxiv-vtt/module.json`
- Download URL inside the manifest: `https://yourserver.example.com/ffxiv-vtt/ffxiv-vtt.zip`

Your `module.json` already has these fields:

```json
"manifest": "https://github.com/yourname/ffxiv-vtt",
"download": "https://github.com/yourname/ffxiv-vtt/releases/latest/download/ffxiv-vtt.zip"
```

Update them to the actual hosted manifest and zip download URLs after you publish.

## Packaging the module for distribution

Foundry modules are often distributed as zip packages. The package should contain the module folder contents at the top level.

Example package structure in `ffxiv-vtt.zip`:

- `module.json`
- `package.json`
- `README.md`
- `scripts/module.js`
- `styles/module.css`

## Notes for private hosting

- If the manifest file is behind authentication, Foundry will not be able to fetch it automatically.
- For private use, a private repo plus a separate public manifest host is the most reliable method.
- You can still install the module manually by copying the folder into Foundry's `Data/modules/ffxiv-vtt` directory.
