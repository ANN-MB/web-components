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
