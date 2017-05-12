export class D3ChartDimensions{

    constructor(margin, size){
        this.margin = margin;
        this.size = size;
    }

    Margin(margin){
        if(typeof margin != 'undefined')
            this.margin = margin;

        return this.margin;
    }
    Size(size){
        if(typeof size != 'undefined')
            this.size = size;

        return this.size;
    }

    OuterWidth(width){
        if(typeof width != 'undefined')
            this.size.width = width - this.margin.left - this.margin.right;

        return this.size.width + this.margin.left + this.margin.right;
    }
    OuterHeight(height){
        if(typeof height != 'undefined')
            this.size.height = height - this.margin.top - this.margin.bottom;

        return this.size.height + this.margin.top + this.margin.bottom;
    }

}