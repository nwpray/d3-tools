import * as d3 from "d3";
import {D3Chart} from "./D3Chart";
import {ColumnListener} from 'bootstrap-event-listeners';
import Emitter from "es6-event-emitter";

let EVENT_COLUMN_RESIZE = 'on.column.resize';
let EVENT_MOUSE_DRAG = 'on.mouse.drag';
let SCALE_LINEAR = 'scaleLinear';
let _this = undefined;

class EventBus extends Emitter{}

export class D3LineChart extends D3Chart{
    constructor(binding){
        super(binding);

        _this = this;

        this.eventBus = new EventBus();
        this.columnListener = new ColumnListener();
        this.columnListener.onWidthChange(this._onColumnResize.bind(this));
        this.columnListener.onWidthChecked(this._onScreenResize.bind(this));
        this.domain = [0,100];
        this.range = [0,100];
        this.horizontalZones = [];
        this.lines = [];
        this.valueDotRadius = 18;

        this.yScale = undefined;
        this.xScale = undefined;

        this.yScaleType = SCALE_LINEAR;
        this.xScaleType = SCALE_LINEAR;

        this.yFormatter = function(scale){
            return d3.axisLeft(scale)
                .tickSize(3)
                .tickFormat(function(d){
                    return d;
                });
        };
        this.xFormatter = function(scale){
            return d3.axisBottom(scale)
                .tickSize(3)
                .tickFormat(function(d){
                    return d;
                });
        };
        this.lineFormatter = function(){
            return d3.line()
                .x(function(d) { return this.xScale(d[0]); }.bind(this))
                .y(function(d) { return this.yScale(d[1]); }.bind(this));
        };

        this.mouseOver = false;
    }

    //Properties
    Domain(domain){
        if(typeof domain != 'undefined'){
            this.domain = domain;
        }

        return this.domain;
    }
    Range(range){
        if(typeof range != 'undefined')
            this.range = range;

        return this.range;
    }
    HorizontalZones(zones){
        if(typeof zones != 'undefined')
            this.horizontalZones = zones;

        return this.horizontalZones;
    }
    Lines(lines){
        if(typeof lines != 'undefined')
            this.lines = lines;

        return this.lines;
    }

    Render(){
        let element = d3.select(this.binding).html("");

        if(this.Responsive()){
            let rect = element.node().getBoundingClientRect();
            this.Dimensions().OuterWidth(rect.width);
            this.Dimensions().OuterHeight(rect.height);
        }

        let svg = d3.select(this.binding)
            .append('svg')
            .attr("width", this.Dimensions().OuterWidth())
            .attr("height", this.Dimensions().OuterHeight())
            .on('mouseover', this._onMouseOver.bind(this))
            .on('mouseout', this._onMouseOut.bind(this))
            .on('mousemove', this._onMouseMove);


        this.rootGroup = svg.append("g")
            .attr("transform", "translate(" + this.Dimensions().Margin().Left() + "," + this.Dimensions().Margin().Top() + ")");

        this.yScale = d3[this.yScaleType]()
            .domain(this.range)
            .range([this.Dimensions().Size().Height(), 0]);

        this.xScale = d3[this.xScaleType]()
            .domain(this.domain)
            .range([0, this.Dimensions().Size().Width()]);

        this.rootGroup.append('g')
            .call(function(g){g.call(this.yFormatter(this.yScale))}.bind(this))
            .classed("axis", true)
            .classed("y", true);

        this.rootGroup.append('g')
            .call(function(g){g.call(this.xFormatter(this.xScale))}.bind(this))
            .classed("axis", true)
            .classed("x", true)
            .attr("transform", "translate(0, " + this.Dimensions().Size().Height() + ")");

        this._renderHorizontalZones();
        this._renderLines();
    }

    _renderHorizontalZones(){
        let horizontalZones = this.rootGroup.selectAll('.plot-zone')
            .data(this.horizontalZones)
            .enter()
            .append('g')
            .attr('class', function(d, index){
                return "plot-zone zone_" + index;
            });

        horizontalZones.append("rect")
            .attr("x", 0)
            .attr("width", this.Dimensions().Size().Width())
            .attr("y", function(d){
                return this.yScale(d.High());
            }.bind(this))
            .attr("height", function(d){
                return this.yScale(d.Low()) - this.yScale(d.High());
            }.bind(this));


        horizontalZones.append("text")
            .attr("x", (this.Dimensions().Size().Width() / 2))
            .attr("width", this.Dimensions().Size().Width())
            .attr("y", function(d){
                let top = this.yScale(d.High());
                let height = this.yScale(d.Low()) - this.yScale(d.High());
                return top + (height / 2) + (0.08 * height);
            }.bind(this))
            .attr("height", function(d){
                return this.yScale(d.Low()) - this.yScale(d.High());
            }.bind(this))
            .style("text-anchor", "middle")
            .text(function(d){return d.label;});

        horizontalZones.exit();
    }
    _renderLines(){
        let lines = this.rootGroup.selectAll('.plot-line')
            .data(this.lines)
            .enter()
            .append('g')
            .attr('class', function(d, index){
                let dot = this._renderValueDot(d.points[0], d.points[0][1], "line_" + index);
                this.onMouseDrag(function(pos){
                    let point = d.ClosestPointToX(pos.x);
                    this._moveValueDot(dot, point, point[1]);
                }.bind(this));
                return "plot-line line_" + index;
            }.bind(this));

        lines.append("path")
            .datum(function(d){return d.points})
            .attr("d", this.lineFormatter())
            .append("circle");

        lines.selectAll(".dot")
            .data(function(d){return d.points})
            .enter().append("circle")
            .attr("class", "dot")
            .attr("r", 5)
            .attr("cx", function(d){return this.xScale(d[0]);}.bind(this))
            .attr("cy", function(d){return this.yScale(d[1]);}.bind(this));
    }
    _renderValueDot(coords, display_value, css_class){
        let dot_group = this.rootGroup.append("g")
            .classed("value-dot", true)
            .attr("transform", "translate(" + this.xScale(coords[0]) + "," + this.yScale(coords[1]) + ")");

        if(typeof css_class != 'undefined')
            dot_group.classed(css_class, true);

        dot_group.append("circle")
            .attr("r", this.valueDotRadius);

        dot_group.append("text")
            .style('text-anchor', 'middle')
            .attr("transform", "translate(0, 5)")
            .text(display_value);

        return dot_group;
    }
    _moveValueDot(dot, coords, display_value){
        dot.attr("transform", "translate(" + this.xScale(coords[0]) + "," + this.yScale(coords[1]) + ")");
        dot.select("text").text(display_value);
    }

    //Events
    _onColumnResize(width){
        this.eventBus.trigger(EVENT_COLUMN_RESIZE, {chart : this, width: width});
    }
    _onScreenResize(width){
        if(this.Responsive())
            this.Render();
    }
    onColumnResize(callback){
        this.eventBus.on(EVENT_COLUMN_RESIZE, callback);
    }

    //Mouse events
    _onMouseOver(){
        this.mouseOver = true;
    }
    _onMouseOut(){
        this.mouseOver = false;
    }
    _onMouseMove(){
        if(_this.mouseOver){
            let pos = {
                x: _this.xScale.invert(d3.mouse(this)[0]),
                y: _this.yScale.invert(d3.mouse(this)[1])
            };

            _this.eventBus.trigger(EVENT_MOUSE_DRAG, pos);
        }
    }
    onMouseDrag(callback){
        this.eventBus.on(EVENT_MOUSE_DRAG, callback);
    }
}