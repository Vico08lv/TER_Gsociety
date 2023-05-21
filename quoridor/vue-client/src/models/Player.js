import {reactive} from "vue";

export class Player {
    constructor() {
        const data = reactive({
            host: false,
            roomId: null,
            username: "",
            socketId: "",
            turn: false,
            color: null,
            positionStart: null,
            win: false,
            barLeft: null
        });
        Object.assign(this, data);
    }


    isHost(sockedId) {
        this.host = true;
        this.turn = true;
        this.socketId = sockedId;
    }
}
