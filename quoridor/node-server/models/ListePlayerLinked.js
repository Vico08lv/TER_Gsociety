const PlayerLinked = require('./PlayerLinked');

class ListePlayerLinked {
    constructor({nb_Players}) {
        this.tailleMax = nb_Players
        this.listePlayerLinked = [];
    }

    addPlayerLinked(players) {
        players.forEach(p => {
            this.listePlayerLinked.push(new PlayerLinked(p))
        })
        for (let i = 0; i < this.tailleMax; i++) {
            if (i === this.tailleMax - 1) break
            this.listePlayerLinked[i].playernext = this.listePlayerLinked[i + 1]
        }
    }


}

module.exports = ListePlayerLinked;
