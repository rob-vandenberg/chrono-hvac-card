import{LitElement,html,svg,css}from"https://unpkg.com/lit@2.0.0/index.js?module";import{live}from"https://unpkg.com/lit@2.0.0/directives/live.js?module";const CARD_VERSION="0.0.2",CH_ARC_START=210,CH_ARC_SWEEP=300,CH_DEFAULT_MIN_TEMP=7,CH_DEFAULT_MAX_TEMP=35,CH_DEFAULT_STEP=.5,CH_MODE_COLORS={heat:"#ff8100",cool:"#2196f3",heat_cool:"#7c4dff",auto:"#43a047",dry:"#ffc107",fan_only:"#00bcd4",off:"#8a8a8a",idle:"#8a8a8a"},CH_HVAC_MODE_LABELS={off:"Off",heat:"Heat",cool:"Cool",heat_cool:"Heat/Cool",auto:"Auto",dry:"Dry",fan_only:"Fan only"},CH_HVAC_MODE_ICONS={off:"mdi:power",heat:"mdi:fire",cool:"mdi:snowflake",heat_cool:"mdi:sun-snowflake-variant",auto:"mdi:autorenew",dry:"mdi:water-percent",fan_only:"mdi:fan"},DEFAULT_CONFIG={entity:"",name:"",show_current_temperature:!0,show_current_humidity:!0,show_mode_row:!0,show_preset_row:!0,show_fan_row:!0,show_swing_row:!0};function chCapitalize(e){return e?e.charAt(0).toUpperCase()+e.slice(1).replace(/_/g," "):""}function chParseNumber(e){const t=String(e).replace(",",".");if("-"===t||"-0"===t||t.endsWith("."))return null;if(t.includes(".")&&t.endsWith("0"))return null;if(""===t)return;const i=parseFloat(t);return isNaN(i)?null:i}function chPolarToCartesian(e,t,i,r){const o=r*Math.PI/180;return{x:e+i*Math.sin(o),y:t-i*Math.cos(o)}}function chDescribeArc(e,t,i,r,o){if(o<=r)return"";const a=chPolarToCartesian(e,t,i,r),s=chPolarToCartesian(e,t,i,o),n=o-r<=180?0:1;return`M ${a.x} ${a.y} A ${i} ${i} 0 ${n} 1 ${s.x} ${s.y}`}function chAngleForTemp(e,t,i){return 210+300*Math.min(1,Math.max(0,(e-t)/(i-t)))}function chTempForAngle(e,t,i,r){let o=t+(e-210)/300*(i-t);return o=Math.round(o/r)*r,Math.min(i,Math.max(t,o))}function chTextField(e,t,i,r={}){return html`
    <div class="text-field">
      <label>${e}</label>
      <ch-textfield
        .value=${String(t)}
        type=${r.type||"text"}
        step=${r.step||""}
        min=${void 0!==r.min?r.min:""}
        max=${void 0!==r.max?r.max:""}
        @input=${i}
      ></ch-textfield>
    </div>
  `}function chToggleField(e,t,i){return html`
    <div class="toggle-field">
      <label>${e}</label>
      <ha-switch .checked=${t} @change=${i}></ha-switch>
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
    `}_onInput(e){this.value=e.target.value,this.dispatchEvent(new Event("input",{bubbles:!0,composed:!0}))}}customElements.define("ch-textfield",ChTextfield);class ChFeaturePicker extends LitElement{static properties={label:{type:String},value:{type:String},options:{type:Array},color:{type:String},_open:{state:!0}};constructor(){super(),this._open=!1,this._boundOutsideClick=this._onOutsideClick.bind(this)}disconnectedCallback(){super.disconnectedCallback(),window.removeEventListener("pointerdown",this._boundOutsideClick,!0)}_toggleOpen(e){e.stopPropagation(),this._open=!this._open,this._open?window.addEventListener("pointerdown",this._boundOutsideClick,!0):window.removeEventListener("pointerdown",this._boundOutsideClick,!0)}_onOutsideClick(e){this.contains(e.target)||(this._open=!1,window.removeEventListener("pointerdown",this._boundOutsideClick,!0))}_select(e,t){t.stopPropagation(),this._open=!1,window.removeEventListener("pointerdown",this._boundOutsideClick,!0),this.dispatchEvent(new CustomEvent("change",{detail:{value:e},bubbles:!0,composed:!0}))}render(){const e=this.options||[],t=e.find(e=>e.value===this.value)||{};return html`
      <button class="picker-button" @click=${this._toggleOpen}>
        <ha-icon icon=${t.icon||"mdi:circle-small"}></ha-icon>
        <div class="picker-text">
          <span class="picker-label">${this.label}</span>
          <span class="picker-value">${t.label||this.value}</span>
        </div>
      </button>
      ${this._open?html`
        <div class="picker-popup">
          ${e.map(e=>html`
            <div
              class="picker-option ${e.value===this.value?"active":""}"
              style=${e.value===this.value?`background:${this.color||"var(--ch-active-color,#2196f3)"}`:""}
              @click=${t=>this._select(e.value,t)}
            >
              <ha-icon icon=${e.icon||"mdi:circle-small"}></ha-icon>
              <span>${e.label}</span>
            </div>
          `)}
        </div>
      `:""}
    `}static styles=css`
    :host { position: relative; display: block; }
    .picker-button {
      display: flex;
      align-items: center;
      gap: 10px;
      width: 100%;
      box-sizing: border-box;
      padding: 10px 14px;
      border: none;
      border-radius: 12px;
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
    .picker-label { font-size: 11px; color: var(--secondary-text-color, #999); }
    .picker-value { font-size: 14px; font-weight: 600; }
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
    ha-icon { --mdc-icon-size: 18px; }
  `}customElements.define("ch-feature-picker",ChFeaturePicker);class ChronoHvacCardEditor extends LitElement{static properties={hass:{type:Object},_config:{type:Object}};setConfig(e){this._config={...DEFAULT_CONFIG,...e}}_valueChanged(e,t){if(!this._config||!this.hass)return;let i;i=void 0!==t.detail?.value?t.detail.value:"HA-SWITCH"===t.target.tagName?t.target.checked:t.target.value,this._config={...this._config,[e]:i},this.dispatchEvent(new CustomEvent("config-changed",{detail:{config:this._config},bubbles:!0,composed:!0}))}render(){if(!this._config||!this.hass)return html``;const e=this._config;return html`
      <div class="editor">
        <div class="section-title">Entity</div>
        <ha-entity-picker
          .hass=${this.hass}
          .value=${e.entity}
          .includeDomains=${["climate"]}
          allow-custom-entity
          @value-changed=${e=>this._valueChanged("entity",{detail:{value:e.detail.value}})}
        ></ha-entity-picker>

        ${chTextField("Name (optional)",e.name,e=>this._valueChanged("name",e))}

        <div class="section-title">Display</div>
        ${chToggleField("Show current temperature",e.show_current_temperature,e=>this._valueChanged("show_current_temperature",e))}
        ${chToggleField("Show current humidity",e.show_current_humidity,e=>this._valueChanged("show_current_humidity",e))}

        <div class="section-title">Button rows</div>
        ${chToggleField("Show Mode row",e.show_mode_row,e=>this._valueChanged("show_mode_row",e))}
        ${chToggleField("Show Preset row",e.show_preset_row,e=>this._valueChanged("show_preset_row",e))}
        ${chToggleField("Show Fan mode row",e.show_fan_row,e=>this._valueChanged("show_fan_row",e))}
        ${chToggleField("Show Swing mode row",e.show_swing_row,e=>this._valueChanged("show_swing_row",e))}
      </div>
    `}static styles=css`
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
  `}customElements.define("chrono-hvac-card-editor",ChronoHvacCardEditor);class ChronoHvacCard extends LitElement{static properties={_dragTarget:{type:String},_dragTemp:{type:Object}};constructor(){super(),this._dragTarget=null,this._dragTemp=null,this._boundPointerMove=this._onPointerMove.bind(this),this._boundPointerUp=this._onPointerUp.bind(this)}set hass(e){this._hass=e}get hass(){return this._hass}setConfig(e){if(!e.entity||"climate"!==e.entity.split(".")[0])throw new Error("Specify an entity from the climate domain");this._config={...DEFAULT_CONFIG,...e}}getCardSize(){return 7}static getConfigElement(){return document.createElement("chrono-hvac-card-editor")}static getStubConfig(){return{...DEFAULT_CONFIG}}get _stateObj(){return this.hass?.states[this._config.entity]}_callService(e,t){this.hass.callService("climate",e,{entity_id:this._config.entity,...t})}_handleMoreInfo(){this.dispatchEvent(new CustomEvent("hass-more-info",{detail:{entityId:this._config.entity},bubbles:!0,composed:!0}))}_setHvacMode(e){this._callService("set_hvac_mode",{hvac_mode:e})}_setPresetMode(e){this._callService("set_preset_mode",{preset_mode:e})}_setFanMode(e){this._callService("set_fan_mode",{fan_mode:e})}_setSwingMode(e){this._callService("set_swing_mode",{swing_mode:e})}_step(e,t){const i=this._stateObj;if(!i)return;const r=i.attributes,o=r.target_temp_step||.5,a=r.min_temp??7,s=r.max_temp??35;if(void 0!==r.target_temp_low&&void 0!==r.target_temp_high){const i=r.target_temp_low,n=r.target_temp_high;if("low"===t){const t=Math.min(n,Math.max(a,i+e*o));this._callService("set_temperature",{target_temp_low:t,target_temp_high:n})}else{const t=Math.max(i,Math.min(s,n+e*o));this._callService("set_temperature",{target_temp_low:i,target_temp_high:t})}}else{const t=r.temperature??a,i=Math.min(s,Math.max(a,t+e*o));this._callService("set_temperature",{temperature:i})}}_angleFromPointer(e,t,i){const r=e-(i.left+i.width/2),o=t-(i.top+i.height/2);let a=180*Math.atan2(r,-o)/Math.PI;a<0&&(a+=360);return a<=150&&(a+=360),a<210&&(a=210),a>510&&(a=510),a}_onPointerDown(e){const t=this._stateObj;if(!t||"off"===t.state)return;const i=t.attributes,r=i.min_temp??7,o=i.max_temp??35,a=void 0!==i.target_temp_low&&void 0!==i.target_temp_high,s=e.currentTarget.getBoundingClientRect(),n=this._angleFromPointer(e.clientX,e.clientY,s);if(a){const e=chAngleForTemp(i.target_temp_low,r,o),t=chAngleForTemp(i.target_temp_high,r,o);this._dragTarget=Math.abs(n-e)<=Math.abs(n-t)?"low":"high",this._dragTemp={low:i.target_temp_low,high:i.target_temp_high}}else this._dragTarget="single",this._dragTemp={single:i.temperature??r};this._dialRect=s,window.addEventListener("pointermove",this._boundPointerMove),window.addEventListener("pointerup",this._boundPointerUp),this._onPointerMove(e)}_onPointerMove(e){if(!this._dragTarget)return;const t=this._stateObj.attributes,i=t.min_temp??7,r=t.max_temp??35,o=t.target_temp_step||.5,a=chTempForAngle(this._angleFromPointer(e.clientX,e.clientY,this._dialRect),i,r,o);"single"===this._dragTarget?this._dragTemp={single:a}:"low"===this._dragTarget?this._dragTemp={...this._dragTemp,low:Math.min(a,this._dragTemp.high)}:"high"===this._dragTarget&&(this._dragTemp={...this._dragTemp,high:Math.max(a,this._dragTemp.low)}),this.requestUpdate()}_onPointerUp(){this._dragTarget&&("single"===this._dragTarget?this._callService("set_temperature",{temperature:this._dragTemp.single}):this._callService("set_temperature",{target_temp_low:this._dragTemp.low,target_temp_high:this._dragTemp.high}),this._dragTarget=null,this._dragTemp=null,window.removeEventListener("pointermove",this._boundPointerMove),window.removeEventListener("pointerup",this._boundPointerUp))}_renderButtonRow(e,t,i,r,o){const a=t.map(e=>({value:e,label:CH_HVAC_MODE_LABELS[e]||chCapitalize(e),icon:o&&o[e]||"mdi:circle-small"}));return html`
      <ch-feature-picker
        label=${e}
        .options=${a}
        .value=${i}
        @change=${e=>r(e.detail.value)}
      ></ch-feature-picker>
    `}_renderDial(e){const t=e.attributes,i=e.state,r=(t.hvac_action,t.min_temp??7),o=t.max_temp??35,a=void 0!==t.target_temp_low&&void 0!==t.target_temp_high,s=CH_MODE_COLORS[i]||CH_MODE_COLORS.idle,n=100,l=100,c=88,d=chDescribeArc(n,l,c,210,510);let h="",p=[];if("off"===i);else if(a){const e=this._dragTarget?this._dragTemp.low:t.target_temp_low,i=this._dragTarget?this._dragTemp.high:t.target_temp_high,a=chAngleForTemp(e,r,o),s=chAngleForTemp(i,r,o);h=chDescribeArc(n,l,c,a,s);const d=chPolarToCartesian(n,l,c,a),_=chPolarToCartesian(n,l,c,s);p=[{x:d.x,y:d.y},{x:_.x,y:_.y}]}else{const e=chAngleForTemp(this._dragTarget?this._dragTemp.single:t.temperature??r,r,o);h=chDescribeArc(n,l,c,210,e);const i=chPolarToCartesian(n,l,c,e);p=[{x:i.x,y:i.y}]}return svg`
      <svg viewBox="0 0 200 200" class="dial-svg">
        <path class="dial-track" d=${d}></path>
        ${h?svg`<path class="dial-fill" d=${h} style="stroke:${s}"></path>`:""}
        ${p.map(e=>svg`<circle class="dial-handle" cx=${e.x} cy=${e.y} r="9" style="stroke:${s}"></circle>`)}
      </svg>
    `}_renderCenter(e){const t=e.attributes,i=e.state,r=t.hvac_action,o=void 0!==t.target_temp_low&&void 0!==t.target_temp_high;let a;if(a="idle"===r?"Idle":"off"===i?"Off":CH_HVAC_MODE_LABELS[i]||chCapitalize(i),"off"===i)return html`
        <div class="center">
          <div class="center-label">${a}</div>
        </div>
      `;if(o){const e=this._dragTarget?this._dragTemp.low:t.target_temp_low,i=this._dragTarget?this._dragTemp.high:t.target_temp_high;return html`
        <div class="center">
          <div class="center-label">${a}</div>
          <div class="center-temp-range">
            <span class="center-temp">${e}°</span>
            <span class="center-temp-sep">–</span>
            <span class="center-temp">${i}°</span>
          </div>
        </div>
      `}const s=this._dragTarget?this._dragTemp.single:t.temperature,[n,l]=String(s??"").split(".");return html`
      <div class="center">
        <div class="center-label">${a}</div>
        <div class="center-temp-single">
          <span class="whole">${n}</span>
          <span class="frac">
            <span class="deg">°C</span>
            ${void 0!==l?html`<span class="dec">,${l}</span>`:""}
          </span>
        </div>
      </div>
    `}_renderStepButtons(e){const t=e.attributes;if("off"===e.state)return html``;return void 0!==t.target_temp_low&&void 0!==t.target_temp_high?html`
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
    `}render(){if(!this.hass||!this._config)return html``;const e=this._stateObj;if(!e)return html`
        <ha-card>
          <div class="warning">Entity not found: ${this._config.entity}</div>
        </ha-card>
      `;const t=e.attributes,i=e.state,r=CH_MODE_COLORS[i]||CH_MODE_COLORS.idle,o=t.hvac_modes||[],a=t.preset_modes||[],s=t.fan_modes||[],n=t.swing_modes||[],l=this._config.name||this.hass.states[this._config.entity]?.attributes?.friendly_name||"";return html`
      <ha-card style="--ch-active-color:${r}">
        <div class="header">
          ${l?html`<p class="title">${l}</p>`:""}
          <div class="more-info" @click=${this._handleMoreInfo}>
            <ha-icon icon="mdi:dots-vertical"></ha-icon>
          </div>
        </div>

        <div class="readouts">
          ${this._config.show_current_temperature&&void 0!==t.current_temperature?html`
            <div class="readout">
              <div class="readout-label">Current temperature</div>
              <div class="readout-value">${t.current_temperature}°C</div>
            </div>
          `:html`<div></div>`}
          ${this._config.show_current_humidity&&void 0!==t.current_humidity?html`
            <div class="readout">
              <div class="readout-label">Current humidity</div>
              <div class="readout-value">${t.current_humidity}%</div>
            </div>
          `:html`<div></div>`}
        </div>

        <div class="dial-wrapper" @pointerdown=${this._onPointerDown}>
          ${this._renderDial(e)}
          ${this._renderCenter(e)}
        </div>

        ${this._renderStepButtons(e)}

        <div class="feature-grid">
          ${this._config.show_mode_row&&o.length>1?this._renderButtonRow("Mode",o,i,e=>this._setHvacMode(e),CH_HVAC_MODE_ICONS):""}
          ${this._config.show_preset_row&&a.length?this._renderButtonRow("Preset",a,t.preset_mode,e=>this._setPresetMode(e)):""}
          ${this._config.show_fan_row&&s.length?this._renderButtonRow("Fan mode",s,t.fan_mode,e=>this._setFanMode(e)):""}
          ${this._config.show_swing_row&&n.length?this._renderButtonRow("Swing mode",n,t.swing_mode,e=>this._setSwingMode(e)):""}
        </div>
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
  `}customElements.define("chrono-hvac-card",ChronoHvacCard),console.info("%c CHRONO-HVAC-CARD %c v0.0.2 ","background-color: #ff8100; color: #fff; font-weight: bold; padding: 2px 4px; border-radius: 3px 0 0 3px;","background-color: #1e1e1e; color: #fff; font-weight: bold; padding: 2px 4px; border-radius: 0 3px 3px 0;"),window.customCards=window.customCards||[],window.customCards.push({type:"chrono-hvac-card",name:"Chrono HVAC Card",description:"A visual replica of the native HA thermostat card with capability-driven mode/preset/fan/swing buttons.",preview:!0,config:ChronoHvacCard.getStubConfig()});