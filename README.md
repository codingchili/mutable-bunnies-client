# Mutable Bunnies - Game Client

Browser based game client for the Mutable Bunnies game server. [Mutable Bunnies - Server](https://github.com/codingchili/mutable-bunnies-server)

![img/in-game-v3.png](img/in-game-v3.png)

Sample in-game image of a simple test world, first [demo video](https://www.youtube.com/watch?v=TlFcvCJb9lw) now available!

Uses Pixi.js for rendering and assets from gamedeveloperstudio, see [license](https://www.gamedeveloperstudio.com/license.php). This repository doesn't contain any client code or assets - as these may not be included in any open source listing. Contributions are welcome for the backend but only the core team may work on the client scripts/assets.

# Install & run

Until mutable-bunnies-server has a release available this repository should be cloned as a submodule to the 
mutable-bunnies-server project. See the instructions in the [repo](https://github.com/codingchili/mutable-bunnies-server)
on how to clone.

**Note**: The client requires licensed resources which are available as a submodule under 
`website/resources`. If you don't have acess to this repository then you need to set the
realm resource url to the public resource CDN. (which doesn't exist yet.)

When cloned as a git submodule inside the server project, the server can be started with

```console
./gradlew :client:generate
./gradlew :client:run
```

Create the distribution zip and run polymer build with:
```console
./gradlew :client:distribution
```

Building a docker image, make sure to build the distribution zip first.

```console
cd client
docker build -f Dockerfile ./build
docker run -p 443:443 -p 1443:1443 -p 9301:9301 -it <imageId>
```

# Configuration

The webserver can be configured in conf/service/web.yaml.

Example of the default configuration,

```yaml
---
node: "website.node"
startPage: "index.html"
missingPage: "404.html"
resources: "website/"
cache: false
gzip: false
global: "LSc7+5GuvEPkt80gTa9X6IdteHJ++aZWkBYsbWnvB1NpOEP6RcfW03qXNFj9HO4YAUX6JxohipZm51rReU553Q=="
logging:
  properties:
    type: "HmacSHA512"
  domain: "website.node"
  key: "+DPBfH6OGlvBvoLCKqlWZcj67apYCDBrQf1fZcllxW2xpwOB0VGqWHMCYnABgmZsS1NWNvk+6VOpQPfFbf5LKA=="
  expiry: 1599990680
listener:
  secure: true
  port: 443
```

See [conf/system/certificates/README.md](conf/system/certificates/README.md) for information on how to set up keystores
with `secure: true`. If keystore is unset then a test certificate is generated on the fly.

### Configuration paths

- conf/system - configuration for the [chili-core](https://github.com/codingchili/chili-core) framework.
- conf/game - game configuration, such as instances, items and npcs.
- conf/realm - realm server configuration.
- conf/service - microservices configuration, realm deployer, realm registry, authentication, banking etc.


### Progress

Overview of the client implementation progress

User interface
- [X] spellbar
- [X] character status
- [X] chat box
- [X] creature targeting
- [X] inventory
- [X] quest tracker
- [ ] crafting
- [ ] in-game help

Effects
- [X] skybox
- [X] sound effects
- [X] spell effects

Website
- [X] patch notes
- [X] realm list
- [X] character creation
- [X] login
- [ ] highscores
- [ ] character viewer
- [ ] auction client

##### Great software :blue_heart:
To make this project a reality we use only great software.

On the backend
- [mutable bunnies](https://github.com/codingchili/mutable-bunnies-server)  mutable bunnies server.

On the frontend
- [Polymer](https://www.polymer-project.org/) for the website and game UI.
- [PIXI.js](http://www.pixijs.com/) for client side rendering.

For art
- [MagicaVoxel](https://ephtracy.github.io/) for artwork!
- [Spine 2d](http://esotericsoftware.com/) for animations!