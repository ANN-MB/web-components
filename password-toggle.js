// Accessible Combobox Web Component - 2024 Ann MB - https://github.com/4nnm8/web-components/blob/main/combo-box.js
customElements.define("combo-box",class extends HTMLElement{constructor(){if(super(),this.attachShadow({mode:"open",delegatesFocus:!0}),this.SELECTED_OPTION=null,this.VALEUR=null,this.VISUAL_FOCUS=null,this.labelSearch=this.getAttribute("labelsearch"),this.labelReset=this.getAttribute("labelreset"),this.labelList=this.getAttribute("labellist"),!this.labelSearch||!this.labelReset||!this.labelList)throw new Error('Please provide the following attributes for accessibility :\n  labelsearch="[string]" - a label for the search input\n  labelreset="[string]" - a label for the reset button\n  labellist="[string]" - a label for the options list');this.TEMPLATE=document.createElement("template"),this.TEMPLATE.innerHTML='<style>\n  \t*, *::before, *::after {\n  \t  box-sizing: border-box\n  \t}\n  \t.hide {\n  \t  display: none !important\n  \t}\n    :host {\n  \t  --cb-primary:  #2E3562;\n  \t  --cb-secondary: #CED8F7;\n  \t  --cb-bg-list: white;\n  \t  --cb-icon-chevron: "▼";\n  \t  --cb-icon-reset: "×"; \n  \t  display: inline-block;\n  \t  position: relative;\n  \t  font: inherit;\n  \t  color: var(--cb-primary);\n  \t  scrollbar-color: var(--cb-primary) var(--cb-secondary);\n      }\n  \t:host(:focus-within) {\n  \t  z-index: 2147483647;\n  \t}\n  \t:host([value]) [part="combobox__top"] {\n  \t  background: var(--cb-primary);\n  \t}\n  \t:host([value]) input, :host([value]) button {\n  \t  color: var(--cb-secondary)\n  \t}\t\n  \t[part="combobox__top"] {\n  \t  display: flex;\n  \t  justify-content: space-between;\n  \t  align-items: center;\n  \t  background-color: var(--cb-secondary);\n  \t  border-style: solid;\n  \t  border-width: 3px 3px 3px 3px;\n  \t  border-color: var(--cb-primary);\n  \t  border-radius: 15px\n  \t}\n  \tinput {\n\t  font-family: inherit;\n      font-size: var(--cb-font-size, inherit);\n  \t  width: 100%;\n      padding: .5em 2em .5em 1em;\n      outline: 0; border: 0;\n      color: var(--clr-primary);\n      background: transparent;\n\t  vertical-align: middle;\n    }\n  \t:host([open]) [part="combobox__top"] {\n  \t  border-radius: 15px 15px 0 0;\n  \t  border-width: 3px 3px 0 3px;\n  \t}\n  \tinput:not(:focus) {\n  \t  cursor: pointer\n  \t}\n  \tinput::placeholder {\n  \t  color: var(--cb-primary);\n  \t  opacity: 1;\n  \t  text-transform: uppercase;\n  \t  letter-spacing: 0.1ch\n  \t}\n  \tinput::placeholder-shown {\n  \t  text-overflow: ellipsis\n  \t}\n  \tinput:focus::placeholder {\n  \t  opacity: .2\n  \t}\n  \tinput::-moz-selection { \n  \t  color: var(--cb-secondary);\n  \t  background-color: var(--cb-primary)\n  \t}\n  \tinput::selection {\n  \t  color: var(--cb-secondary);\n  \t  background-color: var(--cb-primary)\n  \t}\t\t\n  \tbutton {\n      display: block;\n  \t  position: absolute;\n      height: 100%;\n      font-size: 1.5em;\n      background: transparent;\n      border: 0;\n      cursor: pointer;\n  \t  color: var(--cb-primary);\n  \t  right: 0.5em;\n  \t  pointer-events: none;\n    }\n  \tbutton:focus-visible {\n  \t  border-radius: 5px;\n  \t  outline: 3px solid var(--cb-primary)\n  \t}\n  \tbutton::before {\n      content: var(--cb-icon-chevron);\n  \t}\n  \t:host([open]) button {\n      transform: rotate(180deg)\n  \t}\n  \t:host([value]) button::before {\n      content: var(--cb-icon-reset)\n  \t}\n  \t:host([value]) button {\n  \t  pointer-events: auto;\n  \t}\n  \t[part="combobox__bottom"] {\n      display: none;\n  \t  position: absolute;\n  \t  background-color: var(--cb-bg-list);\n  \t  width: 100%;\n  \t  max-height: 50vh;\n  \t  overflow-y: auto;\n  \t  overflow-x: hidden;\n  \t  border-width: 0 3px 3px 3px;\n  \t  border-style: solid;\n  \t  border-color: var(--cb-primary);\n  \t  border-radius: 0 0 15px 15px;\n  \t}\n\t[part="combobox__bottom"].empty::before {\n\t  content:"Aucune correspondance";\n\t  display: block;\n  \t  padding: .5rem 1rem;\n  \t  color: gray;\n\t  font-style: italic;\n  \t  font-size: var(--cb-font-size,inherit);\n\t  cursor: not-allowed\n\t}\n  \t:host([open]) [part="combobox__bottom"] {\n      display: block\n  \t}\n  \t[part="combobox__listbox"] {\n      list-style: none;\n      margin: 0;\n      padding: 0;\n  \t}\n  \tli {\n  \t  cursor: pointer;\n  \t  display: block;\n  \t  padding: .5rem 1rem;\n  \t  color: var(--cb-primary);\n  \t  font-size: var(--cb-font-size,inherit);\n  \t  white-space: nowrap\n  \t}\n  \tli + li {\n  \t  border-top: 1px solid #ccc\n  \t}\n  \tli:hover, li.visualfocus {\n  \t  background-color: var(--cb-primary);\n      color: var(--cb-secondary) \n  \t}\t\n  \t</style>\n    <div part="combobox__top">\n      <input  part="combobox__search"  type="text" role="combobox" \n\t\t\t  aria-autocomplete="list" aria-expanded="false" aria-controls="combobox__listbox">\n      <button part="combobox__reset" disabled></button>\n    </div>\n    <div part="combobox__bottom" tabindex="-1">\n      <ul role="listbox" part="combobox__listbox" id="combobox__listbox"></ul>\n    </div>',this.render()}show(t){t.classList.remove("hide")}hide(t){t.classList.add("hide")}removeDiactrics(t){return t.normalize("NFD").replace(/[\u0300-\u036f]/g,"")}getPreviousSibling(t,e,o){let i=t.previousElementSibling;if(!e)return i;for(;i;){if(i.matches(e))return i;i=i.previousElementSibling}}getNextSibling(t,e,o){let i=t.nextElementSibling;if(!e)return i;for(;i;){if(i.matches(e))return i;i=i.nextElementSibling}}generateItem(t,e){const o=document.createElement("li");o.dataset.value=t.getAttribute("value"),o.textContent=t.textContent,o.setAttribute("role","option"),o.setAttribute("part","combobox__item"),o.id="item-"+e,this.ITEM_LIST.appendChild(o),t.remove()}render(){this.shadowRoot.appendChild(this.TEMPLATE.content.cloneNode(!0)),this.INPUT_SEARCH=this.shadowRoot.querySelector("input"),this.BUTTON_RESET=this.shadowRoot.querySelector("button"),this.COMBOBOX_BOTTOM=this.shadowRoot.querySelector('[part="combobox__bottom"]'),this.ITEM_LIST=this.shadowRoot.querySelector("ul"),this.INPUT_SEARCH.setAttribute("placeholder",this.labelSearch),this.INPUT_SEARCH.setAttribute("aria-label",this.labelSearch),this.INPUT_SEARCH.style.minWidth=1.1*this.labelSearch.length+"ch",this.BUTTON_RESET.setAttribute("aria-label",this.labelReset),this.ITEM_LIST.setAttribute("aria-label",this.labelList),this.removeAttribute("labelsearch"),this.removeAttribute("labellist"),this.removeAttribute("labelreset"),this.querySelectorAll("item").forEach(((t,e)=>this.generateItem(t,e))),this.LIS=this.shadowRoot.querySelectorAll("li"),this.addEventListener("focus",(()=>{this.setAttribute("open",""),this.moveVisualFocusTo(this.INPUT_SEARCH)})),this.addEventListener("blur",(()=>{this.removeAttribute("open",""),this.removePreviousVisualFocus(),this.VISUAL_FOCUS=null})),this.addEventListener("click",(t=>{const e=t.composedPath()[0];"LI"===e.tagName&&this.setValue(e),e==this.BUTTON_RESET&&this.reset(),e==this.INPUT_SEARCH&&(this.setAttribute("open",""),this.moveVisualFocusTo(this.INPUT_SEARCH))}),!0),this.INPUT_SEARCH.addEventListener("keyup",(t=>{this.setAttribute("open","");const e=this.removeDiactrics(this.INPUT_SEARCH.value.toLowerCase());this.LIS.forEach((t=>{this.removeDiactrics(t.textContent.toLowerCase()).indexOf(e)>-1?this.show(t):(this.hide(t),t.removeAttribute("aria-selected"))}));const o=this.shadowRoot.querySelectorAll("li:not(.hide)");switch(0===o.length?this.COMBOBOX_BOTTOM.classList.add("empty"):this.COMBOBOX_BOTTOM.classList.remove("empty"),t.key){case"ArrowRight":case"ArrowLeft":case"Home":case"End":this.moveVisualFocusTo(this.INPUT_SEARCH);break;case"ArrowDown":if(this.VISUAL_FOCUS==this.INPUT_SEARCH&&o){const t=o[0];return void(t&&this.moveVisualFocusTo(t))}if("LI"===this.VISUAL_FOCUS.tagName){const t=this.getNextSibling(this.VISUAL_FOCUS,":not(.hide)");return void(t?this.moveVisualFocusTo(t):this.moveVisualFocusTo(o[0]))}break;case"ArrowUp":if(this.VISUAL_FOCUS==this.INPUT_SEARCH&&o){const t=o[o.length-1];t&&this.moveVisualFocusTo(t)}if("LI"===this.VISUAL_FOCUS.tagName){const t=this.getPreviousSibling(this.VISUAL_FOCUS,":not(.hide)");t?this.moveVisualFocusTo(t):this.moveVisualFocusTo(o[o.length-1])}break;case"Enter":if(this.VISUAL_FOCUS==this.INPUT_SEARCH){for(const t of this.LIS)this.removeDiactrics(t.textContent.toLowerCase())==e&&(this.setValue(t),this.moveVisualFocusTo(this.INPUT_SEARCH));return}"LI"===this.VISUAL_FOCUS.tagName&&this.setValue(this.VISUAL_FOCUS);break;case"Escape":this.BUTTON_RESET.disabled?(this.moveVisualFocusTo(this.INPUT_SEARCH),this.COMBOBOX_BOTTOM.scrollTo(0,0)):this.BUTTON_RESET.click()}}))}reset(){this.VALEUR=null,this.removeAttribute("value"),this.announceChange(),this.INPUT_SEARCH.value="",this.INPUT_SEARCH.focus(),this.moveVisualFocusTo(this.INPUT_SEARCH),this.LIS.forEach(this.show),this.SELECTED_OPTION.removeAttribute("aria-selected"),this.SELECTED_OPTION=null,this.BUTTON_RESET.setAttribute("disabled",""),this.COMBOBOX_BOTTOM.scrollTo(0,0)}removePreviousVisualFocus(){this.VISUAL_FOCUS&&("LI"===this.VISUAL_FOCUS.tagName&&(this.VISUAL_FOCUS.setAttribute("part","combobox__item"),this.INPUT_SEARCH.removeAttribute("aria-activedescendant")),this.VISUAL_FOCUS.classList.remove("visualfocus"))}moveVisualFocusTo(t){this.removePreviousVisualFocus(),this.VISUAL_FOCUS=t,this.VISUAL_FOCUS.classList.add("visualfocus"),"LI"===this.VISUAL_FOCUS.tagName?(this.VISUAL_FOCUS.scrollIntoView({block:"end"}),this.VISUAL_FOCUS.setAttribute("part","combobox__item visualfocused"),this.INPUT_SEARCH.setAttribute("aria-activedescendant",this.VISUAL_FOCUS.id)):this.INPUT_SEARCH.removeAttribute("aria-activedescendant")}setValue(t){this.VALEUR=t.getAttribute("data-value"),this.setAttribute("value",this.VALEUR),this.BUTTON_RESET.removeAttribute("disabled"),this.SELECTED_OPTION!==t&&(this.SELECTED_OPTION&&this.SELECTED_OPTION.removeAttribute("aria-selected"),this.SELECTED_OPTION=t,t.setAttribute("aria-selected","true")),this.INPUT_SEARCH.value=t.textContent,this.BUTTON_RESET.removeAttribute("disabled"),this.moveVisualFocusTo(this.INPUT_SEARCH),this.INPUT_SEARCH.focus(),this.announceChange(),this.removeAttribute("open")}announceChange(){this.dispatchEvent(new Event("change",{bubbles:!0,composed:!0}))}connectedCallback(){Object.defineProperty(this,"value",{get:()=>this.VALEUR,enumerable:!0,configurable:!0}),new MutationObserver((t=>{t.forEach(((t,e)=>{t.addedNodes.length&&this.generateItem(t.addedNodes[e-1],e)})),this.LIS=this.shadowRoot.querySelectorAll("li")})).observe(this,{childList:!0})}});

// Toggle Show/Hide Password Web Component - 2024 Ann MB - 
customElements.define("password-toggle", class extends HTMLElement {
  constructor() {
    super();
    this.attachShadow({
      mode: "open",
      delegatesFocus: true
    });
    this.VALEUR   = null;
    this.TEMPLATE = document.createElement("template");
    this.TEMPLATE.innerHTML = `
    <style>
  	*, *::before, *::after {
  	  box-sizing: border-box
  	}
    :host {
  	  --pt-primary:  #2E3562;
  	  --pt-secondary: #CED8F7;
  	  display: inline-block;
  	  position: relative;
  	  font: inherit;
  	  color: var(--cb-primary);
    }
  	:host(:focus-within) {
  	  z-index: 2147483647;
  	}
  	[part="pt__container"] {
  	  display: flex;
  	  justify-content: space-between;
  	  align-items: center;
  	  background-color: var(--pt-secondary);
  	  border-style: solid;
  	  border-width: 3px 3px 3px 3px;
  	  border-color: var(--pt-primary);
  	  border-radius: 15px
  	}
  	[part="pt__password"] {
      font-size: var(--pt-font-size, inherit);
  	  width: 100%;
      padding: .5em 2em .5em 1em;
      outline: 0; border: 0;
      color: var(--pt-primary);
      background: transparent
    }
  	[part="pt__password"]::placeholder-shown {
  	  text-overflow: ellipsis
  	}
  	[part="pt__password"]:focus::placeholder {
  	  opacity: .2
  	}
  	[part="pt__password"]::-moz-selection { 
  	  color: var(--pt-secondary);
  	  background-color: var(--pt-primary)
  	}
  	[part="pt__password"]::selection {
  	  color: var(--pt-secondary);
  	  background-color: var(--pt-primary)
  	}
  	[part="pt__toggle"] {
		position: absolute;
      right: 1em;
      display: flex;
      align-items: center;
      justify-content: center;
      width: 1.2em; height: 1.2em;
      border: 1px solid #000;
      border-radius:  75% 5%;
      transform: rotate(45deg);
      background: var(--pt-primary);
      cursor: pointer;
    }
    [part="pt__toggle"]::before {
      content: '';
      display: block;
      width: .6em;
      height: .6em;
      border-radius: 100%;
      background: var(--pt-primary);
      box-shadow: inset 0 0 0 .1em var(--pt-secondary);
    }
    [part="pt__toggle"].striked::after {
      content: '';
      display: block;
      width: 1.5em;
      height: .2em;
      background: var(--pt-primary);
      position: absolute;
   }
  	</style>
    <div part="pt__container">
      <input part="pt__password" type="password" autocomplete="current-password">
      <button part="pt__toggle"></button>
    </div>`;
    this.render();
  }
  announceChange() {
    this.dispatchEvent(new Event("change", {
      bubbles: true,
      composed: true
    }));
  }
  render() {
    this.shadowRoot.appendChild(this.TEMPLATE.content.cloneNode(true));
    this.passwordField = this.shadowRoot.querySelector('[part="pt__password"]');
    this.toggleButton  = this.shadowRoot.querySelector('[part="pt__toggle"]');
    this.passwordField.addEventListener("change", () => {
      this.VALEUR = this.passwordField.value;
      this.announceChange()
    });
    this.toggleButton.addEventListener("click", () => {
      if (this.passwordField.type === "password") {
        this.passwordField.type = "text";
        this.toggleButton.classList.add("striked");
      } else if (this.passwordField.type === "text") {
        this.passwordField.type = "password";
        this.toggleButton.classList.remove("striked");
      }
    });
  }
  connectedCallback() {
    Object.defineProperty(this, "value", {
      get: () => this.VALEUR,
      enumerable: true,
      configurable: true
    });
  }
});
