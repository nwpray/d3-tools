export class D3Line{
    constructor(points){
        this.points = points;
    }
    Points(points){
        if(typeof points != 'undefined')
            this.points = points;

        return this.points;
    }
    ClosestPointToX(x){
        let closest = this.points[0];

        for(let i in this.points){
            let point = this.points[i];
            if(Math.abs(x - point[0]) < Math.abs(x - closest[0]))
                closest = point;
        }

        return closest;
    }
}