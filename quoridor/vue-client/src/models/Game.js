import {reactive} from "vue";

export class Game {
    constructor() {
        const data = reactive({
            nb_Players: 2,
            nb_Squares: 9,
            nb_Walls: 5,
            new_nb_Walls: 5
        });
        Object.assign(this, data);
    }
}

