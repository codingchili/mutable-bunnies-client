window.AdminHandler = class AdminHandler {

    constructor() {
        game.subscribe('character-target', target => {
            this.target = target;
        })

        server.connection.setHandler('admin', {
            accepted: event => {
                game.chat.system(event.message);
            },
            error: event => {
                game.chat.system(event.message);
            }
        });
    }

    command(msg) {
        msg = msg.replace('.', '');
        server.connection.send('admin', {
            line: msg,
            entity: (this.target) ? this.target.id : null,
            vector: {
                x: game.world().x,
                y: game.world().y
            }
        });
    }
}