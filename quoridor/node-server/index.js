/*
Serveur node.js utilisant Express et socket.io
Auteur : Gsociety
Jeu du quoridor
 */
const express = require('express');
const app = express();
const port = 3000;
const http = require('http');
const server = http.createServer(app);
const io = require("socket.io")(server);
const ListeRoom = require('./models/ListeRoom');
const ConnectionPlayer = require('./models/ConnectionPlayer');
require('./models/Tour');

app.use(express.static('../vue-client/dist'));

// Initialisation de la liste de salon
let rooms = new ListeRoom();

/* Quand un utilisateur se connecte au seveur */
io.on('connection', (socket) => {
    console.log(`[connection] ${socket.id}`);
    let room = {}; // initialisation du salon vide
    const connection = new ConnectionPlayer(); // Creer une instance pour gerer la connexion

    /*  CONNEXION D'UN JOUEUR  */
    socket.on('playerData', (player, game) => {

        console.log(`[playerData] ${player.roomId}`);
        /*  CREER UNE NOUVELLE ROOM  */
        if (!player.roomId) {
            room = connection.createRoom(rooms, player, game)
            io.emit('room id', room.id)
            io.emit('list rooms', rooms.roomsDispo());
        }
        /*  REJOINDRE UNE ROOM  */
        else {
            room = connection.joinRoom(rooms, player)
            io.emit('list rooms', rooms.roomsDispo());
        }

        /* AJOUTER LE SOCKET DU PLAYER AU SALON */
        socket.join(room.id);

        /* info quand autre joueurs rejoints le salon uniquement a un socket*/
        io.to(room.id).emit('join room', room.id);
        io.to(room.id).emit('list users', room.players);

        /* A FAIRE QUAND IL EXISTE AU MOINS UN SALON DE JEU */
        if (!rooms.isEmpty()) {
            if (room.sizePlayers() === room.info.nb_Players) {
                /* DEBUT DE LA PARTIE */
                io.to(room.id).emit('start game', room);
            }
        }
    });

    // Permet de gérer les evenement lors de la partie
    socket.on('game', (roomID) => {
        let room = rooms.findRoom(roomID);
        //
        if (socket.id === room.tour.currentPlayer.currentPlayer.socketId) {
            room.startTurn(room.tour.currentPlayer.currentPlayer.socketId)
            io.to(room.tour.currentPlayer.currentPlayer.socketId).emit('my turn', true);
            io.to(room.id).except(room.tour.currentPlayer.currentPlayer.socketId).emit('my turn', false)
            io.to(room.tour.currentPlayer.currentPlayer.socketId).emit('cells checked', room.arbitre.validCells);
        }
        //  ecouteur pour tester la si la pose des barrières est valide
        socket.on('testBar', (roomID, bar1, bar2) => {
            let room = rooms.findRoom(roomID);
            if (socket.id === room.tour.currentPlayer.currentPlayer.socketId) {//on verifie que c'est le bon joueur
                if (room.enoughtBar(socket.id)) { // on vérifie que le joueur dispose encore de barrières a poser
                    let res = room.arbitre.testValidBar(bar1, bar2, socket.id)
                    if (res) { // si le placement est valide
                        // je garde en mémoire les barrières
                        room.addBarriere(socket.id, bar1, bar2)
                        // je renvois au joueurs de la room la mise a jour du nombre de barrières disponible
                        io.to(room.id).emit('majBar', room.players)
                        // je change le tour du joueur
                        room.tour.changerJoueurActif()
                        room.startTurn(room.tour.currentPlayer.currentPlayer.socketId)
                        // je emet les informations nécessaire au joueurs
                        io.to(room.tour.currentPlayer.currentPlayer.socketId).emit('my turn', true);
                        io.to(room.id).emit('updated bar', bar1);
                        io.to(room.tour.currentPlayer.currentPlayer.socketId).emit('cells checked', room.arbitre.validCells);
                        io.to(room.id).except(room.tour.currentPlayer.currentPlayer.socketId).emit('my turn', false);
                    }
                    io.to(socket.id).emit('valid Bar', res);
                } else {
                    io.to(socket.id).emit('valid Bar', false);
                }
            }

        })

        // Pour prendre en compte un déplacement
        socket.on('coord', (roomID, coord) => {
            let room = rooms.findRoom(roomID);
            if (room) { // je vérifie que la room ne soit pas null
                let test = socket.id === room.tour.currentPlayer.currentPlayer.socketId
                if (test && room.antiCheat(coord)) {// je test si c'est le bon joueur et j'utilise .anticheat() pour verifier la validité de la cellule
                    // je regarde si un joueur a gagné
                    let isWin = room.updateCoordPion(socket.id, coord)
                    let sendCoord = {id: socket.id, coord: coord}
                    // j'envoie les nouvelle coordonné a tout les joeurs du salon
                    io.to(room.id).emit('change', sendCoord);
                    if (!isWin) { // si personne n'a gagné
                        room.tour.changerJoueurActif()
                        room.startTurn(room.tour.currentPlayer.currentPlayer.socketId) // o
                        io.to(room.tour.currentPlayer.currentPlayer.socketId).emit('my turn', true);
                        io.to(room.tour.currentPlayer.currentPlayer.socketId).emit('cells checked', room.arbitre.validCells);
                        io.to(room.id).except(room.tour.currentPlayer.currentPlayer.socketId).emit('my turn', false);
                    } else { // si victoire
                        io.to(room.id).emit('my turn', false);
                        io.to(room.id).emit('winner', socket.id);
                        console.log(`[winner] Room: ${room.id} | Player: ${socket.id}`)
                    }
                }
            }
        })
    })
    // Si un joueur quitte qui na pas commencé
    socket.on('deserter', ({roomId, host}) => {
        console.log(`[deserter] ${socket.id} `);
        rooms.disconnection(socket.id)
        io.emit('list rooms', rooms.roomsDispo());
        if (!host) { // si ce n'est pas l'hote la on supprime juste le joueur et les autres reste en attente
            const room = rooms.findRoom(roomId);
            io.to(roomId).emit('list users', room.players);
        }
    });

    /* OBTENIR LA LISTE DES JOUEURS DANS UN SALON */
    socket.on('get users', (roomID) => {
        const room = rooms.findRoom(roomID);
        io.to(roomID).emit('list users', room.players);
    });

    /* OBTENIR LA LISTE DES SALONS DISPONIBLE */
    socket.on('get rooms', () => {
        io.to(socket.id).emit('list rooms', rooms.roomsDispo());
    });

    /* GESTION DECONNEXION JOUEUR  */
    socket.on('disconnect', () => {
        console.log(`[disconnect] ${socket.id} `);
        let roomId = rooms.disconnection(socket.id)
        io.emit('list rooms', rooms.roomsDispo());
        if (roomId) {
            io.to(roomId).emit('disconnect players')
        }
    });

    //MESSAGERIE
    socket.on("message", (data, roomId) => {
        const room = rooms.findRoom(roomId);
        io.to(room.id).except(socket.id).emit("message recu", data)
    });
    socket.on("typing", (data, roomId) => {
        const room = rooms.findRoom(roomId);
        const username = data.username;
        io.to(room.id).except(socket.id).emit("typing", {username: data.username});
    });
    socket.on("stop typing", (roomId) => {
        const room = rooms.findRoom(roomId);
        io.to(room.id).except(socket.id).emit("stop typing");
    });
});

// Démarrage du serveur
server.listen(port, () => {
    console.log(`Le serveur écoute sur le port ${port}`);
});

