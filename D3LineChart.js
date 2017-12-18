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
        this.mouseOver = false;
        this.eventBus = new EventBus();
        this.columnListener = new ColumnListener();
        this.columnListener.onWidthChange(this._onColumnResize.bind(this));
        this.columnListener.onWidthChecked(this._onScreenResize.bind(this));

        //Modifiable values
        this.domain = [0,100];
        this.range = [0,100];
        this.horizontalZones = [];
        this.lines = [];
        this.lineDotRadius = 4;
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
        this.yTranslator = function(scale, value){
            return scale(value);
        };
        this.xTranslator = function(scale, value){
            return scale(value);
        };
        this.lineFormatter = function(){
            return d3.line()
                .x(function(d, index) { return this.xTranslator(this.xScale, d[0], index); }.bind(this))
                .y(function(d, index) { return this.yTranslator(this.yScale, d[1], index); }.bind(this));
        };
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
    LineDotRadius(radius){
        if(typeof radius != 'undefined')
            this.lineDotRadius = radius;

        return this.lineDotRadius;
    }
    ValueDotRadius(radius){
        if(typeof radius != 'undefined')
            this.valueDotRadius = radius;

        return this.valueDotRadius;
    }

    XScale(scale){
        if(typeof scale != 'undefined')
            this.xScale = scale;

        return this.xScale;
    }
    YScale(scale){
        if(typeof scale != 'undefined')
            this.yScale = scale;

        return this.yScale;
    }
    XScaleType(type){
        if(typeof type != 'undefined')
            this.xScaleType = type;

        return this.xScaleType;
    }
    YScaleType(type){
        if(typeof type != 'undefined')
            this.yScaleType = type;

        return this.yScaleType;
    }

    XFormatter(formatter){
        if(typeof formatter != 'undefined')
            this.xFormatter = formatter;

        return this.xFormatter;
    }
    YFormatter(formatter){
        if(typeof formatter != 'undefined')
            this.yFormatter = formatter;

        return this.yFormatter;
    }
    XTranslator(translator){
        if(typeof translator != 'undefined')
            this.xTranslator = translator;

        return this.xTranslator;
    }
    YTranslator(translator){
        if(typeof translator != 'undefined')
            this.yTranlator = translator;

        return this.yTranlator;
    }
    LineFormatter(formatter){
        if(typeof formatter != 'undefined')
            this.lineFormatter = formatter;

        return this.lineFormatter;
    }


    Render(){
        let element = d3.select(this.binding).html("");

        if(!element) return;

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
        let x = 0, y = 1;
        let lines = this.rootGroup.selectAll('.plot-line')
            .data(this.lines)
            .enter()
            .append('g')
            .attr('class', function(d, index){
                let last_index = d.points.length - 1;
                let dot = this._renderValueDot(
                    [this.xTranslator(this.xScale, d.points[last_index][x], last_index), this.yTranslator(this.yScale, d.points[last_index][y], last_index)],
                    d.points[d.points.length - 1][1], "line_" + index);
                this.onMouseDrag(function(pos){
                    let closest = 0;
                    let x = 0, y = 1;
                    let mouseX = this.xScale(pos.x);

                    for(let point = 1; point < d.points.length; point++){
                        let pointDist = Math.abs(mouseX - this.xTranslator(this.xScale, d.points[point][x], point));
                        let closestDist = Math.abs(mouseX - this.xTranslator(this.xScale, d.points[closest][x], closest));

                        if(pointDist < closestDist)
                            closest = point;
                    }
                    if(closest !== undefined)
                        this._moveValueDot(dot, [this.xTranslator(this.xScale, d.points[closest][x], closest), this.yTranslator(this.yScale, d.points[closest][y], closest)], d.points[closest][y]);

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
            .attr("r", this.lineDotRadius)
            .attr("cx", function(d, index){return this.xTranslator(this.xScale, d[0], index);}.bind(this))
            .attr("cy", function(d, index){return this.yTranslator(this.yScale, d[1], index);}.bind(this));
    }
    _renderValueDot(coords, display_value, css_class){
        let dot_group = this.rootGroup.append("g")
            .classed("value-dot", true)
            .style("transition", 'all 0.2s ease-in-out')
            .attr("transform",  "translate(" + coords[0] + "," + coords[1] + ")");

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
        dot.attr("transform", "translate(" + coords[0] + "," + coords[1] + ")");
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
                x: _this.xScale.invert(d3.mouse(this)[0] - _this.Dimensions().Margin().Left()),
                y: _this.yScale.invert(d3.mouse(this)[1] - _this.Dimensions().Margin().Bottom())
            };

            _this.eventBus.trigger(EVENT_MOUSE_DRAG, pos);
        }
    }
    onMouseDrag(callback){
        this.eventBus.on(EVENT_MOUSE_DRAG, callback);
    }
}