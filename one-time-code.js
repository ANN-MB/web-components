customElements.define("one-time-code", class extends HTMLElement {
  constructor() {
    super();
    this.attachShadow({
      mode: "open"
    });
    this.size = /^([1-9]|1[0-9])$/.test(this.getAttribute('size')) ? this.getAttribute('size') : 6;
    this.placeholder = this.getAttribute('placeholder') || false;
    this.private = this.hasAttribute('private');
    this.autosubmit = this.hasAttribute('autosubmit');
    this.regex = /[0-9]/i;
    this.pattern = this.testpattern();
    this.characters = (this.getAttribute('characters') !== null && this.getAttribute('characters') !== '') ? this.getAttribute('characters') : 'numeric';
    this.inputs = [];
    this.template = document.createElement("template");
    this.template.innerHTML = '<style>' 
      + ':host {white-space: nowrap}' 
      + 'input {text-align:center;width: 3ch;height: 3ch}' 
      + 'input:not(:last-child){margin-right:.5ch}' 
      + '</style>';
    this.render();
  }
  testpattern() {
    let pat = this.getAttribute('pattern');
    if (pat) {
      let patsplit = pat.match(/^\/(.*?)\/([iuv]*)$/);
      if (patsplit) {
        try {
          return new RegExp(patsplit[1], patsplit[2]);
        } catch (e) {
          return false;
        }
      } else {
        try {
          return new RegExp(pat, 'v');
        } catch (e) {
          return false;
        }
      }
      return true
    } else {
      return false
    }
  }
  render() {
    this.shadowRoot.appendChild(this.template.content.cloneNode(true));
    switch (this.characters) {
      case "alpha":
        this.regex = /[a-z]/i;
        break;
      case "alphanumeric":
        this.regex = /[0-9a-z]/i;
        break;
      case "all":
        this.regex = void(0);
        break;
    }
    for (let i = 0; i < this.size; i++) {
      const input = document.createElement('input');
      input.setAttribute('maxlength', '1');
      input.setAttribute('size', '1');
      input.setAttribute('minlength', '1');
      input.setAttribute('required', '');
      input.setAttribute('part', 'input');
      input.classList.add('otc-input-' + (i + 1));
      //input.setAttribute('autocomplete','one-time-code');
      input.setAttribute('aria-label', 'Authorization code digit ' + i)
      input.type = this.private ? "password" : "text";
      this.placeholder && (input.placeholder = this.placeholder.split('')[i]);
      if (this.characters == 'numeric') {
        if ('inputmode' in document.createElement('input')) {
          input.setAttribute('inputmode', 'numeric');
        } else {
          input.type = 'tel';
        }
      }
      input.addEventListener('keydown', e => {
        if (e.key == "ArrowLeft" && input.previousElementSibling) {
          e.preventDefault();
          input.previousElementSibling.focus();
        }
        if (e.key == "ArrowRight" && input.nextElementSibling) {
          e.preventDefault();
          input.nextElementSibling.focus();
        }
        if (e.key == "Backspace" && input.previousElementSibling) {
          console.log('bonk')
          e.preventDefault();
          if (input.value == '') {
            input.previousElementSibling.value = '';
          } else {
            input.value = '';
          }
          input.previousElementSibling.focus();
        }
      }, !1);
      input.addEventListener('input', e => {
        if (e.data && input.nextElementSibling) {
          // Timeout prevents quirks when typing too fast.
          setTimeout(() => {
            input.nextElementSibling.focus();
          }, 0);
        }
        this.isFilled();
      }, !1);
      if (this.regex || this.pattern) {
        input.addEventListener('beforeinput', (e) => {
          let valid = this.pattern ? this.pattern : this.regex;
          if (!valid.test(e.data) && data !== null) {
            e.preventDefault()
          }
        }, !1);
      }
      input.addEventListener('paste', e => {
        e.preventDefault()
        let paste = (e.clipboardData || window.clipboardData).getData('text');
        this.autofill(paste);
      });
      input.addEventListener('focus', function() {
        setTimeout(() => {
          this.select();
        }, 0);
      });
      this.shadowRoot.appendChild(input);
      this.inputs.push(input);
    }
  }
  getValue() {
    return Array.from(this.inputs).map(input => input.value).join('');
  }
  isFilled() {
    let filled = (this.getValue().length == this.size);
    if (filled) {
      this.dispatchEvent(new Event('filled', {
        bubbles: true,
        composed: true
      }));
      return true
    } else {
      return false
    }
  }
  autofill(content) {
    content = content.replace(/[\n\r\t\s]+/g, '');
    if ((this.regex || this.pattern) && content.length == this.size) {
      let valid = this.pattern ? this.pattern : this.regex;
      for (const char of content) {
        if (!valid.test(char)) {
          return false
        }
      }
      for (let i = 0; i < this.size; i++) {
        this.shadowRoot.querySelectorAll('input')[i].value = content[i];
      }
      this.isFilled();
    }
  }
  connectedCallback() {
    Object.defineProperty(this, 'value', {
      get: () => this.getValue(),
      enumerable: true,
      configurable: true,
    });
    if ("OTPCredential" in window) {
      window.addEventListener("DOMContentLoaded", (e) => {
        this.abort = new AbortController();
        this.form = this.closest("form");
        if (this.form) {
          form.addEventListener("submit", (e) => {
            this.abort.abort();
          });
        }
        setTimeout(() => { // abort after two minutes
          this.abort.abort();
        }, 2 * 60 * 1000);
        navigator.credentials.get({
          otp: {
            transport: ['sms']
          },
          signal: this.abort.signal
        }).then(otp => {
          this.autofill(otp.code);
          if (this.form && this.autosubmit) form.submit();
        }).catch(err => {
          console.log(err);
        });
      });
    }
  }
});
