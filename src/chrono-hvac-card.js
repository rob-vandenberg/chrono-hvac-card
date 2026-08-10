import { LitElement, html, svg, css } from 'https://unpkg.com/lit@2.0.0/index.js?module';
import { live } from 'https://unpkg.com/lit@2.0.0/directives/live.js?module';

// ─── Card Version ─────────────────────────────────────────────────────────────
const CARD_VERSION = '1.4.53';

// ─── Card Version History ─────────────────────────────────────────────────────
// v1.4.53: [User-directed] Step 2 of styles: support - converted cosmetic/
//          spacing/sizing literal values in static styles to
//          var(--name, default), following chrono-slider-card's convention.
//          Structural/functional properties (display, position, box-sizing,
//          the dial-container::before aspect-ratio trick, scrollbar-hiding)
//          intentionally left literal - not exposed as overridable, since
//          doing so risks breaking layout mechanics. No prefixing on any
//          variable name (explicit user decision - names stay simple,
//          guessable, matching the class they belong to). One deliberate
//          exception: ha-card's border-radius uses the real HA global token
//          name var(--ha-card-border-radius, 12px) rather than a separate
//          custom name, since <ha-card> is HA's real native component and
//          already reads that exact variable internally (confirmed from
//          ha-card.ts source) - this ties our default into HA's own live
//          theming mechanism instead of a disconnected duplicate knob.
//          New variables: --ha-card-border-radius, --warning-padding,
//          --readouts-padding, --readouts-margin-bottom,
//          --readout-label-opacity, --readout-label-letter-spacing,
//          --readout-label-margin-bottom, --dial-container-margin-bottom,
//          --dial-padding, --mode-buttons-max-width, --mode-button-min-width,
//          --mode-button-max-width (the last two shared between the grid
//          track's minmax() and the item's clamp(), deliberately, so they
//          can't drift out of sync if only one is overridden).
// v1.4.52: [User-directed] Step 1 of styles: support - DOM structure and
//          classname pass only, no visual/behavioral change. Mirrors
//          chrono-slider-card's shared+unique classname convention
//          (e.g. control-button/control-button-open there ->
//          mode-button/mode-button-mode here). Renamed .container ->
//          .dial-container (avoids the collision with HA's own native
//          .container inside hui-sections-view, discovered this session)
//          and .current -> .readouts. Added classes that were previously
//          entirely absent: ha-card itself, the two readout wrapper divs
//          (readout/readout-temperature, readout/readout-humidity), their
//          label/value <p> tags, the dial element, each of the four mode/
//          preset/fan/swing buttons (mode-button/mode-button-<type>), and
//          each button's icon (mode-button-icon/mode-button-icon-<type>).
//          .card-content intentionally kept, unlike slider-card which has
//          no equivalent wrapper - it's required for ha-card.ts's own
//          automatic conditional padding mechanism (documented earlier
//          this project), which slider-card doesn't rely on. All CSS
//          selectors updated to match; no property values changed. var()
//          conversion is a separate, later step.
// v1.3.51: [User-directed, spec-verified] Fixed v1.3.50's justify-self:center
//          making each button size to its own icon+label content instead of
//          its track (measured: 82/87/106/120px, all below the 112px floor,
//          all different per label length). Confirmed via CSS Working Group
//          thread (fantasai/Palmgren): the fit-content(track-size) override
//          triggered by non-stretch justify-self is explicitly conditioned
//          on the item's width being 'auto'. Changed .mode-buttons > *'s
//          width from auto (via unset width + min/max-width) to an explicit
//          width: clamp(112px, 100%, 140px) - not 'auto', so the fit-content
//          override doesn't apply; the 100% still ties it to the real,
//          continuously-shrinking track width, floored/ceilinged by the
//          clamp(), and justify-self:center can now center the resulting
//          non-ambiguous box normally.
// v1.3.50: [User-directed, spec-verified] Fixed v1.3.49's grid not actually
//          shrinking. Root cause, confirmed via CSS Working Group discussion:
//          repeat(auto-fit, minmax(min,max)) decides column COUNT using the
//          max argument only when that max is a definite length - with
//          minmax(112px, 140px) (both definite), the count was decided using
//          140px, identical to the old fixed-width behavior, so the 112px
//          floor never actually applied. Fixed by changing the max argument
//          to 1fr: minmax(112px, 1fr) - fr is explicitly not "definite" for
//          this purpose (confirmed: "the fr value is ignored for repetition
//          purposes"), so column count now uses the 112px min instead,
//          giving genuine continuous shrink 140->112 before a column drops.
//          Since 1fr would otherwise let a lone item stretch to fill an
//          entire wide row, .mode-buttons > * now caps itself at
//          max-width:140px with justify-self:center, capping visual growth
//          while the track itself can still be wider.
// v1.3.49: [User-directed] Replaced all per-item-count CSS (items-4,
//          items-3, multiline) with a single universal rule that applies
//          identically regardless of how many buttons are present (1, 2,
//          3, 4, or more). .mode-buttons now uses
//          grid-template-columns: repeat(auto-fit, minmax(112px, 140px))
//          with max-width:320px (matches the dial's real measured width
//          at 1920x1080, up from the old 300px). auto-fit/minmax
//          continuously shrinks buttons from 140px down to 112px before
//          dropping a column, and Grid's default auto-placement wraps any
//          excess items onto new rows automatically - no per-count
//          selectors needed. With a 320px cap, 3 buttons at minimum width
//          (360px) can never fit on one line, so columns are capped at 2
//          purely by that arithmetic: 4 buttons -> 2x2, 3 -> 2+1,
//          5 -> 2+2+1, 6 -> 2+2+2, etc. Removed modeButtonsClass (the old
//          items-${length}/multiline string) - .mode-buttons is now a
//          plain, unparameterized class.
// v1.3.48: [User-measured] Made the 4-button case's width continuously
//          shrinkable instead of a fixed 140px. .mode-buttons.multiline > *
//          now uses flex:1 1 140px with min-width:112px, max-width:140px
//          (overrides the shared .mode-buttons > * min-width:120px for this
//          case only, via 2-class specificity). Buttons shrink together as
//          available width drops below the 292px needed for two 140px
//          buttons + gap, floor at 112px (matches the 244px budget measured
//          inside chrono-popup at a 360px viewport). Below the 236px needed
//          for two 112px buttons, flex-wrap forces a single column, where
//          the lone button grows back to its 140px max-width. 2-item/
//          3-item cases untouched.
// v1.3.47: [User-measured] Removed .mode-buttons' padding:0 12px 0 12px.
//          User's DevTools measurement confirmed .mode-buttons box was
//          300px wide (items-4 max-width) with 12px horizontal padding on
//          a border-box element, leaving only 276px content width - 16px
//          short of the 292px needed for 2x140px buttons + 12px gap,
//          causing the 1-column collapse. .card-content's own automatic
//          16px/side padding (from ha-card.ts) still keeps the row off
//          the card edges without this element's own padding.
// v1.3.46: Restructured the mode/fan/swing button row to follow the same
//          pattern chrono-slider-card uses for its .favorites section:
//          the wrapping row is now a direct child of a column-flex parent
//          (.controls) instead of being nested inside its own row-flex
//          wrapper (.ch-controls-container). That nested-row-in-row
//          structure was the actual cause of the v1.3.45 min-width:auto
//          issue reappearing as a 4-buttons-in-1-column bug - as a cross-
//          axis child of a column flex parent, the row is no longer subject
//          to the flexbox auto-minimum-size special case at all, verified
//          against chrono-slider-card_1.8.80.js's own working .favorites
//          implementation (ha-card > section.favorites, same relationship).
//          Also renamed ch-controls-container/ch-controls-scroll (merged
//          into one element) to .mode-buttons for a more intuitive name,
//          matching .favorites' naming style. items-4/items-3/multiline
//          column-forcing logic and all pixel values otherwise unchanged.
// v1.3.45: Fixed mode/fan/swing buttons becoming unreachable on mobile.
//          Root cause: .ch-controls-scroll (the button row) is a flex item
//          of a row flex container (.ch-controls-container) and had no
//          min-width override, so it kept the flexbox default min-width:auto
//          and refused to shrink below its content's width - meaning its own
//          overflow:auto never engaged and the excess was clipped by
//          .card-content's overflow:hidden instead of being reachable.
//          Fixed by adding min-width:0. Also removed the
//          @media (hover:hover), (min-width:600px) and (min-height:501px)
//          gate around the flex-wrap:wrap rules so wrapping applies
//          universally instead of only on hover-capable/wide viewports -
//          narrow touch devices now wrap the row instead of relying on
//          horizontal scroll.
// v1.2.44: [Rule: zero negative margins, forbidden going forward] Removed
//          .card-content's margin-top:-12px (added v1.2.37 as a workaround
//          for ha-card's unreachable internal header padding). Compensated
//          by reducing .current's own padding-top 20px->8px, keeping the
//          same net 24px gap when a header exists (16px header padding + 8px
//          = 24px, same as before: 16 + (-12) + 20 = 24), built entirely
//          from positive spacing. Root cause of the no-name/no-header
//          collapse bug: the flat -12px was applied unconditionally, but
//          ha-card.ts's own CSS treats header-present vs header-absent
//          .card-content differently (confirmed from source) - so the same
//          -12px landed on two different baselines and only produced a
//          correct result in the header-present case. .current's padding-top
//          doesn't depend on that conditional, so both cases should now be
//          consistent. [Not yet re-measured on the no-header entity -
//          reasoning-based, pending verification.]
// v1.2.43: Added show_border config option (default true) with editor toggle.
//          ha-card's border comes from ha-card.ts's own default CSS
//          (border-width: var(--ha-card-border-width, 1px), confirmed from
//          source) - when off, a .no-border class sets border-width:0 on our
//          own <ha-card> element, overriding it directly rather than via any
//          theme variable. [Self-caught during this edit: an earlier
//          str_replace briefly dropped DEFAULT_CONFIG's closing brace and
//          the Helpers section comment header - caught and fixed before
//          delivery, verified via node -c and diff below.]
// v1.2.42: [User-measured] .current (readout block): padding-top 12px->20px,
//          margin-bottom 26px->18px (net 38px unchanged). Shifts the block
//          down 8px from its own top spacing, not the title's, keeping the
//          arc and everything below in the same position.
// v1.2.41: [User-measured] Removed .ch-controls-container's own
//          padding-bottom:12px + margin-bottom:4px (16px combined) - was
//          stacking on top of ha-card.ts's automatic padding:var(--ha-space-4)
//          (16px) on .card-content since the v1.2.38 rename, doubling the
//          bottom gap. User confirmed this was the only misaligned block;
//          everything else already correct.
// v1.2.40: Removed height:100% from .card-content. Was circular now that
//          getGridOptions() no longer forces a fixed pixel height on ha-card
//          (v1.2.39): a child asking for 100% of a parent whose own height
//          is determined by that same child has no definite value to
//          resolve against, so the browser let .card-content overshoot
//          ha-card's real box - confirmed by measurement: ha-card bottom
//          edge at 718.8, .ch-controls-container (mode buttons) bottom edge
//          at 761.8, a 43px overflow past the card's own border. Content
//          (title/readouts/arc/buttons) now correctly determines the card's
//          height, with nothing fighting against it.
// v1.2.39: Deleted getGridOptions() entirely. Per explicit project rule: the
//          card must contain zero code that knows about or adapts to any
//          specific container/layout system (sections, masonry, panel, etc).
//          hui-thermostat-card.ts defines getGridOptions() because HA wrote
//          it and made that choice for their own card; we are not doing the
//          same. Card content (title/readouts/arc/buttons) now determines
//          the card's natural height/width entirely on its own; per-instance
//          resizing remains available to the user via the dashboard's own UI
//          (e.g. sections view's Layout tab), same as any card without this
//          method. This also resolves the edit-mode clipping bug from
//          earlier (card rendering 622px inside a fixed 312px grid cell),
//          since the card no longer requests a fixed row height at all.
// v1.2.38: Four changes: 1) ha-card: added height:100%/width:100%, matching
//          hui-thermostat-card.ts source - fixes edit-mode overflow bug
//          (verified: ha-card was rendering 622px inside a 312px grid cell).
//          2) .content renamed to .card-content, matching ha-card.ts's own
//          ::slotted(.card-content) selector (real automatic padding from
//          ha-card itself, previously missing since "content" didn't match).
//          3) Readouts markup/CSS rewritten from .readouts/.readout to
//          .current/<p class="label">/<p class="value">, matching more-info-
//          climate.ts's real .current class and markup exactly (existing
//          user-tuned margin-bottom:26px preserved, not reverted to source's
//          var(--ha-space-10)). 4) .container and .ch-controls-container now
//          wrapped in a shared .controls div (flex:1, column), matching the
//          reference DOM's grouping - existing margin-bottom values on
//          .container/.ch-controls-container preserved as-is internally.
//          [Disclosed] spacing may need re-tuning after this pass, since
//          .card-content's newly-real automatic padding stacks with existing
//          manual margins that were tuned against the old (padding-less)
//          .content div.
// v1.2.37: 1) .readouts padding-top 0->12px. 2) [Workaround, disclosed] title's
//          padding-bottom cannot be reduced directly - it's inside ha-card's own
//          shadow DOM with no exposed hook - so .content gets margin-top:-12px
//          instead, same visual result via a different mechanism. 3) Fixed
//          v1.2.33 regression: .more-info was nested inside .content (anchoring
//          position:absolute to .content's top, next to readouts, not the
//          title) - moved back to a direct child of ha-card, and re-added
//          position:relative to ha-card (was moved to .content only in v1.2.33,
//          leaving ha-card without a positioning context).
// v1.2.36: [Disclosed, not source-verified] User-measured: .container margin-
//          bottom 14px->16px (+2px), .ch-controls-container margin-bottom
//          6px->4px (-2px). Net-zero swap: shifts controls block down 2px
//          without moving readouts/dial or total card height.
// v1.2.35: [Disclosed, not source-verified] User-measured manual spacing
//          adjustment, not derived from native source: .readouts margin-bottom
//          40px->26px (-14px), .container margin-bottom 0->14px (+14px),
//          .ch-controls-container margin-bottom 0->6px (+6px). Moves the dial
//          block up 14px without moving readouts or controls positions.
// v1.2.34: Add margin-bottom: var(--ha-space-10) to .readouts, matching
//          more-info-climate.ts's .current class exactly (was missing).
//          Fixes tight current-temp-to-arc spacing.
// v1.2.33: Fix title alignment: ha-card is plain block again (matching v1.1.23),
//          flex/align-items:center layout moved to new .content wrapper div.
//          ha-card.header's internal h1 was being centered/shrunk by
//          align-items:center previously on ha-card itself.
// v1.2.32: Restored title to ha-card's own built-in .header property, matching
//          v1.1.23 (the last version confirmed correct) and verified against
//          real ha-card.ts source: ha-card renders <h1 class="card-header">
//          internally (24px, padding 12px/16px/16px) when .header is set -
//          this is what the custom:more-info-card reference actually uses,
//          confirmed via user-provided DevTools inspection (h1.card-header,
//          24px, 12px 16px 16px - exact match to ha-card.ts's own CSS).
//          Removes the <p class="title"> markup (wrong element, introduced
//          between v1.1.23 and v1.2.24) and its now-dead .title CSS rule.
//          Nothing else changed: ha-card's padding:0/layout untouched,
//          .more-info still a direct child of ha-card as before.
// v1.2.31: Fixed v1.2.30's ResizeObserver to literally match hui-thermostat-
// v1.2.31: Fixed v1.2.30's ResizeObserver to literally match hui-thermostat-
//          card.ts's ResizeController, verified against source: (1) now
//          observes the host card element itself (`this`), not .container
//          directly, matching source's `new ResizeController(this, {...})`;
//          (2) the callback no longer trusts the ResizeObserver entry's own
//          contentRect - it re-queries .container fresh from the shadow root
//          on every callback and reads its live clientHeight, matching
//          source's `entries[0]?.target.shadowRoot?.querySelector(".container")
//          ?.clientHeight` exactly; (3) removed the `if (height)` guard -
//          value is now assigned unconditionally every callback, matching
//          source (source has no guard). Root cause of v1.2.30's tiny-dial/
//          missing-buttons bug: observing .container directly meant a
//          transient early measurement (before the child custom element
//          upgraded) could lock in permanently, since .container's own box
//          height is set by flex:1 within a fixed-height ha-card and never
//          resizes again on its own to trigger a correcting callback.
//          disconnectedCallback() and all CSS unchanged - already correct.
// v1.2.30: Restored the max-width capping behavior removed in v1.2.29, using
//          the browser's native, built-in ResizeObserver instead of the
//          CORS-blocked @lit-labs/observers package - zero import, zero CDN
//          dependency, same measurement/result as source's ResizeController
//          (measures .container's rendered height, applied as max-width on the
//          dial). Set up once in firstUpdated() (observing .container),
//          disconnected in disconnectedCallback(). New _containerHeight
//          reactive property holds the measured value.
// v1.2.29: Fix v1.2.27/28's fatal load failure - confirmed via console output
//          that unpkg.com does not serve @lit-labs/observers with the CORS
//          headers browsers require, so the import threw and the whole card
//          module failed to register (showing as HA's generic "Configuration
//          error"). Removed the import, the _resizeController setup, and the
//          now-unused max-width style binding on
//          <ha-state-control-climate-temperature>. .container's CSS is
//          unchanged and remains fully correct on its own (confirmed working
//          since v1.2.26). [Disclosed, accepted] without this refinement, an
//          unusually short-but-wide card could let the dial slightly overflow
//          .container's overflow:hidden - user-confirmed native has this exact
//          same behavior in that scenario, so this is not a new gap versus
//          native, just an un-fixed one native doesn't fully solve either.
// v1.2.28: FUNDAMENTAL ARCHITECTURE CHANGE for block 3 (the arc, +/- buttons,
//          and center temperature). Every previous version of this block was a
//          from-scratch reimplementation of native's geometry, color, drag,
//          keyboard, and touch logic - each attempt introduced its own subtle
//          divergence from source, several of which caused real regressions
//          tonight. Replaced entirely: block 3 now renders the REAL
//          <ha-state-control-climate-temperature> custom element directly
//          (already globally registered in any real HA frontend, same way this
//          file already uses ha-control-select-menu/ha-big-number/
//          ha-outlined-icon-button/ha-icon-button directly elsewhere), exactly
//          as hui-thermostat-card.ts does: style=max-width (from our own
//          ResizeController measuring .container), prevent-interaction-on-scroll,
//          show-secondary, .stateObj=${stateObj}. This guarantees block 3 is
//          byte-for-byte identical to native by construction - there is no
//          geometry, color, drag, keyboard, or responsive-breakpoint logic left
//          for us to get wrong, because we no longer implement any of it.
//          Removed entirely (all now dead code, superseded by the real
//          element): CH_ARC_* constants, CH_SLIDER_MODES, CH_HVAC_ACTION_TO_MODE,
//          chSvgArc, chClamp, chValueToPercentage, chStrokeDashArc,
//          chStrokeCircleDashArc, chComputeCssVariable, chSlugify,
//          chDomainColorProperties, chStateActive, chStateColorCss, chGetStep,
//          chDebounce, _effectiveSingle/Low/High, _commitStepOverride, _step,
//          _percentageFromPointer, _findActiveHandle, _onPointerDown/Move/Up,
//          _handleKeyDown/Up, _renderArcGroup, _renderDial, _renderCenter,
//          _renderStepButtons, and every CSS rule for .dial-wrapper/.dial-svg/
//          .ch-arc*/.ch-target*/.ch-info/.ch-label*/.ch-dual/.step-buttons*/the
//          responsive @container breakpoints - all of it was reimplementing
//          behavior the real component already provides internally.
//          .container's CSS is unchanged (still hui-thermostat-card.ts's exact
//          model, verified working as of v1.2.26/27) and now correctly has a
//          single real child again, matching source's ".container > *" exactly.
//          Blocks 1 (title/more-info), 2 (readouts), and 4 (mode/preset/fan/
//          swing rows) are untouched.
// v1.2.27: Ported the ResizeController mechanism itself, literally - not a
//          substitute. Imports the same @lit-labs/observers package source
//          uses (pinned to a lit-2-compatible version via unpkg, consistent
//          with how lit itself is imported in this file). Constructor sets up
//          the controller with the exact same callback as source: measures
//          .container's own rendered clientHeight on resize. render() applies
//          that value as max-width directly on .dial-wrapper, matching
//          source's styleMap({maxWidth: controlMaxWidth}) exactly (implemented
//          as a plain inline style string here since styleMap wasn't already
//          imported - same resulting DOM attribute, different Lit directive
//          used to write it). This caps the dial's width to whatever height
//          .container actually has available, fixing the clipping seen on
//          wide-but-short cards where the fixed 320px default overflowed
//          .container's overflow:hidden.
// v1.2.26: Fix v1.2.25's collapse - re-fetched hui-thermostat-card.ts (this time
//          the actual file, uploaded directly, not a possibly-corrupted page
//          render) and found the real structure: native uses TWO separate
//          nested elements, not one. .container (outer: flex, align/justify
//          center, the ::before padding-top:100% trick, flex:1) is one thing.
//          <ha-state-control-climate-temperature> - a SEPARATE element placed
//          inside it, with its own :host{width:320px} default (verified from
//          state-control-circular-slider-style.ts, already on disk) - is a
//          second thing. Split accordingly: .container now matches source
//          byte-for-byte; .dial-wrapper (containing our svg/center-info/step-
//          buttons) is now the inner element with the real component's own
//          320px default width + aspect-ratio:1 + max-width:100%, and is
//          .container's single real child, so ".container > .dial-wrapper"
//          padding:8px now matches source's ".container > *" exactly (no
//          longer a 3-vs-1-child mismatch like the previous attempt).
//          [Disclosed, still not ported] native additionally uses a JS
//          ResizeController measuring .container's own rendered height to cap
//          the control's max-width further, for wide-but-short cards. Without
//          it, an unusually short-but-wide card could let the dial grow up to
//          320px and get clipped by .container's overflow:hidden rather than
//          shrinking gracefully - a real, narrower edge case than what broke
//          in v1.2.24/25, not the core sizing bug.
// v1.2.25: Fix regression from v1.2.24 - .dial-wrapper's sizing was NOT actually
//          the same technique as source despite claiming so. v1.2.24 used
//          aspect-ratio:1 + flex:1, which requires height:100% to resolve up the
//          full ancestor chain (only true inside HA's real grid dashboard); when
//          it doesn't resolve, flex:1 has no height to distribute and collapses
//          toward zero. Replaced with the literal, unmodified technique from
//          hui-thermostat-card.ts's .container: flex row + justify-content/
//          align-items:center + an empty ::before with padding-top:100%
//          (percentage padding is calculated from WIDTH, not height - fully
//          self-contained, works whether or not ha-card's height:100% resolves
//          to anything meaningful). [Disclosed, minor structural difference]
//          source's .container has one real child (padding:8px applied via
//          ".container > *"); our .dial-wrapper has three (the svg plus two
//          absolutely-positioned overlays for center-info and step-buttons) -
//          the 8px padding is scoped to just the svg specifically, since the
//          absolutely-positioned overlays already position themselves precisely
//          via inset/bottom offsets and don't need it.
// v1.2.24: Major structural rework distinguishing dashboard-card infrastructure
//          (sourced from hui-thermostat-card.ts, re-fetched fresh - title,
//          container/sizing model, getGridOptions, touch-only dot interaction,
//          real ha-icon-button) from dialog-content styling (sourced from
//          more-info-climate.ts and the shared dial components - responsive
//          breakpoints, label sizing, action-color glow):
//          1) Title reverted to a literal <p class="title"> matching
//          hui-thermostat-card.ts exactly, replacing the ha-card.header
//          approach - the earlier DevTools h1.card-header finding was measuring
//          the more-info DIALOG's own title bar chrome, not applicable to a card.
//          2) Removed the .content wrapper entirely; ha-card's direct children
//          are now .title, .more-info, .readouts, .dial-wrapper, and the
//          controls container - matching native's flatter structure. Dial sizing
//          now uses flex:1 + aspect-ratio:1 on .dial-wrapper directly (modern
//          CSS equivalent of source's flex:1 + padding-top:100% hack).
//          3) Added getGridOptions() matching source (columns:12, rows:5,
//          min_rows:2, min_columns:6) for HA's sections-type dashboards.
//          4) Touch-only dot interaction: full ring draggable normally: on
//          coarse/touch pointers (@media (pointer:coarse), standing in for
//          source's JS isTouch check), only a small dot-sized hit circle at the
//          target position is interactive, matching source's
//          prevent-interaction-on-scroll intent (avoids fighting page-scroll
//          swipes on mobile dashboards).
//          5) More-info button is now the real <ha-icon-button> component
//          (verified source: accepts a slotted <ha-icon> when .path isn't set),
//          replacing the earlier plain div+ha-icon substitute.
//          6) Responsive breakpoints ported from state-control-circular-slider-
//          style.ts via CSS container queries on .dial-wrapper at the verified
//          130/190/250px thresholds - step buttons hide below 250px, label
//          hides below 130px, ha-big-number/.ch-label font sizes step down.
//          [Approximation, disclosed] source's ".state" breakpoint selector
//          role wasn't independently confirmed; mapped to .ch-label as the
//          closest equivalent in our structure.
//          7) .ch-label now matches source's real sizing: width:60%,
//          -webkit-line-clamp:2, min-height:1.5em, white-space:nowrap,
//          color:var(--action-color, inherit) (was color:inherit only).
//          8) Added the real actionColor computation (action && action!=='idle'
//          && action!=='off' && active, mapped via CLIMATE_HVAC_ACTION_TO_MODE,
//          verified from climate.ts already on disk) as --action-color, plus
//          the radial-gradient glow effect on the dial matching source exactly.
// v1.1.23: Second full source-comparison review pass, two findings fixed:
//          1) Off-state arc hiding: verified from source
//          (ha-control-circular-slider.ts: ".inactive .arc{opacity:0}", applied
//          only in the interactive single/dual branches via .inactive=${!active}
//          in ha-state-control-climate-temperature.ts - NOT in the readonly
//          unavailable branch, which already renders correctly since v1.1.21).
//          When a climate entity is genuinely off (not unavailable), the arc
//          fill (clear/colored/active layers) is now fully hidden, leaving only
//          the plain background ring and the white target dot - previously we
//          still rendered a second grey ring on top of the background.
//          2) Full keyboard accessibility: ported _handleKeyDown/_handleKeyUp
//          from source - ArrowUp/Right (+step), ArrowDown/Left (-step),
//          PageUp/PageDown (+/- max(step, (max-min)/10)), Home/End (min/max).
//          Keydown updates visually (reuses the same drag-override state as
//          pointer dragging), keyup commits immediately via the same
//          _onPointerUp path used for drag release - matches source's
//          changing-during/changed-on-release pattern exactly. Added
//          role="slider" + full ARIA attributes + tabindex to the interaction
//          path. [Disclosed adaptation] native has two independently-focusable
//          slider elements in dual mode (one per low/high); we use one shared
//          focusable control acting on whichever target is currently selected
//          (_selectedRangeTarget) - same target the step buttons already act
//          on, rather than building two separate focusable DOM elements.
//          Focus-visible outline is also our own addition (a visible stroke
//          outline), since native's focus style applies to a visible colored
//          arc element, while our interaction path is invisible by design.
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
  show_border:                true,
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
        ${chToggleField('Show card border', c.show_border, (e) => this._valueChanged('show_border', e))}
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
    _containerHeight: { state: true },
  };

  constructor() {
    super();
    this._attrIconCache = {};
    this._containerHeight = undefined;
  }

  // Native browser ResizeObserver - built in, no import, no CDN/CORS risk.
  // Does the same job the (broken, CDN-blocked) @lit-labs/observers
  // ResizeController was meant to: measures .container's own rendered height,
  // applied as max-width on the dial so it doesn't overflow .container's
  // overflow:hidden on wide-but-short cards.
  firstUpdated() {
    this._resizeObserver = new ResizeObserver((entries) => {
      const container = entries[0]?.target.shadowRoot?.querySelector('.dial-container');
      this._containerHeight = container?.clientHeight;
    });
    this._resizeObserver.observe(this);
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
    const showMoreInfo = this._config.show_more_info_button;

    return html`
      <ha-card .header=${name} class="ha-card ${this._config.show_border ? '' : 'no-border'}">
        ${showMoreInfo ? html`
          <ha-icon-button class="more-info" label="Show more info" @click=${this._handleMoreInfo} tabindex="0">
            <ha-icon icon="mdi:dots-vertical"></ha-icon>
          </ha-icon-button>
        ` : ''}
        <div class="card-content">
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

        <div class="controls">
        <div class="dial-container">
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
        </div>
        </div>
      </ha-card>
    `;
  }

  static styles = css`
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
    .card-content {
      position: relative;
      width: 100%;
      display: flex;
      flex-direction: column;
      align-items: center;
      justify-content: space-between;
      overflow: hidden;
      box-sizing: border-box;
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
