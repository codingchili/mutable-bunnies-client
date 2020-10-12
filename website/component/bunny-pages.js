import {html, render} from '/node_modules/lit-html/lit-html.js';

class BunnyPages extends HTMLElement {

    constructor() {
        super();
        this.page = this.getAttribute("page");
        this.tabs = [];
        this.listener = () => {
        };
    }

    onclicked() {
        this.listener();
    }

    set clicked(callback) {
        this.listener = callback;
    }

    static get is() {
        return 'bunny-pages';
    }

    connectedCallback() {
        this.attachShadow({mode: 'open'});
        this.page = this.getAttribute('selected') || 0;
        render(this.template, this.shadowRoot);

        let query = (selector) => {
            let hits = this.shadowRoot.querySelector(selector);
            let assigned = hits.assignedNodes();
            if (hits && assigned.length > 0) {
                return Array.from(assigned[0].children)
            } else {
                return [];
            }
        }

        customElements.whenDefined('bunny-tab').then(() => {
            let selected = false;
            this.pages = query('slot[name="pages"]');
            this.tabs = query('slot[name="tabs"]');

            for (let i = 0; i < this.tabs.length; i++) {
                let tab = this.tabs[i];
                tab.parentElement.style.cssText = `
                    display: flex;
                    flex-direction: row;
                `;

                tab.clicked = () => this.update(i);

                if (tab.hasAttribute('active')) {
                    this.update(i);
                    selected = true;
                }
            }
            if (!selected) {
                this.update(this.page);
            }
        });
    }

    update(index) {
        for (let i = 0; i < this.pages.length; i++) {
            this.pages[i].setAttribute('index', i);
            this.pages[i].style.display = (i === index) ? 'block' : 'none';

            if (i < this.tabs.length) {
                let tab = this.tabs[i];
                (i === index) ? tab.activate() : tab.inactivate();
            }
        }
    }

    get template() {
        return html`
        <style>
            :host {
                display: block;
                width: 100%;
                height: 100%;
            }
            
            .tabhost {
                    display:flex;
                    flex-flow: row nowrap;
                    justify-content: space-around;  
                    align-items: stretch;
                    flex-direction: column;
                }
        </style>
        
        <div id="container">
            <!-- map tabs to pages in here. -->
            <slot name="tabs"></slot>
            <slot name="pages"></slot>
        </div>
        `;
    }
}

customElements.define(BunnyPages.is, BunnyPages);