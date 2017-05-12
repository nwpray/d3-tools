import * as d3 from "d3";
import {D3Chart} from "./D3Chart";

export class D3RadialChart extends D3Chart{
    constructor(binding){
        super(binding);
        this.lineWidth = 1;
        this.linepadding = 0;
        this.maxValue = 100;
        this.contents = "";
        this.bars = [];
    }

    LineWidth(width){
        if(typeof width != 'undefined')
            this.lineWidth = width;
        return this.lineWidth;
    }
    LinePadding(padding){
        if(typeof padding != 'undefined')
            this.linePadding = padding;
        return this.linePadding;
    }
    MaxValue(value){
        if(typeof value != 'undefined')
            this.maxValue = value;
        return this.maxValue;
    }
    Contents(contents){
        if(typeof contents != 'undefined')
            this.contents = contents;

        return this.contents;
    }
    Bars(bars){
        if(typeof bars != 'undefined')
            this.bars = bars;

        return this.bars;
    }
    Dimensions(dimensions){
        if(typeof dimensions != 'undefined')
            this.dimensions = dimensions;

        return this.dimensions;
    }

    Render(){
        let element = d3.select(this.binding)
            .style("position", "relative")
            .html("");

        if(this.Responsive()){
            let rect = element.node().getBoundingClientRect();
            this.Dimensions().OuterWidth(rect.width);
            this.Dimensions().OuterHeight(rect.height);
        }

        let svg = element
            .append('svg')
            .attr("width", this.Dimensions().OuterWidth())
            .attr("height", this.Dimensions().OuterHeight());

        this.rootGroup = svg.append("g")
            .attr("transform", "translate(" + (this.Dimensions().Size().Width() / 2) + ", " + (this.Dimensions().Size().Height() / 2) +  ")");

        let arc = d3.arc()
            .outerRadius(function(d){
                return (this.Dimensions().Size().Width() / 2) - ((this.LineWidth()  + this.LinePadding()) * d.index);
            }.bind(this))
            .innerRadius(function(d){
                return (this.Dimensions().Size().Width() / 2) - ((this.LineWidth()  + this.LinePadding()) * d.index) - this.LineWidth();
            }.bind(this))
            .cornerRadius(30)
            .startAngle(0)
            .endAngle(function(d){
                return (d.data * 360) / 100 * (Math.PI / 180);
            });

        let pie = d3.pie()
            .value(function(d){return d;});

        let arcs = this.rootGroup.selectAll('.arc')
            .data(pie(this.bars))
            .enter()
            .append("g")
            .attr("class", "arc");

        arcs.append("path")
            .attr("class", function(d){return "bar bar_" + d.index;}, true)
            .attr("d", arc);

        let contents = element.append("div")
            .style("position", "absolute")
            .style("top", "50%")
            .style("left", "50%")
            .style("transform", "translate(-50%, -50%)")
            .style("width", (((this.Dimensions().Size().Width() / 2) - ((this.LineWidth()  + this.LinePadding()) * this.bars.length - 1)) * 2) + "px")
            .classed("display", true)
            .html((typeof this.contents != 'undefined') ?
                (this.contents == false ? "" : this.contents) :
                this.bars.reduce(function(acc, bar, index){
                    acc += (index > 0 ? "<hr style='margin:2px;'>" : "") + bar;
                    return acc;
                }, ""));

    }
}
