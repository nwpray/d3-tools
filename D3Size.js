export class D3Size{
    constructor(width, height){
        this.width = width;
        this.height = height;
    }
    Width(width){
        if(typeof width != 'undefined')
            this.width = width;
        return this.width;
    }
    Height(height){
        if(typeof height != 'undefined')
            this.height = height;

        return this.height;
    }
}