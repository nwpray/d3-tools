export class D3Line{
    constructor(points){
        this.points = points;
    }
    Points(points){
        if(typeof points != 'undefined')
            this.points = points;

        return this.points;
    }
}