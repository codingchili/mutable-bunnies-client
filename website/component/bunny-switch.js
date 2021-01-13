import {html, render} from '/node_modules/lit-html/lit-html.js';
import '/node_modules/ink-ripple/ink-ripple.js'

class BunnySwitch extends HTMLElement {

    constructor() {
        super();
        let update = () => {
            this._checked = this.hasAttribute('checked');
            this._disabled = this.hasAttribute('disabled');
        };

        new MutationObserver(() => {
            update();
            this.render();
        }).observe(this, {attributes: true});

        update();
    }

    static get is() {
        return 'bunny-switch';
    }

    connectedCallback() {
        this.attachShadow({mode: 'open'});
        this.render();
    }

    set checked(value) {
        this._checked = value;
        this.render();
    }

    get checked() {
        return this._checked;
    }

    set disabled(value) {
        this._disabled = value;
    }

    get disabled() {
        return this._disabled;
    }

    render() {
        render(this.template, this.shadowRoot);
    }

    toggle() {
        if (!this.disabled) {
            this.checked = !this.checked;
            this.render();
        }
    }

    get template() {
        return html`
            <style>
                :host {
                    contain: content;
                    display: inline-block;
                    user-select: none;
                    margin-left: 11px;
                    margin-right: 11px;
                }
                
                #container {
                    position: relative;
                    cursor: ${this._disabled ? 'unset' : 'var(--bunny-cursor-pointer, pointer)'};
                    height: 22px;
                    width: 44px;
                }

                #bar {
                    background-color: #484848;
                    border-radius: 4px;
                    position: absolute;
                    top: 6px;
                    width: 44px;
                    height: 10px;
                }

                #switch {
                    position: absolute;
                    top: 0px;
                    width: 22px;
                    height: 22px;
                    border-radius: 11px;
                    transition: left 0.1s ease-in, background-color 0.2s ease-in;

                    box-shadow: 0 6px 10px 0 rgba(0, 0, 0, 0.14),
                    0 1px 18px 0 rgba(0, 0, 0, 0.12),
                    0 3px 5px -1px rgba(0, 0, 0, 0.4);
                }

                .checked {
                    left: 21px;
                    background-color: var(--bunny-switch-on, #00cc00);
                }

                .unchecked {
                    left: 0px;
                    background-color: var(--bunny-switch-off, #ff0000);
                }
                
                .disabled {
                    background-color: #646464 !important;
                    cursor: not-allowed !important;
                }

            </style>

            <div id="container" @mousedown="${this.toggle.bind(this)}">
                <div id="bar"></div>
                <div id="switch" class="
                        ${this.checked ? 'checked' : 'unchecked'}
                        ${this._disabled ? 'disabled' : ''}
                    ">
                    
                </div>
            </div>
        `;
    }
}

customElements.define(BunnySwitch.is, BunnySwitch);