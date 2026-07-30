import{LitElement,html,svg,css}from"https://unpkg.com/lit@2.0.0/index.js?module";import{live}from"https://unpkg.com/lit@2.0.0/directives/live.js?module";const CARD_VERSION="1.1.20",CH_ARC_MAX_ANGLE=270,CH_ARC_ROTATE=135,CH_ARC_RADIUS=145,CH_ARC_VIEWBOX=320,CH_ARC_CENTER=160,CH_SLIDER_MODES={auto:"full",cool:"end",dry:"full",fan_only:"full",heat:"start",heat_cool:"full",off:"full"},CH_DEFAULT_MIN_TEMP=7,CH_DEFAULT_MAX_TEMP=35,CH_HVAC_MODE_LABELS={off:"Off",heat:"Heat",cool:"Cool",heat_cool:"Heat/Cool",auto:"Auto",dry:"Dry",fan_only:"Fan only"},CH_HVAC_MODE_ICONS={cool:"mdi:snowflake",dry:"mdi:water-percent",fan_only:"mdi:fan",auto:"mdi:thermostat-auto",heat:"mdi:fire",off:"mdi:power",heat_cool:"mdi:sun-snowflake-variant"},CH_HVAC_MODE_ICON_FALLBACK="mdi:thermostat";function chHvacModeIcon(t){return CH_HVAC_MODE_ICONS[t]||"mdi:thermostat"}const CH_HVAC_MODES_ORDER=["auto","heat_cool","heat","cool","dry","fan_only","off"];function chCompareHvacModes(t,e){return CH_HVAC_MODES_ORDER.indexOf(t)-CH_HVAC_MODES_ORDER.indexOf(e)}const _chPlatformIconsCache={},_chComponentIconsCache={};function chGetIconFromRange(t,e){const i=Object.keys(e).map(Number).filter(t=>!isNaN(t)).sort((t,e)=>t-e);if(!i.length||t<i[0])return;let o=i[0];for(const e of i){if(!(t>=e))break;o=e}return e[String(o)]}function chGetIconFromTranslations(t,e){if(e)return null!=t&&e.state?.[t]?e.state[t]:void 0!==t&&e.range&&!isNaN(Number(t))?chGetIconFromRange(Number(t),e.range)??e.default:e.default}async function chGetPlatformIcons(t,e){if(e in _chPlatformIconsCache)return _chPlatformIconsCache[e];if(!t.config?.components?.includes(e))return;const i=t.callWS({type:"frontend/get_icons",category:"entity",integration:e}).then(t=>t?.resources?.[e]).catch(()=>{});return _chPlatformIconsCache[e]=i,i}async function chGetComponentIcons(t,e){if(e in _chComponentIconsCache)return _chComponentIconsCache[e];if(!t.config?.components?.includes(e))return;const i=t.callWS({type:"frontend/get_icons",category:"entity_component"}).then(t=>t?.resources?.[e]).catch(()=>{});return _chComponentIconsCache[e]=i,i}async function chAttributeIcon(t,e,i,o){const r=e.entity_id.split(".")[0],n=e.attributes.device_class,a=t.entities?.[e.entity_id],s=a?.platform,c=a?.translation_key,l=o??e.attributes[i];let h;if(c&&s){const e=await chGetPlatformIcons(t,s);e&&(h=chGetIconFromTranslations(l,e[r]?.[c]?.state_attributes?.[i]))}if(!h){const e=await chGetComponentIcons(t,r);if(e){h=chGetIconFromTranslations(l,n&&e[n]?.state_attributes?.[i]||e._?.state_attributes?.[i])}}return h}const DEFAULT_CONFIG={entity:"",name:"",show_entity_name_fallback:!0,show_current_temperature:!0,show_current_humidity:!0,show_more_info_button:!1,show_mode_button:!0,show_preset_button:!0,show_fan_button:!0,show_swing_button:!0};function chCapitalize(t){return t?t.charAt(0).toUpperCase()+t.slice(1).replace(/_/g," "):""}function chParseNumber(t){const e=String(t).replace(",",".");if("-"===e||"-0"===e||e.endsWith("."))return null;if(e.includes(".")&&e.endsWith("0"))return null;if(""===e)return;const i=parseFloat(e);return isNaN(i)?null:i}function chSvgArc(t){const{x:e,y:i,r:o,start:r,end:n,rotate:a=0}=t,s=r/180*Math.PI,c=(n/180*Math.PI-s)%(2*Math.PI),l=a/180*Math.PI,h=Math.cos(l),d=Math.sin(l),p=([t,e])=>[h*t-d*e,d*t+h*e],[u,_]=p([o*Math.cos(s),o*Math.sin(s)]).map((t,o)=>t+(0===o?e:i)),[g,m]=p([o*Math.cos(s+c),o*Math.sin(s+c)]).map((t,o)=>t+(0===o?e:i)),f=c>Math.PI?1:0,v=c>0?1:0;return["M",u,_,"A",o,o,l/(2*Math.PI)*360,f,v,g,m].join(" ")}function chClamp(t,e,i){return Math.min(Math.max(t,e),i)}function chValueToPercentage(t,e,i){return(chClamp(t,e,i)-e)/(i-e)}function chStrokeDashArc(t,e,i,o){const r=chValueToPercentage(t,i,o),n=chValueToPercentage(e,i,o),a=290*Math.PI*270/360,s=Math.max((n-r)*a,0);return[`${s} ${a-s}`,`-${r*a-.5}`]}function chStrokeCircleDashArc(t,e,i){return chStrokeDashArc(t,t,e,i)}function chComputeCssVariable(t){return Array.isArray(t)?t.reduceRight((t,e)=>`var(${e}${t?`, ${t}`:""})`,void 0):`var(${t})`}function chSlugify(t){return String(t).toLowerCase().replace(/[^a-z0-9]+/g,"_").replace(/^_+|_+$/g,"")}function chDomainColorProperties(t,e,i,o){const r=chSlugify(i),n=o?"active":"inactive",a=e.attributes.device_class,s=[];return a&&s.push(`--state-${t}-${a}-${r}-color`),s.push(`--state-${t}-${r}-color`,`--state-${t}-${n}-color`,`--state-${n}-color`),s}function chStateActive(t){return"unavailable"!==t&&"unknown"!==t&&"off"!==t}function chStateColorCss(t,e){const i=void 0!==e?e:t.state;if("unavailable"===i)return"var(--state-unavailable-color)";return chComputeCssVariable(chDomainColorProperties("climate",t,i,chStateActive(i)))}function chGetStep(t,e){return e.attributes.target_temp_step?e.attributes.target_temp_step:"°F"===t?.config?.unit_system?.temperature?1:.5}function chDebounce(t,e){let i;const o=(...o)=>{clearTimeout(i),i=setTimeout(()=>t(...o),e)};return o.cancel=()=>clearTimeout(i),o}function chTextField(t,e,i,o={}){return html`
    <div class="text-field">
      <label>${t}</label>
      <ch-textfield
        .value=${String(e)}
        type=${o.type||"text"}
        step=${o.step||""}
        min=${void 0!==o.min?o.min:""}
        max=${void 0!==o.max?o.max:""}
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
    `}_onInput(t){this.value=t.target.value,this.dispatchEvent(new Event("input",{bubbles:!0,composed:!0}))}}customElements.define("ch-textfield",ChTextfield);class ChronoHvacCardEditor extends LitElement{static properties={hass:{type:Object},_config:{type:Object}};setConfig(t){this._config={...DEFAULT_CONFIG,...t}}_valueChanged(t,e){if(!this._config||!this.hass)return;let i;i=void 0!==e.detail?.value?e.detail.value:"HA-SWITCH"===e.target.tagName?e.target.checked:e.target.value,this._config={...this._config,[t]:i},this.dispatchEvent(new CustomEvent("config-changed",{detail:{config:this._config},bubbles:!0,composed:!0}))}render(){if(!this._config||!this.hass)return html``;const t=this._config,e=t.entity?this.hass.states[t.entity]:void 0,i=e?.attributes||{},o=void 0!==i.current_temperature,r=void 0!==i.current_humidity,n=(i.hvac_modes||[]).length>1,a=(i.preset_modes||[]).length>0,s=(i.fan_modes||[]).length>0,c=(i.swing_modes||[]).length>0;return html`
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
        ${chToggleField("Show more-info button",t.show_more_info_button,t=>this._valueChanged("show_more_info_button",t))}
        ${o?chToggleField("Show current temperature",t.show_current_temperature,t=>this._valueChanged("show_current_temperature",t)):""}
        ${r?chToggleField("Show current humidity",t.show_current_humidity,t=>this._valueChanged("show_current_humidity",t)):""}

        ${n||a||s||c?html`
          <div class="section-title">Buttons</div>
          ${n?chToggleField("Show Mode button",t.show_mode_button,t=>this._valueChanged("show_mode_button",t)):""}
          ${a?chToggleField("Show Preset button",t.show_preset_button,t=>this._valueChanged("show_preset_button",t)):""}
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
  `}customElements.define("chrono-hvac-card-editor",ChronoHvacCardEditor);class ChronoHvacCard extends LitElement{static properties={_dragTarget:{type:String},_dragTemp:{type:Object},_stepOverride:{type:Object},_selectedRangeTarget:{type:String}};constructor(){super(),this._dragTarget=null,this._dragTemp=null,this._boundPointerMove=this._onPointerMove.bind(this),this._boundPointerUp=this._onPointerUp.bind(this),this._attrIconCache={},this._selectedRangeTarget="low",this._stepOverride={},this._debouncedStepCommit=chDebounce(()=>this._commitStepOverride(),1e3)}set hass(t){this._hass=t,this.requestUpdate()}get hass(){return this._hass}setConfig(t){if(!t.entity||"climate"!==t.entity.split(".")[0])throw new Error("Specify an entity from the climate domain");this._config={...DEFAULT_CONFIG,...t}}getCardSize(){return 7}static getConfigElement(){return document.createElement("chrono-hvac-card-editor")}static getStubConfig(){return{...DEFAULT_CONFIG}}get _stateObj(){return this.hass?.states[this._config.entity]}_callService(t,e){this.hass.callService("climate",t,{entity_id:this._config.entity,...e})}_handleMoreInfo(){this.dispatchEvent(new CustomEvent("hass-more-info",{detail:{entityId:this._config.entity},bubbles:!0,composed:!0}))}_setHvacMode(t){this._callService("set_hvac_mode",{hvac_mode:t})}_setPresetMode(t){this._callService("set_preset_mode",{preset_mode:t})}_setFanMode(t){this._callService("set_fan_mode",{fan_mode:t})}_setSwingMode(t){this._callService("set_swing_mode",{swing_mode:t})}_effectiveSingle(t){return"single"===this._dragTarget?this._dragTemp.single:void 0!==this._stepOverride.value?this._stepOverride.value:t.temperature}_effectiveLow(t){return this._dragTarget?this._dragTemp.low:void 0!==this._stepOverride.low?this._stepOverride.low:t.target_temp_low}_effectiveHigh(t){return this._dragTarget?this._dragTemp.high:void 0!==this._stepOverride.high?this._stepOverride.high:t.target_temp_high}_commitStepOverride(){const t=this._stateObj;if(!t)return void(this._stepOverride={});const e=t.attributes;if(void 0!==e.target_temp_low&&void 0!==e.target_temp_high){const t=this._stepOverride.low??e.target_temp_low,i=this._stepOverride.high??e.target_temp_high;this._callService("set_temperature",{target_temp_low:t,target_temp_high:i})}else void 0!==this._stepOverride.value&&this._callService("set_temperature",{temperature:this._stepOverride.value});this._stepOverride={}}_step(t,e){const i=this._stateObj;if(!i)return;const o=i.attributes,r=chGetStep(this.hass,i),n=o.min_temp??7,a=o.max_temp??35;if(void 0!==o.target_temp_low&&void 0!==o.target_temp_high){const i=this._effectiveLow(o)??n,s=this._effectiveHigh(o)??a;if("low"===e){const e=chClamp(i+t*r,n,s);this._stepOverride={...this._stepOverride,low:e}}else{const e=chClamp(s+t*r,i,a);this._stepOverride={...this._stepOverride,high:e}}}else{const e=chClamp((this._effectiveSingle(o)??n)+t*r,n,a);this._stepOverride={...this._stepOverride,value:e}}this._debouncedStepCommit()}_percentageFromPointer(t,e,i){const o=t-(i.left+i.width/2),r=e-(i.top+i.height/2);return chClamp(((180*Math.atan2(r,o)/Math.PI+45-135+360)%360-45)/270,0,1)}_findActiveHandle(t,e,i,o,r){const n=Math.max(e??o,o),a=Math.min(i??r,r);return n>=t?"low":a<=t?"high":Math.abs(t-n)<=Math.abs(t-a)?"low":"high"}_onPointerDown(t){const e=this._stateObj;if(!e||"off"===e.state||"unavailable"===e.state)return;const i=e.attributes,o=i.min_temp??7,r=i.max_temp??35,n=void 0!==i.target_temp_low&&void 0!==i.target_temp_high,a=this.renderRoot.querySelector(".dial-wrapper").getBoundingClientRect(),s=o+this._percentageFromPointer(t.clientX,t.clientY,a)*(r-o);n?(this._dragTarget=this._findActiveHandle(s,i.target_temp_low,i.target_temp_high,o,r),this._dragTemp={low:i.target_temp_low,high:i.target_temp_high}):(this._dragTarget="single",this._dragTemp={single:i.temperature??o}),this._dialRect=a,window.addEventListener("pointermove",this._boundPointerMove),window.addEventListener("pointerup",this._boundPointerUp),this._onPointerMove(t)}_onPointerMove(t){if(!this._dragTarget)return;const e=this._stateObj,i=e.attributes,o=i.min_temp??7,r=i.max_temp??35,n=chGetStep(this.hass,e),a=o+this._percentageFromPointer(t.clientX,t.clientY,this._dialRect)*(r-o),s=chClamp(Math.round(a/n)*n,o,r);"single"===this._dragTarget?this._dragTemp={single:s}:"low"===this._dragTarget?this._dragTemp={...this._dragTemp,low:Math.min(s,this._dragTemp.high)}:"high"===this._dragTarget&&(this._dragTemp={...this._dragTemp,high:Math.max(s,this._dragTemp.low)}),this.requestUpdate()}_onPointerUp(){this._dragTarget&&("single"===this._dragTarget?this._callService("set_temperature",{temperature:this._dragTemp.single}):(this._selectedRangeTarget=this._dragTarget,this._callService("set_temperature",{target_temp_low:this._dragTemp.low,target_temp_high:this._dragTemp.high})),this._dragTarget=null,this._dragTemp=null,window.removeEventListener("pointermove",this._boundPointerMove),window.removeEventListener("pointerup",this._boundPointerUp))}_getAttributeIcon(t,e){const i=`${t}:${e}`;if(i in this._attrIconCache)return this._attrIconCache[i];this._attrIconCache[i]=void 0;const o=this._stateObj;chAttributeIcon(this.hass,o,t,e).then(t=>{this._attrIconCache[i]=t||null,this.requestUpdate()})}_renderModeRow(t,e){const i=[...t].sort(chCompareHvacModes).map(t=>({value:t,label:CH_HVAC_MODE_LABELS[t]||chCapitalize(t),icon:chHvacModeIcon(t)}));return html`
      <ha-control-select-menu
        .label=${"Mode"}
        .value=${e}
        .options=${i}
        @wa-select=${t=>{const i=t.detail?.item?.value;void 0!==i&&i!==e&&this._setHvacMode(i)}}
      >
        <ha-icon slot="icon" icon=${chHvacModeIcon(e)}></ha-icon>
      </ha-control-select-menu>
    `}_renderAttributeRow(t,e,i,o,r){const n=i.map(t=>({value:t,label:CH_HVAC_MODE_LABELS[t]||chCapitalize(t)}));return html`
      <ha-control-select-menu
        .label=${t}
        .value=${o}
        .options=${n}
        .renderIcon=${t=>{const i=this._getAttributeIcon(e,t);return html`<ha-icon icon=${i||"mdi:circle-small"}></ha-icon>`}}
        @wa-select=${t=>{const e=t.detail?.item?.value;void 0!==e&&e!==o&&r(e)}}
      >
        <ha-icon slot="icon" icon=${this._getAttributeIcon(e,o)||"mdi:circle-small"}></ha-icon>
      </ha-control-select-menu>
    `}_renderArcGroup(t,e,i,o,r,n){const a=chSvgArc({x:0,y:0,start:0,end:270,r:145}),s="end"===e?o:i,c=r??s,l=t??s,h=null!=t,d=h?("end"===e?l<=c:"start"===e&&c<=l)?"end"===e?chStrokeDashArc(l,c,i,o):chStrokeDashArc(c,l,i,o):chStrokeCircleDashArc(l,i,o):null,p="full"===e?chStrokeDashArc(i,o,i,o):"end"===e?chStrokeDashArc(l,s,i,o):chStrokeDashArc(s,l,i,o),u=h?chStrokeCircleDashArc(l,i,o):null;return svg`
      <g>
        <path class="ch-arc ch-arc-clear" d=${a} stroke-dasharray=${p[0]} stroke-dashoffset=${p[1]}></path>
        <path class="ch-arc ch-arc-colored" style="stroke:${n}" d=${a} stroke-dasharray=${p[0]} stroke-dashoffset=${p[1]}></path>
        ${d?svg`<path class="ch-arc ch-arc-active" style="stroke:${n}" d=${a} stroke-dasharray=${d[0]} stroke-dashoffset=${d[1]}></path>`:""}
        ${u?svg`
          <path class="ch-target-border" style="stroke:${n}" d=${a} stroke-dasharray=${u[0]} stroke-dashoffset=${u[1]}></path>
          <path class="ch-target" d=${a} stroke-dasharray=${u[0]} stroke-dashoffset=${u[1]}></path>
        `:""}
      </g>
    `}_renderDial(t){const e=t.attributes,i=t.state,o=e.min_temp??7,r=e.max_temp??35,n=void 0!==e.target_temp_low&&void 0!==e.target_temp_high,a=e.current_temperature,s=chSvgArc({x:0,y:0,start:0,end:270,r:145}),c=null!=a&&a<=r&&a>=o?chStrokeCircleDashArc(a,o,r):null;let l;if(n){const t=this._effectiveLow(e),i=this._effectiveHigh(e);l=svg`
        ${this._renderArcGroup(t,"start",o,r,a,"var(--ch-low-color)")}
        ${this._renderArcGroup(i,"end",o,r,a,"var(--ch-high-color)")}
      `}else{const t=this._effectiveSingle(e),n=(e.hvac_modes||[]).filter(t=>["heat","cool","heat_cool"].includes(t)),s=1===n.length&&["off","auto"].includes(i)?n[0]:i,c=CH_SLIDER_MODES[s]||"full";l=this._renderArcGroup(t,c,o,r,a,"var(--ch-state-color)")}return svg`
      <svg viewBox="0 0 ${320} ${320}" class="dial-svg" overflow="visible">
        <g transform="translate(${160} ${160}) rotate(${135})">
          <path class="ch-track-bg" d=${s}></path>
          ${c?svg`<path class="ch-current-marker" d=${s} stroke-dasharray=${c[0]} stroke-dashoffset=${c[1]}></path>`:""}
          ${l}
          <path
            class="ch-interaction ${"off"===i||"unavailable"===i?"disabled":""}"
            d=${s}
            @pointerdown=${this._onPointerDown}
          ></path>
        </g>
      </svg>
    `}_renderCenter(t){const e=t.attributes,i=t.state,o=e.hvac_action,r=void 0!==e.target_temp_low&&void 0!==e.target_temp_high;if("unavailable"===i)return html`
        <div class="ch-info">
          <p class="ch-label ch-label-disabled">Unavailable</p>
        </div>
      `;const n=chGetStep(this.hass,t),a=String(n).split(".")?.[1]?.length??0,s={minimumFractionDigits:a,maximumFractionDigits:a},c=o&&"off"!==o?chCapitalize(o):CH_HVAC_MODE_LABELS[i]||chCapitalize(i);if(r){const t=this._effectiveLow(e),i=this._effectiveHigh(e);return html`
        <div class="ch-info">
          <p class="ch-label">${c}</p>
          <div class="ch-dual">
            <button class="ch-target-select ${"low"===this._selectedRangeTarget?"selected":""}" @click=${()=>{this._selectedRangeTarget="low"}}>
              <ha-big-number .value=${t} unit="°C" unit-position="top" .formatOptions=${s}></ha-big-number>
            </button>
            <span>–</span>
            <button class="ch-target-select ${"high"===this._selectedRangeTarget?"selected":""}" @click=${()=>{this._selectedRangeTarget="high"}}>
              <ha-big-number .value=${i} unit="°C" unit-position="top" .formatOptions=${s}></ha-big-number>
            </button>
          </div>
        </div>
      `}const l=this._effectiveSingle(e);return html`
      <div class="ch-info">
        <p class="ch-label">${c}</p>
        ${null!=l?html`<ha-big-number .value=${l} unit="°C" unit-position="top" .formatOptions=${s}></ha-big-number>`:""}
      </div>
    `}_renderStepButtons(t){const e=t.attributes,i=t.state;if("off"===i||"unavailable"===i)return html``;const o=void 0!==e.target_temp_low&&void 0!==e.target_temp_high,r=o?this._selectedRangeTarget||"low":"single";let n;o&&chStateActive(i)&&(n=chStateColorCss(t,"high"===r?"cool":"heat"));const a=n?`--md-sys-color-outline:${n}`:"";return html`
      <div class="step-buttons">
        <ha-outlined-icon-button style=${a} @click=${()=>this._step(-1,r)}>
          <ha-icon icon="mdi:minus"></ha-icon>
        </ha-outlined-icon-button>
        <ha-outlined-icon-button style=${a} @click=${()=>this._step(1,r)}>
          <ha-icon icon="mdi:plus"></ha-icon>
        </ha-outlined-icon-button>
      </div>
    `}render(){if(!this.hass||!this._config)return html``;const t=this._stateObj;if(!t)return html`
        <ha-card>
          <div class="warning">Entity not found: ${this._config.entity}</div>
        </ha-card>
      `;const e=t.attributes,i=t.state,o=chStateActive(i),r=chStateColorCss(t),n=chStateColorCss(t,o?"heat":"off"),a=chStateColorCss(t,o?"cool":"off"),s=e.hvac_modes||[],c=e.preset_modes||[],l=e.fan_modes||[],h=e.swing_modes||[],d=this.hass.states[this._config.entity]?.attributes?.friendly_name||"",p=this._config.name||(this._config.show_entity_name_fallback?d:""),u=[];this._config.show_mode_button&&s.length>1&&u.push(this._renderModeRow(s,i)),this._config.show_preset_button&&c.length&&u.push(this._renderAttributeRow("Preset","preset_mode",c,e.preset_mode,t=>this._setPresetMode(t))),this._config.show_fan_button&&l.length&&u.push(this._renderAttributeRow("Fan mode","fan_mode",l,e.fan_mode,t=>this._setFanMode(t))),this._config.show_swing_button&&h.length&&u.push(this._renderAttributeRow("Swing mode","swing_mode",h,e.swing_mode,t=>this._setSwingMode(t)));const _=`ch-controls-scroll items-${u.length}${u.length>=4?" multiline":""}`,g=this._config.show_current_temperature&&void 0!==e.current_temperature,m=this._config.show_current_humidity&&void 0!==e.current_humidity,f=this._config.show_more_info_button;return html`
      <ha-card
        .header=${p}
        style="--ch-state-color:${r};--ch-low-color:${n};--ch-high-color:${a}"
      >
        ${f?html`
          <div class="more-info" @click=${this._handleMoreInfo}>
            <ha-icon icon="mdi:dots-vertical"></ha-icon>
          </div>
        `:""}

        <div class="content">
          ${g||m?html`
            <div class="readouts ${g&&m?"":"single"}">
              ${g?html`
                <div class="readout">
                  <div class="readout-label">Current temperature</div>
                  <div class="readout-value">${e.current_temperature}°C</div>
                </div>
              `:""}
              ${m?html`
                <div class="readout">
                  <div class="readout-label">Current humidity</div>
                  <div class="readout-value">${e.current_humidity}%</div>
                </div>
              `:""}
            </div>
          `:""}

          <div class="dial-wrapper">
            ${this._renderDial(t)}
            ${this._renderCenter(t)}
            ${this._renderStepButtons(t)}
          </div>

          ${u.length?html`
            <div class="ch-controls-container">
              <div class="${_}">
                ${u}
              </div>
            </div>
          `:""}
        </div>
      </ha-card>
    `}static styles=css`
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
      padding: 16px;
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
      margin: 0 auto;
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
  `}customElements.define("chrono-hvac-card",ChronoHvacCard),console.info("%c CHRONO-%cHVAC%c-CARD %c v1.1.20 ","background-color: #101010; color: #FFFFFF; font-weight: bold; padding: 2px 0 2px 4px; border-radius: 3px 0 0 3px;","background-color: #101010; color: #4676d3; font-weight: bold; padding: 2px 0;","background-color: #101010; color: #FFFFFF; font-weight: bold; padding: 2px 4px 2px 0;","background-color: #1E1E1E; color: #FFFFFF; font-weight: bold; padding: 2px 4px; border-radius: 0 3px 3px 0;"),window.customCards=window.customCards||[],window.customCards.push({type:"chrono-hvac-card",name:"Chrono HVAC Card",description:"A visual replica of the native HA thermostat card with capability-driven mode/preset/fan/swing buttons.",preview:!0,config:ChronoHvacCard.getStubConfig()});