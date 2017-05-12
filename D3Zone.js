export class D3Zone{
    constructor(low, high, label){
        this.low = low;
        this.high = high;
        this.label = label;
    }

    Low(low){
        if(typeof low != 'undefined')
            this.low = low;
        return this.low;
    }
    High(high){
        if(typeof high != 'undefined')
            this.high = high;
        return this.high;
    }
    Label(label){
        if(typeof label != 'undefined')
            this.label = label;
        return this.label;
    }
}