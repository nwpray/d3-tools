import {D3ChartDimensions} from "./D3ChartDimensions";
import {D3Size} from "./D3Size";
import {D3Margin} from "./D3Margin";

export class D3Chart{
    constructor(binding){
        this.binding = binding;
        this.rootGroup = undefined;
        this.eventManager = undefined;
        this.dimensions = new D3ChartDimensions(new D3Margin(0,0,0,0), new D3Size(0,0));
        this.responsive = true;
    }

    Render(){ throw "D3Chart.Render() is an abstract method"; }
    Responsive(responsive){
        if(typeof responsive != 'undefined')
            this.responsive = responsive;

        return this.responsive;
    }
    Property(property, value){
        if(typeof value != 'undefined')
            this[property] = value;
        return this[property];
    }
    Dimensions(dimensions){
        if(typeof dimensions != 'undefined')
            this.dimensions = dimensions;

        return this.dimensions;
    }
}