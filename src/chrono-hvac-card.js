import { LitElement, html, svg, css } from 'https://unpkg.com/lit@2.0.0/index.js?module';
import { live } from 'https://unpkg.com/lit@2.0.0/directives/live.js?module';

// ─── Card Version ─────────────────────────────────────────────────────────────
const CARD_VERSION = '1.5.66';

// ─── Card Version History ─────────────────────────────────────────────────────
// v1.5.66: Condensed version history comments.
// v1.5.65: Made card behave nicely inside UI editor.
// v1.5.64: Fixed .circle-slider stretching to fill leftover vertical
//          space in taller containers - removed leftover flex:1.
// v1.5.63: [User-tuned] Mode-buttons row spacing (max-width/margin/padding)
//          via negative-margin bleed technique, mirroring HA's own row.
// v1.5.62: [User-measured] Fixed button-gap bug: lowered mode-buttons
//          max-width 320->294px so clamp() cap matches track width
//          instead of absorbing gap changes as invisible overhang.
// v1.5.61: [User-measured] Pixel-level spacing correction of readouts/
//          circle-slider/mode-buttons margins vs. HA's native dialog.
// v1.5.60: [User-directed] Recalibrated spacing after v1.5.59 restructure
//          to reproduce v1.4.58's exact gaps; added ha-card padding.
// v1.5.59: [User-directed] Flattened DOM: removed .hvac-content/.controls
//          wrappers, header/readouts/circle-slider/mode-buttons now
//          direct children of ha-card, each owning its own margin-top.
// v1.4.58: [User-directed] Implemented styles: config mechanism (ported
//          from chrono-slider-card) via adoptedStyleSheets.
// v1.4.57: [User-directed] Renamed .card-content -> .hvac-content to stop
//          HA's automatic padding injection; added explicit flat padding.
// v1.4.56: [User-directed] Editor's "Show card border" toggle now shows
//          checked when show_border is true OR undefined, not just true.
// v1.4.55: [User-directed] show_border removed from DEFAULT_CONFIG
//          (true/undefined/false now meaningful); added getStubConfig(hass).
// v1.4.54: [User-directed] Added default 8px top/bottom margin to .controls.
// v1.4.53: [User-directed] Converted cosmetic/spacing/sizing CSS values to
//          var(--name, default) (styles: support, step 2).
// v1.4.52: [User-directed] DOM/classname pass for styles: support (step 1)
//          - renamed .container->.dial-container, .current->.readouts.
// v1.3.51: [User-directed] Fixed mode-buttons sizing to track instead of
//          content: explicit width:clamp(112px,100%,140px).
// v1.3.50: [User-directed] Fixed mode-buttons grid not shrinking:
//          minmax(112px,140px)->minmax(112px,1fr) so columns actually shrink.
// v1.3.49: [User-directed] Replaced per-item-count CSS with one universal
//          rule: repeat(auto-fit, minmax(112px,140px)), max-width:320px.
// v1.3.48: [User-measured] Made 4-button case shrinkable: flex:1 1 140px,
//          min-width:112px, max-width:140px.
// v1.3.47: [User-measured] Removed .mode-buttons' own padding - was
//          stacking with ha-card's automatic padding, causing 1-col collapse.
// v1.3.46: Restructured mode-buttons row as direct child of column-flex
//          .controls (was nested row-in-row, causing a flexbox collapse bug).
// v1.3.45: Fixed mode/fan/swing buttons unreachable on mobile: added
//          min-width:0 to button row, removed flex-wrap media-query gate.
// v1.2.44: Removed .card-content's negative-margin workaround (rule: no
//          negative margins going forward); compensated via padding-top.
// v1.2.43: Added show_border config option (default true) with editor toggle.
// v1.2.42: [User-measured] .current padding-top 12->20px, margin-bottom
//          26->18px (net unchanged) - shifts block down 8px.
// v1.2.41: [User-measured] Removed .ch-controls-container's own bottom
//          padding/margin - was doubling with ha-card's automatic padding.
// v1.2.40: Removed height:100% from .card-content (circular now that
//          getGridOptions() no longer forces ha-card's height).
// v1.2.39: Deleted getGridOptions() entirely - project rule: card must be
//          container-agnostic. Also fixes an edit-mode clipping bug.
// v1.2.38: ha-card gets height/width:100% (fixes edit-mode overflow);
//          .content->.card-content; readouts match more-info-climate.ts;
//          .container/.ch-controls-container wrapped in shared .controls.
// v1.2.37: .readouts padding-top 0->12px; fixed .more-info nesting
//          regression from v1.2.33.
// v1.2.36: [User-measured] .container margin-bottom 14->16px,
//          .ch-controls-container margin-bottom 6->4px (net-zero swap).
// v1.2.35: [User-measured] .readouts margin-bottom 40->26px, .container
//          margin-bottom 0->14px, .ch-controls-container 0->6px.
// v1.2.34: Added margin-bottom: var(--ha-space-10) to .readouts, matching
//          more-info-climate.ts.
// v1.2.33: Fixed title alignment: ha-card back to plain block, flex/
//          align-items moved to new .content wrapper.
// v1.2.32: Restored title to ha-card's built-in .header property, matching
//          verified ha-card.ts source.
// v1.2.31: Fixed ResizeObserver to match hui-thermostat-card.ts exactly:
//          observes host itself, re-queries .container fresh each callback.
// v1.2.30: Restored max-width dial-capping using native ResizeObserver
//          (replacing CORS-blocked @lit-labs/observers).
// v1.2.29: Fixed fatal load failure: @lit-labs/observers isn't served with
//          CORS headers by unpkg; removed the import/ResizeController.
// v1.2.28: Replaced hand-built arc/drag/color logic with the real
//          <ha-state-control-climate-temperature> element directly,
//          matching hui-thermostat-card.ts. Removed all dead dial code.
// v1.2.27: Ported the real ResizeController mechanism (@lit-labs/observers)
//          - measures .container height, applies as max-width on dial.
// v1.2.26: Fixed dial sizing: native uses two nested elements (.container +
//          a separate 320px-default inner control), not one; restructured.
// v1.2.25: Fixed v1.2.24 regression: replaced aspect-ratio+flex:1 with the
//          literal padding-top:100% technique from hui-thermostat-card.ts.
// v1.2.24: Major rework separating dashboard-card infrastructure (from
//          hui-thermostat-card.ts) from dialog-content styling
//          (more-info-climate.ts): title, sizing, getGridOptions,
//          touch-only dot interaction, responsive breakpoints, action glow.
// v1.1.23: Off-state now hides the arc fill (was showing a duplicate grey
//          ring); added full keyboard accessibility ported from source.
// v1.1.22: Readouts block moved up 8px without affecting dial position.
// v1.1.21: Unavailable-state handling now a verified port; added
//          .disabled binding to Mode/Preset/Fan/Swing rows.
// v1.1.20: chStateActive() rewritten as verified port of state_active.ts,
//          scoped to the climate domain.
// v1.1.19: Full source-review fix pass against
//          ha-state-control-climate-temperature.ts: active-aware dual-mode
//          colors, unit-based step fallback, debounced step buttons,
//          colored dual-mode outline, unavailable handling, tap-to-select.
// v1.0.18: Fixed +/- buttons triggering spurious arc drag: interaction now
//          attached only to an invisible path tracing the ring, not the
//          whole wrapper div.
// v1.0.17: show_more_info_button default changed true->false.
// v1.0.16: Fixed real-time updates: hass setter now calls requestUpdate().
// v1.0.15: Card border-radius 28->12px; dial center label moved up 16px;
//          feature buttons moved down 8px; fixed target-dot border color.
// v0.0.14: Fixed title: now uses ha-card's built-in header property
//          (real h1.card-header) instead of a hand-built element.
// v0.0.13: Fixed .title and .readout-label/.readout-value font properties
//          to match native source exactly.
// v0.0.12: Added font-family to :host; dial center number now shows
//          correct decimal (e.g. "21,0") via formatOptions.
// v0.0.11: Full dial rewrite against verified HA source: real arc
//          geometry, target dot technique, current-temp marker, real
//          color-variable chain, ha-big-number/ha-outlined-icon-button.
// v0.0.10: Fixed .header justify-content so more-info button stays
//          pinned top-right when name is hidden; fixed toggle alignment.
// v0.0.9: Added show_more_info_button config key; header row omitted
//         entirely when both name and button are hidden.
// v0.0.8: Preset/Fan/Swing icons now use HA's real icon resolution
//         instead of a generic dot fallback.
// v0.0.7: Added show_entity_name_fallback config key; combined Name
//         field + toggle into one editor row.
// v0.0.6: Editor now only shows toggles for capabilities the entity
//         actually supports; renamed show_*_row -> show_*_button.
// v0.0.5: Rebuilt Mode/Preset/Fan/Swing rows against more-info-climate.ts
//         source (not the card-feature system) - fixed row width.
// v0.0.4: Replaced hand-built button with HA's real
//         <ha-control-select-menu> component.
// v0.0.3: Added 28px border-radius to ha-card; reduced feature-picker
//         button padding/gap/font size.
// v0.0.2: Replaced segmented toggle group with single feature-picker
//         button + dropdown; rows now in 2-column grid.
// v0.0.1: Initial release: dial with drag-to-set, readouts,
//         capability-detected Mode/Preset/Fan/Swing rows, visual editor.

const CH_HVAC_MODE_LABELS = {
  off:       'Off',
  heat:      'Heat',
  cool:      'Cool',
  heat_cool: 'Heat/Cool',
  auto:      'Auto',
  dry:       'Dry',
  fan_only:  'Fan only',
};

// Verified from HA source (src/data/climate.ts: CLIMATE_HVAC_MODE_ICONS / climateHvacModeIcon)
const CH_HVAC_MODE_ICONS = {
  cool:      'mdi:snowflake',
  dry:       'mdi:water-percent',
  fan_only:  'mdi:fan',
  auto:      'mdi:thermostat-auto',
  heat:      'mdi:fire',
  off:       'mdi:power',
  heat_cool: 'mdi:sun-snowflake-variant',
};
const CH_HVAC_MODE_ICON_FALLBACK = 'mdi:thermostat';
function chHvacModeIcon(mode) {
  return CH_HVAC_MODE_ICONS[mode] || CH_HVAC_MODE_ICON_FALLBACK;
}

// Verified from HA source (src/data/climate.ts: HVAC_MODES / compareClimateHvacModes)
const CH_HVAC_MODES_ORDER = ['auto', 'heat_cool', 'heat', 'cool', 'dry', 'fan_only', 'off'];
function chCompareHvacModes(a, b) {
  return CH_HVAC_MODES_ORDER.indexOf(a) - CH_HVAC_MODES_ORDER.indexOf(b);
}

// ─── Attribute icon resolution ─────────────────────────────────────────────────
// Ported directly from HA source (src/data/icons.ts: attributeIcon,
// getIconFromTranslations, getIconFromRange) — this is the exact mechanism
// ha-attribute-icon uses for Preset/Fan/Swing mode icons. Uses hass.callWS in
// place of the internal callWS util, and hass.config.components as a simplified
// stand-in for the source's isComponentLoaded/atLeastVersion gate.
const _chPlatformIconsCache = {};   // platform -> Promise<PlatformIcons|undefined>
const _chComponentIconsCache = {};  // domain -> Promise<ComponentIcons|undefined>

function chGetIconFromRange(value, range) {
  const keys = Object.keys(range).map(Number).filter((k) => !isNaN(k)).sort((a, b) => a - b);
  if (!keys.length || value < keys[0]) return undefined;
  let selected = keys[0];
  for (const k of keys) {
    if (value >= k) selected = k; else break;
  }
  return range[String(selected)];
}

function chGetIconFromTranslations(state, translations) {
  if (!translations) return undefined;
  if (state !== undefined && state !== null && translations.state?.[state]) {
    return translations.state[state];
  }
  if (state !== undefined && translations.range && !isNaN(Number(state))) {
    return chGetIconFromRange(Number(state), translations.range) ?? translations.default;
  }
  return translations.default;
}

async function chGetPlatformIcons(hass, platform) {
  if (platform in _chPlatformIconsCache) return _chPlatformIconsCache[platform];
  if (!hass.config?.components?.includes(platform)) return undefined;
  const p = hass.callWS({ type: 'frontend/get_icons', category: 'entity', integration: platform })
    .then((res) => res?.resources?.[platform])
    .catch(() => undefined);
  _chPlatformIconsCache[platform] = p;
  return p;
}

async function chGetComponentIcons(hass, domain) {
  if (domain in _chComponentIconsCache) return _chComponentIconsCache[domain];
  if (!hass.config?.components?.includes(domain)) return undefined;
  const p = hass.callWS({ type: 'frontend/get_icons', category: 'entity_component' })
    .then((res) => res?.resources?.[domain])
    .catch(() => undefined);
  _chComponentIconsCache[domain] = p;
  return p;
}

async function chAttributeIcon(hass, stateObj, attribute, attributeValue) {
  const domain = stateObj.entity_id.split('.')[0];
  const deviceClass = stateObj.attributes.device_class;
  const entity = hass.entities?.[stateObj.entity_id];
  const platform = entity?.platform;
  const translationKey = entity?.translation_key;
  const value = attributeValue ?? stateObj.attributes[attribute];

  let icon;
  if (translationKey && platform) {
    const platformIcons = await chGetPlatformIcons(hass, platform);
    if (platformIcons) {
      icon = chGetIconFromTranslations(
        value,
        platformIcons[domain]?.[translationKey]?.state_attributes?.[attribute]
      );
    }
  }
  if (!icon) {
    const componentIcons = await chGetComponentIcons(hass, domain);
    if (componentIcons) {
      const translations =
        (deviceClass && componentIcons[deviceClass]?.state_attributes?.[attribute]) ||
        componentIcons._?.state_attributes?.[attribute];
      icon = chGetIconFromTranslations(value, translations);
    }
  }
  return icon;
}

// ─── Default Configuration ────────────────────────────────────────────────────
const DEFAULT_CONFIG = {
  entity:                     '',
  name:                       '',
  show_entity_name_fallback:  true,
  show_current_temperature:   true,
  show_current_humidity:      true,
  show_mode_button:           true,
  show_preset_button:         true,
  show_fan_button:            true,
  show_swing_button:          true,
};

// ─── Helpers ──────────────────────────────────────────────────────────────────
// Converts a snake_case string to kebab-case. Used for both class names and
// CSS property names coming from config.styles, since CSS text treats them
// identically syntactically.
function chToKebab(str) {
  return String(str).replace(/_/g, '-');
}

// Converts config.styles (a flat { class_name: { property: value } } object)
// into a single ready-to-inject CSS text block. No validation of class names
// or property names against anything - any key the user writes is accepted
// and converted as-is; this is a literal YAML->CSS translation, not a
// filtered one. One reserved key: 'host' targets the card's own :host
// element (a pseudo-class, not a real class) instead of .host - there is
// no class="host" anywhere in this card's markup, so this can't collide.
function chBuildUserStylesCss(stylesConfig) {
  let css = '';
  for (const [className, props] of Object.entries(stylesConfig)) {
    if (!props || typeof props !== 'object' || Array.isArray(props)) continue;
    const declarations = Object.entries(props)
      .map(([prop, value]) => `${chToKebab(prop)}: ${value};`)
      .join(' ');
    const selector = className === 'host' ? ':host' : `.${chToKebab(className)}`;
    css += `${selector} { ${declarations} }\n`;
  }
  return css;
}

function chCapitalize(str) {
  if (!str) return '';
  return str.charAt(0).toUpperCase() + str.slice(1).replace(/_/g, ' ');
}

function chParseNumber(raw) {
  const v = String(raw).replace(',', '.');
  if (v === '-' || v === '-0' || v.endsWith('.')) return null;
  if (v.includes('.') && v.endsWith('0')) return null;
  if (v === '') return undefined;
  const n = parseFloat(v);
  return isNaN(n) ? null : n;
}


// ─── Editor Field Helpers ──────────────────────────────────────────────────────
function chTextField(label, value, onChange, opts = {}) {
  return html`
    <div class="text-field">
      <label>${label}</label>
      <ch-textfield
        .value=${String(value)}
        type=${opts.type || 'text'}
        step=${opts.step || ''}
        min=${opts.min !== undefined ? opts.min : ''}
        max=${opts.max !== undefined ? opts.max : ''}
        @input=${onChange}
      ></ch-textfield>
    </div>
  `;
}

function chToggleField(label, checked, onChange) {
  return html`
    <div class="toggle-field">
      <label>${label}</label>
      <ha-switch .checked=${checked} @change=${onChange}></ha-switch>
    </div>
  `;
}

// ─── ch-textfield ───────────────────────────────────────────────────────────────
// Own text field component — avoids depending on ha-textfield, which HA has
// deprecated/removed in some recent versions. Uses live() so in-progress input
// (trailing '-', trailing '.') is not overwritten by re-render.
class ChTextfield extends LitElement {
  static properties = {
    value:       { type: String },
    type:        { type: String },
    step:        { type: String },
    min:         { type: String },
    max:         { type: String },
    placeholder: { type: String },
  };

  static styles = css`
    :host { display: block; width: 100%; }
    input {
      display: block;
      width: 100%;
      box-sizing: border-box;
      height: 40px;
      padding: 0 12px;
      background: var(--input-fill-color, rgba(0, 0, 0, 0.06));
      border: none;
      border-bottom: 1px solid var(--secondary-text-color, #888);
      border-radius: 4px 4px 0 0;
      color: var(--primary-text-color);
      font-size: 14px;
      font-family: inherit;
      outline: none;
    }
    input:focus { border-bottom: 2px solid var(--primary-color); }
  `;

  render() {
    return html`
      <input
        .value=${live(this.value ?? '')}
        type=${this.type || 'text'}
        step=${this.step || ''}
        min=${this.min || ''}
        max=${this.max || ''}
        placeholder=${this.placeholder || ''}
        @input=${this._onInput}
      />
    `;
  }

  _onInput(e) {
    this.value = e.target.value;
    this.dispatchEvent(new Event('input', { bubbles: true, composed: true }));
  }
}
customElements.define('ch-textfield', ChTextfield);

// ─── Editor ───────────────────────────────────────────────────────────────────
class ChronoHvacCardEditor extends LitElement {
  static properties = {
    hass:    { type: Object },
    _config: { type: Object },
  };

  setConfig(config) {
    this._config = { ...DEFAULT_CONFIG, ...config };
  }

  _valueChanged(key, ev) {
    if (!this._config || !this.hass) return;
    let value;
    if (ev.detail?.value !== undefined) {
      value = ev.detail.value;
    } else if (ev.target.tagName === 'HA-SWITCH') {
      value = ev.target.checked;
    } else {
      value = ev.target.value;
    }
    this._config = { ...this._config, [key]: value };
    this.dispatchEvent(new CustomEvent('config-changed', {
      detail: { config: this._config },
      bubbles: true,
      composed: true,
    }));
  }

  render() {
    if (!this._config || !this.hass) return html``;
    const c = this._config;
    const stateObj = c.entity ? this.hass.states[c.entity] : undefined;
    const attrs = stateObj?.attributes || {};

    const hasCurrentTemperature = attrs.current_temperature !== undefined;
    const hasCurrentHumidity = attrs.current_humidity !== undefined;
    const hasMode = (attrs.hvac_modes || []).length > 1;
    const hasPreset = (attrs.preset_modes || []).length > 0;
    const hasFan = (attrs.fan_modes || []).length > 0;
    const hasSwing = (attrs.swing_modes || []).length > 0;

    return html`
      <div class="editor">
        <div class="section-title">Entity</div>
        <ha-entity-picker
          .hass=${this.hass}
          .value=${c.entity}
          .includeDomains=${['climate']}
          allow-custom-entity
          @value-changed=${(e) => this._valueChanged('entity', { detail: { value: e.detail.value } })}
        ></ha-entity-picker>

        <div class="name-toggle-grid">
          ${chTextField('Name (optional)', c.name, (e) => this._valueChanged('name', e))}
          <div class="toggle-spacer">
            <span class="spacer-label">&nbsp;</span>
            <span class="spacer-control">
              <ha-switch .checked=${c.show_entity_name_fallback} @change=${(e) => this._valueChanged('show_entity_name_fallback', e)}></ha-switch>
            </span>
          </div>
        </div>

        <div class="section-title">Display</div>
        ${chToggleField('Show card border', c.show_border !== false, (e) => this._valueChanged('show_border', e))}
        ${hasCurrentTemperature ? chToggleField('Show current temperature', c.show_current_temperature, (e) => this._valueChanged('show_current_temperature', e)) : ''}
        ${hasCurrentHumidity ? chToggleField('Show current humidity', c.show_current_humidity, (e) => this._valueChanged('show_current_humidity', e)) : ''}

        ${hasMode || hasPreset || hasFan || hasSwing ? html`
          <div class="section-title">Buttons</div>
          ${hasMode ? chToggleField('Show Mode button', c.show_mode_button, (e) => this._valueChanged('show_mode_button', e)) : ''}
          ${hasPreset ? chToggleField('Show Preset button', c.show_preset_button, (e) => this._valueChanged('show_preset_button', e)) : ''}
          ${hasFan ? chToggleField('Show Fan mode button', c.show_fan_button, (e) => this._valueChanged('show_fan_button', e)) : ''}
          ${hasSwing ? chToggleField('Show Swing mode button', c.show_swing_button, (e) => this._valueChanged('show_swing_button', e)) : ''}
        ` : ''}
      </div>
    `;
  }

  static styles = css`
    .editor { display: flex; flex-direction: column; gap: 12px; padding: 8px 0; }
    .name-toggle-grid {
      display: grid;
      grid-template-columns: 1fr auto;
      gap: 12px;
      align-items: start;
    }
    .toggle-spacer {
      display: flex;
      flex-direction: column;
      gap: 4px;
    }
    .toggle-spacer .spacer-label {
      font-size: 13px;
      visibility: hidden;
    }
    .toggle-spacer .spacer-control {
      height: 40px;
      display: flex;
      align-items: center;
    }
    .section-title {
      font-size: 12px;
      font-weight: 600;
      text-transform: uppercase;
      color: var(--secondary-text-color);
      margin-top: 8px;
    }
    .text-field { display: flex; flex-direction: column; gap: 4px; }
    .text-field label { font-size: 13px; color: var(--primary-text-color); }
    .toggle-field {
      display: flex;
      align-items: center;
      justify-content: space-between;
      gap: 12px;
    }
    .toggle-field label { font-size: 13px; color: var(--primary-text-color); }
  `;
}
customElements.define('chrono-hvac-card-editor', ChronoHvacCardEditor);

// ─── Card ─────────────────────────────────────────────────────────────────────
class ChronoHvacCard extends LitElement {
  static properties = {
    _containerHeight: { state: true },
  };

  constructor() {
    super();
    this._attrIconCache = {};
    this._containerHeight = undefined;
    this._userStyleSheet = new CSSStyleSheet();
  }

  // Native browser ResizeObserver - built in, no import, no CDN/CORS risk.
  // Does the same job the (broken, CDN-blocked) @lit-labs/observers
  // ResizeController was meant to: measures .container's own rendered height,
  // applied as max-width on the dial so it doesn't overflow .container's
  // overflow:hidden on wide-but-short cards.
  firstUpdated() {
    this._resizeObserver = new ResizeObserver((entries) => {
      const container = entries[0]?.target.shadowRoot?.querySelector('.circle-slider');
      this._containerHeight = container?.clientHeight;
    });
    this._resizeObserver.observe(this);

    // Appended after Lit's own static-style sheets (already present in
    // adoptedStyleSheets by this point) so styles: overrides win cascade
    // ties against them, on any property, not just ones the built-in
    // styles leave undeclared.
    this.renderRoot.adoptedStyleSheets = [
      ...this.renderRoot.adoptedStyleSheets,
      this._userStyleSheet,
    ];
  }

  disconnectedCallback() {
    super.disconnectedCallback();
    this._resizeObserver?.disconnect();
  }

  set hass(hass) {
    this._hass = hass;
    this.requestUpdate();
  }

  get hass() {
    return this._hass;
  }

  setConfig(config) {
    if (!config.entity || config.entity.split('.')[0] !== 'climate') {
      throw new Error('Specify an entity from the climate domain');
    }
    this._config = { ...DEFAULT_CONFIG, ...config };

    let stylesConfig = config.styles;
    if (stylesConfig !== undefined && (typeof stylesConfig !== 'object' || Array.isArray(stylesConfig))) {
      console.warn('chrono-hvac-card: "styles" must be an object, ignoring.');
      stylesConfig = {};
    }
    this._userStyleSheet.replaceSync(chBuildUserStylesCss(stylesConfig || {}));
  }

  getCardSize() {
    return 7;
  }

  static getConfigElement() {
    return document.createElement('chrono-hvac-card-editor');
  }

  static getStubConfig(hass) {
    const climateEntities = Object.keys(hass?.states || {}).filter((id) => id.startsWith('climate.'));
    return { ...DEFAULT_CONFIG, entity: climateEntities[0] || '' };
  }

  get _stateObj() {
    return this.hass?.states[this._config.entity];
  }

  _callService(service, data) {
    this.hass.callService('climate', service, {
      entity_id: this._config.entity,
      ...data,
    });
  }

  _setHvacMode(mode) {
    this._callService('set_hvac_mode', { hvac_mode: mode });
  }

  _setPresetMode(preset) {
    this._callService('set_preset_mode', { preset_mode: preset });
  }

  _setFanMode(mode) {
    this._callService('set_fan_mode', { fan_mode: mode });
  }

  _setSwingMode(mode) {
    this._callService('set_swing_mode', { swing_mode: mode });
  }

  // Effective values: drag override > pending step override > live entity state.
  // Mirrors native's _targetTemperature local-state pattern.

  // ─── Render ────────────────────────────────────────────────────────────────
  _getAttributeIcon(attribute, value) {
    const key = `${attribute}:${value}`;
    if (key in this._attrIconCache) {
      return this._attrIconCache[key];
    }
    this._attrIconCache[key] = undefined; // mark in-flight, avoid duplicate fetches
    const stateObj = this._stateObj;
    chAttributeIcon(this.hass, stateObj, attribute, value).then((icon) => {
      this._attrIconCache[key] = icon || null;
      this.requestUpdate();
    });
    return undefined;
  }

  _renderModeRow(hvacModes, currentMode, disabled) {
    const opts = [...hvacModes].sort(chCompareHvacModes).map((m) => ({
      value: m,
      label: CH_HVAC_MODE_LABELS[m] || chCapitalize(m),
      icon: chHvacModeIcon(m),
    }));
    return html`
      <ha-control-select-menu
        class="mode-button mode-button-mode"
        .label=${'Mode'}
        .value=${currentMode}
        .options=${opts}
        .disabled=${disabled}
        @wa-select=${(ev) => {
          const value = ev.detail?.item?.value;
          if (value !== undefined && value !== currentMode) this._setHvacMode(value);
        }}
      >
        <ha-icon class="mode-button-icon mode-button-icon-mode" slot="icon" icon=${chHvacModeIcon(currentMode)}></ha-icon>
      </ha-control-select-menu>
    `;
  }

  _renderAttributeRow(label, attribute, options, currentValue, onChange, disabled) {
    const opts = options.map((v) => ({ value: v, label: CH_HVAC_MODE_LABELS[v] || chCapitalize(v) }));
    const renderIcon = (value) => {
      const icon = this._getAttributeIcon(attribute, value);
      return html`<ha-icon icon=${icon || 'mdi:circle-small'}></ha-icon>`;
    };
    const attrClass = `mode-button-${attribute.replace(/_mode$/, '')}`;
    const iconClass = `mode-button-icon-${attribute.replace(/_mode$/, '')}`;
    return html`
      <ha-control-select-menu
        class="mode-button ${attrClass}"
        .label=${label}
        .value=${currentValue}
        .options=${opts}
        .renderIcon=${renderIcon}
        .disabled=${disabled}
        @wa-select=${(ev) => {
          const value = ev.detail?.item?.value;
          if (value !== undefined && value !== currentValue) onChange(value);
        }}
      >
        <ha-icon class="mode-button-icon ${iconClass}" slot="icon" icon=${this._getAttributeIcon(attribute, currentValue) || 'mdi:circle-small'}></ha-icon>
      </ha-control-select-menu>
    `;
  }


  render() {
    if (!this.hass || !this._config) return html``;
    const stateObj = this._stateObj;
    if (!stateObj) {
      return html`
        <ha-card>
          <div class="warning">Entity not found: ${this._config.entity}</div>
        </ha-card>
      `;
    }

    const attrs = stateObj.attributes;
    const mode = stateObj.state;

    const hvacModes = attrs.hvac_modes || [];
    const presetModes = attrs.preset_modes || [];
    const fanModes = attrs.fan_modes || [];
    const swingModes = attrs.swing_modes || [];

    const friendlyName = this.hass.states[this._config.entity]?.attributes?.friendly_name || '';
    const name = this._config.name || (this._config.show_entity_name_fallback ? friendlyName : '');

    const featureRowsDisabled = mode === 'unavailable';
    const featureRows = [];
    if (this._config.show_mode_button && hvacModes.length > 1) {
      featureRows.push(this._renderModeRow(hvacModes, mode, featureRowsDisabled));
    }
    if (this._config.show_preset_button && presetModes.length) {
      featureRows.push(this._renderAttributeRow('Preset', 'preset_mode', presetModes, attrs.preset_mode, (v) => this._setPresetMode(v), featureRowsDisabled));
    }
    if (this._config.show_fan_button && fanModes.length) {
      featureRows.push(this._renderAttributeRow('Fan mode', 'fan_mode', fanModes, attrs.fan_mode, (v) => this._setFanMode(v), featureRowsDisabled));
    }
    if (this._config.show_swing_button && swingModes.length) {
      featureRows.push(this._renderAttributeRow('Swing mode', 'swing_mode', swingModes, attrs.swing_mode, (v) => this._setSwingMode(v), featureRowsDisabled));
    }
    const showTemp = this._config.show_current_temperature && attrs.current_temperature !== undefined;
    const showHumidity = this._config.show_current_humidity && attrs.current_humidity !== undefined;

    return html`
      <ha-card class="ha-card ${this._config.show_border === false ? 'no-border' : ''}">
        ${name ? html`<p class="header">${name}</p>` : ''}

        ${showTemp || showHumidity ? html`
          <div class="readouts">
            ${showTemp ? html`
              <div class="readout readout-temperature">
                <p class="readout-label readout-label-temperature">Current temperature</p>
                <p class="readout-value readout-value-temperature">${attrs.current_temperature}°C</p>
              </div>
            ` : ''}
            ${showHumidity ? html`
              <div class="readout readout-humidity">
                <p class="readout-label readout-label-humidity">Current humidity</p>
                <p class="readout-value readout-value-humidity">${attrs.current_humidity}%</p>
              </div>
            ` : ''}
          </div>
        ` : ''}

        <div class="circle-slider">
          <ha-state-control-climate-temperature
            class="dial"
            style=${this._containerHeight ? `max-width:${this._containerHeight}px` : ''}
            prevent-interaction-on-scroll
            show-secondary
            .stateObj=${stateObj}
          ></ha-state-control-climate-temperature>
        </div>

        ${featureRows.length ? html`
          <div class="mode-buttons">
            ${featureRows}
          </div>
        ` : ''}
      </ha-card>
    `;
  }

  static styles = css`
    :host {
      display: block;
      position: relative;
      height: 100%;
      max-width: 360px;
      margin: 0 auto;
      font-family: var(--ha-font-family-body, inherit);
    }
    ha-card {
      position: relative;
      height: 100%;
      width: 100%;
      padding: var(--ha-card-padding, 0 8px 16px 8px);
      background: var(--card-background-color, #1a1a1a);
      color: var(--primary-text-color, #fff);
      border-radius: var(--ha-card-border-radius, 12px);
      box-sizing: border-box;
      display: flex;
      flex-direction: column;
      align-items: center;
      overflow: hidden;
    }
    ha-card.no-border {
      border-width: 0;
    }
    .header {
      width: 100%;
      box-sizing: border-box;
      text-align: var(--header-text-align, left);
      font-size: var(--header-font-size, 24px);
      font-weight: var(--header-font-weight, 500);
      line-height: var(--ha-line-height-normal, 1.2);
      padding: var(--header-padding, 12px 8px 16px);
      margin: 0;
      color: var(--primary-text-color);
    }
    .warning {
      color: var(--error-color, #db4437);
      padding: var(--warning-padding, 16px);
    }
    .readouts {
      display: flex;
      flex-direction: row;
      align-items: center;
      justify-content: center;
      text-align: center;
      width: 100%;
      box-sizing: border-box;
      padding: var(--readouts-padding, 8px 16px 0 16px);
      margin-top: var(--readouts-margin-top, 6px);
      margin-bottom: var(--readouts-margin-bottom, 4px);
      flex: none;
    }
    .readout {
      display: flex;
      flex-direction: column;
      align-items: center;
      justify-content: center;
      text-align: center;
      flex: 1;
    }
    .readout-label,
    .readout-value {
      margin: 0;
      text-align: center;
      color: var(--primary-text-color);
    }
    .readout-label {
      opacity: var(--readout-label-opacity, 0.8);
      font-size: var(--ha-font-size-m);
      line-height: var(--ha-line-height-condensed);
      letter-spacing: var(--readout-label-letter-spacing, 0.4px);
      margin-bottom: var(--readout-label-margin-bottom, 4px);
    }
    .readout-value {
      font-size: var(--ha-font-size-xl);
      font-weight: var(--ha-font-weight-medium);
      line-height: var(--ha-line-height-condensed);
      direction: ltr;
    }
    .circle-slider {
      display: flex;
      align-items: center;
      justify-content: center;
      position: relative;
      overflow: hidden;
      max-width: 100%;
      width: 100%;
      box-sizing: border-box;
      margin-top: var(--circle-slider-margin-top, 25px);
      margin-bottom: var(--circle-slider-margin-bottom, 4px);
    }
    .circle-slider::before {
      content: "";
      display: block;
      padding-top: 100%;
    }
    .circle-slider > * {
      padding: var(--dial-padding, 8px);
    }
    .mode-buttons {
      display: grid;
      grid-template-columns: repeat(auto-fit, minmax(var(--mode-button-min-width, 112px), 1fr));
      justify-content: center;
      flex: none;
      gap: var(--mode-buttons-gap, 12px);
      width: 100%;
      max-width: var(--mode-buttons-max-width, 316px);
      margin: var(--mode-buttons-margin, -2px -12px);
      padding: var(--mode-buttons-padding, 2px 12px 8px);
      box-sizing: border-box;
      overflow: auto;
      -ms-overflow-style: none;
      scrollbar-width: none;
      margin-top: var(--mode-buttons-margin-top, 9px);
      margin-bottom: 0;
    }
    .mode-buttons::-webkit-scrollbar { display: none; }
    .mode-buttons > * {
      width: clamp(var(--mode-button-min-width, 112px), 100%, var(--mode-button-max-width, 140px));
      justify-self: center;
    }

  `;
}
customElements.define('chrono-hvac-card', ChronoHvacCard);

// Log version info
console.info(
  `%c CHRONO-%cHVAC%c-CARD %c v${CARD_VERSION} `,
  'background-color: #101010; color: #FFFFFF; font-weight: bold; padding: 2px 0 2px 4px; border-radius: 3px 0 0 3px;',
  'background-color: #101010; color: #4676d3; font-weight: bold; padding: 2px 0;',
  'background-color: #101010; color: #FFFFFF; font-weight: bold; padding: 2px 4px 2px 0;',
  'background-color: #1E1E1E; color: #FFFFFF; font-weight: bold; padding: 2px 4px; border-radius: 0 3px 3px 0;'
);

window.customCards = window.customCards || [];
window.customCards.push({
  type:        'chrono-hvac-card',
  name:        'Chrono HVAC Card',
  description: 'A visual replica of the native HA thermostat card with capability-driven mode/preset/fan/swing buttons.',
  preview:     true,
  config:      ChronoHvacCard.getStubConfig(),
});
