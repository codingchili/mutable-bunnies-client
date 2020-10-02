import {html, render} from '/node_modules/lit-html/lit-html.js';
import {repeat} from 'lit-html/directives/repeat.js';

import '../../component/bunny-tooltip.js'
import '../../component/bunny-progress.js'
import '../../component/bunny-box.js'
import './stats-view.js'

class PlayerStatus extends HTMLElement {

    static get is() {
        return 'player-status';
    }

    connectedCallback() {
        this.attachShadow({mode: 'open'})
    }

    get target() {
        return this._target;
    }

    set target(value) {
        if (value) {
            value.stats = value.stats || {};
            this._target = value;

            if (this.shadowRoot) {
                this.render();
            }
        }
    }

    constructor() {
        super();
        this.afflictions = [];
        this.compact = false;
        this._target = {
            stats: {}
        };

        setInterval(this.render.bind(this), 1000);

        application.onGameLoaded(this._listen.bind(this));
        application.onRealmLoaded(realm => this.realm = realm);

        if (this.compact) {
            this.query('#health-bar').classList.add('health-bar-mini');
            this.query('.frame').classList.add('frame-mini');
            this.query('#portrait').classList.add('portrait-mini');
            this.query('#afflictions').classList.add('afflictions-mini');
            this.query('class-icon').classList.add('class-icon-mini');
            this.style.width = '276px';
        }
    }

    _targeting() {
        game.publish('character-target', this.target);
    }

    _integer(number) {
        return Math.round(number);
    }

    _listen() {
        game.subscribe('character-update', (creature) => {
            if (creature.id === this.target.id) {
                this._updatePlayerState(creature);
            }
        });
    }

    _portrait() {
        if (this.target && this.realm && this.target.classId) {
            return `${this.realm.resources}/gui/class/${this.target.classId}.svg`;
        } else {
            //return 'data:image/gif;base64,R0lGODlhAQABAAD/ACwAAAAAAQABAAACADs=';
            return "";
        }
    }

    _notifyTargetChange(target) {
        if (target) {
            this._updatePlayerState(target);
        }
    }

    _updatePlayerState(target) {
        this._default(target, 'experience');
        this._default(target, 'nextlevel');
        this._default(target, 'energy');

        this.target = target;

        if (target.afflictions) {
            this.afflictions = target.afflictions;
        }

        this.render();
        this.query('#stats').selected = target;
    }


    _description(affliction) {
        return eval('`' + affliction.description + '`');
    }

    _default(target, attribute, def) {
        if (!target.stats) {
            target.stats = {
                health: 0,
                maxhealth: 1,
                energy: 0,
                maxenergy: 1,
                experience: 0,
                nextlevel: 1
            };
        }
        if (!target.stats[attribute]) {
            target.stats[attribute] = (def) ? def : 0;
        }
    }

    get template() {
        return html`
        <style>
            :host {
                position: absolute;
                left: 16px;
                top: 16px;
                width: 408px;
                z-index: 700;
            }

            .frame {
                display: block;
                height: 68px;
                z-index: 495;
            }

            .portrait {
                height: 42px;
                margin-top: 4px;
                margin-left: 10px;
            }

            .name {
                display: block;
                position: absolute;
                left: 66px;
                opacity: 0.86;
                top: 12px;
            }

            .health-bar {
                margin-left: 64px;
                margin-right: 8px;
                margin-top: 32px;
                padding: 4px;
                --bunny-progress-active-color: #8c0006;
                --bunny-progress-container-color: #8c000632;
            }

            .energy-bar {
                top: 32px;
                left: 64px;
                margin-left: 64px;
                margin-right: 8px;
                margin-top: 4px;
                padding: 4px;
                --bunny-progress-active-color: #4db6ac;
                --bunny-progress-container-color: #4db6ac32;
            }

            .level {
                display: block;
                position: absolute;
                top: 4px;
                right: 14px;
                width: 48px;
                text-align: right;
                font-size: larger;
            }

            .exp-bar {
                width: 46px;
                margin-top: -11px;
                padding: 4px;
                margin-left: 6px;
                --bunny-progress-active-color: #b6a500;
                --bunny-progress-container-color: #b6a50032;
            }

            .health-bar > paper-progress {
                width: 100%;
            }

            .energy-bar > paper-progress {
                width: 100%;
            }

            .exp-bar > paper-progress {
                width: 100%;
            }

            .class-icon {
                position: absolute;
            }

            /* compact display classes ends with -mini. */
            .health-bar-mini {
                margin-top: 8px;
            }

            .portrait-mini {
                width: 24px;
                height: 24px;
                left: 8px;
                top: -2px;
                position: absolute;
            }

            .frame-mini {
                height: 40px;
                width: 276px;
            }

            .afflictions-mini {
                position: absolute;
                left: 222px;
                top: 0px;
            }

            .class-icon-mini {
                position: unset;
            }

            @media (max-width: 728px) {
                :host {
                    top: 0px;
                    left: 0px;
                    right: 2px;
                    width: unset;
                }

                .energy-bar {
                    width: 80%;
                }

                .health-bar {
                    width: 80%;
                }
            }

            #afflictions {
                margin-left: 72px;
                display: flex;
                flex-wrap: wrap;
                z-index: 850;
                flex-direction: row;
                width: 296px;
                position: relative;
            }

            .affliction-icon {
                max-width: 24px;
                max-height: 24px;
                margin: auto;
                display: block;
                margin-top: 4px;
            }

            @keyframes fadein {
                from {
                    opacity: 0;
                }
                to {
                    opacity: 1;
                }
            }

            .affliction {
                width: 32px;
                min-width: 24px;
                padding: 4px;
                height: 32px;
                margin: 4px;
                animation: fadein 0.72s ease 1;
            }

            .duration {
                color: #00b0ff;
            }

            .info-table {
                margin-top: 12px;
                width: 100%;
            }

            .title {
                font-size: larger;
            }

            .description {
                margin-top: 12px;
                display: block;
                font-size: small;
            }

            .class-stats {
                font-size: 14px;
                width: 176px;
            }

            .stats-tooltip {
                margin-left: 64px;
                z-index: 99999;
            }

            .class-stats {
                z-index: 999999;
            }

            img[src=""] {
                display: none;
            }

            .stats-level {
                display: block;
                right: 12px;
                position: absolute;
                top: 8px;
            }

            #stats {
                margin-top: 8px;
            }

            .spell-info {
                width: 192px;
            }

            .noselect {
                user-select: none;
            }

        </style>


        <bunny-box border elevation="3" id="frame" class="noselect frame">

            <slot></slot>

            <span ?hidden="${this.compact}" class="level">${this.target.stats.level}</span>
            <span ?hidden="${this.compact}"    class="name">${this.target.name}</span>

            <div @click="${this._targeting.bind(this)}" class="class-icon" id="class-icon">
                <img id="portrait" class="portrait" src="${this._portrait(this.target, this.realm)}">
                <bunny-tooltip animation-delay="0" position="bottom" class="stats-tooltip" for="portrait">
                    <div class="class-stats">
                        <span class="stats-header">${this.target.name}'s stats</span>
                        <span class="stats-level">lv. ${this.target.stats.level}</span>
                        <stats-view id="stats" compact="true" .selected="${this.target}"
                                    style="display:block"></stats-view>
                    </div>
                </bunny-tooltip>
            </div>

            <div class="health-bar" id="health-bar">
                <bunny-progress class="transiting" max="${this.target.stats.maxhealth}"
                                value="${this.target.stats.health}"></bunny-progress>
            </div>
            <bunny-tooltip class="" animation-delay="0" position="bottom">
                <span>${this._integer(this.target.stats.health)} / ${this._integer(this.target.stats.maxhealth)}</span>
            </bunny-tooltip>

            <div class="energy-bar">
                <bunny-progress class="transiting" max="${this.target.stats.maxenergy}"
                                value="${this.target.stats.energy}"></bunny-progress>
            </div>
            <bunny-tooltip class="" animation-delay="0" position="bottom">
                <span>${this._integer(this.target.stats.energy)} / ${this._integer(this.target.stats.maxenergy)}</span>
            </bunny-tooltip>

            <div class="exp-bar">
                <bunny-progress class="transiting" max="${this.target.stats.nextlevel}"
                                value="${this.target.stats.experience}"></bunny-progress>
            </div>
            <bunny-tooltip class="" animation-delay="0" position="bottom">
                <span>${this._integer(this.target.stats.experience)} / ${this._integer(this.target.stats.nextlevel)}</span>
            </bunny-tooltip>

        </bunny-box>

        <div id="afflictions">
            ${repeat(this.afflictions, affliction => affliction.id, this.afflictionHtml.bind(this))}
        </div>

        `;
    }

    afflictionHtml(active) {
        return html`
            <bunny-box border class="affliction">
                <img src="${this.realm.resources}/gui/afflictions/${active.affliction.id}.svg" class="affliction-icon" alt="affliction">
            </bunny-box>
            <bunny-tooltip class="spell-info" position="bottom">
                    <div>
                        <span class="title">${active.affliction.name}</span>

                        <table class="info-table">
                            <tr>
                                <th>Duration</th>
                            </tr>
                            <tr style="text-align: center;">
                                <td class="duration">${active.duration}s</td>
                            </tr>
                        </table>

                        <span class="description">${this._description(active.affliction)}</span>
                    </div>
                </bunny-tooltip>
        `;
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

customElements.define(PlayerStatus.is, PlayerStatus);