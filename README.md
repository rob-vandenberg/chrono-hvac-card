  
 <div align="center">

  [![](https://img.shields.io/badge/HACS-Custom-orange.svg?style=for-the-badge)](https://github.com/hacs/integration)
  [![](https://img.shields.io/badge/License-AGPL_3.0-blue.svg?style=for-the-badge)](https://www.gnu.org/licenses/agpl-3.0)
  [![](https://img.shields.io/github/v/release/rob-vandenberg/chrono-hvac-card?style=for-the-badge&color=brightgreen&label=Version)](https://github.com/rob-vandenberg/chrono-hvac-card/releases)

  <img src="art/header.svg" width="780" alt="Chrono HVAC Card Banner">

  <img src="art/banner.png" width="800" alt="Chrono HVAC Card in action">

  <p align="center">
    <strong>A thermostat card that looks and feels exactly like Home Assistant's own.<br>
            Every button shown or hidden, your way.<br>
            Set up entirely with a visual editor - no YAML needed.</strong>
  </p>

  <p align="center">
    <a href="#introduction">Introduction</a> •
    <a href="#key-features">Key Features</a> •
    <a href="#installation">Installation</a> •
    <a href="#usage">Usage</a> •
    <a href="#license">License</a>
  </p>

</div>

---

**Chrono HVAC Card** is a dashboard card for any `climate` entity. It looks like Home Assistant's built-in thermostat card, because it uses the same real dial component Home Assistant uses internally. On top of that, it adds mode, preset, fan, and swing buttons - and lets you show or hide any part of the card, right from the editor.

---

## 📋 Table of Contents

- [Introduction](#introduction)
- [Key Features](#key-features)
- [Installation](#installation)
  - [HACS (Recommended)](#hacs-recommended)
  - [Manual Installation](#manual-installation)
- [Uninstallation](#uninstallation)
- [Usage](#usage)
  - [Adding the Card](#adding-the-card)
  - [Options](#options)
  - [Custom Styling](#-custom-styling)
- [Limitations](#limitations)
- [License](#license)
- [Support](#support)

---

## 🚀 Key Features

### 🎯 Looks and Feels Native
The dial is Home Assistant's own dial component, not a copy. Dragging, stepping, colors, and dual heat/cool ranges all work exactly like the built-in thermostat card.

### 🧩 Capability-Aware Buttons
Mode, preset, fan, and swing buttons only show up if your entity actually supports them. Nothing empty, nothing broken.

### 🎛️ Full Visual Editor
Every setting - the entity, the name, and what's shown or hidden - can be changed from the card editor. No YAML required.

### 👁️ Show or Hide Anything
Turn off the border, the name, the more-info button, the humidity readout, or any of the four mode buttons. Build the exact card you want.

### 🎨 Custom CSS, From YAML
Every element on the card - the card itself, the header, the readouts, the dial, and the mode buttons - can be restyled directly from your dashboard config with a `styles:` block. A handful of built-in CSS variables also let you change one thing - like the spacing between mode buttons - and have it apply consistently, in a single edit. No editing the card's source, no browser dev tools required.

### 📐 Fits Any Dashboard
The card sizes itself to its own content. It works the same in masonry, sections, and panel views, with no layout code needed.

### 🎨 Matches Your Theme
Colors come from your Home Assistant theme automatically, the same way the native card does.

---

## 📦 Installation

### HACS (Recommended)

1. Open **HACS** in your Home Assistant instance.
2. Navigate to **Frontend** and click the three-dot menu in the top right corner.
3. Select **Custom repositories**.
4. Enter `https://github.com/rob-vandenberg/chrono-hvac-card` and select **Lovelace** as the category.
5. Click **Add**. The repository will appear in the list.
6. Search for `Chrono HVAC Card` and click **Download**.
7. Reload your browser.

### Manual Installation

1. Download `chrono-hvac-card.js` from the [latest release](https://github.com/rob-vandenberg/chrono-hvac-card/releases/latest).
2. Copy it to your Home Assistant `config/www/` folder.
3. In Home Assistant, go to **Settings → Dashboards → Resources**.
4. Click **Add Resource**.
5. Enter `/local/chrono-hvac-card.js` as the URL and select **JavaScript Module**.
6. Click **Create** and reload your browser.

---

## 🗑️ Uninstallation

### Via HACS
1. Open **HACS → Frontend**.
2. Find **Chrono HVAC Card** and click the three-dot menu.
3. Select **Remove**.
4. Reload your browser.

### Manual
1. Delete `chrono-hvac-card.js` from `config/www/`.
2. Remove the resource entry from **Settings → Dashboards → Resources**.
3. Remove any cards using `chrono-hvac-card` from your dashboards.

---

<img src="art/hvac-card.png" alt="Chrono HVAC Card showing a climate entity">

---

## ⚙️ Usage

### Adding the Card

1. Open a dashboard and click **Edit Dashboard**.
2. Click **Add Card**.
3. Search for **Chrono HVAC Card**.
4. Pick a `climate` entity from the dropdown.
5. Use the editor to show or hide whatever you want.

<img src="art/hvac-editor.png" alt="Chrono HVAC Card visual editor">

The editor only shows toggles that apply to your entity. For example, the Fan mode toggle only appears if your entity has fan modes.

If you'd rather write YAML directly, here's a full example:

```yaml
type: custom:chrono-hvac-card
entity: climate.living_room
name: Living Room
show_entity_name_fallback: true
show_current_temperature: true
show_current_humidity: true
show_more_info_button: false
show_mode_button: true
show_preset_button: true
show_fan_button: true
show_swing_button: true
show_border: true
```

### Options

| Key | Type | Default | What it does |
| :--- | :--- | :--- | :--- |
| `entity` | text | required | The `climate` entity to control. |
| `name` | text | (none) | A custom name to show in the header. Leave it out to use the entity's own name. |
| `show_entity_name_fallback` | `true`/`false` | `true` | If `true` and `name` is empty, shows the entity's friendly name instead. Set to `false` to hide the header entirely when no custom name is set. |
| `show_current_temperature` | `true`/`false` | `true` | Shows the current temperature reading, if the entity reports one. |
| `show_current_humidity` | `true`/`false` | `true` | Shows the current humidity reading, if the entity reports one. |
| `show_more_info_button` | `true`/`false` | `false` | Shows a button in the top-right corner that opens the entity's more-info dialog. |
| `show_mode_button` | `true`/`false` | `true` | Shows the HVAC mode button (heat, cool, auto, off, and so on). |
| `show_preset_button` | `true`/`false` | `true` | Shows the preset mode button, if the entity has presets. |
| `show_fan_button` | `true`/`false` | `true` | Shows the fan mode button, if the entity has fan modes. |
| `show_swing_button` | `true`/`false` | `true` | Shows the swing mode button, if the entity has swing modes. |
| `show_border` | `true`/`false` | `true` | Shows the card's outer border. Set to `false` for a borderless look. |
| `styles` | object | (none) | Advanced: restyle individual elements of the card directly from YAML. See [Custom Styling](#-custom-styling) below. |

Using a key that isn't in this list, or a value that isn't valid, won't break the card - it's just ignored.

### 🎨 Custom Styling

Every visual piece of the card can be restyled directly from your dashboard config, without touching the card's source or your browser's dev tools. Under `styles:`, each entry is a CSS class name paired with the CSS properties you want to change on it:

```yaml
type: custom:chrono-hvac-card
entity: climate.living_room
styles:
  ha-card:
    border: none
  readout-value:
    font-size: 28px
  mode-buttons:
    gap: 6px
```

The class names match exactly what you'd find inspecting the card with your browser's dev tools. A handful of the most useful ones: `ha-card`, `header`, `warning`, `readouts`, `readout`, `readout-label`, `readout-value`, `circle-slider`, `dial`, `mode-buttons`.

One key is special: `host` targets the card's own outer element (not a class) - use it to change things like the card's own margin or max-width.

```yaml
styles:
  host:
    max-width: 400px
```

The temperature and humidity readouts each have both a shared class and their own specific one - style `readout`, `readout-label`, or `readout-value` to change both readings at once, or `readout-temperature`/`readout-label-temperature`/`readout-value-temperature` (and the `-humidity` equivalents) to change just one.

There's no validation on `styles:` - any class name and any CSS property is accepted and applied exactly as written, even if it doesn't match anything on the card or doesn't make visual sense. This gives you full control, but also means a typo will silently do nothing rather than warn you.

#### Built-in CSS variables

A regular property override only affects the one class you targeted. On top of that, the card exposes its own set of CSS variables covering fonts, spacing, and colors across every part of the card, each with a sensible default. Set these the same way, under whichever class the table below lists for it, written with quotes since they start with `--`:

```yaml
styles:
  circle-slider:
    "--dial-padding": 4px
  mode-buttons:
    "--mode-buttons-gap": 20px
```

| Variable | Set it under | Default | What it changes |
| :--- | :--- | :--- | :--- |
| `--ha-font-family-body` | `host` | `inherit` | Font family used throughout the card. |
| `--ha-card-padding` | `ha-card` | `0 8px 16px 8px` | Padding inside the card's outer edge. |
| `--card-background-color` | `ha-card` | Your theme's card background color | Background color of the card. |
| `--primary-text-color` | `ha-card` | Your theme's primary text color | Text color used throughout the card. |
| `--ha-card-border-radius` | `ha-card` | `12px` | Corner rounding of the card. |
| `--header-text-align` | `header` | `left` | Alignment of the name text. |
| `--header-font-size` | `header` | `24px` | Font size of the name text. |
| `--header-font-weight` | `header` | `500` | Font weight of the name text. |
| `--ha-line-height-normal` | `header` | `1.2` | Line height of the name text. |
| `--header-padding` | `header` | `12px 8px 16px` | Padding around the name text. |
| `--error-color` | `warning` | Your theme's error color | Color of the "Entity not found" warning text. |
| `--warning-padding` | `warning` | `16px` | Padding around the "Entity not found" message. |
| `--readouts-padding` | `readouts` | `8px 16px 0 16px` | Padding around the temperature/humidity readouts row. |
| `--readouts-margin-top` | `readouts` | `6px` | Space above the readouts row. |
| `--readouts-margin-bottom` | `readouts` | `4px` | Space below the readouts row. |
| `--readout-label-opacity` | `readout-label` | `0.8` | Opacity of the readout labels. |
| `--ha-font-size-m` | `readout-label` | HA's own medium font-size token | Font size of the readout labels. |
| `--ha-line-height-condensed` | `readout-label` | HA's own condensed line-height token | Line height of the readout labels. |
| `--readout-label-letter-spacing` | `readout-label` | `0.4px` | Letter spacing of the readout labels. |
| `--readout-label-margin-bottom` | `readout-label` | `4px` | Space between a label and its value. |
| `--ha-font-size-xl` | `readout-value` | HA's own extra-large font-size token | Font size of the readout values. |
| `--ha-font-weight-medium` | `readout-value` | HA's own medium font-weight token | Font weight of the readout values. |
| `--ha-line-height-condensed` | `readout-value` | HA's own condensed line-height token | Line height of the readout values. |
| `--circle-slider-margin-top` | `circle-slider` | `25px` | Space above the dial. |
| `--circle-slider-margin-bottom` | `circle-slider` | `4px` | Space below the dial. |
| `--dial-padding` | `circle-slider` | `8px` | Padding between the dial and its surrounding box. |
| `--mode-button-min-width` | `mode-buttons` | `112px` | The narrowest a mode/preset/fan/swing button is allowed to shrink to. |
| `--mode-button-max-width` | `mode-buttons` | `140px` | The widest a single mode/preset/fan/swing button is allowed to grow to. |
| `--mode-buttons-gap` | `mode-buttons` | `12px` | Gap between mode/preset/fan/swing buttons. |
| `--mode-buttons-max-width` | `mode-buttons` | `316px` | The widest the whole button row is allowed to grow to. |
| `--mode-buttons-margin` | `mode-buttons` | `-2px -12px` | Outer margin of the button row. |
| `--mode-buttons-padding` | `mode-buttons` | `2px 12px 8px` | Padding inside the button row. |
| `--mode-buttons-margin-top` | `mode-buttons` | `9px` | Space above the button row. |

`--ha-line-height-condensed` is used by both `readout-label` and `readout-value`, but they're siblings, not nested inside each other - set it under both if you want it to apply to both readings, or under `readouts` to affect the whole row at once.

---

## ⚠️ Limitations

- Only entities from the `climate` domain are supported.
- One entity per card. Add another card for another entity.
- The dial's exact look follows your installed Home Assistant version, since it uses Home Assistant's own dial component directly. A very old Home Assistant version may not have that component available.
- Mode, preset, fan, and swing buttons are only shown if the entity itself reports supporting them. The card can't add capabilities an entity doesn't have.

---

## ⚖️ License

**GNU Affero General Public License v3.0 (AGPL-3.0)**

This project is licensed under the AGPL-3.0. You are free to use, modify, and distribute this software, provided that any modifications or derivative works that are made available — including over a network — are also distributed under the same license.

Full license text: [https://www.gnu.org/licenses/agpl-3.0](https://www.gnu.org/licenses/agpl-3.0)

Copyright © 2026 Rob Vandenberg. All rights reserved.

---

## ☕ Support

If you find this project useful and wish to support its continued development, please consider a contribution.

[![](https://img.shields.io/badge/Buy_Me_A_Coffee-Support-yellow.svg?style=for-the-badge)](https://www.buymeacoffee.com/robvandenberg)
