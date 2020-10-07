window.TextEffects = class TextEffects {

    constructor() {
        this.counters = [];
        this.last = performance.now();
        this.effects = {
            'physical': this.physical,
            'heal': this.heal,
            'magic': this.magic,
            'experience': this.experience,
            'true': this.trueDamage,
            'chat': this.chat,
            'poison': this.poison
        };

        server.connection.setHandler('error', (event) => {
            this.effects['chat'](game.player, {
                text: event.message
            });
        });
    }

    update(delta) {
        for (let i = 0; i < this.counters.length; i++) {
            let counter = this.counters[i];

            if (!counter.visible) {
                counter.ttl = 0;
            }

            counter.ttl -= delta;

            if (counter.ttl <= 0 && counter.alpha <= 0) {
                game.stage.removeChild(counter);
                this.counters.splice(i, 1);
            } else {
                counter.speed *= counter.slowdown;
                counter.dx += counter.speed * Math.cos(counter.dir) * delta;
                counter.dy += counter.speed * Math.sin(counter.dir) * delta;

                counter.x = Math.trunc(counter.dx);
                counter.y = Math.trunc(counter.dy);

                if (counter.ttl > 0) {
                    counter.alpha += counter.fade_in * delta;
                }

                if (counter.ttl < 0) {
                    counter.alpha -= counter.fade_out * delta;
                }

                if (counter.alpha > 1.0) {
                    counter.alpha = 1.0;
                }
                if (counter.alpha < 0.0) {
                    counter.alpha = 0.0;
                }
            }
        }
    }

    style(options) {
        options = options || this.options();

        return new PIXI.TextStyle({
            fontFamily: 'Courier',
            fontSize: options.size || 18,
            fontStyle: options.fontStyle || 'normal',
            fontWeight: options.fontWeight || 'bold',
            fill: [options.begin, options.end], // gradient
            stroke: '#161616',
            strokeThickness: 2,
            dropShadow: true,
            dropShadowColor: '#000000',
            dropShadowBlur: 6,
            dropShadowAngle: Math.PI / 6,
            dropShadowDistance: 4,
        });
    }

    options() {
        return {
            begin: '#ffffff',
            end: '#ffffff',
        }
    }

    _create(target, text, options) {
        let style = this.style(options);
        //style.fontSize = 24;
        let counter = new PIXI.Text(text, style);
        counter.dir = (6.14 / 360) * Math.random() * 360;

        if (options.critical) {
            style.fontSize = 24;
            style.fontStyle = 'italic';
            counter.ttl = options.ttl || 2.2;
        } else {
            counter.ttl = options.ttl || 1.2;
        }

        if (options.float) {
            counter.dir = (6.14 / 360) * 270;
            counter.dx = target.x - (counter.width / 2);
            counter.dy = (target.y * 1.01) - target.height;
        } else {
            counter.dx = target.x - (counter.width / 2) + (target.width / 3) * Math.cos(counter.dir);
            counter.dy = target.y - (target.height / 2) + (target.height / 4) * Math.sin(counter.dir);
        }

        counter.alpha = 1.0;//0.18;
        counter.speed = 192;
        counter.slowdown = 0.825;
        counter.fade_in = 25;
        counter.fade_out = 8;

        // newer texts always on top!
        counter.layer = performance.now();

        counter.x = Math.trunc(counter.dx);
        counter.y = Math.trunc(counter.dy);

        this.counters.push(counter);
        game.stage.addChild(counter);
        return counter;
    }

    physical(target, event) {
        game.texts._create(target, event.value, {
            begin: '#cc0000',
            end: '#480000',
            critical: event.critical
        });
    }

    heal(target, event) {
        game.texts._create(target, '+' + event.value, {
            begin: '#06ff00',
            end: '#106301',
            float: true,
            critical: event.critical
        });
    }

    magic(target, event) {
        game.texts._create(target, event.value, {
            begin: '#ff03f5',
            end: '#690054',
            critical: event.critical
        });
    }

    experience(target, event) {
        game.texts._create(target, '+' + event.value, {
            begin: '#ffc200',
            end: '#b58400',
            float: true,
            ttl: 2.6,
            critical: true
        });
    }

    trueDamage(target, event) {
        game.texts._create(target, event.value, {
            begin: '#ffeaf9',
            end: '#4eaad5',
            critical: event.critical
        });
    }

    poison(target, event) {
        game.texts._create(target, event.value, {
            begin: '#ffcc00',
            end: '#0bb001',
            critical: event.critical
        });
    }

    chat(target, event) {
        game.texts._create(target, event.text, {
            begin: event.color1 || '#ffffff',
            end: event.color2 || '#ffffff',
            float: true,
            // longer chat messages has longer lifetime.
            ttl: 1.325 + event.text.length * 0.065,
            fontStyle: 'normal',
            fontWeight: 'normal',
            size: 16
        });
    }

    levelUp(target) {
        game.texts._create(target, `Level Up!`, {
            size: 18,
            float: true,
            ttl: 4.0,
            begin: '#ffc200',
            end: '#ffc200',
            fontStyle: 'normal'
        });
    }
};