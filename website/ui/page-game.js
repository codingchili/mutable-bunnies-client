import {html, render} from '/node_modules/lit-html/lit-html.js';

export class PageGame extends HTMLElement {

    get template() {
        return html`
            <style>
                :host {
                    display: inline-block;
                    width: 100%;
                }

                .title {
                    text-align: left;
                    padding-top: 16px;
                }

                .title {
                    padding-top: 16px;
                    margin-left: 16px;
                }

                .text {
                    margin-left: 32px;
                    margin-right: 32px;
                    padding-bottom: 24px;
                }

                .item {
                    margin-bottom: 32px;
                    margin-top: 32px;
                }

                #demo-video {
                    text-align: center;
                    margin: 32px;
                }

                .gif {
                    display: block;
                    margin: auto;
                    min-height: 192px;
                    animation: fadeIn ease 0.8s;
                }
                
                @keyframes fadeIn {
                    0% { opacity: 0 }
                    100% { opacity: 1 }
                }

            </style>

            <div class="container">
                    <div class="item">

                        <!--<div id="demo-video">
                            <iframe width="560" height="315" src="https://www.youtube.com/embed/WETENsMuUKQ"
                                    frameborder="0"
                                    allow="accelerometer; autoplay; encrypted-media; gyroscope; picture-in-picture"
                                    allowfullscreen></iframe>
                        </div>-->

                        <div class="text">
                            <p>
                                Mutable Bunnies is a two-dimensional online role playing game that
                                spans multiple dimensions, planes, transcends species and beliefs.
                            </p>

                                <video muted loop autoplay src="../images/bunbun2.webm" class="gif"></video>

                            <p>
                                Bunnies have been chosen for an extraordinary quest, a quest that
                                will change life as it's currently known. The salvation of species
                                and the end of others, is there a bigger plot? Will you bring
                                the end of the world.. or save it? It's a matter of perspective, of which
                                there are many throughout the planes..
                            </p>

                                <!--<video muted loop autoplay class="gif" src="../images/squito.webm">-->

                            <p>
                                Take on your worst bunny-fears and face all manners of scary creatures
                                from alternate dimensions. Grow stronger through your adventures,
                                learn new skills and meet unexpected friends. The multiverse is in your
                                paws bunbun.
                            </p>

                            <!-- penguin gif? -->


                            <!--<h4>Screenshots</h4>-->
                            <!-- 3x2 in game screenshots -->

                        </div>
                </div>
            </div>
        `;
    }

    static get is() {
        return 'page-game';
    }

    connectedCallback() {
        this.attachShadow({mode: 'open'});
        render(this.template, this.shadowRoot);
    }
}

window.customElements.define(PageGame.is, PageGame);