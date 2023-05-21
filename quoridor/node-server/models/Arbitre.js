//TODO : test deplacement si on bloque un pion adverse pour 1 tour (cas du bout du tunnel)

const {Coord, Barriere, Pion} = require("./Pion");

class Arbitre {

    validCells = []

    constructor(pions, walls, param) {
        this.param = param
        /*pions = {socketId:Pion(socket,coord(x,y)),...}*/
        this.pions = pions
        /*walls = {type:[],...}*/
        this.walls = walls
    }
    // Permet de récuperer la liste des cellules valide a chaque début de tour
    checkMoves(socketId) {
        let cellPion = this.pions[socketId]
        this.validCells = this.adjacentValidCells(cellPion)
        return this.validCells
    }

    //Permet de récupérer les cells en +-1 de la cell ou se trouve le pion du joueur à qui c'est le tour
    findCells(myCell) {
        return [new Coord(myCell.coord.x - 1, myCell.coord.y),
            new Coord(myCell.coord.x, myCell.coord.y - 1),
            new Coord(myCell.coord.x + 1, myCell.coord.y),
            new Coord(myCell.coord.x, myCell.coord.y + 1)];
    }

    // Permet de tester si il y a une barrière entre un cellules et ses cellules adjacentes
    testBarr(myCell, checkingCells) {

        if (this.walls["H"].length === 0 && this.walls["V"] === 0) this.validCells = checkingCells;
        else {
            for (let indice = checkingCells.length - 1; indice >= 0; indice--) {
                let c = checkingCells[indice];
                if ((myCell.y - c.y) === 0) {// horizontale
                    let wallV = this.walls["V"]
                    if ((myCell.x - c.x) > 0) { // gauche
                        if (wallV.find(w => w.coord.x === myCell.x - 1 && w.coord.y === myCell.y)) {// si une barriere est en travers de notre route , sur ma route oui
                            checkingCells.splice(indice, 1); // On enlève la barrière
                        }
                    } else { // droite
                        if (wallV.find(w => w.coord.x === myCell.x && w.coord.y === myCell.y)) {// si une barriere est en travers de notre route , sur ma route oui
                            checkingCells.splice(indice, 1); // On enlève la barrière
                        }
                    }
                }
                if ((myCell.x - c.x) === 0) { // verticale
                    let wallH = this.walls["H"]
                    if ((myCell.y - c.y) > 0) { // haut
                        if (wallH.find(w => w.coord.x === myCell.x && w.coord.y === myCell.y - 1)) {// si une barriere est en travers de notre route , sur ma route oui
                            checkingCells.splice(indice, 1); // On enlève la barrière
                        }
                    } else { // bas

                        if (wallH.find(w => w.coord.x === myCell.x && w.coord.y === myCell.y)) {// si une barriere est en travers de notre route , sur ma route oui
                            checkingCells.splice(indice, 1); // On enlève la barrière
                        }
                    }
                }
            }
        }
        return checkingCells
    }

    //test si cellules adjacentes valides pour déplacement et retourne liste cells valides après les test
    adjacentValidCells(cell) {
        let res = []
        let myCell = cell
        let checkingCells = this.findCells(myCell)
        let checkingCells2
        //on retire les coords des cells qui ne sont pas dans le plateau
        checkingCells = checkingCells.filter(c => c.x > -1 && c.y > -1 && c.x < this.param.nb_Squares && c.y < this.param.nb_Squares)

        // on garde les cellules valide
        checkingCells = this.testBarr(myCell.coord, checkingCells)
        checkingCells2 = checkingCells
        //pour chaque pion on verifie sur si il est sur une des celllules valide
        for (const key of Object.keys(this.pions)) {
            const pion = this.pions[key];
            for (let i = 0; i < checkingCells.length; i++) { // pour chaque cellules
                if (checkingCells[i].x === pion.coord.x && checkingCells[i].y === pion.coord.y) {
                    let direction1 = checkingCells[i].x - myCell.coord.x // on regarde ou se situe la cellule par rapport au mycell
                    if (direction1 === 0) { // Vertical
                        let direction2 = checkingCells[i].y - myCell.coord.y // on regarde si la celuile ce situe en haut ou en bas
                        if (direction2 < 0) { // haut
                            // i,j-2 / muCell
                            if (myCell.coord.y - 2 < 0) { // dans le cas ou la cellule en -2 (lors d'un saut) est inférieur a 0
                                // je test si les cellules a doite et a gauche sont valides
                                this.testBarr(checkingCells[i], [new Coord(myCell.coord.x - 1, myCell.coord.y - 1), new Coord(myCell.coord.x + 1, myCell.coord.y - 1)]).forEach(r => res.push(r))
                            } else { // sinon je recupère la cellule en -2 (elle est dans le plateau)
                                // je test si elle est valide
                                let out = this.testBarr(checkingCells[i], [new Coord(myCell.coord.x, myCell.coord.y - 2)])
                                if (out.length !== 0) { // si taille différent de zero c'est que la cellule est valide
                                    out.forEach(r => res.push(r)) // je l'ajoute
                                } else {// sinon je test les cellules a droite et a gauche (ps: allez voir le rapport c'est mieux expliqué)
                                    this.testBarr(checkingCells[i], [new Coord(myCell.coord.x - 1, myCell.coord.y - 1), new Coord(myCell.coord.x + 1, myCell.coord.y - 1)]).forEach(r => res.push(r))
                                }
                            }
                            /*  IDEM POUR LA SUITE DE LA FONCTION C'EST LE MEME PRINCIPE*/
                        } else {//bas
                            // i,j+2 / muCell
                            if (myCell.coord.y + 2 > this.param.nb_Squares - 1) {
                                this.testBarr(checkingCells[i], [new Coord(myCell.coord.x - 1, myCell.coord.y + 1), new Coord(myCell.coord.x + 1, myCell.coord.y + 1)]).forEach(r => res.push(r))
                            } else {
                                let out = this.testBarr(checkingCells[i], [new Coord(myCell.coord.x, myCell.coord.y + 2)])
                                if (out.length !== 0) {
                                    out.forEach(r => res.push(r))
                                } else {
                                    this.testBarr(checkingCells[i], [new Coord(myCell.coord.x - 1, myCell.coord.y + 1), new Coord(myCell.coord.x + 1, myCell.coord.y + 1)]).forEach(r => res.push(r))
                                }
                            }
                        }
                    } else { // Horizontal
                        let direction3 = checkingCells[i].x - myCell.coord.x
                        if (direction3 > 0) { // droite
                            // i+2,j / muCell
                            if (myCell.coord.x + 2 > this.param.nb_Squares - 1) {
                                this.testBarr(checkingCells[i], [new Coord(myCell.coord.x + 1, myCell.coord.y + 1), new Coord(myCell.coord.x + 1, myCell.coord.y - 1)]).forEach(r => res.push(r))
                            } else {
                                let out = this.testBarr(checkingCells[i], [new Coord(myCell.coord.x + 2, myCell.coord.y)])
                                if (out.length !== 0) {
                                    out.forEach(r => res.push(r))
                                } else {
                                    this.testBarr(checkingCells[i], [new Coord(myCell.coord.x + 1, myCell.coord.y + 1), new Coord(myCell.coord.x + 1, myCell.coord.y - 1)]).forEach(r => res.push(r))
                                }
                            }
                        } else {//gauche
                            // i-2,j / muCell
                            if (myCell.coord.x - 2 < 0) {
                                this.testBarr(checkingCells[i], [new Coord(myCell.coord.x - 1, myCell.coord.y + 1), new Coord(myCell.coord.x - 1, myCell.coord.y - 1)]).forEach(r => res.push(r))
                            } else {
                                let out = this.testBarr(checkingCells[i], [new Coord(myCell.coord.x - 2, myCell.coord.y)])
                                if (out.length !== 0) {
                                    out.forEach(r => res.push(r))
                                } else {
                                    this.testBarr(checkingCells[i], [new Coord(myCell.coord.x - 1, myCell.coord.y + 1), new Coord(myCell.coord.x - 1, myCell.coord.y - 1)]).forEach(r => res.push(r))
                                }
                            }
                        }
                    }
                }
            }
            // je supprime les cellules ou il y a un pion
            checkingCells2 = checkingCells2.filter(c => c.x !== pion.coord.x || c.y !== pion.coord.y)
        }
        checkingCells2.forEach(r => res.push(r))
        return res; // je renvois les cellules valides
    }


    //Test si le placement d'une barrière passée en paramètre est valide
    //Bar1 et bar2 sont les 2 moitiées de la barrières envoyées par le client de socketid socket
    //Accrochez vos ceintures, c'est parti !!! (on doit optimiser cette fonction.... et le reste)
    testValidBar(bar1, bar2, socket) {

        //On initialise le placement comme valide
        let placementOk = true

        //On récupère les murs déjà placé sur le plateau
        const murs = this.walls

        //On créé les deux parties de barrières
        let part1 = new Barriere(new Coord(bar1.x1, bar1.y1), socket)
        let part2 = new Barriere(new Coord(bar2.x1, bar2.y1), socket)
        let croiseBar1 = false
        let croiseBar2 = false

        //On teste si la barrière croise une autre barrière orientée différement
        if (bar1.name === "V") {
            murs["H"].forEach(b => {
                if ((b.coord.x === bar1.x1 && b.coord.y === bar1.y1)) {
                    croiseBar1 = true
                }
                if ((b.coord.x === bar1.x1 + 1 && b.coord.y === bar1.y1)) {
                    croiseBar2 = true
                }
            })
        } else {
            murs["V"].forEach(b => {

                if ((b.coord.x === bar1.x1 && b.coord.y === bar1.y1)) {
                    croiseBar1 = true
                }
                if ((b.coord.x === bar1.x1 && b.coord.y === bar1.y1 + 1)) {
                    croiseBar2 = true
                }
            })
        }

        //Si la barrière croise une autre barrière, on définit le placement comme invalide et on s'arrete là
        if ((croiseBar1 && croiseBar2)
        ) {
            placementOk = false
            return placementOk
        }

        //Si la barrière entre en collision avec une autre (si l'emplacement est déjà pris) on s'arrete ici
        //Attention si vous voulez sortir de la fonction, c'est maintenant
        for (let i = 0; i < murs[bar1.name].length; i++) {
            if ((part1.coord.x === murs[bar1.name][i].coord.x && part1.coord.y === murs[bar1.name][i].coord.y)
                || (part2.coord.x === murs[bar1.name][i].coord.x && part2.coord.y === murs[bar1.name][i].coord.y)) {
                placementOk = false
                return placementOk
            }
        }

        //La barrière pouvant etre placée, on l'ajoute comme mur et on teste si un pion est bloqué (ne peut pas atteindre une condition de victoire)
        //On la supprime à la fin de la fonction (et on l'ajoute pour de bon autre part)
        murs[bar1.name].push(part1);
        murs[bar2.name].push(part2);

        //pour chaque pion
        for (const key of Object.keys(this.pions)) {

            //On prend le pion
            let pion = new Pion(this.pions[key].testVict, this.pions[key].score, this.pions[key].socket, new Coord(this.pions[key].coord.x, this.pions[key].coord.y))
            //on l'initialise comme bloqué
            let pionBlocked = true

            //On va parcourir tout le plateau depuis le pion pour trouver une condition de victoire
            //On récupère les cellules adjacentes au pion
            let cellsATester = this.adjacentValidCells(pion)
            //Cellules déjà testées
            let cellsTestee = []

            //tant qu'il reste des cellules à tester
            while (cellsATester.length !== 0) {

                //Le code n'est pas optimisé, donc on a 4 fois la même partie, chacune testant pour un pion différent (car le coté de victoire est différent)
                if (pion.testVict === "y-") {
                    //Si la cellule est une cellule correspondant à une victoire
                    if (cellsATester[0].y === this.param.nb_Squares - 1) {
                        //le pion n'est pas bloqué
                        pionBlocked = false
                        //on vide les cellules à tester (car une condition de victoire à été trouvée)
                        cellsATester = []
                        break
                    } else {
                        let dedans2 = false

                        //Sinon, on regarde si la cellule a déjà été testée
                        cellsTestee.forEach(ct => {
                            if ((ct.x === cellsATester[0].x && ct.y === cellsATester[0].y)) {
                                dedans2 = true
                            }
                        })

                        //Si elle n'a pas été testée, on l'ajoute aux cellules testées
                        if (!dedans2) {
                            cellsTestee.push(cellsATester[0])
                        }

                        //On décale le pion imaginaire sur cette cellule
                        pion.coord.x = cellsATester[0].x
                        pion.coord.y = cellsATester[0].y

                        //on récupère les cellules adjacentes à cette cellule
                        this.adjacentValidCells(pion).forEach(c => {

                            //On les ajoute dans les cellules à tester si elle n'ont pas été testées
                            let dedans = false
                            cellsTestee.forEach(ct => {
                                if ((ct.x === c.x && ct.y === c.y)) {
                                    dedans = true
                                }
                            })
                            if (!dedans) {
                                cellsATester.push(c)
                            }
                        })
                        //On retire la cellules que l'on vient de tester des cellules à tester
                        cellsATester.shift()
                    }

                //IDEM POUR LES 3 AUTRES PIONS
                } else if (pion.testVict === "y+") {
                    if (cellsATester[0].y === 0) {
                        pionBlocked = false
                        cellsATester = []
                        break
                    } else {
                        let dedans2 = false
                        cellsTestee.forEach(ct => {
                            if ((ct.x === cellsATester[0].x && ct.y === cellsATester[0].y)) {
                                dedans2 = true
                            }
                        })
                        if (!dedans2) {
                            cellsTestee.push(cellsATester[0])
                        }
                        pion.coord.x = cellsATester[0].x
                        pion.coord.y = cellsATester[0].y
                        this.adjacentValidCells(pion).forEach(c => {
                            let dedans = false
                            cellsTestee.forEach(ct => {
                                if ((ct.x === c.x && ct.y === c.y)) {
                                    dedans = true
                                }
                            })
                            if (!dedans) {
                                cellsATester.push(c)
                            }
                        })
                        cellsATester.shift()
                    }
                } else if (pion.testVict === "x-") {
                    if (cellsATester[0].x === this.param.nb_Squares - 1) {
                        pionBlocked = false
                        cellsATester = []
                        break
                    } else {
                        let dedans2 = false
                        cellsTestee.forEach(ct => {
                            if ((ct.x === cellsATester[0].x && ct.y === cellsATester[0].y)) {
                                dedans2 = true
                            }
                        })
                        if (!dedans2) {
                            cellsTestee.push(cellsATester[0])
                        }
                        pion.coord.x = cellsATester[0].x
                        pion.coord.y = cellsATester[0].y
                        this.adjacentValidCells(pion).forEach(c => {
                            let dedans = false
                            cellsTestee.forEach(ct => {
                                if ((ct.x === c.x && ct.y === c.y)) {
                                    dedans = true
                                }
                            })
                            if (!dedans) {
                                cellsATester.push(c)
                            }
                        })
                        cellsATester.shift()
                    }
                } else if (pion.testVict === "x+") {
                    if (cellsATester[0].x === 0) {
                        pionBlocked = false
                        cellsATester = []
                        break
                    } else {
                        let dedans2 = false
                        cellsTestee.forEach(ct => {
                            if ((ct.x === cellsATester[0].x && ct.y === cellsATester[0].y)) {
                                dedans2 = true
                            }
                        })
                        if (!dedans2) {
                            cellsTestee.push(cellsATester[0])
                        }
                        pion.coord.x = cellsATester[0].x
                        pion.coord.y = cellsATester[0].y
                        this.adjacentValidCells(pion).forEach(c => {
                            let dedans = false
                            cellsTestee.forEach(ct => {
                                if ((ct.x === c.x && ct.y === c.y)) {
                                    dedans = true
                                }
                            })
                            if (!dedans) {
                                cellsATester.push(c)
                            }
                        })
                        cellsATester.shift()
                    }
                }
            }

            //Si au moins un pion n'a pas trouvé de condition de victoire, le placement de la barrière n'est pas valide
            if (pionBlocked) {
                placementOk = false;
                break
            }
        }

        //On retire les deux murs de la liste de murs
        const index1 = murs[bar1.name].indexOf(bar1);
        murs[bar1.name].splice(index1, 1);
        const index2 = murs[bar2.name].indexOf(bar2);
        murs[bar2.name].splice(index2, 1);

        //On retourne si le placement de la barrière est valide
        return placementOk
    }
}

module.exports = Arbitre;