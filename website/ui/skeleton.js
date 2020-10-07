import {html, render} from '/node_modules/lit-html/lit-html.js';

class CharacterList extends HTMLElement {

    static get is() {
        return '??';
    }

    connectedCallback() {
        this.attachShadow({mode: 'open'})
    }

    get template() {
        return html``;
    }

    render() {
        render(this.template, this.shadowRoot);
        this.bind();
    }

    query(selector) {
        return this.shadowRoot.querySelector(selector);
    }

    bind() {
    }
}

customElements.define(CharacterList.is, CharacterList);