//* 3. Création de la classe tour
class Tour {
    constructor() {
        this.players = [];
        this.currentPlayer = null;
    }

    // j'initialise ma liste de joueur lié
    initTour(players) {
        this.players = players;
        this.currentPlayer = players.listePlayerLinked[0];
    }

    // Obtenir le joueur suivant
    joueurSuivant() {
        if (this.currentPlayer.playernext === null) {
            return this.players.listePlayerLinked[0];
        }
        return this.currentPlayer.playernext;
    }
    // changer le joueur suivant
    changerJoueurActif() {
        this.currentPlayer = this.joueurSuivant();
    }

}


module.exports = Tour;
