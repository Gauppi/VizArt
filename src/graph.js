/**
* @name showGraph - 
*/
'use strict';

export function showGraph(data) {

    //Falls bereits einer vorhanden: Graph löschen
    d3.select("svg").remove();

    var svg = d3.select("#dataviz_basicZoom"),
        width = +svg.attr("width"),
        height = +svg.attr("height");

    var svg = d3.select("#dataviz_basicZoom")
        .append("svg")
        .attr("preserveAspectRatio", "xMinYMin meet")
        .attr("viewBox", "0 0 960 480")

        .call(d3.zoom().on("zoom", function () {
            svg.attr("transform", d3.event.transform)
        }))
        .append("g")

    svg.append('defs').append('marker')
        .attr("id", 'arrowhead')
        .attr('viewBox', '-0 -5 10 10') 
        .attr('refX', 18) // Pfeilkopfgrösse
        .attr('refY', 0)
        .attr('orient', 'auto')
        .attr('markerWidth', 6)
        .attr('markerHeight', 6)
        .attr('xoverflow', 'visible')
        .append('svg:path')
        .attr('d', 'M 0,-5 L 10 ,0 L 0,5')
        .attr('fill', '#999')
        .style('stroke', 'none');

    var color = d3.scaleOrdinal(d3.schemeCategory10);

    var simulation = d3.forceSimulation()
        .force("link", d3.forceLink().id(link => link.id))
        .force("charge", d3.forceManyBody())
        .force("center", d3.forceCenter(width / 2, height / 2));

    d3.set(data)

    var link = svg.append("g")
        .attr("class", "links")
        .selectAll("line")
        .data(data.edges)
        .enter().append("line")
        .attr("stroke-width", function (d) { return Math.sqrt(d.value); })
        .attr("id", d => "line" + d.source + d.target)
        .attr("class", "links")
        .attr('marker-end', 'url(#arrowhead)') //The marker-end attribute defines the arrowhead or polymarker that will be drawn at the final vertex of the given shape.


    var node = svg.append("g")
        .attr("class", "nodes")
        .selectAll("g")
        .data(data.nodes)
        .enter().append("g")

    var circles = node.append("circle")
        .attr("r", 8)
        .style("stroke", "grey")
        .style("stroke-opacity", 0.3)
        .style("fill", function (d) { return color(d.group); });

    //Legende
    /*
    const domains = ["Artikel", "Review", "evt. Review"];
    const legend = svg.append("g")
    // Apply a translation to the entire group 
    .attr("transform", "translate(960, 450)")

    const size = 20;
    const border_padding = 15;
    const item_padding = 5;
    const text_offset = 2;

    // Border
    legend
    .append('rect')
    .attr("width", 120)
    .attr("height", 125)
    .style("fill", "none")
    .style("stroke-width", 1)
    .style("stroke", "black");

    // Boxes
    legend.selectAll("boxes")
    .data(domains)
    .enter()
    .append("rect")
        .attr("x", border_padding)
        .attr("y", (d, i) => border_padding + (i * (size + item_padding)))
        .attr("width", size)
        .attr("height", size)
        .style("fill", (d) => color(d));

    // Labels
    legend.selectAll("labels")
    .data(domains)
    .enter()
    .append("text")
        .attr("x", border_padding + size + item_padding)
        .attr("y", (d, i) => border_padding + i * (size + item_padding) + (size / 2) + text_offset)
        // .style("fill", (d) => color(d))
        .text((d) => d)
        .attr("text-anchor", "left")
        .style("alignment-baseline", "middle")
        .style("font-family", "sans-serif");

    */

    //Info Box
    var tip;
    svg.on("click", function () {
        if (tip) tip.remove();
    });
    node.on("click", function (d) {
        d3.event.stopPropagation();

        if (tip) tip.remove();

        tip = svg.append("g")
            .attr("transform", "translate(" + d.x + "," + d.y + ")");

        var rect = tip.append("rect")
            .style("fill", "white")
            .style("stroke", "steelblue");

        tip.append("text")
            .text("PMID: " + d.id)
            .attr("dy", "1em")
            .attr("x", 5);

        tip.append("text")
            .text("Group: " + d.group)
            .attr("dy", "2em")
            .attr("x", 5);

        tip.append("text")
            .text("(n) Zitireungen: " + d.citation_count)
            .attr("dy", "3em")
            .attr("x", 5);


        

        var bbox = tip.node().getBBox();
        rect.attr("width", bbox.width + 5)
            .attr("height", bbox.height + 5)
    });

    // Create a drag handler and append it to the node object instead
    var drag_handler = d3.drag()
        .on("start", dragstarted)
        .on("drag", dragged)
        .on("end", dragended);

    drag_handler(node);

    var lables = node.append("text")
        .text(function (d) {
            return d.id;
        })
        .attr('x', 6)
        .attr('y', 3);

    node.append("title")
        .text(function (d) { return d.id; });

    simulation
        .nodes(data.nodes)
        .on("tick", ticked);

    simulation.force("link")
        .links(data.edges);

    function ticked() {
        link
            .attr("x1", function (d) { return d.source.x; })
            .attr("y1", function (d) { return d.source.y; })
            .attr("x2", function (d) { return d.target.x; })
            .attr("y2", function (d) { return d.target.y; });

        node
            .attr("transform", function (d) {
                return "translate(" + d.x + "," + d.y + ")";
            })
    }

    function dragstarted(d) {
        if (!d3.event.active) simulation.alphaTarget(0.3).restart();
        d.fx = d.x;
        d.fy = d.y;
    }

    function dragged(d) {
        d.fx = d3.event.x;
        d.fy = d3.event.y;
    }

    function dragended(d) {
        if (!d3.event.active) simulation.alphaTarget(0);
        d.fx = null;
        d.fy = null;
    }

}