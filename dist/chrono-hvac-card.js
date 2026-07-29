import{LitElement,html,svg,css}from"https://unpkg.com/lit@2.0.0/index.js?module";import{live}from"https://unpkg.com/lit@2.0.0/directives/live.js?module";const CARD_VERSION="0.0.9",CH_ARC_START=210,CH_ARC_SWEEP=300,CH_DEFAULT_MIN_TEMP=7,CH_DEFAULT_MAX_TEMP=35,CH_DEFAULT_STEP=.5,CH_MODE_COLORS={heat:"#ff8100",cool:"#2196f3",heat_cool:"#7c4dff",auto:"#43a047",dry:"#ffc107",fan_only:"#00bcd4",off:"#8a8a8a",idle:"#8a8a8a"},CH_HVAC_MODE_LABELS={off:"Off",heat:"Heat",cool:"Cool",heat_cool:"Heat/Cool",auto:"Auto",dry:"Dry",fan_only:"Fan only"},CH_HVAC_MODE_ICONS={cool:"mdi:snowflake",dry:"mdi:water-percent",fan_only:"mdi:fan",auto:"mdi:thermostat-auto",heat:"mdi:fire",off:"mdi:power",heat_cool:"mdi:sun-snowflake-variant"},CH_HVAC_MODE_ICON_FALLBACK="mdi:thermostat";function chHvacModeIcon(t){return CH_HVAC_MODE_ICONS[t]||"mdi:thermostat"}const CH_HVAC_MODES_ORDER=["auto","heat_cool","heat","cool","dry","fan_only","off"];function chCompareHvacModes(t,e){return CH_HVAC_MODES_ORDER.indexOf(t)-CH_HVAC_MODES_ORDER.indexOf(e)}const _chPlatformIconsCache={},_chComponentIconsCache={};function chGetIconFromRange(t,e){const i=Object.keys(e).map(Number).filter(t=>!isNaN(t)).sort((t,e)=>t-e);if(!i.length||t<i[0])return;let n=i[0];for(const e of i){if(!(t>=e))break;n=e}return e[String(n)]}function chGetIconFromTranslations(t,e){if(e)return null!=t&&e.state?.[t]?e.state[t]:void 0!==t&&e.range&&!isNaN(Number(t))?chGetIconFromRange(Number(t),e.range)??e.default:e.default}async function chGetPlatformIcons(t,e){if(e in _chPlatformIconsCache)return _chPlatformIconsCache[e];if(!t.config?.components?.includes(e))return;const i=t.callWS({type:"frontend/get_icons",category:"entity",integration:e}).then(t=>t?.resources?.[e]).catch(()=>{});return _chPlatformIconsCache[e]=i,i}async function chGetComponentIcons(t,e){if(e in _chComponentIconsCache)return _chComponentIconsCache[e];if(!t.config?.components?.includes(e))return;const i=t.callWS({type:"frontend/get_icons",category:"entity_component"}).then(t=>t?.resources?.[e]).catch(()=>{});return _chComponentIconsCache[e]=i,i}async function chAttributeIcon(t,e,i,n){const o=e.entity_id.split(".")[0],a=e.attributes.device_class,r=t.entities?.[e.entity_id],s=r?.platform,c=r?.translation_key,l=n??e.attributes[i];let h;if(c&&s){const e=await chGetPlatformIcons(t,s);e&&(h=chGetIconFromTranslations(l,e[o]?.[c]?.state_attributes?.[i]))}if(!h){const e=await chGetComponentIcons(t,o);if(e){h=chGetIconFromTranslations(l,a&&e[a]?.state_attributes?.[i]||e._?.state_attributes?.[i])}}return h}const DEFAULT_CONFIG={entity:"",name:"",show_entity_name_fallback:!0,show_current_temperature:!0,show_current_humidity:!0,show_more_info_button:!0,show_mode_button:!0,show_preset_button:!0,show_fan_button:!0,show_swing_button:!0};function chCapitalize(t){return t?t.charAt(0).toUpperCase()+t.slice(1).replace(/_/g," "):""}function chParseNumber(t){const e=String(t).replace(",",".");if("-"===e||"-0"===e||e.endsWith("."))return null;if(e.includes(".")&&e.endsWith("0"))return null;if(""===e)return;const i=parseFloat(e);return isNaN(i)?null:i}function chPolarToCartesian(t,e,i,n){const o=n*Math.PI/180;return{x:t+i*Math.sin(o),y:e-i*Math.cos(o)}}function chDescribeArc(t,e,i,n,o){if(o<=n)return"";const a=chPolarToCartesian(t,e,i,n),r=chPolarToCartesian(t,e,i,o),s=o-n<=180?0:1;return`M ${a.x} ${a.y} A ${i} ${i} 0 ${s} 1 ${r.x} ${r.y}`}function chAngleForTemp(t,e,i){return 210+300*Math.min(1,Math.max(0,(t-e)/(i-e)))}function chTempForAngle(t,e,i,n){let o=e+(t-210)/300*(i-e);return o=Math.round(o/n)*n,Math.min(i,Math.max(e,o))}function chTextField(t,e,i,n={}){return html`
    <div class="text-field">
      <label>${t}</label>
      <ch-textfield
        .value=${String(e)}
        type=${n.type||"text"}
        step=${n.step||""}
        min=${void 0!==n.min?n.min:""}
        max=${void 0!==n.max?n.max:""}
        @input=${i}
      ></ch-textfield>
    </div>
  `}function chToggleField(t,e,i){return html`
    <div class="toggle-field">
      <label>${t}</label>
      <ha-switch .checked=${e} @change=${i}></ha-switch>
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
    `}_onInput(t){this.value=t.target.value,this.dispatchEvent(new Event("input",{bubbles:!0,composed:!0}))}}customElements.define("ch-textfield",ChTextfield);class ChronoHvacCardEditor extends LitElement{static properties={hass:{type:Object},_config:{type:Object}};setConfig(t){this._config={...DEFAULT_CONFIG,...t}}_valueChanged(t,e){if(!this._config||!this.hass)return;let i;i=void 0!==e.detail?.value?e.detail.value:"HA-SWITCH"===e.target.tagName?e.target.checked:e.target.value,this._config={...this._config,[t]:i},this.dispatchEvent(new CustomEvent("config-changed",{detail:{config:this._config},bubbles:!0,composed:!0}))}render(){if(!this._config||!this.hass)return html``;const t=this._config,e=t.entity?this.hass.states[t.entity]:void 0,i=e?.attributes||{},n=void 0!==i.current_temperature,o=void 0!==i.current_humidity,a=(i.hvac_modes||[]).length>1,r=(i.preset_modes||[]).length>0,s=(i.fan_modes||[]).length>0,c=(i.swing_modes||[]).length>0;return html`
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
          <ha-switch .checked=${t.show_entity_name_fallback} @change=${t=>this._valueChanged("show_entity_name_fallback",t)}></ha-switch>
        </div>

        <div class="section-title">Display</div>
        ${chToggleField("Show more-info button",t.show_more_info_button,t=>this._valueChanged("show_more_info_button",t))}
        ${n?chToggleField("Show current temperature",t.show_current_temperature,t=>this._valueChanged("show_current_temperature",t)):""}
        ${o?chToggleField("Show current humidity",t.show_current_humidity,t=>this._valueChanged("show_current_humidity",t)):""}

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
      align-items: end;
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
  `}customElements.define("chrono-hvac-card-editor",ChronoHvacCardEditor);class ChronoHvacCard extends LitElement{static properties={_dragTarget:{type:String},_dragTemp:{type:Object}};constructor(){super(),this._dragTarget=null,this._dragTemp=null,this._boundPointerMove=this._onPointerMove.bind(this),this._boundPointerUp=this._onPointerUp.bind(this),this._attrIconCache={}}set hass(t){this._hass=t}get hass(){return this._hass}setConfig(t){if(!t.entity||"climate"!==t.entity.split(".")[0])throw new Error("Specify an entity from the climate domain");this._config={...DEFAULT_CONFIG,...t}}getCardSize(){return 7}static getConfigElement(){return document.createElement("chrono-hvac-card-editor")}static getStubConfig(){return{...DEFAULT_CONFIG}}get _stateObj(){return this.hass?.states[this._config.entity]}_callService(t,e){this.hass.callService("climate",t,{entity_id:this._config.entity,...e})}_handleMoreInfo(){this.dispatchEvent(new CustomEvent("hass-more-info",{detail:{entityId:this._config.entity},bubbles:!0,composed:!0}))}_setHvacMode(t){this._callService("set_hvac_mode",{hvac_mode:t})}_setPresetMode(t){this._callService("set_preset_mode",{preset_mode:t})}_setFanMode(t){this._callService("set_fan_mode",{fan_mode:t})}_setSwingMode(t){this._callService("set_swing_mode",{swing_mode:t})}_step(t,e){const i=this._stateObj;if(!i)return;const n=i.attributes,o=n.target_temp_step||.5,a=n.min_temp??7,r=n.max_temp??35;if(void 0!==n.target_temp_low&&void 0!==n.target_temp_high){const i=n.target_temp_low,s=n.target_temp_high;if("low"===e){const e=Math.min(s,Math.max(a,i+t*o));this._callService("set_temperature",{target_temp_low:e,target_temp_high:s})}else{const e=Math.max(i,Math.min(r,s+t*o));this._callService("set_temperature",{target_temp_low:i,target_temp_high:e})}}else{const e=n.temperature??a,i=Math.min(r,Math.max(a,e+t*o));this._callService("set_temperature",{temperature:i})}}_angleFromPointer(t,e,i){const n=t-(i.left+i.width/2),o=e-(i.top+i.height/2);let a=180*Math.atan2(n,-o)/Math.PI;a<0&&(a+=360);return a<=150&&(a+=360),a<210&&(a=210),a>510&&(a=510),a}_onPointerDown(t){const e=this._stateObj;if(!e||"off"===e.state)return;const i=e.attributes,n=i.min_temp??7,o=i.max_temp??35,a=void 0!==i.target_temp_low&&void 0!==i.target_temp_high,r=t.currentTarget.getBoundingClientRect(),s=this._angleFromPointer(t.clientX,t.clientY,r);if(a){const t=chAngleForTemp(i.target_temp_low,n,o),e=chAngleForTemp(i.target_temp_high,n,o);this._dragTarget=Math.abs(s-t)<=Math.abs(s-e)?"low":"high",this._dragTemp={low:i.target_temp_low,high:i.target_temp_high}}else this._dragTarget="single",this._dragTemp={single:i.temperature??n};this._dialRect=r,window.addEventListener("pointermove",this._boundPointerMove),window.addEventListener("pointerup",this._boundPointerUp),this._onPointerMove(t)}_onPointerMove(t){if(!this._dragTarget)return;const e=this._stateObj.attributes,i=e.min_temp??7,n=e.max_temp??35,o=e.target_temp_step||.5,a=chTempForAngle(this._angleFromPointer(t.clientX,t.clientY,this._dialRect),i,n,o);"single"===this._dragTarget?this._dragTemp={single:a}:"low"===this._dragTarget?this._dragTemp={...this._dragTemp,low:Math.min(a,this._dragTemp.high)}:"high"===this._dragTarget&&(this._dragTemp={...this._dragTemp,high:Math.max(a,this._dragTemp.low)}),this.requestUpdate()}_onPointerUp(){this._dragTarget&&("single"===this._dragTarget?this._callService("set_temperature",{temperature:this._dragTemp.single}):this._callService("set_temperature",{target_temp_low:this._dragTemp.low,target_temp_high:this._dragTemp.high}),this._dragTarget=null,this._dragTemp=null,window.removeEventListener("pointermove",this._boundPointerMove),window.removeEventListener("pointerup",this._boundPointerUp))}_getAttributeIcon(t,e){const i=`${t}:${e}`;if(i in this._attrIconCache)return this._attrIconCache[i];this._attrIconCache[i]=void 0;const n=this._stateObj;chAttributeIcon(this.hass,n,t,e).then(t=>{this._attrIconCache[i]=t||null,this.requestUpdate()})}_renderModeRow(t,e){const i=[...t].sort(chCompareHvacModes).map(t=>({value:t,label:CH_HVAC_MODE_LABELS[t]||chCapitalize(t),icon:chHvacModeIcon(t)}));return html`
      <ha-control-select-menu
        .label=${"Mode"}
        .value=${e}
        .options=${i}
        @wa-select=${t=>{const i=t.detail?.item?.value;void 0!==i&&i!==e&&this._setHvacMode(i)}}
      >
        <ha-icon slot="icon" icon=${chHvacModeIcon(e)}></ha-icon>
      </ha-control-select-menu>
    `}_renderAttributeRow(t,e,i,n,o){const a=i.map(t=>({value:t,label:CH_HVAC_MODE_LABELS[t]||chCapitalize(t)}));return html`
      <ha-control-select-menu
        .label=${t}
        .value=${n}
        .options=${a}
        .renderIcon=${t=>{const i=this._getAttributeIcon(e,t);return html`<ha-icon icon=${i||"mdi:circle-small"}></ha-icon>`}}
        @wa-select=${t=>{const e=t.detail?.item?.value;void 0!==e&&e!==n&&o(e)}}
      >
        <ha-icon slot="icon" icon=${this._getAttributeIcon(e,n)||"mdi:circle-small"}></ha-icon>
      </ha-control-select-menu>
    `}_renderDial(t){const e=t.attributes,i=t.state,n=(e.hvac_action,e.min_temp??7),o=e.max_temp??35,a=void 0!==e.target_temp_low&&void 0!==e.target_temp_high,r=CH_MODE_COLORS[i]||CH_MODE_COLORS.idle,s=100,c=100,l=88,h=chDescribeArc(s,c,l,210,510);let d="",_=[];if("off"===i);else if(a){const t=this._dragTarget?this._dragTemp.low:e.target_temp_low,i=this._dragTarget?this._dragTemp.high:e.target_temp_high,a=chAngleForTemp(t,n,o),r=chAngleForTemp(i,n,o);d=chDescribeArc(s,c,l,a,r);const h=chPolarToCartesian(s,c,l,a),p=chPolarToCartesian(s,c,l,r);_=[{x:h.x,y:h.y},{x:p.x,y:p.y}]}else{const t=chAngleForTemp(this._dragTarget?this._dragTemp.single:e.temperature??n,n,o);d=chDescribeArc(s,c,l,210,t);const i=chPolarToCartesian(s,c,l,t);_=[{x:i.x,y:i.y}]}return svg`
      <svg viewBox="0 0 200 200" class="dial-svg">
        <path class="dial-track" d=${h}></path>
        ${d?svg`<path class="dial-fill" d=${d} style="stroke:${r}"></path>`:""}
        ${_.map(t=>svg`<circle class="dial-handle" cx=${t.x} cy=${t.y} r="9" style="stroke:${r}"></circle>`)}
      </svg>
    `}_renderCenter(t){const e=t.attributes,i=t.state,n=e.hvac_action,o=void 0!==e.target_temp_low&&void 0!==e.target_temp_high;let a;if(a="idle"===n?"Idle":"off"===i?"Off":CH_HVAC_MODE_LABELS[i]||chCapitalize(i),"off"===i)return html`
        <div class="center">
          <div class="center-label">${a}</div>
        </div>
      `;if(o){const t=this._dragTarget?this._dragTemp.low:e.target_temp_low,i=this._dragTarget?this._dragTemp.high:e.target_temp_high;return html`
        <div class="center">
          <div class="center-label">${a}</div>
          <div class="center-temp-range">
            <span class="center-temp">${t}°</span>
            <span class="center-temp-sep">–</span>
            <span class="center-temp">${i}°</span>
          </div>
        </div>
      `}const r=this._dragTarget?this._dragTemp.single:e.temperature,[s,c]=String(r??"").split(".");return html`
      <div class="center">
        <div class="center-label">${a}</div>
        <div class="center-temp-single">
          <span class="whole">${s}</span>
          <span class="frac">
            <span class="deg">°C</span>
            ${void 0!==c?html`<span class="dec">,${c}</span>`:""}
          </span>
        </div>
      </div>
    `}_renderStepButtons(t){const e=t.attributes;if("off"===t.state)return html``;return void 0!==e.target_temp_low&&void 0!==e.target_temp_high?html`
        <div class="step-buttons">
          <div class="step-pair">
            <button @click=${()=>this._step(-1,"low")}>−</button>
            <span class="step-label">Low</span>
            <button @click=${()=>this._step(1,"low")}>+</button>
          </div>
          <div class="step-pair">
            <button @click=${()=>this._step(-1,"high")}>−</button>
            <span class="step-label">High</span>
            <button @click=${()=>this._step(1,"high")}>+</button>
          </div>
        </div>
      `:html`
      <div class="step-buttons">
        <button @click=${()=>this._step(-1,"single")}>−</button>
        <button @click=${()=>this._step(1,"single")}>+</button>
      </div>
    `}render(){if(!this.hass||!this._config)return html``;const t=this._stateObj;if(!t)return html`
        <ha-card>
          <div class="warning">Entity not found: ${this._config.entity}</div>
        </ha-card>
      `;const e=t.attributes,i=t.state,n=CH_MODE_COLORS[i]||CH_MODE_COLORS.idle,o=e.hvac_modes||[],a=e.preset_modes||[],r=e.fan_modes||[],s=e.swing_modes||[],c=this.hass.states[this._config.entity]?.attributes?.friendly_name||"",l=this._config.name||(this._config.show_entity_name_fallback?c:""),h=[];this._config.show_mode_button&&o.length>1&&h.push(this._renderModeRow(o,i)),this._config.show_preset_button&&a.length&&h.push(this._renderAttributeRow("Preset","preset_mode",a,e.preset_mode,t=>this._setPresetMode(t))),this._config.show_fan_button&&r.length&&h.push(this._renderAttributeRow("Fan mode","fan_mode",r,e.fan_mode,t=>this._setFanMode(t))),this._config.show_swing_button&&s.length&&h.push(this._renderAttributeRow("Swing mode","swing_mode",s,e.swing_mode,t=>this._setSwingMode(t)));const d=`ch-controls-scroll items-${h.length}${h.length>=4?" multiline":""}`,_=this._config.show_current_temperature&&void 0!==e.current_temperature,p=this._config.show_current_humidity&&void 0!==e.current_humidity,m=this._config.show_more_info_button;return html`
      <ha-card style="--ch-active-color:${n}">
        ${l||m?html`
          <div class="header">
            ${l?html`<p class="title">${l}</p>`:""}
            ${m?html`
              <div class="more-info" @click=${this._handleMoreInfo}>
                <ha-icon icon="mdi:dots-vertical"></ha-icon>
              </div>
            `:""}
          </div>
        `:""}

        ${_||p?html`
          <div class="readouts ${_&&p?"":"single"}">
            ${_?html`
              <div class="readout">
                <div class="readout-label">Current temperature</div>
                <div class="readout-value">${e.current_temperature}°C</div>
              </div>
            `:""}
            ${p?html`
              <div class="readout">
                <div class="readout-label">Current humidity</div>
                <div class="readout-value">${e.current_humidity}%</div>
              </div>
            `:""}
          </div>
        `:""}

        <div class="dial-wrapper" @pointerdown=${this._onPointerDown}>
          ${this._renderDial(t)}
          ${this._renderCenter(t)}
        </div>

        ${this._renderStepButtons(t)}

        ${h.length?html`
          <div class="ch-controls-container">
            <div class="${d}">
              ${h}
            </div>
          </div>
        `:""}
      </ha-card>
    `}static styles=css`
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
    .readouts.single {
      display: flex;
      justify-content: center;
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
    .ch-controls-container {
      display: flex;
      flex-direction: row;
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
  `}customElements.define("chrono-hvac-card",ChronoHvacCard),console.info("%c CHRONO-HVAC-CARD %c v0.0.9 ","background-color: #ff8100; color: #fff; font-weight: bold; padding: 2px 4px; border-radius: 3px 0 0 3px;","background-color: #1e1e1e; color: #fff; font-weight: bold; padding: 2px 4px; border-radius: 0 3px 3px 0;"),window.customCards=window.customCards||[],window.customCards.push({type:"chrono-hvac-card",name:"Chrono HVAC Card",description:"A visual replica of the native HA thermostat card with capability-driven mode/preset/fan/swing buttons.",preview:!0,config:ChronoHvacCard.getStubConfig()});