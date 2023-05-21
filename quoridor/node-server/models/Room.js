/*
Permet de stocker les methodes et les informations liés au salon
 */

const ListePlayerLinked = require('./ListePlayerLinked');
const Tour = require("./Tour");
const {Pion, Barriere, Coord} = require("./Pion");
const Arbitre = require("./Arbitre");

class Room {

    constructor(game) {
        this.id = Math.random().toString(36).substr(2, 9);
        this.info = game;
        this.players = [];
        this.initGame = [];
        this.listePlayerLinked = new ListePlayerLinked(game);
        this.tour = new Tour();
        this.pions = {}
        this.barrieres = {"V": [], "H": []}
        this.savedValidCells = null
    }
    // Mettre a jour les coordonnées du pion
    updateCoordPion(socketId, coord) {

        if (this.pions[socketId].testVict === "y-") { // camp_opposé : bas
            this.pions[socketId].score = this.pions[socketId].score + (this.pions[socketId].coord.y - coord.y);
        } else if (this.pions[socketId].testVict === "y+") { // camp_opposé : haut
            this.pions[socketId].score = this.pions[socketId].score - (this.pions[socketId].coord.y - coord.y);
        } else if (this.pions[socketId].testVict === "x-") { // camp_opposé : droite
            this.pions[socketId].score = this.pions[socketId].score + (this.pions[socketId].coord.x - coord.x);
        } else if (this.pions[socketId].testVict === "x+") { // camp_opposé : gauche
            this.pions[socketId].score = this.pions[socketId].score - (this.pions[socketId].coord.x - coord.x);
        }
        this.pions[socketId].coord.x = coord.x
        this.pions[socketId].coord.y = coord.y
        return this.pions[socketId].score === 0;

    }

    // A chaque début de tour je réinitialise l'arbitre
    startTurn(socketId) {
        this.arbitre = null
        this.arbitre = new Arbitre(this.pions, this.barrieres, this.info)
        this.savedValidCells = this.arbitre.checkMoves(socketId)
    }

    // Pour vérifier si la cellule du pion est bien valide
    antiCheat(coord) {
        let valid = false
        this.savedValidCells.forEach(c => {
            if (c.x === coord.x && c.y === coord.y) {
                valid = true
            }
        })
        return valid
    }

    // Ajout du joueur a la room
    addPlayer(player) {
        this.players.push(player)
        // calcul de la position initiale du pion
        this.positionPionStart(this.info, this.sizePlayers(), player)
        this.initGame.push(this.paramPlayers(player, this.sizePlayers()));
        if (this.sizePlayers() === this.info.nb_Players) {// si la game est complete
            // je crée des joeurs lié afin d'obtenir l'ordre des joueurs
            this.listePlayerLinked.addPlayerLinked(this.players)
            this.tour.initTour(this.listePlayerLinked)
        }
        console.log(`[room] socketId : ${player.username} add room : ${this.id}`);
    }
    // Tester le un joueur a suffisament de mur restant a poser
    enoughtBar(socketId) {
        let enough = false
        this.players.forEach(p => {
            if (p.socketId === socketId) {
                if (p.barLeft > 0) {
                    enough = true
                }
            }
        })
        return enough
    }

    // Ajout d'une barrière
    addBarriere(socketId, bar1, bar2) {
        this.barrieres[bar1.name].push(new Barriere(new Coord(bar1.x1, bar1.y1), socketId));
        this.barrieres[bar2.name].push(new Barriere(new Coord(bar2.x1, bar2.y1), socketId));
        this.players.forEach((p, index) => {
            if (p.socketId === socketId) {
                this.players[index].barLeft = this.players[index].barLeft - 1
            }
        })
    }

    sizePlayers() {
        return this.players.length
    }

    isEmpty() {
        return this.sizePlayers() === 0
    }
    // Calcul des positions initales
    positionPionStart({nb_Squares, nb_Walls}, num, player) {
        switch (num) {
            case 1:
                player.positionStart = {x: Math.floor(nb_Squares / 2), y: 0}
                this.pions[player.socketId] = new Pion("y-", nb_Squares - 1, player.socketId, new Coord(player.positionStart.x, player.positionStart.y))
                break;
            case 2:
                player.positionStart = {x: Math.floor(nb_Squares / 2), y: nb_Squares - 1}
                this.pions[player.socketId] = new Pion("y+", nb_Squares - 1, player.socketId, new Coord(player.positionStart.x, player.positionStart.y))
                break;
            case 3:
                player.positionStart = {x: 0, y: Math.floor(nb_Squares / 2)}
                this.pions[player.socketId] = new Pion("x-", nb_Squares - 1, player.socketId, new Coord(player.positionStart.x, player.positionStart.y))
                break;
            case 4:
                player.positionStart = {x: nb_Squares - 1, y: Math.floor(nb_Squares / 2)}
                this.pions[player.socketId] = new Pion("x+", nb_Squares - 1, player.socketId, new Coord(player.positionStart.x, player.positionStart.y))
                break;
        }
    }
    // Determiner les informations de chaque joeur : couleur, bord opposé etc
    paramPlayers({socketId, username, positionStart}, num) {
        switch (num) {
            case 1:
                return {
                    socketId: socketId,
                    positionStart: positionStart,
                    color: "#B391D3",
                    username: username,
                    bord_oppose: "bas"
                };
            case 2:
                return {
                    socketId: socketId,
                    positionStart: positionStart,
                    color: "#14C7D5",
                    username: username,
                    bord_oppose: "haut"
                };
            case 3:
                return {
                    socketId: socketId,
                    positionStart: positionStart,
                    color: "#F10002",
                    username: username,
                    bord_oppose: "droite"
                };
            case 4:
                return {
                    socketId: socketId,
                    positionStart: positionStart,
                    color: "#F48229",
                    username: username,
                    bord_oppose: "gauche"
                };
        }
    }

    // Retirer un joueur du salon
    removePlayer(player) {
        const index = this.players.indexOf(player);
        this.players.splice(index, 1);
    }


}

module.exports = Room;