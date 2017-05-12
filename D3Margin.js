export class D3Margin{
    constructor(top, right, bottom, left){
        this.top = top;
        this.right = right;
        this.bottom = bottom;
        this.left = left;
    }

    Top(top){
        if(typeof top != 'undefined')
            this.top = top;
        return this.top;
    }
    Right(right){
        if(typeof right != 'undefined')
            this.right = right;
        return this.right;
    }
    Bottom(bottom){
        if(typeof bottom != 'undefined')
            this.bottom = bottom;
        return this.bottom;
    }
    Left(left){
        if(typeof left != 'undefined')
            this.left = left;
        return this.left;
    }
}