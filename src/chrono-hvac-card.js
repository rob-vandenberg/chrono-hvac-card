import { LitElement, html, svg, css } from 'https://unpkg.com/lit@2.0.0/index.js?module';
import { live } from 'https://unpkg.com/lit@2.0.0/directives/live.js?module';

// ─── Card Version ─────────────────────────────────────────────────────────────
const CARD_VERSION = '1.1.22';

// ─── Card Version History ─────────────────────────────────────────────────────
// v1.1.22: Readouts block moved up 8px without moving the dial or anything below
//          it. Implemented by reducing .content's top padding (16px -> 8px,
//          i.e. shrinking the space contributed by the block above, not a
//          negative margin on the readouts block itself), then adding
//          margin-top:8px to .dial-wrapper to restore its original position -
//          net effect: readouts moves up 8px, gap between readouts and the dial
//          grows by 8px, dial and everything below unchanged.
// v1.1.21: Unavailable-state handling now a verified port, not an invention -
//          read further into ha-state-control-climate-temperature.ts than
//          before and found the real fallback branch. Dial now forces the
//          plain readonly 'full' ring (no target dot, no low/high split)
//          regardless of whether the entity is normally single/range mode,
//          matching source exactly. The grey look comes for free from
//          chStateColorCss already resolving to var(--state-unavailable-color)
//          for the unavailable state - no separate dimming needed. Also added
//          .disabled=${state==='unavailable'} to the Mode/Preset/Fan/Swing
//          ha-control-select-menu rows, matching
//          hui-mode-select-card-feature-base.ts's own .disabled binding, which
//          we had never ported.
// v1.1.20: chStateActive() rewritten as a verified port of state_active.ts,
//          scoped to the climate domain specifically (this card never handles
//          any other domain, so the timestamp-domain and per-domain-switch
//          branches that only apply elsewhere are omitted). For climate, the
//          real logic reduces to exactly: active = state is not off/unavailable/
//          unknown - confirming the previous heuristic was already correct, now
//          traceable to real source instead of an assumption.
// v1.1.19: Full source-comparison review and fix pass against
//          ha-state-control-climate-temperature.ts (previously only its render
//          output had been ported, not all of its interaction/logic branches):
//          1) Dual-mode (heat_cool) low/high colors now active-aware — 'heat'/
//             'cool' only when active, 'off'/'off' when inactive (was always
//             heat/cool regardless of active state).
//          2) Single-mode slider now replicates the heatCoolModes.length===1
//             special case: if the entity supports exactly one of heat/cool/
//             heat_cool and current mode is off/auto, the slider still uses that
//             one mode's style instead of falling back to 'full'.
//          3) Step size now falls back to hass.config.unit_system.temperature
//             ('°F' -> 1, else 0.5) instead of a hardcoded 0.5, matching source.
//          4) Step-button service calls are now debounced 1000ms (matching
//             source's _debouncedCallService), instead of firing immediately on
//             every click. Drag-release calls remain immediate (matches source's
//             _valueChanged vs _handleButton distinction).
//          5) Dual-mode step buttons now get a colored outline
//             (--md-sys-color-outline) matching the selected target's color when
//             active, matching source's _renderTemperatureButtons(target, colored).
//          6) Added UNAVAILABLE state handling: dedicated disabled label, dial
//             non-interactive. [Disclosed] native's exact fallback markup for
//             this branch wasn't in the retrieved source; this is a reasonable
//             equivalent, not a verified pixel-identical port.
//          7) Center label/number now gated on actual temperature-support
//             presence instead of always attempting to render.
//          8) Added tap-to-select on the low/high numbers in dual mode
//             (previously only settable by dragging); _selectedRangeTarget moved
//             into static properties so it's properly reactive.
//          9) _step() per-side fallback now uses ?? min / ?? max per side,
//             matching source's defaultValue behavior, instead of no fallback.
//          Plus: console banner recolored to white/blue/white
//          (background #101010, "HVAC" in #4676d3, rest white) per explicit
//          instruction, replacing the earlier orange/dark scheme.
// v1.0.18: Structural fix for the +/- buttons triggering a spurious arc drag
//          (Rule 6 - fixed the cause, not the symptom). Verified from source
//          (ha-control-circular-slider.ts): native attaches drag interaction ONLY
//          to a dedicated invisible <path> tracing the ring geometry
//          (stroke:transparent, pointer-events:auto, stroke-width = visible 24px +
//          2x12px margin = 48px), with the whole <svg> set to pointer-events:none.
//          It is never attached to a generic wrapper div. Replicated exactly:
//          pointerdown listener moved off .dial-wrapper entirely, onto a new
//          .ch-interaction path inside the SVG with the same 48px hit-band.
//          Since the event now originates on the path (whose bounding box is the
//          arc shape, not a centered square), _onPointerDown now reads
//          .dial-wrapper's rect via renderRoot.querySelector instead of
//          ev.currentTarget, keeping center-of-dial math correct. Buttons live
//          outside the <svg> as siblings, so pointerdown events starting on them
//          can never reach this listener at all, by construction - not by
//          stopPropagation.
// v1.0.17: Change show_more_info_button default from true to false.
// v1.0.16: Fix real-time updates — the hass setter never called requestUpdate(),
//          so Lit never re-rendered on incoming HA state pushes (hass is
//          deliberately kept out of static properties to avoid deep-checking the
//          whole hass object, but the setter must manually trigger an update).
//          The card previously only re-rendered when the user interacted with it
//          directly (drag/click touching the reactive _dragTarget/_dragTemp
//          properties), never from external state changes.
// v1.0.15: Card border-radius 28px -> 12px (user correction). Dial center label+
//          temperature block (.ch-info) moved up 16px via transform. Feature
//          button row (.ch-controls-container) moved down 8px via margin-top.
//          Target dot fixed: ch-target-border now gets the arc's color (matching
//          native's cascade, where .value/.low/.high override the base white on
//          .target-border, leaving only the inner .target circle pure white) —
//          previously both layers were flat white with no color, unlike native's
//          colored-ring + white-center look.
//          Border-radius/shift values are user-measured corrections against the
//          native card, not re-derived from source.
// v0.0.14: Fix title font entirely — DevTools inspection (h1.card-header, 24px)
//          revealed the real name text is NOT hui-thermostat-card.ts's own
//          <p class="title">, it's ha-card's own built-in `header` property
//          (renders <h1 class="card-header">, font-size var(--ha-font-size-2xl)
//          default, verified from ha-card.ts source). Now using .header=${name}
//          directly on <ha-card> — guaranteed identical since it's the literal
//          same generated element, not a re-implementation.
//          ha-card padding changed 16px->0 (verified: hui-thermostat-card.ts's own
//          ha-card uses padding:0, since the internal header supplies its own
//          padding); added a .content wrapper div carrying the 16px
//          padding/16px gap that used to live on ha-card itself.
//          .more-info rebuilt as a direct child of ha-card (required for its
//          position:absolute to anchor to ha-card's own position:relative, which
//          only works for elements that land in ha-card's actual box, not nested
//          inside our own wrapper divs) using the exact verified positioning CSS
//          (position/top/right/inset-inline-*/border-radius/color/direction).
//          [Disclosed, not verified] display:flex/align-items/padding:8px on
//          .more-info are my own addition for clickable sizing, since native
//          wraps a real <ha-icon-button> component (own internal sizing we don't
//          have source for) while ours is a plain div+ha-icon.
// v0.0.13: Fix .title font properties to match hui-thermostat-card.ts exactly:
//          font-size var(--ha-font-size-l), line-height var(--ha-line-height-expanded),
//          removed unverified font-weight:500 override (source has none, inherits
//          normal weight). Fix .readout-label/.readout-value to match
//          more-info-climate.ts's .current .label/.current .value exactly:
//          label now opacity:0.8, font-size var(--ha-font-size-m), line-height
//          var(--ha-line-height-condensed), letter-spacing 0.4px, color
//          var(--primary-text-color) (was hardcoded secondary-text-color/12px);
//          value now font-size var(--ha-font-size-xl), font-weight
//          var(--ha-font-weight-medium), line-height var(--ha-line-height-condensed)
//          (was hardcoded 18px/500). Only font properties changed; layout/spacing
//          properties (margin, padding, structure) left untouched per scope.
// v0.0.12: Add font-family: var(--ha-font-family-body, inherit) to :host (verified
//          variable name from ha-control-select-menu.ts). Dial center number now
//          passes .formatOptions to ha-big-number (minimumFractionDigits/
//          maximumFractionDigits computed from target_temp_step, exact port of
//          ha-state-control-climate-temperature.ts _renderTarget) so whole-number
//          targets show the correct decimal (e.g. "21,0") instead of dropping it.
// v0.0.11: Full dial rewrite against verified HA source (ha-control-circular-slider.ts,
//          state-control-circular-slider-style.ts, ha-big-number.ts,
//          ha-outlined-icon-button.ts, state_color.ts, svg-arc.ts, css-variables.ts):
//          - Real geometry: 270° sweep, 145 radius, 320 viewBox, 135° group rotation
//            (previous 300°/210° values were an unverified approximation)
//          - Target dot is now the real technique: a zero-length round-linecap
//            stroke segment positioned via stroke-dasharray, not a drawn circle
//          - Added the current-temperature marker on the ring (8px, primary-text-color,
//            50% opacity) — previously missing entirely
//          - Arc now layers clear/colored/active segments exactly as source does,
//            instead of a single flat fill path
//          - Colors now resolve via the real CSS custom property chain
//          (--state-climate-<mode>-color etc, ported chStateColorCss/
//          chDomainColorProperties/chComputeCssVariable) instead of hardcoded hex —
//          matches any HA theme automatically since we run in the same frontend.
//          [Note] the active/inactive fallback tier of this chain uses a
//          simplified heuristic (mode !== 'off') since state_active.ts was not
//          verified this session; low practical impact since HA themes define
//          --state-climate-<mode>-color directly for standard hvac modes.
//          - Center number now uses the real <ha-big-number> element (exact font
//            sizing/weight/decimal handling) instead of manual whole/decimal split
//          - +/- controls now use the real <ha-outlined-icon-button> element,
//            48x48px, positioned absolutely inside the dial (bottom:10px) instead
//            of a separate custom circle-button row below the dial
//          - Drag interaction ported from the real _getPercentageFromEvent /
//            _findActiveSlider formulas instead of re-derived angle math
//          - Dual (heat_cool) mode always colors low=heat-color/high=cool-color
//            regardless of current mode, matching source; added persistent
//            _selectedRangeTarget so the step buttons act on whichever handle was
//            last dragged (default 'low')
//          [Simplification, disclosed] per-arc secondary current-temperature
//          marker (the subtle --clear-background-color one drawn again inside
//          each arc group) was not ported — only the single shared top-level
//          marker was, which is the visually significant one users identified.
//          [Simplification, disclosed] responsive breakpoint sizing (xs/sm/md/lg
//          font-size swaps tied to container width) was not ported — out of
//          scope for this pass, current sizing is fixed.
// v0.0.10: Fix .header justify-content (space-between -> flex-end) so the
//          more-info button stays pinned top-right when the name is hidden,
//          instead of jumping to the left as the only flex child. Fix the name
//          row toggle vertical alignment: give it an invisible label spacer
//          matching the real "Name (optional)" label's height, plus a 40px
//          control row matching the text input's height, so the switch centers
//          on the input box itself rather than the whole label+input block.
// v0.0.9: Add show_more_info_button config key (default true) with editor toggle.
//         Display section in editor no longer gated on temperature/humidity
//         capability existing, since the more-info toggle is always available.
//         Header row (name + more-info button) is now omitted entirely when both
//         are hidden, so the dial moves up to fill the freed space.
// v0.0.8: Preset/Fan/Swing mode icons now use HA's real icon resolution instead
//         of a generic dot fallback. Ported directly from verified HA source
//         (src/data/icons.ts: attributeIcon/getIconFromTranslations/
//         getIconFromRange) — same WebSocket data ('frontend/get_icons') and
//         same platform-translation-key + entity-component-icon lookup order
//         ha-attribute-icon itself uses. Uses hass.callWS (standard on any
//         custom card) in place of the internal-only callWS util, and
//         hass.config.components as a simplified load-check in place of the
//         source's isComponentLoaded/atLeastVersion version gate (that gate
//         exists only to protect against very old HA servers lacking this WS
//         command; omitting it doesn't change output on any current HA version).
//         Results cached per platform/domain, same as source.
// v0.0.7: Add show_entity_name_fallback config key (default true) controlling
//         whether the header falls back to the entity's friendly name when the
//         Name field is blank. Editor: Name field + new toggle combined into a
//         single grid row (.name-toggle-grid, same named-grid-class method used
//         throughout chrono-compass-card.js), toggle right-aligned to match the
//         switches in the rows below. No label on the toggle itself.
// v0.0.6: Editor now only shows a toggle for a capability the selected entity
//         actually supports (current temperature/humidity, Mode/Preset/Fan/Swing)
//         instead of always showing all of them; renamed config keys
//         show_*_row -> show_*_button and editor labels "row" -> "button" to
//         match; single-readout layout now centers instead of using a half grid
//         cell when only current temperature or only current humidity is shown
// v0.0.5: Rebuilt Mode/Preset/Fan/Swing rows against verified HA source for the
//         MORE-INFO DIALOG specifically (more-info-climate.ts), not the card-feature
//         system used earlier — these are different component trees. Confirmed from
//         source: no hide-label, no show-arrow on ha-control-select-menu; row
//         container replicates ha-more-info-control-select-container.ts exactly
//         (flex-wrap row, 120-160px per item, gap var(--ha-space-3), 300px max-width
//         at 4 items) — this was the actual cause of "too wide"; Mode row now uses
//         the real per-mode icon mapping from data/climate.ts
//         (CLIMATE_HVAC_MODE_ICONS) and real HVAC_MODES ordering, both mode label
//         and icon change dynamically with current mode, matching source exactly
// v0.0.4: Replace hand-built ch-feature-picker with HA's real native
//         <ha-control-select-menu> component (confirmed from HA frontend source:
//         hui-mode-select-card-feature-base.ts) — guarantees identical rendering
//         since it's the same element HA itself uses. Row icons now match source
//         exactly (mdi:thermostat / mdi:tune-variant / mdi:fan / mdi:arrow-oscillating).
//         Per source, Mode row shows no per-option icons; Preset/Fan/Swing rows
//         use a generic dot icon fallback (native uses ha-attribute-icon, which
//         depends on HA's internal icon-translation data we don't have access to)
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
// Verified from HA source (src/components/ha-control-circular-slider.ts)
const CH_ARC_MAX_ANGLE = 270;                                   // local sweep, degrees
const CH_ARC_ROTATE = 360 - CH_ARC_MAX_ANGLE / 2 - 90;           // group rotation, = 135
const CH_ARC_RADIUS = 145;
const CH_ARC_VIEWBOX = 320;                                      // svg viewBox is 0 0 320 320
const CH_ARC_CENTER = 160;                                       // viewBox/2, translate(160 160)

// Verified from HA source (src/state-control/climate/ha-state-control-climate-temperature.ts)
const CH_SLIDER_MODES = {
  auto: 'full', cool: 'end', dry: 'full', fan_only: 'full',
  heat: 'start', heat_cool: 'full', off: 'full',
};

const CH_DEFAULT_MIN_TEMP = 7;
const CH_DEFAULT_MAX_TEMP = 35;

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
  show_more_info_button:      false,
  show_mode_button:           true,
  show_preset_button:         true,
  show_fan_button:            true,
  show_swing_button:          true,
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

// Ported directly from HA source (src/resources/svg-arc.ts)
function chSvgArc(opts) {
  const { x, y, r, start, end, rotate = 0 } = opts;
  const t1 = (start / 180) * Math.PI;
  const t2 = (end / 180) * Math.PI;
  const delta = (t2 - t1) % (2 * Math.PI);
  const phi = (rotate / 180) * Math.PI;
  const cosPhi = Math.cos(phi);
  const sinPhi = Math.sin(phi);
  const rot = ([vx, vy]) => [cosPhi * vx - sinPhi * vy, sinPhi * vx + cosPhi * vy];
  const [sX, sY] = rot([r * Math.cos(t1), r * Math.sin(t1)]).map((v, i) => v + (i === 0 ? x : y));
  const [eX, eY] = rot([r * Math.cos(t1 + delta), r * Math.sin(t1 + delta)]).map((v, i) => v + (i === 0 ? x : y));
  const fA = delta > Math.PI ? 1 : 0;
  const fS = delta > 0 ? 1 : 0;
  return ['M', sX, sY, 'A', r, r, (phi / (2 * Math.PI)) * 360, fA, fS, eX, eY].join(' ');
}

function chClamp(value, min, max) {
  return Math.min(Math.max(value, min), max);
}

// Ported directly from HA source (src/components/ha-control-circular-slider.ts:
// _valueToPercentage / _strokeDashArc / _strokeCircleDashArc)
function chValueToPercentage(value, min, max) {
  return (chClamp(value, min, max) - min) / (max - min);
}

function chStrokeDashArc(from, to, min, max) {
  const start = chValueToPercentage(from, min, max);
  const end = chValueToPercentage(to, min, max);
  const track = (CH_ARC_RADIUS * 2 * Math.PI * CH_ARC_MAX_ANGLE) / 360;
  const arc = Math.max((end - start) * track, 0);
  const arcOffset = start * track - 0.5;
  return [`${arc} ${track - arc}`, `-${arcOffset}`];
}

function chStrokeCircleDashArc(value, min, max) {
  return chStrokeDashArc(value, value, min, max);
}

// Ported directly from HA source (src/resources/css-variables.ts: computeCssVariable)
function chComputeCssVariable(props) {
  if (Array.isArray(props)) {
    return props.reduceRight((str, variable) => `var(${variable}${str ? `, ${str}` : ''})`, undefined);
  }
  return `var(${props})`;
}

function chSlugify(str) {
  return String(str).toLowerCase().replace(/[^a-z0-9]+/g, '_').replace(/^_+|_+$/g, '');
}

// Ported from HA source (src/common/entity/state_color.ts: domainColorProperties).
// [Note] the "active" flag here uses a simplified heuristic (mode !== 'off') since
// state_active.ts (the real stateActive() source) was not verified in this session.
// This tier is only reached as a fallback if HA's theme has no
// --state-climate-<mode>-color defined for the specific mode, which standard HA
// themes always do for hvac modes — so this heuristic should rarely, if ever, matter.
function chDomainColorProperties(domain, stateObj, state, active) {
  const stateKey = chSlugify(state);
  const activeKey = active ? 'active' : 'inactive';
  const deviceClass = stateObj.attributes.device_class;
  const props = [];
  if (deviceClass) props.push(`--state-${domain}-${deviceClass}-${stateKey}-color`);
  props.push(
    `--state-${domain}-${stateKey}-color`,
    `--state-${domain}-${activeKey}-color`,
    `--state-${activeKey}-color`
  );
  return props;
}

// Shared active/inactive heuristic, used consistently everywhere "active" matters
// (color chain fallback tier, dual-mode low/high coloring, button tinting).
// [Note] approximates the real stateActive() (source not verified this session);
// treats off/unavailable/unknown as inactive, everything else as active.
// Ported from HA source (src/common/entity/state_active.ts: stateActive), scoped
// to the climate domain only (this card never handles any other domain). For
// climate: not in TIMESTAMP_STATE_DOMAINS, not the "alert" exception, and not
// one of the custom-cased domains (alarm_control_panel/cover/lock/etc) - so the
// real logic reduces to exactly this.
function chStateActive(state) {
  if (state === 'unavailable' || state === 'unknown') return false;
  if (state === 'off') return false;
  return true;
}

function chStateColorCss(stateObj, overrideState) {
  const compareState = overrideState !== undefined ? overrideState : stateObj.state;
  if (compareState === 'unavailable') return 'var(--state-unavailable-color)';
  const active = chStateActive(compareState);
  return chComputeCssVariable(chDomainColorProperties('climate', stateObj, compareState, active));
}

// Ported from HA source (ha-state-control-climate-temperature.ts: this._step getter)
function chGetStep(hass, stateObj) {
  if (stateObj.attributes.target_temp_step) return stateObj.attributes.target_temp_step;
  return hass?.config?.unit_system?.temperature === '°F' ? 1 : 0.5;
}

// Simple debounce, matching source's use of common/util/debounce for step-button
// service calls (1000ms).
function chDebounce(fn, wait) {
  let timer;
  const debounced = (...args) => {
    clearTimeout(timer);
    timer = setTimeout(() => fn(...args), wait);
  };
  debounced.cancel = () => clearTimeout(timer);
  return debounced;
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
        ${chToggleField('Show more-info button', c.show_more_info_button, (e) => this._valueChanged('show_more_info_button', e))}
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
    _dragTarget:        { type: String },   // null | 'single' | 'low' | 'high'
    _dragTemp:          { type: Object },   // { single } or { low, high } while dragging
    _stepOverride:       { type: Object },  // { value?, low?, high? } while a debounced button-step is pending
    _selectedRangeTarget: { type: String }, // 'low' | 'high' - which side the step buttons act on in dual mode
  };

  constructor() {
    super();
    this._dragTarget = null;
    this._dragTemp = null;
    this._boundPointerMove = this._onPointerMove.bind(this);
    this._boundPointerUp = this._onPointerUp.bind(this);
    this._attrIconCache = {};
    this._selectedRangeTarget = 'low';
    this._stepOverride = {};
    this._debouncedStepCommit = chDebounce(() => this._commitStepOverride(), 1000);
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

  // Effective values: drag override > pending step override > live entity state.
  // Mirrors native's _targetTemperature local-state pattern.
  _effectiveSingle(attrs) {
    if (this._dragTarget === 'single') return this._dragTemp.single;
    if (this._stepOverride.value !== undefined) return this._stepOverride.value;
    return attrs.temperature;
  }

  _effectiveLow(attrs) {
    if (this._dragTarget) return this._dragTemp.low;
    if (this._stepOverride.low !== undefined) return this._stepOverride.low;
    return attrs.target_temp_low;
  }

  _effectiveHigh(attrs) {
    if (this._dragTarget) return this._dragTemp.high;
    if (this._stepOverride.high !== undefined) return this._stepOverride.high;
    return attrs.target_temp_high;
  }

  _commitStepOverride() {
    const stateObj = this._stateObj;
    if (!stateObj) { this._stepOverride = {}; return; }
    const attrs = stateObj.attributes;
    const isRange = attrs.target_temp_low !== undefined && attrs.target_temp_high !== undefined;
    if (isRange) {
      const low = this._stepOverride.low ?? attrs.target_temp_low;
      const high = this._stepOverride.high ?? attrs.target_temp_high;
      this._callService('set_temperature', { target_temp_low: low, target_temp_high: high });
    } else if (this._stepOverride.value !== undefined) {
      this._callService('set_temperature', { temperature: this._stepOverride.value });
    }
    this._stepOverride = {};
  }

  // Ported from HA source (_handleButton): accumulates from the last locally-known
  // value (not the stale server value) so rapid clicks add up correctly during the
  // debounce window, matching source's this._targetTemperature[target] ?? default.
  _step(direction, which) {
    const stateObj = this._stateObj;
    if (!stateObj) return;
    const attrs = stateObj.attributes;
    const step = chGetStep(this.hass, stateObj);
    const min = attrs.min_temp ?? CH_DEFAULT_MIN_TEMP;
    const max = attrs.max_temp ?? CH_DEFAULT_MAX_TEMP;
    const isRange = attrs.target_temp_low !== undefined && attrs.target_temp_high !== undefined;

    if (isRange) {
      const currentLow = this._effectiveLow(attrs) ?? min;
      const currentHigh = this._effectiveHigh(attrs) ?? max;
      if (which === 'low') {
        const next = chClamp(currentLow + direction * step, min, currentHigh);
        this._stepOverride = { ...this._stepOverride, low: next };
      } else {
        const next = chClamp(currentHigh + direction * step, currentLow, max);
        this._stepOverride = { ...this._stepOverride, high: next };
      }
    } else {
      const current = this._effectiveSingle(attrs) ?? min;
      const next = chClamp(current + direction * step, min, max);
      this._stepOverride = { ...this._stepOverride, value: next };
    }
    this._debouncedStepCommit();
  }

  // ─── Drag interaction ─────────────────────────────────────────────────────
  // Ported directly from HA source (ha-control-circular-slider.ts:
  // xy2polar / rad2deg / _getPercentageFromEvent) rather than re-derived geometry.
  _percentageFromPointer(clientX, clientY, rect) {
    const cx = rect.left + rect.width / 2;
    const cy = rect.top + rect.height / 2;
    const x = clientX - cx;
    const y = clientY - cy;
    const phi = Math.atan2(y, x);
    const deg = (phi * 180) / Math.PI;
    const offset = (360 - CH_ARC_MAX_ANGLE) / 2;
    const angle = ((deg + offset - CH_ARC_ROTATE + 360) % 360) - offset;
    return chClamp(angle / CH_ARC_MAX_ANGLE, 0, 1);
  }

  // Ported from HA source (_findActiveSlider): nearest-handle selection by value,
  // not by angle.
  _findActiveHandle(value, low, high, min, max) {
    const lo = Math.max(low ?? min, min);
    const hi = Math.min(high ?? max, max);
    if (lo >= value) return 'low';
    if (hi <= value) return 'high';
    return Math.abs(value - lo) <= Math.abs(value - hi) ? 'low' : 'high';
  }

  _onPointerDown(ev) {
    const stateObj = this._stateObj;
    if (!stateObj || stateObj.state === 'off' || stateObj.state === 'unavailable') return;
    const attrs = stateObj.attributes;
    const min = attrs.min_temp ?? CH_DEFAULT_MIN_TEMP;
    const max = attrs.max_temp ?? CH_DEFAULT_MAX_TEMP;
    const isRange = attrs.target_temp_low !== undefined && attrs.target_temp_high !== undefined;
    const rect = this.renderRoot.querySelector('.dial-wrapper').getBoundingClientRect();
    const percentage = this._percentageFromPointer(ev.clientX, ev.clientY, rect);
    const rawValue = min + percentage * (max - min);

    if (isRange) {
      this._dragTarget = this._findActiveHandle(rawValue, attrs.target_temp_low, attrs.target_temp_high, min, max);
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
    const step = chGetStep(this.hass, stateObj);
    const percentage = this._percentageFromPointer(ev.clientX, ev.clientY, this._dialRect);
    const rawValue = min + percentage * (max - min);
    const stepped = chClamp(Math.round(rawValue / step) * step, min, max);

    if (this._dragTarget === 'single') {
      this._dragTemp = { single: stepped };
    } else if (this._dragTarget === 'low') {
      this._dragTemp = { ...this._dragTemp, low: Math.min(stepped, this._dragTemp.high) };
    } else if (this._dragTarget === 'high') {
      this._dragTemp = { ...this._dragTemp, high: Math.max(stepped, this._dragTemp.low) };
    }
    this.requestUpdate();
  }

  _onPointerUp() {
    if (!this._dragTarget) return;
    if (this._dragTarget === 'single') {
      this._callService('set_temperature', { temperature: this._dragTemp.single });
    } else {
      this._selectedRangeTarget = this._dragTarget;
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
        .label=${'Mode'}
        .value=${currentMode}
        .options=${opts}
        .disabled=${disabled}
        @wa-select=${(ev) => {
          const value = ev.detail?.item?.value;
          if (value !== undefined && value !== currentMode) this._setHvacMode(value);
        }}
      >
        <ha-icon slot="icon" icon=${chHvacModeIcon(currentMode)}></ha-icon>
      </ha-control-select-menu>
    `;
  }

  _renderAttributeRow(label, attribute, options, currentValue, onChange, disabled) {
    const opts = options.map((v) => ({ value: v, label: CH_HVAC_MODE_LABELS[v] || chCapitalize(v) }));
    const renderIcon = (value) => {
      const icon = this._getAttributeIcon(attribute, value);
      return html`<ha-icon icon=${icon || 'mdi:circle-small'}></ha-icon>`;
    };
    return html`
      <ha-control-select-menu
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
        <ha-icon slot="icon" icon=${this._getAttributeIcon(attribute, currentValue) || 'mdi:circle-small'}></ha-icon>
      </ha-control-select-menu>
    `;
  }

  // Ported from HA source (ha-control-circular-slider.ts: renderArc) — builds one
  // arc's clear/colored/active layers plus its target dot (a zero-length,
  // round-linecap stroke segment positioned via dasharray, not x/y coordinates).
  _renderArcGroup(value, mode, min, max, current, colorVar) {
    const path = chSvgArc({ x: 0, y: 0, start: 0, end: CH_ARC_MAX_ANGLE, r: CH_ARC_RADIUS });
    const limit = mode === 'end' ? max : min;
    const curr = current ?? limit;
    const target = value ?? limit;

    const showActive = mode === 'end' ? target <= curr : mode === 'start' ? curr <= target : false;
    const showTarget = value != null;

    const activeArc = showTarget
      ? (showActive
          ? (mode === 'end' ? chStrokeDashArc(target, curr, min, max) : chStrokeDashArc(curr, target, min, max))
          : chStrokeCircleDashArc(target, min, max))
      : null;

    const coloredArc = mode === 'full'
      ? chStrokeDashArc(min, max, min, max)
      : mode === 'end'
        ? chStrokeDashArc(target, limit, min, max)
        : chStrokeDashArc(limit, target, min, max);

    const targetCircle = showTarget ? chStrokeCircleDashArc(target, min, max) : null;

    return svg`
      <g>
        <path class="ch-arc ch-arc-clear" d=${path} stroke-dasharray=${coloredArc[0]} stroke-dashoffset=${coloredArc[1]}></path>
        <path class="ch-arc ch-arc-colored" style="stroke:${colorVar}" d=${path} stroke-dasharray=${coloredArc[0]} stroke-dashoffset=${coloredArc[1]}></path>
        ${activeArc ? svg`<path class="ch-arc ch-arc-active" style="stroke:${colorVar}" d=${path} stroke-dasharray=${activeArc[0]} stroke-dashoffset=${activeArc[1]}></path>` : ''}
        ${targetCircle ? svg`
          <path class="ch-target-border" style="stroke:${colorVar}" d=${path} stroke-dasharray=${targetCircle[0]} stroke-dashoffset=${targetCircle[1]}></path>
          <path class="ch-target" d=${path} stroke-dasharray=${targetCircle[0]} stroke-dashoffset=${targetCircle[1]}></path>
        ` : ''}
      </g>
    `;
  }

  _renderDial(stateObj) {
    const attrs = stateObj.attributes;
    const mode = stateObj.state;
    const min = attrs.min_temp ?? CH_DEFAULT_MIN_TEMP;
    const max = attrs.max_temp ?? CH_DEFAULT_MAX_TEMP;
    const isRange = attrs.target_temp_low !== undefined && attrs.target_temp_high !== undefined;
    const current = attrs.current_temperature;

    const trackPath = chSvgArc({ x: 0, y: 0, start: 0, end: CH_ARC_MAX_ANGLE, r: CH_ARC_RADIUS });
    const showCurrentMarker = current != null && current <= max && current >= min;
    const currentMarker = showCurrentMarker ? chStrokeCircleDashArc(current, min, max) : null;

    let arcs;
    if (mode === 'unavailable') {
      // Ported from HA source (render(), final fallback branch): unavailable
      // entities always fall to the plain readonly 'full' ring regardless of
      // whether the entity is normally single/range - no target dot, no
      // low/high split, matching native exactly.
      arcs = this._renderArcGroup(null, 'full', min, max, current, 'var(--ch-state-color)');
    } else if (isRange) {
      const low = this._effectiveLow(attrs);
      const high = this._effectiveHigh(attrs);
      arcs = svg`
        ${this._renderArcGroup(low, 'start', min, max, current, 'var(--ch-low-color)')}
        ${this._renderArcGroup(high, 'end', min, max, current, 'var(--ch-high-color)')}
      `;
    } else {
      const target = this._effectiveSingle(attrs);
      // Ported from HA source (render(), single-temperature branch): if the
      // entity supports exactly one of heat/cool/heat_cool and the current mode
      // is off/auto, the slider still uses that one mode's style instead of 'full'.
      const heatCoolModes = (attrs.hvac_modes || []).filter((m) => ['heat', 'cool', 'heat_cool'].includes(m));
      const effectiveMode = (heatCoolModes.length === 1 && ['off', 'auto'].includes(mode)) ? heatCoolModes[0] : mode;
      const sliderMode = CH_SLIDER_MODES[effectiveMode] || 'full';
      arcs = this._renderArcGroup(target, sliderMode, min, max, current, 'var(--ch-state-color)');
    }

    return svg`
      <svg viewBox="0 0 ${CH_ARC_VIEWBOX} ${CH_ARC_VIEWBOX}" class="dial-svg" overflow="visible">
        <g transform="translate(${CH_ARC_CENTER} ${CH_ARC_CENTER}) rotate(${CH_ARC_ROTATE})">
          <path class="ch-track-bg" d=${trackPath}></path>
          ${currentMarker ? svg`<path class="ch-current-marker" d=${trackPath} stroke-dasharray=${currentMarker[0]} stroke-dashoffset=${currentMarker[1]}></path>` : ''}
          ${arcs}
          <path
            class="ch-interaction ${(mode === 'off' || mode === 'unavailable') ? 'disabled' : ''}"
            d=${trackPath}
            @pointerdown=${this._onPointerDown}
          ></path>
        </g>
      </svg>
    `;
  }

  _renderCenter(stateObj) {
    const attrs = stateObj.attributes;
    const mode = stateObj.state;
    const action = attrs.hvac_action;
    const isRange = attrs.target_temp_low !== undefined && attrs.target_temp_high !== undefined;

    if (mode === 'unavailable') {
      return html`
        <div class="ch-info">
          <p class="ch-label ch-label-disabled">Unavailable</p>
        </div>
      `;
    }

    const step = chGetStep(this.hass, stateObj);

    // Ported from HA source (ha-state-control-climate-temperature.ts: _renderTarget)
    const digits = String(step).split('.')?.[1]?.length ?? 0;
    const formatOptions = { minimumFractionDigits: digits, maximumFractionDigits: digits };

    const label = (action && action !== 'off')
      ? chCapitalize(action)
      : (CH_HVAC_MODE_LABELS[mode] || chCapitalize(mode));

    if (isRange) {
      const low = this._effectiveLow(attrs);
      const high = this._effectiveHigh(attrs);
      return html`
        <div class="ch-info">
          <p class="ch-label">${label}</p>
          <div class="ch-dual">
            <button class="ch-target-select ${this._selectedRangeTarget === 'low' ? 'selected' : ''}" @click=${() => { this._selectedRangeTarget = 'low'; }}>
              <ha-big-number .value=${low} unit="°C" unit-position="top" .formatOptions=${formatOptions}></ha-big-number>
            </button>
            <span>–</span>
            <button class="ch-target-select ${this._selectedRangeTarget === 'high' ? 'selected' : ''}" @click=${() => { this._selectedRangeTarget = 'high'; }}>
              <ha-big-number .value=${high} unit="°C" unit-position="top" .formatOptions=${formatOptions}></ha-big-number>
            </button>
          </div>
        </div>
      `;
    }

    const target = this._effectiveSingle(attrs);
    return html`
      <div class="ch-info">
        <p class="ch-label">${label}</p>
        ${target != null ? html`<ha-big-number .value=${target} unit="°C" unit-position="top" .formatOptions=${formatOptions}></ha-big-number>` : ''}
      </div>
    `;
  }

  _renderStepButtons(stateObj) {
    const attrs = stateObj.attributes;
    const mode = stateObj.state;
    if (mode === 'off' || mode === 'unavailable') return html``;
    const isRange = attrs.target_temp_low !== undefined && attrs.target_temp_high !== undefined;
    const target = isRange ? (this._selectedRangeTarget || 'low') : 'single';

    // Ported from HA source (_renderTemperatureButtons): dual-mode buttons only
    // get a colored outline (heat for low, cool for high) while active.
    let buttonColor;
    if (isRange && chStateActive(mode)) {
      buttonColor = target === 'high' ? chStateColorCss(stateObj, 'cool') : chStateColorCss(stateObj, 'heat');
    }
    const buttonStyle = buttonColor ? `--md-sys-color-outline:${buttonColor}` : '';

    return html`
      <div class="step-buttons">
        <ha-outlined-icon-button style=${buttonStyle} @click=${() => this._step(-1, target)}>
          <ha-icon icon="mdi:minus"></ha-icon>
        </ha-outlined-icon-button>
        <ha-outlined-icon-button style=${buttonStyle} @click=${() => this._step(1, target)}>
          <ha-icon icon="mdi:plus"></ha-icon>
        </ha-outlined-icon-button>
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
    const active = chStateActive(mode);
    const stateColor = chStateColorCss(stateObj);
    const lowColor = chStateColorCss(stateObj, active ? 'heat' : 'off');
    const highColor = chStateColorCss(stateObj, active ? 'cool' : 'off');

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
    const scrollClass = `ch-controls-scroll items-${featureRows.length}${featureRows.length >= 4 ? ' multiline' : ''}`;

    const showTemp = this._config.show_current_temperature && attrs.current_temperature !== undefined;
    const showHumidity = this._config.show_current_humidity && attrs.current_humidity !== undefined;
    const showMoreInfo = this._config.show_more_info_button;

    return html`
      <ha-card
        .header=${name}
        style="--ch-state-color:${stateColor};--ch-low-color:${lowColor};--ch-high-color:${highColor}"
      >
        ${showMoreInfo ? html`
          <div class="more-info" @click=${this._handleMoreInfo}>
            <ha-icon icon="mdi:dots-vertical"></ha-icon>
          </div>
        ` : ''}

        <div class="content">
          ${showTemp || showHumidity ? html`
            <div class="readouts ${showTemp && showHumidity ? '' : 'single'}">
              ${showTemp ? html`
                <div class="readout">
                  <div class="readout-label">Current temperature</div>
                  <div class="readout-value">${attrs.current_temperature}°C</div>
                </div>
              ` : ''}
              ${showHumidity ? html`
                <div class="readout">
                  <div class="readout-label">Current humidity</div>
                  <div class="readout-value">${attrs.current_humidity}%</div>
                </div>
              ` : ''}
            </div>
          ` : ''}

          <div class="dial-wrapper">
            ${this._renderDial(stateObj)}
            ${this._renderCenter(stateObj)}
            ${this._renderStepButtons(stateObj)}
          </div>

          ${featureRows.length ? html`
            <div class="ch-controls-container">
              <div class="${scrollClass}">
                ${featureRows}
              </div>
            </div>
          ` : ''}
        </div>
      </ha-card>
    `;
  }

  static styles = css`
    :host {
      display: block;
      font-family: var(--ha-font-family-body, inherit);
    }
    ha-card {
      padding: 0;
      background: var(--card-background-color, #1a1a1a);
      color: var(--primary-text-color, #fff);
      border-radius: 12px;
    }
    .content {
      display: flex;
      flex-direction: column;
      gap: 16px;
      padding: 8px 16px 16px 16px;
    }
    .more-info {
      position: absolute;
      cursor: pointer;
      top: 0;
      right: 0;
      inset-inline-end: 0px;
      inset-inline-start: initial;
      border-radius: var(--ha-border-radius-pill);
      color: var(--secondary-text-color);
      direction: var(--direction);
      display: flex;
      align-items: center;
      padding: 8px;
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
    .readouts.single {
      display: flex;
      justify-content: center;
    }
    .readout-label {
      opacity: 0.8;
      font-size: var(--ha-font-size-m);
      line-height: var(--ha-line-height-condensed);
      letter-spacing: 0.4px;
      color: var(--primary-text-color);
    }
    .readout-value {
      font-size: var(--ha-font-size-xl);
      font-weight: var(--ha-font-weight-medium);
      line-height: var(--ha-line-height-condensed);
      margin-top: 2px;
    }
    .dial-wrapper {
      position: relative;
      width: 70%;
      max-width: 320px;
      margin: 8px auto 0;
      aspect-ratio: 1;
    }
    .dial-svg {
      width: 100%;
      height: 100%;
      display: block;
      pointer-events: none;
    }
    .dial-svg g { fill: none; }
    .ch-interaction {
      fill: none;
      stroke: transparent;
      stroke-linecap: round;
      stroke-width: 48px;
      pointer-events: auto;
      cursor: pointer;
      touch-action: none;
    }
    .ch-interaction.disabled {
      pointer-events: none;
      cursor: initial;
    }
    .ch-track-bg {
      fill: none;
      stroke: var(--disabled-color);
      opacity: 0.3;
      stroke-linecap: round;
      stroke-width: 24px;
    }
    .ch-current-marker {
      fill: none;
      stroke-linecap: round;
      stroke-width: 8px;
      stroke: var(--primary-text-color);
      opacity: 0.5;
    }
    .ch-arc {
      fill: none;
      stroke-linecap: round;
      stroke-width: 24px;
    }
    .ch-arc-clear {
      stroke: var(--clear-background-color, var(--disabled-color));
    }
    .ch-arc-colored {
      opacity: 0.5;
    }
    .ch-target {
      fill: none;
      stroke-linecap: round;
      stroke-width: 18px;
      stroke: white;
    }
    .ch-target-border {
      fill: none;
      stroke-linecap: round;
      stroke-width: 24px;
      stroke: white;
    }
    .ch-info {
      position: absolute;
      top: 0; left: 0; right: 0; bottom: 0;
      display: flex;
      flex-direction: column;
      align-items: center;
      justify-content: center;
      transform: translateY(-16px);
      pointer-events: none;
      gap: var(--ha-space-2, 4px);
    }
    .ch-info * { margin: 0; }
    .ch-label {
      font-size: var(--ha-font-size-l, 16px);
      font-weight: var(--ha-font-weight-medium, 500);
      text-align: center;
      color: inherit;
    }
    .ch-label-disabled {
      color: var(--secondary-text-color);
    }
    ha-big-number {
      color: var(--primary-text-color);
    }
    .ch-dual {
      display: flex;
      flex-direction: row;
      align-items: center;
      gap: var(--ha-space-4, 12px);
      font-size: 24px;
      color: var(--secondary-text-color);
    }
    .ch-target-select {
      background: none;
      border: none;
      padding: 2px 4px;
      border-radius: 8px;
      cursor: pointer;
      pointer-events: auto;
      font: inherit;
      color: inherit;
    }
    .ch-target-select.selected {
      outline: 1px solid var(--secondary-text-color);
    }
    .step-buttons {
      position: absolute;
      bottom: 10px;
      left: 0;
      right: 0;
      margin: 0 auto;
      gap: var(--ha-space-6, 24px);
      display: flex;
      flex-direction: row;
      align-items: center;
      justify-content: center;
      pointer-events: none;
    }
    .step-buttons > * { pointer-events: auto; }
    .step-buttons ha-outlined-icon-button {
      --md-outlined-icon-button-container-width: 48px;
      --md-outlined-icon-button-container-height: 48px;
      --md-outlined-icon-button-icon-size: 24px;
    }
    .ch-controls-container {
      display: flex;
      flex-direction: row;
      margin-top: 8px;
      justify-content: center;
    }
    .ch-controls-scroll {
      display: flex;
      flex-direction: row;
      justify-content: flex-start;
      gap: var(--ha-space-3, 12px);
      margin: auto;
      overflow: auto;
      -ms-overflow-style: none;
      scrollbar-width: none;
    }
    .ch-controls-scroll::-webkit-scrollbar { display: none; }
    .ch-controls-scroll > * {
      min-width: 120px;
      max-width: 160px;
      flex: none;
    }
    @media all and (hover: hover), all and (min-width: 600px) and (min-height: 501px) {
      .ch-controls-scroll {
        justify-content: center;
        flex-wrap: wrap;
        width: 100%;
        max-width: 450px;
      }
      .ch-controls-scroll.items-4 { max-width: 300px; }
      .ch-controls-scroll.items-3 > * { max-width: 140px; }
      .ch-controls-scroll.multiline > * { width: 140px; }
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
