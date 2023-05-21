<template>
    <div>
        <div ref="cell"></div>
    </div>
</template>

<script>
export default {
    props: {
        layerCell: Object,
        tailleGrille: Number,
        width: Number,
        height: Number,
        roomId: Number,
        socket: Object
    },
    data() {
        return {
            myTurn: null,
            valid: [],
            clickable: true
        }
    },
    mounted() {

        // Savoir a qui est le tour
        this.socket.on("my turn", (turn) => {
            this.myTurn = turn
            this.clickable = true
            if (!turn) {
                //Réinitialiser la couleur des cellules
                this.layerCell.getChildren().forEach(e => {
                    e.fill("#0B0B0B");
                    e.valid = false;
                })
            }
        })

        //Récupération des cellules valides pour le déplcament du pion
        this.socket.on("cells checked", (validCells) => {
            this.valid = validCells
            this.layerCell.getChildren().forEach(e => {
                e.fill("#0B0B0B");
                e.valid = false;
            })
            //Mise en évidence des cellules valides
            validCells.forEach(c => {
                this.layerCell.find(node => node.attrs.x1 === c.x && node.attrs.y1 === c.y)[0].fill('#333363')
                this.layerCell.draw()
            })
        })
    },

    watch: {
        layerCell: {
            immediate: true,
            handler(layerCell) {
                const self = this;
                if (layerCell) {
                    // On créé un damier de cellules
                    for (let i = 0; i < this.tailleGrille; i++) {
                        for (let j = 0; j < this.tailleGrille; j++) {


                            const cell = new Konva.Rect({
                                id: "" + i + "" + j,
                                x1: i,
                                y1: j,
                                x: (this.width / this.tailleGrille) * i,
                                y: (this.height / this.tailleGrille) * j,
                                width: (this.width / this.tailleGrille) - (this.width / this.tailleGrille) / 6,
                                height: (this.height / this.tailleGrille) - (this.height / this.tailleGrille) / 6,
                                fill: "#0B0B0B",
                                stroke: '#217BFF'
                                //   stroke: (() => {
                                //       if (i === (this.tailleGrille-1)/2 && j === 0) {
                                //           return '#B391D3';
                                //       } else if (i === (this.tailleGrille-1)/2 && j === this.tailleGrille-1) {
                                //           return '#14C7D5';
                                //       } else if (i === 0 && j === (this.tailleGrille-1)/2) {
                                //           return '#F10002';
                                //       } else if (i === this.tailleGrille-1 && j === (this.tailleGrille-1)/2) {
                                //           return '#F48229';
                                //       } else {
                                //           return '#217BFF'; // Couleur par défaut pour les autres valeurs de x et y
                                //       }
                                //   })()
                            });

                            //Ecouteur d'évenement lié à la cellule
                            cell.on('click', function (evt) {

                                let test = false

                                if (self.valid.find(c => c.x === evt.target.attrs.x1 && c.y === evt.target.attrs.y1)) test = true
                                if (self.myTurn && test && self.clickable) { // si c'est mon tour et si la a été validée par le serveur
                                    self.clickable = false
                                    self.socket.emit('nextplayer', self.roomId);
                                    self.socket.emit('coord', self.roomId, {
                                        x: evt.target.attrs.x1,
                                        y: evt.target.attrs.y1
                                    });
                                    self.layerCell.getChildren().forEach(e => {
                                        e.fill("#0B0B0B");
                                        e.valid = false;
                                    })
                                }
                            })
                            layerCell.add(cell);
                        }
                    }
                    layerCell.draw();
                }
            },
        },
    },
};
</script>