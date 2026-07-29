import { LitElement, html, svg, css } from 'https://unpkg.com/lit@2.0.0/index.js?module';
import { live } from 'https://unpkg.com/lit@2.0.0/directives/live.js?module';

// ─── Card Version ─────────────────────────────────────────────────────────────
const CARD_VERSION = '0.0.3';

// ─── Card Version History ─────────────────────────────────────────────────────
// v0.0.3: Add 28px border-radius to ha-card; reduce ch-feature-picker button
//         padding/gap/font size — buttons were too wide/bulky compared to native
// v0.0.2: Replace ch-button-toggle-group (all-options segmented row) with
//         ch-feature-picker (single button showing current icon+value, opens a
//         dropdown popup listing all options — matches native HA behavior);
//         Mode/Preset/Fan mode/Swing mode rows now laid out in a 2-column grid
// v0.0.1: Initial release — dial with drag-to-set interaction (single and dual/heat_cool
//         target modes), current temperature/humidity readouts, capability-detected
//         Mode/Preset/Fan mode/Swing mode button rows read directly from entity
//         attributes and wired to HA climate services, heat/cool/idle color states,
//         full visual editor with per-row visibility toggles

// ─── Constants ────────────────────────────────────────────────────────────────
const CH_ARC_START = 210;              // degrees, 0 = top, clockwise positive
const CH_ARC_SWEEP = 300;              // degrees of travel; gap of 60° centered at bottom
const CH_DEFAULT_MIN_TEMP = 7;
const CH_DEFAULT_MAX_TEMP = 35;
const CH_DEFAULT_STEP = 0.5;

const CH_MODE_COLORS = {
  heat:      '#ff8100',
  cool:      '#2196f3',
  heat_cool: '#7c4dff',
  auto:      '#43a047',
  dry:       '#ffc107',
  fan_only:  '#00bcd4',
  off:       '#8a8a8a',
  idle:      '#8a8a8a',
};

const CH_HVAC_MODE_LABELS = {
  off:       'Off',
  heat:      'Heat',
  cool:      'Cool',
  heat_cool: 'Heat/Cool',
  auto:      'Auto',
  dry:       'Dry',
  fan_only:  'Fan only',
};

const CH_HVAC_MODE_ICONS = {
  off:       'mdi:power',
  heat:      'mdi:fire',
  cool:      'mdi:snowflake',
  heat_cool: 'mdi:sun-snowflake-variant',
  auto:      'mdi:autorenew',
  dry:       'mdi:water-percent',
  fan_only:  'mdi:fan',
};

// ─── Default Configuration ────────────────────────────────────────────────────
const DEFAULT_CONFIG = {
  entity:                     '',
  name:                       '',
  show_current_temperature:   true,
  show_current_humidity:      true,
  show_mode_row:              true,
  show_preset_row:            true,
  show_fan_row:               true,
  show_swing_row:             true,
};

// ─── Helpers ──────────────────────────────────────────────────────────────────
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

function chPolarToCartesian(cx, cy, r, angleDeg) {
  const rad = (angleDeg * Math.PI) / 180;
  return {
    x: cx + r * Math.sin(rad),
    y: cy - r * Math.cos(rad),
  };
}

function chDescribeArc(cx, cy, r, startAngle, endAngle) {
  if (endAngle <= startAngle) return '';
  const start = chPolarToCartesian(cx, cy, r, startAngle);
  const end = chPolarToCartesian(cx, cy, r, endAngle);
  const sweep = endAngle - startAngle;
  const largeArcFlag = sweep <= 180 ? 0 : 1;
  return `M ${start.x} ${start.y} A ${r} ${r} 0 ${largeArcFlag} 1 ${end.x} ${end.y}`;
}

function chAngleForTemp(temp, min, max) {
  const ratio = Math.min(1, Math.max(0, (temp - min) / (max - min)));
  return CH_ARC_START + ratio * CH_ARC_SWEEP;
}

function chTempForAngle(angle, min, max, step) {
  const ratio = (angle - CH_ARC_START) / CH_ARC_SWEEP;
  let temp = min + ratio * (max - min);
  temp = Math.round(temp / step) * step;
  return Math.min(max, Math.max(min, temp));
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

// ─── ch-feature-picker ────────────────────────────────────────────────────────
// Single button showing the current option's icon + row label + current value
// (e.g. "Mode / Cool"). Clicking opens a dropdown popup listing all options
// (icon + label each, current one highlighted); selecting one closes the
// popup and fires 'change'. Matches native HA card-feature button behavior.
class ChFeaturePicker extends LitElement {
  static properties = {
    label:   { type: String },
    value:   { type: String },
    options: { type: Array },
    color:   { type: String },
    _open:   { state: true },
  };

  constructor() {
    super();
    this._open = false;
    this._boundOutsideClick = this._onOutsideClick.bind(this);
  }

  disconnectedCallback() {
    super.disconnectedCallback();
    window.removeEventListener('pointerdown', this._boundOutsideClick, true);
  }

  _toggleOpen(ev) {
    ev.stopPropagation();
    this._open = !this._open;
    if (this._open) {
      window.addEventListener('pointerdown', this._boundOutsideClick, true);
    } else {
      window.removeEventListener('pointerdown', this._boundOutsideClick, true);
    }
  }

  _onOutsideClick(ev) {
    if (!this.contains(ev.target)) {
      this._open = false;
      window.removeEventListener('pointerdown', this._boundOutsideClick, true);
    }
  }

  _select(value, ev) {
    ev.stopPropagation();
    this._open = false;
    window.removeEventListener('pointerdown', this._boundOutsideClick, true);
    this.dispatchEvent(new CustomEvent('change', { detail: { value }, bubbles: true, composed: true }));
  }

  render() {
    const opts = this.options || [];
    const current = opts.find((o) => o.value === this.value) || {};
    return html`
      <button class="picker-button" @click=${this._toggleOpen}>
        <ha-icon icon=${current.icon || 'mdi:circle-small'}></ha-icon>
        <div class="picker-text">
          <span class="picker-label">${this.label}</span>
          <span class="picker-value">${current.label || this.value}</span>
        </div>
      </button>
      ${this._open ? html`
        <div class="picker-popup">
          ${opts.map((opt) => html`
            <div
              class="picker-option ${opt.value === this.value ? 'active' : ''}"
              style=${opt.value === this.value ? `background:${this.color || 'var(--ch-active-color,#2196f3)'}` : ''}
              @click=${(e) => this._select(opt.value, e)}
            >
              <ha-icon icon=${opt.icon || 'mdi:circle-small'}></ha-icon>
              <span>${opt.label}</span>
            </div>
          `)}
        </div>
      ` : ''}
    `;
  }

  static styles = css`
    :host { position: relative; display: block; }
    .picker-button {
      display: flex;
      align-items: center;
      gap: 6px;
      width: 100%;
      box-sizing: border-box;
      padding: 6px 10px;
      border: none;
      border-radius: 10px;
      background: var(--ch-chip-background, rgba(255, 255, 255, 0.06));
      color: var(--primary-text-color, #e1e1e1);
      cursor: pointer;
      font-family: inherit;
      text-align: left;
    }
    .picker-button:hover {
      background: var(--ch-chip-background-hover, rgba(255, 255, 255, 0.1));
    }
    .picker-text { display: flex; flex-direction: column; }
    .picker-label { font-size: 10px; color: var(--secondary-text-color, #999); }
    .picker-value { font-size: 12px; font-weight: 600; }
    .picker-popup {
      position: absolute;
      top: calc(100% + 4px);
      left: 0;
      min-width: 180px;
      background: var(--card-background-color, #1e1e1e);
      border: 1px solid var(--divider-color, #444);
      border-radius: 8px;
      box-shadow: 0 4px 12px rgba(0, 0, 0, 0.4);
      z-index: 20;
      overflow: hidden;
    }
    .picker-option {
      display: flex;
      align-items: center;
      gap: 10px;
      padding: 10px 14px;
      cursor: pointer;
      font-size: 14px;
    }
    .picker-option:hover:not(.active) { background: rgba(255, 255, 255, 0.08); }
    .picker-option.active { color: #fff; }
    ha-icon { --mdc-icon-size: 16px; }
  `;
}
customElements.define('ch-feature-picker', ChFeaturePicker);

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

        ${chTextField('Name (optional)', c.name, (e) => this._valueChanged('name', e))}

        <div class="section-title">Display</div>
        ${chToggleField('Show current temperature', c.show_current_temperature, (e) => this._valueChanged('show_current_temperature', e))}
        ${chToggleField('Show current humidity', c.show_current_humidity, (e) => this._valueChanged('show_current_humidity', e))}

        <div class="section-title">Button rows</div>
        ${chToggleField('Show Mode row', c.show_mode_row, (e) => this._valueChanged('show_mode_row', e))}
        ${chToggleField('Show Preset row', c.show_preset_row, (e) => this._valueChanged('show_preset_row', e))}
        ${chToggleField('Show Fan mode row', c.show_fan_row, (e) => this._valueChanged('show_fan_row', e))}
        ${chToggleField('Show Swing mode row', c.show_swing_row, (e) => this._valueChanged('show_swing_row', e))}
      </div>
    `;
  }

  static styles = css`
    .editor { display: flex; flex-direction: column; gap: 12px; padding: 8px 0; }
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
    _dragTarget: { type: String },   // null | 'single' | 'low' | 'high'
    _dragTemp:   { type: Object },   // { single } or { low, high } while dragging
  };

  constructor() {
    super();
    this._dragTarget = null;
    this._dragTemp = null;
    this._boundPointerMove = this._onPointerMove.bind(this);
    this._boundPointerUp = this._onPointerUp.bind(this);
  }

  set hass(hass) {
    this._hass = hass;
  }

  get hass() {
    return this._hass;
  }

  setConfig(config) {
    if (!config.entity || config.entity.split('.')[0] !== 'climate') {
      throw new Error('Specify an entity from the climate domain');
    }
    this._config = { ...DEFAULT_CONFIG, ...config };
  }

  getCardSize() {
    return 7;
  }

  static getConfigElement() {
    return document.createElement('chrono-hvac-card-editor');
  }

  static getStubConfig() {
    return { ...DEFAULT_CONFIG };
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

  _handleMoreInfo() {
    this.dispatchEvent(new CustomEvent('hass-more-info', {
      detail: { entityId: this._config.entity },
      bubbles: true,
      composed: true,
    }));
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

  _step(direction, which) {
    const stateObj = this._stateObj;
    if (!stateObj) return;
    const attrs = stateObj.attributes;
    const step = attrs.target_temp_step || CH_DEFAULT_STEP;
    const min = attrs.min_temp ?? CH_DEFAULT_MIN_TEMP;
    const max = attrs.max_temp ?? CH_DEFAULT_MAX_TEMP;
    const isRange = attrs.target_temp_low !== undefined && attrs.target_temp_high !== undefined;

    if (isRange) {
      const low = attrs.target_temp_low;
      const high = attrs.target_temp_high;
      if (which === 'low') {
        const next = Math.min(high, Math.max(min, low + direction * step));
        this._callService('set_temperature', { target_temp_low: next, target_temp_high: high });
      } else {
        const next = Math.max(low, Math.min(max, high + direction * step));
        this._callService('set_temperature', { target_temp_low: low, target_temp_high: next });
      }
    } else {
      const current = attrs.temperature ?? min;
      const next = Math.min(max, Math.max(min, current + direction * step));
      this._callService('set_temperature', { temperature: next });
    }
  }

  // ─── Drag interaction ─────────────────────────────────────────────────────
  _angleFromPointer(clientX, clientY, rect) {
    const cx = rect.left + rect.width / 2;
    const cy = rect.top + rect.height / 2;
    const dx = clientX - cx;
    const dy = clientY - cy;
    let deg = (Math.atan2(dx, -dy) * 180) / Math.PI;
    if (deg < 0) deg += 360;
    const gapEndRaw = (CH_ARC_START + CH_ARC_SWEEP) - 360;
    if (deg <= gapEndRaw) deg += 360;
    if (deg < CH_ARC_START) deg = CH_ARC_START;
    if (deg > CH_ARC_START + CH_ARC_SWEEP) deg = CH_ARC_START + CH_ARC_SWEEP;
    return deg;
  }

  _onPointerDown(ev) {
    const stateObj = this._stateObj;
    if (!stateObj || stateObj.state === 'off') return;
    const attrs = stateObj.attributes;
    const min = attrs.min_temp ?? CH_DEFAULT_MIN_TEMP;
    const max = attrs.max_temp ?? CH_DEFAULT_MAX_TEMP;
    const isRange = attrs.target_temp_low !== undefined && attrs.target_temp_high !== undefined;
    const rect = ev.currentTarget.getBoundingClientRect();
    const angle = this._angleFromPointer(ev.clientX, ev.clientY, rect);

    if (isRange) {
      const lowAngle = chAngleForTemp(attrs.target_temp_low, min, max);
      const highAngle = chAngleForTemp(attrs.target_temp_high, min, max);
      this._dragTarget = Math.abs(angle - lowAngle) <= Math.abs(angle - highAngle) ? 'low' : 'high';
      this._dragTemp = { low: attrs.target_temp_low, high: attrs.target_temp_high };
    } else {
      this._dragTarget = 'single';
      this._dragTemp = { single: attrs.temperature ?? min };
    }

    this._dialRect = rect;
    window.addEventListener('pointermove', this._boundPointerMove);
    window.addEventListener('pointerup', this._boundPointerUp);
    this._onPointerMove(ev);
  }

  _onPointerMove(ev) {
    if (!this._dragTarget) return;
    const stateObj = this._stateObj;
    const attrs = stateObj.attributes;
    const min = attrs.min_temp ?? CH_DEFAULT_MIN_TEMP;
    const max = attrs.max_temp ?? CH_DEFAULT_MAX_TEMP;
    const step = attrs.target_temp_step || CH_DEFAULT_STEP;
    const angle = this._angleFromPointer(ev.clientX, ev.clientY, this._dialRect);
    const temp = chTempForAngle(angle, min, max, step);

    if (this._dragTarget === 'single') {
      this._dragTemp = { single: temp };
    } else if (this._dragTarget === 'low') {
      this._dragTemp = { ...this._dragTemp, low: Math.min(temp, this._dragTemp.high) };
    } else if (this._dragTarget === 'high') {
      this._dragTemp = { ...this._dragTemp, high: Math.max(temp, this._dragTemp.low) };
    }
    this.requestUpdate();
  }

  _onPointerUp() {
    if (!this._dragTarget) return;
    if (this._dragTarget === 'single') {
      this._callService('set_temperature', { temperature: this._dragTemp.single });
    } else {
      this._callService('set_temperature', {
        target_temp_low: this._dragTemp.low,
        target_temp_high: this._dragTemp.high,
      });
    }
    this._dragTarget = null;
    this._dragTemp = null;
    window.removeEventListener('pointermove', this._boundPointerMove);
    window.removeEventListener('pointerup', this._boundPointerUp);
  }

  // ─── Render ────────────────────────────────────────────────────────────────
  _renderButtonRow(title, options, activeValue, onChange, iconMap) {
    const opts = options.map((v) => ({
      value: v,
      label: CH_HVAC_MODE_LABELS[v] || chCapitalize(v),
      icon: iconMap ? (iconMap[v] || 'mdi:circle-small') : 'mdi:circle-small',
    }));
    return html`
      <ch-feature-picker
        label=${title}
        .options=${opts}
        .value=${activeValue}
        @change=${(e) => onChange(e.detail.value)}
      ></ch-feature-picker>
    `;
  }

  _renderDial(stateObj) {
    const attrs = stateObj.attributes;
    const mode = stateObj.state;
    const action = attrs.hvac_action;
    const min = attrs.min_temp ?? CH_DEFAULT_MIN_TEMP;
    const max = attrs.max_temp ?? CH_DEFAULT_MAX_TEMP;
    const isRange = attrs.target_temp_low !== undefined && attrs.target_temp_high !== undefined;
    const color = CH_MODE_COLORS[mode] || CH_MODE_COLORS.idle;

    const cx = 100, cy = 100, r = 88;
    const trackPath = chDescribeArc(cx, cy, r, CH_ARC_START, CH_ARC_START + CH_ARC_SWEEP);

    let fillPath = '';
    let handles = [];

    if (mode === 'off') {
      // no fill, no handles
    } else if (isRange) {
      const low = this._dragTarget ? this._dragTemp.low : attrs.target_temp_low;
      const high = this._dragTarget ? this._dragTemp.high : attrs.target_temp_high;
      const lowAngle = chAngleForTemp(low, min, max);
      const highAngle = chAngleForTemp(high, min, max);
      fillPath = chDescribeArc(cx, cy, r, lowAngle, highAngle);
      const lowPos = chPolarToCartesian(cx, cy, r, lowAngle);
      const highPos = chPolarToCartesian(cx, cy, r, highAngle);
      handles = [
        { x: lowPos.x, y: lowPos.y },
        { x: highPos.x, y: highPos.y },
      ];
    } else {
      const target = this._dragTarget ? this._dragTemp.single : (attrs.temperature ?? min);
      const targetAngle = chAngleForTemp(target, min, max);
      fillPath = chDescribeArc(cx, cy, r, CH_ARC_START, targetAngle);
      const pos = chPolarToCartesian(cx, cy, r, targetAngle);
      handles = [{ x: pos.x, y: pos.y }];
    }

    return svg`
      <svg viewBox="0 0 200 200" class="dial-svg">
        <path class="dial-track" d=${trackPath}></path>
        ${fillPath ? svg`<path class="dial-fill" d=${fillPath} style="stroke:${color}"></path>` : ''}
        ${handles.map((h) => svg`<circle class="dial-handle" cx=${h.x} cy=${h.y} r="9" style="stroke:${color}"></circle>`)}
      </svg>
    `;
  }

  _renderCenter(stateObj) {
    const attrs = stateObj.attributes;
    const mode = stateObj.state;
    const action = attrs.hvac_action;
    const isRange = attrs.target_temp_low !== undefined && attrs.target_temp_high !== undefined;

    let label;
    if (action === 'idle') label = 'Idle';
    else if (mode === 'off') label = 'Off';
    else label = CH_HVAC_MODE_LABELS[mode] || chCapitalize(mode);

    if (mode === 'off') {
      return html`
        <div class="center">
          <div class="center-label">${label}</div>
        </div>
      `;
    }

    if (isRange) {
      const low = this._dragTarget ? this._dragTemp.low : attrs.target_temp_low;
      const high = this._dragTarget ? this._dragTemp.high : attrs.target_temp_high;
      return html`
        <div class="center">
          <div class="center-label">${label}</div>
          <div class="center-temp-range">
            <span class="center-temp">${low}°</span>
            <span class="center-temp-sep">–</span>
            <span class="center-temp">${high}°</span>
          </div>
        </div>
      `;
    }

    const target = this._dragTarget ? this._dragTemp.single : attrs.temperature;
    const [whole, decimal] = String(target ?? '').split('.');
    return html`
      <div class="center">
        <div class="center-label">${label}</div>
        <div class="center-temp-single">
          <span class="whole">${whole}</span>
          <span class="frac">
            <span class="deg">°C</span>
            ${decimal !== undefined ? html`<span class="dec">,${decimal}</span>` : ''}
          </span>
        </div>
      </div>
    `;
  }

  _renderStepButtons(stateObj) {
    const attrs = stateObj.attributes;
    const mode = stateObj.state;
    if (mode === 'off') return html``;
    const isRange = attrs.target_temp_low !== undefined && attrs.target_temp_high !== undefined;

    if (isRange) {
      return html`
        <div class="step-buttons">
          <div class="step-pair">
            <button @click=${() => this._step(-1, 'low')}>−</button>
            <span class="step-label">Low</span>
            <button @click=${() => this._step(1, 'low')}>+</button>
          </div>
          <div class="step-pair">
            <button @click=${() => this._step(-1, 'high')}>−</button>
            <span class="step-label">High</span>
            <button @click=${() => this._step(1, 'high')}>+</button>
          </div>
        </div>
      `;
    }

    return html`
      <div class="step-buttons">
        <button @click=${() => this._step(-1, 'single')}>−</button>
        <button @click=${() => this._step(1, 'single')}>+</button>
      </div>
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
    const color = CH_MODE_COLORS[mode] || CH_MODE_COLORS.idle;

    const hvacModes = attrs.hvac_modes || [];
    const presetModes = attrs.preset_modes || [];
    const fanModes = attrs.fan_modes || [];
    const swingModes = attrs.swing_modes || [];

    const name = this._config.name || this.hass.states[this._config.entity]?.attributes?.friendly_name || '';

    return html`
      <ha-card style="--ch-active-color:${color}">
        <div class="header">
          ${name ? html`<p class="title">${name}</p>` : ''}
          <div class="more-info" @click=${this._handleMoreInfo}>
            <ha-icon icon="mdi:dots-vertical"></ha-icon>
          </div>
        </div>

        <div class="readouts">
          ${this._config.show_current_temperature && attrs.current_temperature !== undefined ? html`
            <div class="readout">
              <div class="readout-label">Current temperature</div>
              <div class="readout-value">${attrs.current_temperature}°C</div>
            </div>
          ` : html`<div></div>`}
          ${this._config.show_current_humidity && attrs.current_humidity !== undefined ? html`
            <div class="readout">
              <div class="readout-label">Current humidity</div>
              <div class="readout-value">${attrs.current_humidity}%</div>
            </div>
          ` : html`<div></div>`}
        </div>

        <div class="dial-wrapper" @pointerdown=${this._onPointerDown}>
          ${this._renderDial(stateObj)}
          ${this._renderCenter(stateObj)}
        </div>

        ${this._renderStepButtons(stateObj)}

        <div class="feature-grid">
          ${this._config.show_mode_row && hvacModes.length > 1
            ? this._renderButtonRow('Mode', hvacModes, mode, (v) => this._setHvacMode(v), CH_HVAC_MODE_ICONS)
            : ''}
          ${this._config.show_preset_row && presetModes.length
            ? this._renderButtonRow('Preset', presetModes, attrs.preset_mode, (v) => this._setPresetMode(v))
            : ''}
          ${this._config.show_fan_row && fanModes.length
            ? this._renderButtonRow('Fan mode', fanModes, attrs.fan_mode, (v) => this._setFanMode(v))
            : ''}
          ${this._config.show_swing_row && swingModes.length
            ? this._renderButtonRow('Swing mode', swingModes, attrs.swing_mode, (v) => this._setSwingMode(v))
            : ''}
        </div>
      </ha-card>
    `;
  }

  static styles = css`
    :host { display: block; }
    ha-card {
      padding: 16px;
      display: flex;
      flex-direction: column;
      gap: 16px;
      background: var(--card-background-color, #1a1a1a);
      color: var(--primary-text-color, #fff);
      border-radius: 28px;
    }
    .header {
      display: flex;
      align-items: center;
      justify-content: space-between;
    }
    .title {
      margin: 0;
      font-size: 16px;
      font-weight: 500;
    }
    .more-info {
      cursor: pointer;
      color: var(--secondary-text-color, #999);
      display: flex;
      align-items: center;
    }
    .warning {
      color: var(--error-color, #db4437);
      padding: 16px;
    }
    .readouts {
      display: grid;
      grid-template-columns: 1fr 1fr;
      text-align: center;
    }
    .readout-label {
      font-size: 12px;
      color: var(--secondary-text-color, #999);
    }
    .readout-value {
      font-size: 18px;
      font-weight: 500;
      margin-top: 2px;
    }
    .dial-wrapper {
      position: relative;
      width: 70%;
      max-width: 320px;
      margin: 0 auto;
      aspect-ratio: 1;
      touch-action: none;
      cursor: pointer;
    }
    .dial-svg {
      width: 100%;
      height: 100%;
      overflow: visible;
    }
    .dial-track {
      fill: none;
      stroke: var(--divider-color, #333333);
      stroke-width: 12;
      stroke-linecap: round;
    }
    .dial-fill {
      fill: none;
      stroke-width: 12;
      stroke-linecap: round;
    }
    .dial-handle {
      fill: #ffffff;
      stroke-width: 4;
    }
    .center {
      position: absolute;
      top: 50%;
      left: 50%;
      transform: translate(-50%, -50%);
      display: flex;
      flex-direction: column;
      align-items: center;
      text-align: center;
      pointer-events: none;
    }
    .center-label {
      font-size: 14px;
      color: var(--secondary-text-color, #999);
      margin-bottom: 4px;
    }
    .center-temp-single {
      display: flex;
      align-items: flex-start;
      font-size: 48px;
      font-weight: 300;
      line-height: 1;
    }
    .center-temp-single .frac {
      display: flex;
      flex-direction: column;
      font-size: 16px;
      margin-left: 2px;
      margin-top: 2px;
    }
    .center-temp-range {
      display: flex;
      align-items: center;
      gap: 6px;
      font-size: 28px;
      font-weight: 300;
    }
    .step-buttons {
      display: flex;
      justify-content: center;
      align-items: center;
      gap: 24px;
    }
    .step-pair {
      display: flex;
      align-items: center;
      gap: 8px;
    }
    .step-label {
      font-size: 12px;
      color: var(--secondary-text-color, #999);
    }
    .step-buttons button {
      width: 40px;
      height: 40px;
      border-radius: 50%;
      border: 1px solid var(--divider-color, #444);
      background: transparent;
      color: var(--primary-text-color, #fff);
      font-size: 20px;
      cursor: pointer;
    }
    .step-buttons button:hover {
      background: rgba(255, 255, 255, 0.08);
    }
    .feature-grid {
      display: grid;
      grid-template-columns: 1fr 1fr;
      gap: 8px;
    }
  `;
}
customElements.define('chrono-hvac-card', ChronoHvacCard);

// Log version info
console.info(
  `%c CHRONO-HVAC-CARD %c v${CARD_VERSION} `,
  'background-color: #ff8100; color: #fff; font-weight: bold; padding: 2px 4px; border-radius: 3px 0 0 3px;',
  'background-color: #1e1e1e; color: #fff; font-weight: bold; padding: 2px 4px; border-radius: 0 3px 3px 0;'
);

window.customCards = window.customCards || [];
window.customCards.push({
  type:        'chrono-hvac-card',
  name:        'Chrono HVAC Card',
  description: 'A visual replica of the native HA thermostat card with capability-driven mode/preset/fan/swing buttons.',
  preview:     true,
  config:      ChronoHvacCard.getStubConfig(),
});
