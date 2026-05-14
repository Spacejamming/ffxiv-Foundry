## FFXIV VTT AoE Feature Plan

### Goals
- Add a DM-facing AoE manager for Foundry VTT 13.
- Support existing template shapes: Circle, Cone, Ray, Rectangle.
- Render AoEs as translucent glowing overlays on the map.
- Provide DM controls to show/hide AoEs without removing them.
- Allow the DM to select all tokens within an active AoE.
- Optionally display a glowing aura below tokens inside the AoE.

### Implementation Steps

1. Add a new manager file `scripts/aoe-manager.js`.
   - Track active AoEs and their metadata.
   - Compute token containment using template geometry.
   - Provide methods to show, hide, and toggle aura display.

2. Extend module initialization in `scripts/module.js`.
   - Import and initialize the AoE manager.
   - Register DM-only settings for AoE display:
     - `displayAoEauras` boolean
     - `aoeAuraOpacity` number
     - `aoeAuraColor` string
     - `aoeVisibilityDefault` boolean

3. Add a GM control button group.
   - Use `Hooks.on("getSceneControlButtons", ...)`.
   - Add an `FFXIV VTT AoE` control group visible only to GMs.
   - Include actions:
     - Create AoE from selected template
     - Show/hide AoE
     - Select tokens in AoE

4. Use Foundry template geometry for shape matching.
   - Respect `Circle`, `Cone`, `Ray`, and `Rectangle` template types.
   - Use template position, direction, width, and distance.
   - Determine token inclusion using token center or occupied area.

5. Render token auras.
   - Add CSS classes in `styles/module.css`.
   - Render translucent glowing sprites or overlays below contained tokens.
   - Support toggling aura visibility separately from the template.

6. Add selection actions.
   - Provide a DM button for "Select tokens in AoE".
   - Select all tokens that intersect the active AoE.
   - Optionally support group-selection behavior.

7. Ensure compatibility with Foundry V13 and DnD5e 5.3.3.
   - Use V13 API patterns: `CanvasTemplate`, `canvas.templates`, `canvas.tokens.placeables`, `game.scenes`.
   - Avoid deprecated V10/V11 APIs.

### Verification
- Confirm the DM control group appears in the scene controls.
- Create Circle, Rectangle, Cone, and Ray AoEs.
- Verify AoE geometry matches the template shape.
- Enable token auras and place tokens inside/outside the AoE.
- Use the select action to verify only tokens inside the AoE are selected.
- Confirm show/hide toggles work without removing the template.

### Priority
- Start with Circle and Rectangle support.
- Add Cone and Ray once the base template behavior is working.
- Add the aura overlay and selection actions last.
