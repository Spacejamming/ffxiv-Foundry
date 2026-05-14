# FFXIV VTT

A Foundry VTT module for recreating features from Final Fantasy XIV.

## Installation

Install the module in Foundry using the manifest URL:

`https://raw.githubusercontent.com/Spacejamming/ffxiv-Foundry/main/module.json`

## Features

### AoE (Area of Effect) Management

The module provides comprehensive AoE management tools for Dungeon Masters to create and manage area effects similar to Final Fantasy XIV.

#### DM Controls (Scene Controls Panel)

When enabled in a world, GMs will see additional tools in the **Measurement** control group with the following AoE tools:

- **Register AoE** (🎯): Convert a selected measured template into an active AoE
- **Select Tokens in AoE** (👆): Select all tokens currently inside the selected AoE
- **Toggle AoE Auras** (👁️): Show/hide glowing auras under tokens inside AoEs
- **Toggle AoE Visibility** (👁️‍🗨️): Show/hide the selected AoE template without deleting it

#### Settings

Configure the module behavior in the Module Settings:

- **Enable FFXIV effects**: Toggle all FFXIV-inspired visual effects
- **Display AoE token auras**: Show translucent glowing auras under tokens inside registered AoEs
- **AoE aura opacity**: Set the opacity for AoE token auras (0.1 - 1.0)
- **AoE aura color**: Set the color for AoE token auras (hex format)

#### Chat Integration

When a spell or item with AoE data is used in chat, GMs will see action buttons below the message:

- **Place AoE**: Register the currently selected template as an AoE for this spell
- **Select Tokens**: Select all tokens inside the AoE
- **Resolve AoE**: Select tokens and prepare for damage resolution (selection only for now)

## How to Use

### Basic AoE Workflow

1. **Create a Template**: Use Foundry's built-in template tools to create a Circle, Rectangle, Cone, or Ray template on the canvas

2. **Register as AoE**: Select the template, then click the "Register AoE" button in the **Measurement tools**

3. **Manage Tokens**: Use "Select Tokens" to automatically select all tokens inside the AoE

4. **Visual Effects**: Enable "Toggle AoE Auras" to show glowing auras under affected tokens

5. **Visibility Control**: Use "Toggle AoE Visibility" to hide/show AoEs without removing them

### Spell Integration (Planned)

Future updates will include automatic AoE creation from DnD5e spells with AoE effects. For now, manually create templates and register them as AoEs.

### Visual Effects

- Chat messages get a subtle golden glow animation
- Tokens inside active AoEs display translucent golden auras underneath them
- AoE templates can be hidden while maintaining their effects

## Compatibility

- **Foundry VTT**: v13.0+
- **DnD5e System**: v5.3.3+
- **Supported Template Types**: Circle, Rectangle, Cone, Ray

## Troubleshooting

- **No DM controls visible**: Ensure you're logged in as a GM and the module is enabled in world settings. The AoE tools appear in the Measurement control group.
- **Templates not registering**: Make sure you have a measured template selected before clicking "Register AoE"
- **Auras not showing**: Check that "Display AoE token auras" is enabled in module settings
- **Chat buttons missing**: Ensure the chat message contains DnD5e item data with AoE flags (future feature)


