class ListeRoom {

    constructor() {
        this.rooms = [];
    }


    addRoom(room) {
        this.rooms.push(room);
        console.log(`[listeRoom] ${room.id} ajouté a la liste`)
    }

    findRoom(roomId) {
        return this.rooms.find(r => r.id === roomId);
    }

    roomsDispo() {
        return this.rooms.filter(r => r.players.length < r.info.nb_Players)
    }

    sizeRooms() {
        return this.rooms.length
    }

    isEmpty() {
        return this.sizeRooms() === 0;
    }

    removeRoom(room) {
        this.rooms = this.rooms.filter(r => r !== room);
    }

    disconnection(socketid) {
        let currentRoom = null

        this.rooms.forEach(r => {
            r.players.forEach(p => {
                if (p.socketId === socketid) {
                    currentRoom = r.id
                    if (p.host) {
                        this.removeRoom(r);
                    } else {
                        r.removePlayer(p)
                    }
                }
            });
        });
        return currentRoom
    }


}

module.exports = ListeRoom;