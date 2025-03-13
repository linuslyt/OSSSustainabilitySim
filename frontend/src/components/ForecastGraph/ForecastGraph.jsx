import { Typography } from '@mui/material';
import Box from '@mui/material/Box';
import useResizeObserver from '@react-hook/resize-observer';
import * as d3 from 'd3';
import { debounce } from 'lodash';
import React, { useEffect, useMemo, useRef, useState } from 'react';

// TODO: get data from API
// TODO: plot predictions
// TODO: add nearest datapoint logic for hover
let graphInitialized = false;

export default function ForecastGraph() {
  const data = useMemo(
    () => [
      { month: 8, pGraduate: 0.1 },
      { month: 9, pGraduate: 0.2 },
      { month: 10, pGraduate: 0.25 },
      { month: 11, pGraduate: 0.5 },
      { month: 12, pGraduate: 0.4 },
      { month: 13, pGraduate: 0.5 },
      { month: 14, pGraduate: 0.5 },
      { month: 15, pGraduate: 0.55 },
      { month: 16, pGraduate: 0.7 },
      { month: 17, pGraduate: 0.7 },
      { month: 18, pGraduate: 0.65 },
      { month: 19, pGraduate: 0.55 },
      { month: 20, pGraduate: 0.5 },
      { month: 21, pGraduate: 0.4 },
      { month: 22, pGraduate: 0.5 },
    ],
    [],
  );

  const domain = d3.extent(data.map((d) => d.month));

  const [tooltip, setTooltip] = useState({
    x: 0,
    y: 0,
    visible: false,
    text: '',
  });
  const [crosshairLabel, setCrosshairLabel] = useState({
    x: 0,
    y: 0,
    visible: false,
    text: '',
  });

  // Set up observer for parent container size
  const [size, setSize] = useState({ width: 0, height: 0 });
  const graphRef = useRef(null); // When ref is created as null, React will map it to the JSX node it's assigned to on render
  const handleResize = useMemo(
    () => debounce((entry) => setSize(entry.contentRect), 100), // On window resize, call setSize with debounce of 50ms
    [],
  );
  useResizeObserver(graphRef, handleResize);
  useEffect(() => {
    // Cancel pending debounced calls on component unmount
    return () => {
      handleResize.cancel();
    };
  }, [handleResize]);

  useEffect(() => {
    const renderGraph = (data) => {
      // Derive constants from parent container size
      const margin = {
        top: size.height * 0.16,
        right: size.width * 0.1,
        bottom: size.height * 0.16,
        left: size.width * 0.1,
      };
      const xScale = d3
        .scalePoint()
        .domain(d3.range(domain[0], domain[1] + 1))
        .range([margin.left, size.width - margin.right]);
      const yScale = d3
        .scaleLinear()
        .domain([0, 1])
        .range([size.height - margin.bottom, margin.top]);
      const xAxis = d3.axisBottom(xScale).ticks(data.length);
      const yAxis = d3.axisLeft(yScale).ticks(5);
      const lineGenerator = d3
        .line()
        .x((d) => xScale(d.month))
        .y((d) => yScale(d.pGraduate));
      const { width, height } = size;

      // Draw graph
      if (width === 0 || height === 0) return;

      const svg = d3
        .select('#forecast-graph')
        .attr('width', size.width)
        .attr('height', size.height);

      svg
        .select('#title')
        .attr('x', width / 2)
        .attr('y', margin.top * 0.75)
        .text('Sustainability forecast for month X+1 for Project 1')
        .attr('text-anchor', 'middle')
        .style('font-size', '1.25rem')
        .style('font-family', "'Roboto', sans-serif");

      svg
        .select('#x-axis')
        .attr('transform', `translate(0,${height - margin.bottom})`)
        .call(xAxis) // The first invocation of .call(axis) creates the axis; subsequent calls update it.
        .selectAll('text') // Update tick label size
        .style('font-size', '0.8rem')
        .style('font-family', "'Roboto', sans-serif");

      svg
        .select('#x-axis-label')
        .attr('transform', `translate(${width / 2}, ${margin.bottom * 0.9})`)
        .attr('fill', 'black')
        .text('Month')
        .style('font-size', '1rem')
        .style('font-family', "'Roboto', sans-serif");

      svg
        .select('#y-axis')
        .attr('transform', `translate(${margin.left},0)`)
        .call(yAxis)
        .selectAll('text') // Update tick label size
        .style('font-size', '0.8rem')
        .style('font-family', "'Roboto', sans-serif");

      svg
        .select('#y-axis-label')
        .attr(
          'transform',
          `translate(${-margin.left / 3}, ${height / 2}) rotate(-90)`,
        )
        .attr('fill', 'black')
        .attr('text-anchor', 'middle')
        .text('P(Graduate)')
        .style('font-size', '1rem')
        .style('font-family', "'Roboto', sans-serif");

      svg
        .select('#trendline')
        .datum(data)
        .attr('d', lineGenerator)
        .attr('fill', 'none')
        .attr('stroke', 'orange')
        .attr('stroke-width', '2px');

      svg
        .select('#markers')
        .selectAll('circle')
        .data(data)
        .join('circle')
        .attr('r', '7px')
        .attr('cx', (d) => xScale(d.month))
        .attr('cy', (d) => yScale(d.pGraduate))
        .attr('fill', '#E97451')
        .on('mouseover', function (event, d) {
          const bbox = this.getBBox(); // Get bounding box of marker

          // Compute center coordinate of marker
          const x = bbox.x + bbox.width / 2;
          const y = bbox.y + bbox.height / 2;

          setTooltip({
            x,
            y,
            visible: true,
            text: `P(Graduate): ${d.pGraduate}\nMonth: ${d.month}`,
          });
        })
        .on('mouseout', () => {
          setTooltip((prev) => ({ ...prev, visible: false }));
        });

      d3.select('#forecast-graph')
        .select('#y-crosshair')
        .attr('x1', margin.left)
        .attr('x2', size.width - margin.right)
        .attr('y1', 0)
        .attr('y2', 0)
        .style('stroke', 'black')
        .style('stroke-width', 1)
        .style('stroke-dasharray', '5,5')
        .style('visibility', 'hidden')
        .style('pointer-events', 'none');

      d3.select('#forecast-graph')
        .on('mousemove', (event) => {
          const [mouseX, mouseY] = d3.pointer(event);
          const inBounds =
            mouseX > margin.left &&
            mouseX < width - margin.right &&
            mouseY > margin.top &&
            mouseY < height - margin.bottom;

          d3.select('#forecast-graph')
            .select('#y-crosshair')
            .attr('y1', mouseY)
            .attr('y2', mouseY)
            .style('visibility', inBounds ? 'visible' : 'hidden');

          setCrosshairLabel({
            x: mouseX,
            y: mouseY,
            visible: inBounds,
            text: `P(Graduate): ${yScale.invert(mouseY).toFixed(2)}`,
          });
        })
        .on('mouseleave', () => {
          d3.select('#forecast-graph')
            .select('#y-crosshair')
            .style('visibility', 'hidden');
          setCrosshairLabel((prev) => ({ ...prev, visible: false }));
        });
    };
    renderGraph(data);
  }, [size, data]);

  useEffect(() => {
    // Run once on initialize. See https://react.dev/learn/you-might-not-need-an-effect#initializing-the-application
    if (graphInitialized) return;
    graphInitialized = true;

    // Define SVG elements for graph. These only need to be defined once, and can then be selected
    // by ID and reused across rerenders. This allows the graph to update without duplicating elements,
    // by redrawing the same element instead of appending a new one.
    const svg = d3.select('#forecast-graph');
    svg.append('text').attr('id', 'title');
    svg.append('g').append('path').attr('id', 'trendline');
    svg.append('line').attr('id', 'y-crosshair');
    svg.append('g').attr('id', 'markers');
    svg
      .append('g')
      .attr('id', 'x-axis')
      .append('text')
      .attr('id', 'x-axis-label');
    svg
      .append('g')
      .attr('id', 'y-axis')
      .append('text')
      .attr('id', 'y-axis-label');
  }, []);

  return (
    <Box
      ref={graphRef}
      sx={{
        height: '100%',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
      }}
    >
      {tooltip.visible && (
        <Box
          id="marker-tooltip"
          sx={{
            backgroundColor: '#E5E4E2',
            position: 'absolute',
            left: `${tooltip.x}px`,
            top: `${tooltip.y}px`,
            height: 'auto',
            width: 'auto',
            border: '0px',
            borderRadius: '7px',
            boxSizing: 'border-box',
            px: 1,
            py: 0.5,
            transform: 'translateX(10%) translateY(3rem)', // Center horizontally and offset vertically
            textAlign: 'center',
            pointerEvents: 'none',
          }}
        >
          <Typography sx={{ whiteSpace: 'pre-wrap', textAlign: 'left' }}>
            {tooltip.text}
          </Typography>
        </Box>
      )}
      {crosshairLabel.visible && !tooltip.visible && (
        <Box
          id="crosshair-label"
          sx={{
            backgroundColor: '#E5E4E2',
            position: 'absolute',
            left: `${crosshairLabel.x}px`,
            top: `${crosshairLabel.y}px`,
            height: '1.5rem',
            width: 'auto',
            border: '0px',
            borderRadius: '7px',
            boxSizing: 'border-box',
            px: 1,
            transform: 'translateX(10%) translateY(220%)', // Center horizontally and offset vertically
            textAlign: 'center',
            pointerEvents: 'none',
          }}
        >
          <Typography sx={{ whiteSpace: 'pre-wrap', textAlign: 'left' }}>
            {crosshairLabel.text}
          </Typography>
        </Box>
      )}
      <svg id="forecast-graph"></svg>
    </Box>
  );
}
