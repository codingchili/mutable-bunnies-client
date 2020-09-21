import {html, render} from '/node_modules/lit-html/lit-html.js';

class BunnyProgress extends HTMLElement {

    static get is() {
        return 'bunny-progress';
    }

    constructor() {
        super();
        this._max = 100;
        this._value = 32;

        new MutationObserver(() => {
            this._max = this.getAttribute('max') || this._max;
            this._value = this.getAttribute('value') || this._value;
            this.render();
        }).observe(this, {attributes : true});
    }

    set max(value) {
        this._max = value;
        this.render();
    }

    set value(value) {
        this._value = value;
        this.render();
    }

    percent() {
        return Math.min((this._value / this._max) * 100.0, 100);
    }

    connectedCallback() {
        this.attachShadow({mode: 'open'})
        this.render();
    }

    get template() {
        return html`
            <style>
                :host {
                    display: block;
                    padding: 16px;
                }
                
                .elevation {
                    box-shadow: 2px 2px 4px 1px rgba(50,50,50,0.9);
                }
                
                .container {
                    position: relative;
                    width: 100%;
                }
                
                .outline {
                    right: 0;
                    background-color: darkgray;
                }
                
                .fill {
                    width: ${this.percent()}%;
                    background-color: aqua;
                    transition: width 0.16s ease-out;
                }
                
                .bar {
                    position: absolute;
                    top: 0;
                    left: 0;
                    bottom: 0;
                    height: 4px;
                }
            </style>
            <div class="elevation container">
                <div class="outline bar"></div>
                <div class="fill bar"></div>
            </div>
        `;
    }

    render() {
        render(this.template, this.shadowRoot);
    }
}

customElements.define(BunnyProgress.is, BunnyProgress);