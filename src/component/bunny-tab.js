import {html, render} from '/node_modules/lit-html/lit-html.js';
import '/node_modules/ink-ripple/ink-ripple.js'
import {BunnyStyles} from "./styles.js";

class BunnyTab extends HTMLElement {

    constructor() {
        super();
        this.listener = () => {};
    }

    onclicked() {
        this.listener();
        // reset the ripple - when show/hide is used the ripple can get stuck.
        // the timeout allows the ripple effect to reset - if the button stays visible.
        let element = this.shadowRoot.querySelector('ink-ripple');
        //setTimeout(() => element._reset(), 250);
    }

    set clicked(callback) {
        this.listener = callback;
    }

    static get is() {
        return 'bunny-tab';
    }

    connectedCallback() {
        this.attachShadow({mode: 'open'});
        render(this.template, this.shadowRoot);

        this.tab = this.shadowRoot.querySelector('.tab');
    }

    activate() {
        this.tab.classList.add('active');
    }

    inactivate() {
        this.tab.classList.remove('active');
    }

    get template() {
        return html`
        <style>
            ${BunnyStyles.variables}
        
            :host {
                contain: content;
                display:block;
                width:100%;
            }
        
            .tab {
                min-width: 5.14em;
                height: 2.8em;
                /*position: relative;*/
                background-color: #424242;
                outline-width: 0;
                user-select: none;
                cursor: pointer;
                display: flex;
                justify-content: center;
                align-items: center;
                color: #fff;
            }
            
            .active {
                border-bottom: 2px solid var(--accent-color);
            }
            
            .tab-text {
                display: block;
                margin: auto;
                font-family: Roboto, Noto, sans-serif;
                font-size: 16px;
                font-stretch: 100%;
                font-style: normal;
                font-weight: 500;
                opacity: 0.72;
                padding-bottom: 8px;
                padding-top: 12px;
                -webkit-font-smoothing: antialiased;
            }
            
            ink-ripple {
                --ink-ripple-opacity: 0.15;
                --ink-ripple-duration: 0.15s;
                --ink-ripple-accent-color: var(--accent-ripple-tab);
              }
        </style>
        
        <div class="tab" onmousedown="this.getRootNode().host.onclicked()">
            <span class="tab">
                <slot></slot>            
            </span>
            <ink-ripple></ink-ripple>
        </div>
        `;
    }
}
customElements.define(BunnyTab.is, BunnyTab);