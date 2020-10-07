window.Designer = class Designer {

    constructor() {
        this.marker = {
            active: false
        };
    }

    registry(callback) {
        server.connection.send('registry', {}, (response) => {
            this.registry = response.collection;
            callback(response);
        });
    }

    spawn(id, callback) {
        let request = {
            id: id,
            x: game.world().x,
            y: game.world().y,
            type: 'SPAWN'
        }
        server.connection.send('modify', request, callback);
    }

    update() {
        if (this.marker.active) {
            let sprite = this.marker.sprite;
            sprite.x = game.world().x;
            sprite.y = game.world().y;
        }
    }

    load(id) {
        let item = this.registry.filter(item => item.id === id)[0];

        Loader.load((resource) => {
            let sprite = Loader.toSprite(resource);
            sprite.layer = resource.model.layer;

            this.marker = {
                item: item,
                sprite: resource,
                active: true
            }
            game.stage.addChild(this.marker.sprite);
        }, item.model).begin();
    }

    commit() {
        if (this.marker.active) {
            this.spawn(this.marker.item.id)
        }
    }

    unload() {
        this.marker.active = false;
        game.stage.removeChild(this.marker.sprite);
    }
}
