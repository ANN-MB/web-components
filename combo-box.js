customElements.define("combo-box", class extends HTMLElement {
  constructor() {
    super();
    this.attachShadow({
      mode: "open",
      delegatesFocus: true
    });
    this.SELECTED_OPTION = null;
    this.VALEUR = null;
    this.VISUAL_FOCUS = null;
    this.labelSearch = this.getAttribute("labelsearch");
    this.labelReset = this.getAttribute("labelreset");
    this.labelList = this.getAttribute("labellist");
    if (!this.labelSearch || !this.labelReset || !this.labelList) {
      throw new Error(`Please provide the following attributes for accessibility :\nlabelsearch="[string]"\nlabelreset="[string]"\nlabellist="[string]"`);
      return
    }
    this.TEMPLATE = document.createElement("template");
    this.TEMPLATE.innerHTML = `<style>
  	*, *::before, *::after {
  	  box-sizing: border-box
  	}
  	.hide {
  	  display: none !important
  	}
    :host {
  	  --cb-primary:  #2E3562;
  	  --cb-secondary: #CED8F7;
  	  --cb-bg-list: white;
  	  --cb-icon-chevron: "\u25BC";
  	  --cb-icon-reset: "\u00D7"; 
  	  display: inline-block;
  	  position: relative;
  	  font: inherit;
  	  color: var(--cb-primary);
  	  scrollbar-color: var(--cb-primary) var(--cb-secondary);
      }
  	:host(:focus-within) {
  	  z-index: 2147483647;
  	}
  	:host([value]) [part="combobox__top"] {
  	  background: var(--cb-primary);
  	}
  	:host([value]) input, :host([value]) button {
  	  color: var(--cb-secondary)
  	}	
  	[part="combobox__top"] {
  	  display: flex;
  	  justify-content: space-between;
  	  align-items: center;
  	  background-color: var(--cb-secondary);
  	  border-style: solid;
  	  border-width: 3px 3px 3px 3px;
  	  border-color: var(--cb-primary);
  	  border-radius: 15px
  	}
  	input {
      font-size: var(--cb-font-size, inherit);
  	  width: 100%;
      padding: .5em 2em .5em 1em;
      outline: 0; border: 0;
      color: var(--clr-primary);
      background: transparent
    }
  	:host([open]) [part="combobox__top"] {
  	  border-radius: 15px 15px 0 0;
  	  border-width: 3px 3px 0 3px;
  	}
  	input:not(:focus) {
  	  cursor: pointer
  	}
  	[part="combobox__search"]::placeholder {
  	  color: var(--cb-primary);
  	  opacity: 1;
  	  text-transform: uppercase;
  	  letter-spacing: 0.1ch
  	}
  	input::placeholder-shown {
  	  text-overflow: ellipsis
  	}
  	input:focus::placeholder {
  	  color: transparent;
  	  opacity: 0
  	}
  	input::-moz-selection { 
  	  color: var(--cb-secondary);
  	  background-color: var(--cb-primary)
  	}
  	input::selection {
  	  color: var(--cb-secondary);
  	  background-color: var(--cb-primary)
  	}		
  	button {
      display: block;
  	  position: absolute;
      height: 100%;
      font-size: 1.5em;
      background: transparent;
      border: 0;
      cursor: pointer;
  	  color: var(--cb-primary);
  	  right: 0.5em;
  	  pointer-events: none;
    }
  	button:focus-visible {
  	  border-radius: 5px;
  	  outline: 3px solid var(--cb-primary)
  	}
  	button::before {
      content: var(--cb-icon-chevron);
  	}
  	:host([open]) button {
      transform: rotate(180deg)
  	}
  	:host([value]) button::before {
      content: var(--cb-icon-reset)
  	}
  	:host([value]) button {
  	  pointer-events: auto;
  	}
  	[part="combobox__bottom"] {
      display: none;
  	  position: absolute;
  	  background-color: var(--cb-bg-list);
  	  width: 100%;
  	  max-height: 50vh;
  	  overflow-y: auto;
  	  overflow-x: hidden;
  	  border-width: 0 3px 3px 3px;
  	  border-style: solid;
  	  border-color: var(--cb-primary);
  	  border-radius: 0 0 15px 15px;
  	}
  	:host([open]) [part="combobox__bottom"] {
      display: block
  	}
  	ul {
      list-style: none;
      margin: 0;
      padding: 0;
  	}
  	ul:focus-visible {
  	  outline: 0;
  	}
  	li {
  	  cursor: pointer;
  	  display: block;
  	  padding: .5rem 1rem;
  	  color: var(--cb-primary);
  	  font-size: var(--cb-font-size,inherit);
  	  white-space:nowrap
  	}
  	li + li {
  	  border-top: 1px solid #ccc
  	}
  	li:hover, li.visualfocus {
  	  background-color: var(--cb-primary);
      color: var(--cb-secondary);
  	}	
  	</style>
    <div part="combobox__top">
      <input part="combobox__search" type="search" role="combobox" aria-autocomplete="list" aria-expanded="false" aria-controls="listBox">
      <button part="combobox__reset" aria-hidden="true" disabled></button>
    </div>
    <div part="combobox__bottom" tabindex="-1">
      <ul part="combobox__list" role="listBox" id="listBox"></ul>
    </div>`;
    this.render();
  }
  show(el) {
    el.classList.remove("hide")
  }
  hide(el) {
    el.classList.add("hide")
  }
  removeDiactrics(str) {
    return str.normalize("NFD").replace(/[\u0300-\u036f]/g, "");
  }
  getSibling(el, selector, dir) {
    function sib(x) {
      if (dir === "next") return x.nextElementSibling
      if (dir === "previous") return x.previousElementSibling
    }
    let sibling = sib(el);
    if (!selector) return sibling;
    while (sibling) {
      if (sibling.matches(selector)) return sibling;
      sibling = sib(sibling);
    }
  }
  generateItem(item, index) {
    const li = document.createElement("li");
    li.dataset.value = item.getAttribute("value");
    li.textContent = item.textContent;
    li.setAttribute("role", "option");
    li.setAttribute("part", "combobox__item");
    li.id = "item-" + index;
    this.ITEM_LIST.appendChild(li);
    item.remove();
  }
  render() {
    this.shadowRoot.appendChild(this.TEMPLATE.content.cloneNode(true));
    this.INPUT_SEARCH = this.shadowRoot.querySelector("input");
    this.BUTTON_RESET = this.shadowRoot.querySelector("button");
    this.COMBOBOX_BOTTOM = this.shadowRoot.querySelector(`[part="combobox__bottom"]`);
    this.ITEM_LIST = this.shadowRoot.querySelector("ul");
    this.INPUT_SEARCH.setAttribute("placeholder", this.labelSearch);
    this.INPUT_SEARCH.setAttribute("aria-label", this.labelSearch);
    this.INPUT_SEARCH.style.minWidth = "calc(" + this.labelSearch.length + "ch + " + this.labelSearch.length + "ch * 0.1 + 3.5em)";
    this.BUTTON_RESET.setAttribute("aria-label", this.labelReset);
    this.ITEM_LIST.setAttribute("aria-label", this.labelList);
    this.querySelectorAll("item").forEach((item, index) => this.generateItem(item, index));
    this.LIS = this.shadowRoot.querySelectorAll("li");
    this.addEventListener("focus", event => {
      this.setAttribute("open", "");
      this.INPUT_SEARCH.focus();
      this.moveVisualFocus(this.INPUT_SEARCH);
    });
    this.addEventListener("blur", event => {
      this.removeAttribute("open", "");
      this.removeVisualFocus();
    });
    this.addEventListener("click", event => {
      const t = event.composedPath()[0];
      if (t.tagName === "LI") {
        this.moveVisualFocus(t);
        this.setValue(t)
      }
      if (t == this.BUTTON_RESET) this.reset();
    }, true);
    this.INPUT_SEARCH.addEventListener("keyup", event => {
      this.setAttribute("open", "");
      const searchVal = this.removeDiactrics(this.INPUT_SEARCH.value.toLowerCase());
      this.filter(searchVal);
      const availableOptions = this.shadowRoot.querySelectorAll("li:not(.hide)");
      switch (event.key) {
        case "ArrowRight":
        case "ArrowLeft":
        case "Home":
        case "End": {
          this.moveVisualFocus(this.INPUT_SEARCH);
        }
        break;
        case "ArrowDown": {
          if (this.VISUAL_FOCUS == this.INPUT_SEARCH && availableOptions) {
            const sel = availableOptions[0];
            if (sel) this.moveVisualFocus(sel);
            return
          }
          if (this.VISUAL_FOCUS.tagName === "LI") {
            const sel = this.getSibling(this.VISUAL_FOCUS, ":not(.hide)", "next");
            if (sel) {
              this.moveVisualFocus(sel);
            } else {
              this.moveVisualFocus(availableOptions[0]);
            }
            return
          }
        }
        break;
        case "ArrowUp": {
          if (this.VISUAL_FOCUS == this.INPUT_SEARCH && availableOptions) {
            const sel = availableOptions[availableOptions.length - 1];
            if (sel) this.moveVisualFocus(sel);
          }
          if (this.VISUAL_FOCUS.tagName === "LI") {
            const sel = this.getSibling(this.VISUAL_FOCUS, ":not(.hide)", "previous");
            if (sel) {
              this.moveVisualFocus(sel);
            } else {
              this.moveVisualFocus(availableOptions[availableOptions.length - 1]);
            }
          }
        }
        break;
        case "Enter": {
          if (this.VISUAL_FOCUS == this.INPUT_SEARCH) {
            for (const li of this.LIS) {
              if (this.removeDiactrics(li.textContent.toLowerCase()) == searchVal) {
                this.setValue(li);
                this.moveVisualFocus(this.INPUT_SEARCH);
              }
            }
            return
          } else if (this.VISUAL_FOCUS.tagName === "LI") this.setValue(this.VISUAL_FOCUS);
        }
        break;
        case "Escape": {
          if (this.BUTTON_RESET.disabled) {
            this.moveVisualFocus(this.INPUT_SEARCH);
            this.COMBOBOX_BOTTOM.scrollTo(0, 0);
          } else {
            this.BUTTON_RESET.click();
            break;
          }
        }
      }
    });
  }
  filter(searchVal) {
    this.LIS.forEach(li => {
      const liText = this.removeDiactrics(li.textContent.toLowerCase());
      if (liText.indexOf(searchVal) > -1) {
        this.show(li);
        li.setAttribute("aria-hidden", "false");
      } else {
        this.hide(li);
        li.setAttribute("aria-hidden", "true");
        li.removeAttribute("aria-selected");
      }
    });
  }
  reset() {
    this.VALEUR = null;
    this.removeAttribute("value")
    this.INPUT_SEARCH.value = "";
    this.LIS.forEach(this.show);
    this.SELECTED_OPTION.removeAttribute("aria-selected");
    this.SELECTED_OPTION = null;
    this.BUTTON_RESET.setAttribute("aria-hidden", "true");
    this.BUTTON_RESET.setAttribute("disabled", "");
    this.INPUT_SEARCH.focus();
    this.moveVisualFocus(this.INPUT_SEARCH);
    this.COMBOBOX_BOTTOM.scrollTo(0, 0);
    this.announceChange();
  }
  moveVisualFocus(el) {
    const previousFocus = this.shadowRoot.querySelector(".visualfocus");
    if (previousFocus) previousFocus.classList.remove("visualfocus");
    el.classList.add("visualfocus");
    if (el.tagName === "LI") {
      el.scrollIntoView({
        block: "end"
      });
      this.INPUT_SEARCH.setAttribute("aria-activedescendant", el.id);
    } else {
      this.INPUT_SEARCH.removeAttribute("aria-activedescendant");
    }
    this.VISUAL_FOCUS = el;
  }
  removeVisualFocus() {
    const previousFocus = this.shadowRoot.querySelector(".visualfocus");
    if (previousFocus) previousFocus.classList.remove("visualfocus");
    this.INPUT_SEARCH.removeAttribute("aria-activedescendant");
    this.VISUAL_FOCUS = null;
  }
  setValue(t) {
    this.VALEUR = t.getAttribute("data-value");
    this.setAttribute("value", this.VALEUR);
    this.BUTTON_RESET.removeAttribute("disabled");
    if (this.SELECTED_OPTION !== t) {
      this.SELECTED_OPTION && this.SELECTED_OPTION.removeAttribute("aria-selected");
      this.SELECTED_OPTION = t;
      t.setAttribute("aria-selected", "true");
    }
    this.INPUT_SEARCH.value = t.textContent;
    this.BUTTON_RESET.removeAttribute("aria-hidden");
    this.BUTTON_RESET.removeAttribute("disabled");
    this.moveVisualFocus(this.INPUT_SEARCH);
    this.INPUT_SEARCH.focus();
    this.announceChange();
    this.removeAttribute("open")
  }
  announceChange() {
    this.dispatchEvent(new Event("change", {
      bubbles: true,
      composed: true
    }));
  }
  connectedCallback() {
    Object.defineProperty(this, "value", {
      get: () => this.VALEUR,
      enumerable: true,
      configurable: true
    });
    new MutationObserver(mutations => {
      mutations.forEach((mutation, index) => {
        if (mutation.addedNodes.length) this.generateItem(mutation.addedNodes[index - 1], index);
      });
      this.LIS = this.shadowRoot.querySelectorAll("li");
    }).observe(this, {
      childList: true
    });

  }
});
