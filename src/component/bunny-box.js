import {html, render} from '/node_modules/lit-html/lit-html.js';
import {BunnyStyles} from './styles.js';

class BunnyBox extends HTMLElement {

    static get is() {
        return 'bunny-box';
    }

    constructor() {
        super();
        this.attachShadow({mode: 'open'});
    }

    connectedCallback() {
        render(BunnyBox.template, this.shadowRoot);

        let update = () => {
            let container = this.shadowRoot.querySelector('.container');

            if (this.hasAttribute('border')) {
                container.classList.add('border');
            }
            if (this.hasAttribute('solid')) {
                container.classList.add('solid');
            }
            if (this.hasAttribute('sharp')) {
                container.classList.remove('rounded');
            }

            this.render();
        };
        new MutationObserver(() => update()).observe(this, {attributes : true});
        update();
    }

    render() {
        render(BunnyBox.template, this.shadowRoot);
    }

    static get template() {
        return html`
            <style>
                ${BunnyStyles.variables}
                ${BunnyStyles.elevation}
                
                :host {
                    display: block;
                    box-sizing: border-box;
                   /* box-shadow: 0 6px 10px 0 rgba(0, 0, 0, 0.14),
                          0 1px 18px 0 rgba(0, 0, 0, 0.12),
                          0 3px 5px -1px rgba(0, 0, 0, 0.4);*/
                    
                }
                
                .border {
                    border: 1px solid var(--game-theme-opaque);
                }
                
                .rounded {
                    border-radius: 2px;                
                }
                
                .container {
                    background-color: rgba(22,22,22,0.86);
                    display: inline-block;
                    /*position: relative;*/
                    width: 100%;
                    height: 100%;
                }
                
                .solid {
                    background-color: rgba(22,22,22,1);
                }
            </style>
            
            <div class="container elevation rounded">
                <slot></slot>
            </div>
        `;
    }
}

customElements.define(BunnyBox.is, BunnyBox);