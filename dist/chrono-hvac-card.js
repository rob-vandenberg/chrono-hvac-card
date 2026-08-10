import{LitElement,html,svg,css}from"https://unpkg.com/lit@2.0.0/index.js?module";import{live}from"https://unpkg.com/lit@2.0.0/directives/live.js?module";const CARD_VERSION="1.4.57",CH_HVAC_MODE_LABELS={off:"Off",heat:"Heat",cool:"Cool",heat_cool:"Heat/Cool",auto:"Auto",dry:"Dry",fan_only:"Fan only"},CH_HVAC_MODE_ICONS={cool:"mdi:snowflake",dry:"mdi:water-percent",fan_only:"mdi:fan",auto:"mdi:thermostat-auto",heat:"mdi:fire",off:"mdi:power",heat_cool:"mdi:sun-snowflake-variant"},CH_HVAC_MODE_ICON_FALLBACK="mdi:thermostat";function chHvacModeIcon(t){return CH_HVAC_MODE_ICONS[t]||"mdi:thermostat"}const CH_HVAC_MODES_ORDER=["auto","heat_cool","heat","cool","dry","fan_only","off"];function chCompareHvacModes(t,e){return CH_HVAC_MODES_ORDER.indexOf(t)-CH_HVAC_MODES_ORDER.indexOf(e)}const _chPlatformIconsCache={},_chComponentIconsCache={};function chGetIconFromRange(t,e){const o=Object.keys(e).map(Number).filter(t=>!isNaN(t)).sort((t,e)=>t-e);if(!o.length||t<o[0])return;let i=o[0];for(const e of o){if(!(t>=e))break;i=e}return e[String(i)]}function chGetIconFromTranslations(t,e){if(e)return null!=t&&e.state?.[t]?e.state[t]:void 0!==t&&e.range&&!isNaN(Number(t))?chGetIconFromRange(Number(t),e.range)??e.default:e.default}async function chGetPlatformIcons(t,e){if(e in _chPlatformIconsCache)return _chPlatformIconsCache[e];if(!t.config?.components?.includes(e))return;const o=t.callWS({type:"frontend/get_icons",category:"entity",integration:e}).then(t=>t?.resources?.[e]).catch(()=>{});return _chPlatformIconsCache[e]=o,o}async function chGetComponentIcons(t,e){if(e in _chComponentIconsCache)return _chComponentIconsCache[e];if(!t.config?.components?.includes(e))return;const o=t.callWS({type:"frontend/get_icons",category:"entity_component"}).then(t=>t?.resources?.[e]).catch(()=>{});return _chComponentIconsCache[e]=o,o}async function chAttributeIcon(t,e,o,i){const n=e.entity_id.split(".")[0],a=e.attributes.device_class,r=t.entities?.[e.entity_id],s=r?.platform,c=r?.translation_key,l=i??e.attributes[o];let d;if(c&&s){const e=await chGetPlatformIcons(t,s);e&&(d=chGetIconFromTranslations(l,e[n]?.[c]?.state_attributes?.[o]))}if(!d){const e=await chGetComponentIcons(t,n);if(e){d=chGetIconFromTranslations(l,a&&e[a]?.state_attributes?.[o]||e._?.state_attributes?.[o])}}return d}const DEFAULT_CONFIG={entity:"",name:"",show_entity_name_fallback:!0,show_current_temperature:!0,show_current_humidity:!0,show_more_info_button:!1,show_mode_button:!0,show_preset_button:!0,show_fan_button:!0,show_swing_button:!0};function chCapitalize(t){return t?t.charAt(0).toUpperCase()+t.slice(1).replace(/_/g," "):""}function chParseNumber(t){const e=String(t).replace(",",".");if("-"===e||"-0"===e||e.endsWith("."))return null;if(e.includes(".")&&e.endsWith("0"))return null;if(""===e)return;const o=parseFloat(e);return isNaN(o)?null:o}function chTextField(t,e,o,i={}){return html`
    <div class="text-field">
      <label>${t}</label>
      <ch-textfield
        .value=${String(e)}
        type=${i.type||"text"}
        step=${i.step||""}
        min=${void 0!==i.min?i.min:""}
        max=${void 0!==i.max?i.max:""}
        @input=${o}
      ></ch-textfield>
    </div>
  `}function chToggleField(t,e,o){return html`
    <div class="toggle-field">
      <label>${t}</label>
      <ha-switch .checked=${e} @change=${o}></ha-switch>
    </div>
  `}class ChTextfield extends LitElement{static properties={value:{type:String},type:{type:String},step:{type:String},min:{type:String},max:{type:String},placeholder:{type:String}};static styles=css`
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
  `;render(){return html`
      <input
        .value=${live(this.value??"")}
        type=${this.type||"text"}
        step=${this.step||""}
        min=${this.min||""}
        max=${this.max||""}
        placeholder=${this.placeholder||""}
        @input=${this._onInput}
      />
    `}_onInput(t){this.value=t.target.value,this.dispatchEvent(new Event("input",{bubbles:!0,composed:!0}))}}customElements.define("ch-textfield",ChTextfield);class ChronoHvacCardEditor extends LitElement{static properties={hass:{type:Object},_config:{type:Object}};setConfig(t){this._config={...DEFAULT_CONFIG,...t}}_valueChanged(t,e){if(!this._config||!this.hass)return;let o;o=void 0!==e.detail?.value?e.detail.value:"HA-SWITCH"===e.target.tagName?e.target.checked:e.target.value,this._config={...this._config,[t]:o},this.dispatchEvent(new CustomEvent("config-changed",{detail:{config:this._config},bubbles:!0,composed:!0}))}render(){if(!this._config||!this.hass)return html``;const t=this._config,e=t.entity?this.hass.states[t.entity]:void 0,o=e?.attributes||{},i=void 0!==o.current_temperature,n=void 0!==o.current_humidity,a=(o.hvac_modes||[]).length>1,r=(o.preset_modes||[]).length>0,s=(o.fan_modes||[]).length>0,c=(o.swing_modes||[]).length>0;return html`
      <div class="editor">
        <div class="section-title">Entity</div>
        <ha-entity-picker
          .hass=${this.hass}
          .value=${t.entity}
          .includeDomains=${["climate"]}
          allow-custom-entity
          @value-changed=${t=>this._valueChanged("entity",{detail:{value:t.detail.value}})}
        ></ha-entity-picker>

        <div class="name-toggle-grid">
          ${chTextField("Name (optional)",t.name,t=>this._valueChanged("name",t))}
          <div class="toggle-spacer">
            <span class="spacer-label">&nbsp;</span>
            <span class="spacer-control">
              <ha-switch .checked=${t.show_entity_name_fallback} @change=${t=>this._valueChanged("show_entity_name_fallback",t)}></ha-switch>
            </span>
          </div>
        </div>

        <div class="section-title">Display</div>
        ${chToggleField("Show card border",!1!==t.show_border,t=>this._valueChanged("show_border",t))}
        ${chToggleField("Show more-info button",t.show_more_info_button,t=>this._valueChanged("show_more_info_button",t))}
        ${i?chToggleField("Show current temperature",t.show_current_temperature,t=>this._valueChanged("show_current_temperature",t)):""}
        ${n?chToggleField("Show current humidity",t.show_current_humidity,t=>this._valueChanged("show_current_humidity",t)):""}

        ${a||r||s||c?html`
          <div class="section-title">Buttons</div>
          ${a?chToggleField("Show Mode button",t.show_mode_button,t=>this._valueChanged("show_mode_button",t)):""}
          ${r?chToggleField("Show Preset button",t.show_preset_button,t=>this._valueChanged("show_preset_button",t)):""}
          ${s?chToggleField("Show Fan mode button",t.show_fan_button,t=>this._valueChanged("show_fan_button",t)):""}
          ${c?chToggleField("Show Swing mode button",t.show_swing_button,t=>this._valueChanged("show_swing_button",t)):""}
        `:""}
      </div>
    `}static styles=css`
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
  `}customElements.define("chrono-hvac-card-editor",ChronoHvacCardEditor);class ChronoHvacCard extends LitElement{static properties={_containerHeight:{state:!0}};constructor(){super(),this._attrIconCache={},this._containerHeight=void 0}firstUpdated(){this._resizeObserver=new ResizeObserver(t=>{const e=t[0]?.target.shadowRoot?.querySelector(".dial-container");this._containerHeight=e?.clientHeight}),this._resizeObserver.observe(this)}disconnectedCallback(){super.disconnectedCallback(),this._resizeObserver?.disconnect()}set hass(t){this._hass=t,this.requestUpdate()}get hass(){return this._hass}setConfig(t){if(!t.entity||"climate"!==t.entity.split(".")[0])throw new Error("Specify an entity from the climate domain");this._config={...DEFAULT_CONFIG,...t}}getCardSize(){return 7}static getConfigElement(){return document.createElement("chrono-hvac-card-editor")}static getStubConfig(t){const e=Object.keys(t?.states||{}).filter(t=>t.startsWith("climate."));return{...DEFAULT_CONFIG,entity:e[0]||""}}get _stateObj(){return this.hass?.states[this._config.entity]}_callService(t,e){this.hass.callService("climate",t,{entity_id:this._config.entity,...e})}_handleMoreInfo(){this.dispatchEvent(new CustomEvent("hass-more-info",{detail:{entityId:this._config.entity},bubbles:!0,composed:!0}))}_setHvacMode(t){this._callService("set_hvac_mode",{hvac_mode:t})}_setPresetMode(t){this._callService("set_preset_mode",{preset_mode:t})}_setFanMode(t){this._callService("set_fan_mode",{fan_mode:t})}_setSwingMode(t){this._callService("set_swing_mode",{swing_mode:t})}_getAttributeIcon(t,e){const o=`${t}:${e}`;if(o in this._attrIconCache)return this._attrIconCache[o];this._attrIconCache[o]=void 0;const i=this._stateObj;chAttributeIcon(this.hass,i,t,e).then(t=>{this._attrIconCache[o]=t||null,this.requestUpdate()})}_renderModeRow(t,e,o){const i=[...t].sort(chCompareHvacModes).map(t=>({value:t,label:CH_HVAC_MODE_LABELS[t]||chCapitalize(t),icon:chHvacModeIcon(t)}));return html`
      <ha-control-select-menu
        class="mode-button mode-button-mode"
        .label=${"Mode"}
        .value=${e}
        .options=${i}
        .disabled=${o}
        @wa-select=${t=>{const o=t.detail?.item?.value;void 0!==o&&o!==e&&this._setHvacMode(o)}}
      >
        <ha-icon class="mode-button-icon mode-button-icon-mode" slot="icon" icon=${chHvacModeIcon(e)}></ha-icon>
      </ha-control-select-menu>
    `}_renderAttributeRow(t,e,o,i,n,a){const r=o.map(t=>({value:t,label:CH_HVAC_MODE_LABELS[t]||chCapitalize(t)})),s=`mode-button-${e.replace(/_mode$/,"")}`,c=`mode-button-icon-${e.replace(/_mode$/,"")}`;return html`
      <ha-control-select-menu
        class="mode-button ${s}"
        .label=${t}
        .value=${i}
        .options=${r}
        .renderIcon=${t=>{const o=this._getAttributeIcon(e,t);return html`<ha-icon icon=${o||"mdi:circle-small"}></ha-icon>`}}
        .disabled=${a}
        @wa-select=${t=>{const e=t.detail?.item?.value;void 0!==e&&e!==i&&n(e)}}
      >
        <ha-icon class="mode-button-icon ${c}" slot="icon" icon=${this._getAttributeIcon(e,i)||"mdi:circle-small"}></ha-icon>
      </ha-control-select-menu>
    `}render(){if(!this.hass||!this._config)return html``;const t=this._stateObj;if(!t)return html`
        <ha-card>
          <div class="warning">Entity not found: ${this._config.entity}</div>
        </ha-card>
      `;const e=t.attributes,o=t.state,i=e.hvac_modes||[],n=e.preset_modes||[],a=e.fan_modes||[],r=e.swing_modes||[],s=this.hass.states[this._config.entity]?.attributes?.friendly_name||"",c=this._config.name||(this._config.show_entity_name_fallback?s:""),l="unavailable"===o,d=[];this._config.show_mode_button&&i.length>1&&d.push(this._renderModeRow(i,o,l)),this._config.show_preset_button&&n.length&&d.push(this._renderAttributeRow("Preset","preset_mode",n,e.preset_mode,t=>this._setPresetMode(t),l)),this._config.show_fan_button&&a.length&&d.push(this._renderAttributeRow("Fan mode","fan_mode",a,e.fan_mode,t=>this._setFanMode(t),l)),this._config.show_swing_button&&r.length&&d.push(this._renderAttributeRow("Swing mode","swing_mode",r,e.swing_mode,t=>this._setSwingMode(t),l));const h=this._config.show_current_temperature&&void 0!==e.current_temperature,u=this._config.show_current_humidity&&void 0!==e.current_humidity,m=this._config.show_more_info_button;return html`
      <ha-card .header=${c} class="ha-card ${!1===this._config.show_border?"no-border":""}">
        ${m?html`
          <ha-icon-button class="more-info" label="Show more info" @click=${this._handleMoreInfo} tabindex="0">
            <ha-icon icon="mdi:dots-vertical"></ha-icon>
          </ha-icon-button>
        `:""}
        <div class="hvac-content">
        ${h||u?html`
          <div class="readouts">
            ${h?html`
              <div class="readout readout-temperature">
                <p class="readout-label readout-label-temperature">Current temperature</p>
                <p class="readout-value readout-value-temperature">${e.current_temperature}°C</p>
              </div>
            `:""}
            ${u?html`
              <div class="readout readout-humidity">
                <p class="readout-label readout-label-humidity">Current humidity</p>
                <p class="readout-value readout-value-humidity">${e.current_humidity}%</p>
              </div>
            `:""}
          </div>
        `:""}

        <div class="controls">
        <div class="dial-container">
          <ha-state-control-climate-temperature
            class="dial"
            style=${this._containerHeight?`max-width:${this._containerHeight}px`:""}
            prevent-interaction-on-scroll
            show-secondary
            .stateObj=${t}
          ></ha-state-control-climate-temperature>
        </div>

        ${d.length?html`
          <div class="mode-buttons">
            ${d}
          </div>
        `:""}
        </div>
        </div>
      </ha-card>
    `}static styles=css`
    :host {
      display: block;
      position: relative;
      height: 100%;
      font-family: var(--ha-font-family-body, inherit);
    }
    ha-card {
      position: relative;
      height: 100%;
      width: 100%;
      padding: 0;
      background: var(--card-background-color, #1a1a1a);
      color: var(--primary-text-color, #fff);
      border-radius: var(--ha-card-border-radius, 12px);
      box-sizing: border-box;
    }
    ha-card.no-border {
      border-width: 0;
    }
    .hvac-content {
      position: relative;
      width: 100%;
      display: flex;
      flex-direction: column;
      align-items: center;
      justify-content: space-between;
      overflow: hidden;
      box-sizing: border-box;
      padding: var(--hvac-content-padding, 8px);
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
      margin-bottom: var(--readouts-margin-bottom, 18px);
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
      margin-bottom: var(--readout-label-margin-bottom, 2px);
    }
    .readout-value {
      font-size: var(--ha-font-size-xl);
      font-weight: var(--ha-font-weight-medium);
      line-height: var(--ha-line-height-condensed);
      direction: ltr;
    }
    .controls {
      display: flex;
      flex-direction: column;
      align-items: center;
      width: 100%;
      box-sizing: border-box;
      flex: 1;
      margin-top: var(--controls-margin-top, 8px);
      margin-bottom: var(--controls-margin-bottom, 8px);
    }
    .dial-container {
      display: flex;
      align-items: center;
      justify-content: center;
      position: relative;
      overflow: hidden;
      max-width: 100%;
      box-sizing: border-box;
      flex: 1;
      margin-bottom: var(--dial-container-margin-bottom, 16px);
    }
    .dial-container::before {
      content: "";
      display: block;
      padding-top: 100%;
    }
    .dial-container > * {
      padding: var(--dial-padding, 8px);
    }
    .mode-buttons {
      display: grid;
      grid-template-columns: repeat(auto-fit, minmax(var(--mode-button-min-width, 112px), 1fr));
      justify-content: center;
      flex: none;
      gap: var(--ha-space-3, 12px);
      width: 100%;
      max-width: var(--mode-buttons-max-width, 320px);
      box-sizing: border-box;
      overflow: auto;
      -ms-overflow-style: none;
      scrollbar-width: none;
    }
    .mode-buttons::-webkit-scrollbar { display: none; }
    .mode-buttons > * {
      width: clamp(var(--mode-button-min-width, 112px), 100%, var(--mode-button-max-width, 140px));
      justify-self: center;
    }

  `}customElements.define("chrono-hvac-card",ChronoHvacCard),console.info("%c CHRONO-%cHVAC%c-CARD %c v1.4.57 ","background-color: #101010; color: #FFFFFF; font-weight: bold; padding: 2px 0 2px 4px; border-radius: 3px 0 0 3px;","background-color: #101010; color: #4676d3; font-weight: bold; padding: 2px 0;","background-color: #101010; color: #FFFFFF; font-weight: bold; padding: 2px 4px 2px 0;","background-color: #1E1E1E; color: #FFFFFF; font-weight: bold; padding: 2px 4px; border-radius: 0 3px 3px 0;"),window.customCards=window.customCards||[],window.customCards.push({type:"chrono-hvac-card",name:"Chrono HVAC Card",description:"A visual replica of the native HA thermostat card with capability-driven mode/preset/fan/swing buttons.",preview:!0,config:ChronoHvacCard.getStubConfig()});