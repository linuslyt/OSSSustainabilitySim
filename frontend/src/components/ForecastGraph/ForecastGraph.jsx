import { Typography } from '@mui/material';
import Box from '@mui/material/Box';
import useResizeObserver from '@react-hook/resize-observer';
import * as d3 from 'd3';
import { debounce } from 'lodash';
import React, { useEffect, useMemo, useRef, useState } from 'react';
import { useSimulation } from '../context/SimulationContext';

let graphInitialized = false;

export default function ForecastGraph() {
  const simContext = useSimulation();

  const data = simContext.selectedProjectData.predictions;
  // const simMap = new Map(
  //   simContext.simulatedPredictions.map((sim) => [sim.month, sim]),
  // );
  // const simData2 = data.map((original) =>
  //   simMap.has(original.month) ? simMap.get(original.month) : original,
  // );
  const simData = simContext.simulatedPredictions;

  const domain = d3.extent(data.map((d) => d.month));

  const [tooltip, setTooltip] = useState({
    x: 0,
    y: 0,
    transform: '',
    visible: false,
    text: '',
  });
  const [crosshairLabel, setCrosshairLabel] = useState({
    x: 0,
    y: 0,
    transform: '',
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
        .y((d) => yScale(d.p_grad));
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
        .text(
          simContext.selectedProject?.project_id
            ? `Sustainability predictions for ${simContext.selectedProjectData.details.project_name}`
            : 'Select project to view prediction data.',
        )
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
        .text('P(Graduate) at month m+1')
        .style('font-size', '1rem')
        .style('font-family', "'Roboto', sans-serif");

      svg
        .select('#trendline')
        .datum(data)
        .attr('d', lineGenerator)
        .attr('fill', 'none')
        .attr('stroke', 'orange')
        .attr('opacity', simContext.simulatedPredictions.length > 0 ? 0.75 : 1)
        .attr('stroke-width', '2.5px');

      svg
        .select('#markers')
        .selectAll('circle')
        .data(data)
        .join('circle')
        .attr('r', '7px')
        .attr('cx', (d) => xScale(d.month))
        .attr('cy', (d) => yScale(d.p_grad))
        .attr('fill', '#E97451')
        .attr('opacity', simContext.simulatedPredictions.length > 0 ? 0.75 : 1)
        .on('mouseover', function (event, d) {
          const bbox = this.getBBox(); // Get bounding box of marker

          // Compute center coordinate of marker
          const x = bbox.x + bbox.width / 2;
          const y = bbox.y + bbox.height / 2;
          const transform =
            x > size.width / 2
              ? 'translateX(-110%) translateY(2rem)'
              : 'translateX(10%) translateY(2rem)';

          setTooltip({
            x,
            y,
            visible: true,
            transform: transform,
            text: `P(Graduate): ${d.p_grad.toFixed(3)}\nMonth: ${d.month}`,
          });
        })
        .on('mouseout', () => {
          setTooltip((prev) => ({ ...prev, visible: false }));
        });

      svg
        .select('#sim-markers')
        .selectAll('circle')
        .data(simData)
        .join('circle')
        .attr('r', '7px')
        .attr('cx', (d) => xScale(d.month))
        .attr('cy', (d) => yScale(d.p_grad))
        .attr('fill', 'rgb(17, 105, 193)')
        .attr('opacity', 0.7)
        .on('mouseover', function (event, d) {
          const bbox = this.getBBox(); // Get bounding box of marker

          // Compute center coordinate of marker
          const x = bbox.x + bbox.width / 2;
          const y = bbox.y + bbox.height / 2;

          const transform =
            x > size.width / 2
              ? 'translateX(-110%) translateY(2rem)'
              : 'translateX(10%) translateY(2rem)';

          setTooltip({
            x,
            y,
            visible: true,
            transform: transform,
            text: `P'(Graduate): ${d.p_grad.toFixed(3)}\nMonth: ${d.month}`,
          });
        })
        .on('mouseout', () => {
          setTooltip((prev) => ({ ...prev, visible: false }));
        });

      svg
        .select('#sim-trendline')
        .datum(simData)
        .attr('d', lineGenerator)
        .attr('fill', 'none')
        .attr('stroke', 'rgb(25, 118, 210)')
        .attr('opacity', 0.6)
        .attr('stroke-width', '2.5px');

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
          if (!simContext.selectedProject?.project_id) return;
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

          const transform =
            mouseX > size.width / 2
              ? 'translateX(-110%) translateY(3.3rem)'
              : 'translateX(10%) translateY(3.3rem)';

          setCrosshairLabel({
            x: mouseX,
            y: mouseY,
            visible: inBounds,
            transform: transform,
            text: `P(Graduate): ${yScale.invert(mouseY).toFixed(3)}`,
          });
        })
        .on('mouseleave', () => {
          if (!simContext.selectedProject?.project_id) return;
          d3.select('#forecast-graph')
            .select('#y-crosshair')
            .style('visibility', 'hidden');
          setCrosshairLabel((prev) => ({ ...prev, visible: false }));
        });
    };
    renderGraph(data);
  }, [size, data, simContext]);

  useEffect(() => {
    // Run once on initialize. See https://react.dev/learn/you-might-not-need-an-effect#initializing-the-application
    if (graphInitialized) return;
    graphInitialized = true;

    // Define SVG elements for graph. These only need to be defined once, and can then be selected
    // by ID and reused across rerenders. This allows the graph to update without duplicating elements,
    // by redrawing the same element instead of appending a new one.
    const svg = d3.select('#forecast-graph');
    svg.append('text').attr('id', 'title');
    svg.append('line').attr('id', 'y-crosshair');

    const originalPlot = svg.append('g').attr('id', 'original-plot');
    originalPlot.append('g').append('path').attr('id', 'trendline');
    originalPlot.append('g').attr('id', 'markers');

    const simulatedPlot = svg.append('g').attr('id', 'simulated-plot');
    simulatedPlot.append('g').append('path').attr('id', 'sim-trendline');
    simulatedPlot.append('g').attr('id', 'sim-markers');

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
            transform: tooltip.transform, // Center horizontally and offset vertically
            textAlign: 'center',
            pointerEvents: 'none',
            zIndex: 999,
          }}
        >
          <Typography
            sx={{
              whiteSpace: 'pre-wrap',
              textAlign: 'left',
              fontFamily: "'Roboto', sans-serif",
            }}
          >
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
            height: 'auto',
            width: 'auto',
            border: '0px',
            borderRadius: '7px',
            boxSizing: 'border-box',
            px: 1,
            transform: crosshairLabel.transform, // Center horizontally and offset vertically
            textAlign: 'center',
            pointerEvents: 'none',
            zIndex: 999,
          }}
        >
          <Typography
            sx={{
              whiteSpace: 'pre-wrap',
              textAlign: 'left',
              fontFamily: "'Roboto', sans-serif",
            }}
          >
            {crosshairLabel.text}
          </Typography>
        </Box>
      )}
      <svg id="forecast-graph"></svg>
    </Box>
  );
}
