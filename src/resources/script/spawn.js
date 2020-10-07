const SPAWN = 'SPAWN';
const DESPAWN = 'DESPAWN';

window.SpawnHandler = class SpawnHandler {

    constructor(camera) {
        this.camera = camera;

        server.connection.setHandler('death', event => {
            this.death(game.lookup(event.targetId), game.lookup(event.sourceId));
        });

        server.connection.setHandler('spawn', event => {
            this._spawn(event.entity, event.spawn);
            Loader.begin();
        });
    }

    /**
     * Join event received when entering a new instance.
     *
     * @param event
     * @param done
     */
    join(event, done) {
        game.entities = [];
        this._init(event);

        // in the future we might want to split rendering of entities and creatures.
        this._spawn(event.entities, SPAWN);
        this._spawn(event.creatures, SPAWN);
        Loader.begin(done);

    }

    _init(event) {
        let {texture} = event;
        let {size, tileSizePx, tileScaledWidth} = event.projection;

        Loader.load((sprite) => {
            // improves performance for the tiling
            sprite.texture.baseTexture.wrapMode = PIXI.WRAP_MODES.REPEAT;

            let container = new PIXI.Container();
            let tiling = new PIXI.TilingSprite(
                sprite.texture,
                size.y * tileSizePx,
                size.x * tileSizePx
            );
            container.scale.y = Math.tan(30 * Math.PI / 180);
            tiling.rotation += Math.PI * 2 * (1 / 8);

            // offset cartesian x-axis to align with isometric axes.
            container.x = size.x * tileScaledWidth / 2;
            container.layer = -1;
            container.addChild(tiling);
            game.stage.addChild(container);

        }, texture);
    }

    _spawn(spawnable, type) {
        let entities = [];

        if (Array.isArray(spawnable)) {
            entities = spawnable;
        } else {
            entities.push(spawnable);
        }

        for (let entity of entities) {
            if (type === SPAWN) {
                this.spawn(entity);
            }
            if (type === DESPAWN) {
                this.despawn(game.lookup(entity.id));
            }
        }
    }

    spawn(entity) {
        let vector = entity.vector;

        game.entities[entity.id] = entity;

        Loader.load((resource) => {
            let sprite = Loader.toSprite(resource);

            Object.assign(sprite, entity);

            sprite.x = vector.x;
            sprite.y = vector.y;
            sprite.velocity = vector.velocity;
            sprite.direction = vector.direction;
            sprite.layer = entity.model.layer;
            sprite.id = entity.id;

            // not needed, unwrapped.
            delete sprite.vector;

            game.entities[entity.id] = sprite;

            this._onPlayerSpawnHook(sprite);
            this._onDialogSupportedHook(sprite);
            this._onLootableHook(sprite);
            this._onContextMenuHook(sprite);
            this._onTargetHook(sprite);
            this._processAfflictionsHook(sprite);

            if (entity.account) {
                game.chat.add({text: `${entity.name} has joined.`, system: true});

                // slot; left-hand-sword, right-hand-sword, left-hand-staff, etc.
                /*Loader.load((xsprite) => {
                    sprite.hackTextureBySlotName("arm-down", xsprite.texture);
                }, "/game/equipment/sword_05.png").begin();*/
            }
            game.stage.addChild(sprite);

        }, entity.model);
    }

    _onLootableHook(entity) {
        if (entity.interactions.includes('loot')) {
            entity.interactive = true;
            entity.buttonMode = true;

            entity.on('pointerdown', (e) => {
                input.ifLeftMouse(() => {
                    game.inventory.requestLootList(entity);
                });
            });
        }
    }

    _onContextMenuHook(entity) {
        entity.interactive = true;
        entity.on('pointerdown', (e) => {
            input.ifRightMouse(() => {
                if (e.data.originalEvent.altKey) {
                    application.publish('context-menu', {
                        pointer: e,
                        target: entity
                    });
                }
            });
        });
    }

    _onDialogSupportedHook(entity) {
        if (entity.interactions.includes('dialog')) {
            entity.interactive = true;
            entity.buttonMode = true;
            entity.on('pointerdown', (e) => {
                input.ifLeftMouse(() => {
                    game.dialogs.start(entity.id);
                });
            });
        }
    }

    _onTargetHook(entity) {
        entity.interactive = true;
        entity.on('pointerdown', (e) => {
            input.ifLeftMouse(() => {
                game.publish('character-target', entity);
            });
        });
    }

    _onPlayerSpawnHook(sprite) {
        if (this.isPlayer(sprite)) {
            sprite.isPlayer = true;
            game.setPlayer(sprite);
            application.characterLoaded(sprite);
            game.publish('character-update', sprite);
            this.camera.set(sprite.x, sprite.y);
            this.camera.focus(sprite);
        }
        if (sprite.account) {
            game.publish('player-spawn', sprite);
        }
    }

    _processAfflictionsHook(sprite) {
        if (sprite.afflictions) {
            for (let item of sprite.afflictions) {
                item.loaded = true;
                game.spells.affliction(item);
            }
        }
    }

    isPlayer(entity) {
        return entity.account === application.token.domain;
    }

    death(target, source) {
        target.dead = true;

        if (target.isPlayer) {
            sound.play("the_end.mp3");

            application.publish('player-death', () => {
                game.shutdown();
                application.showCharacters();
            });
        } else {
            sound.play("drop_dead.mp3");
            if (target.account) {
                game.chat.add({text: `${target.name} was undone by ${source.name}.`, system: true});
            }
        }
    }

    despawn(target) {
        game.stage.removeChild(target);
        delete game.entities[target.id];

        if (target.account && !target.dead) {
            game.chat.add({text: `${target.name} has left.`, system: true});
        }
        if (target.account) {
            game.publish('player-leave', target);
        }
        game.publish('creature-despawn', target);
    }
};