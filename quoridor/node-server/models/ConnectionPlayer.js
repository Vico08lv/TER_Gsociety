/*
* Pour gerer si un joueur Crée un game ou rejoint une game
* */

const Room = require("./Room");

class ConnectionPlayer {

    constructor() {
    }

    createRoom(rooms,player,game)
    {
        let room = new Room(game); // donner une valeur de constructeur de classe
        room.addPlayer(player) // j'ajoute l'hote de la partie
        rooms.addRoom(room); // ajout de la room a la liste
        return room;
    }

    joinRoom(rooms,player)
    {
        let room = rooms.findRoom(player.roomId);
        if (room === undefined) { // je verifie que room est bien définit
            return ;
        }
        room.addPlayer(player)
        return room;
    }

}

module.exports = ConnectionPlayer;