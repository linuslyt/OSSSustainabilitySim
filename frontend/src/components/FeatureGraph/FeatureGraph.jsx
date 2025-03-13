import { Box, Typography } from '@mui/material';
import useResizeObserver from '@react-hook/resize-observer';
import * as d3 from 'd3';
import { debounce, isEmpty } from 'lodash';
import React, { useEffect, useMemo, useRef, useState } from 'react';
import { useSimulation } from '../context/SimulationContext';

let graphInitialized = false;

const PERCENT_FORMAT = '.0%';
const FLOAT_FORMAT = '.2f';
const INT_FORMAT = '.0f';

const formatStrings = new Map(
  Object.entries({
    c_percentage: PERCENT_FORMAT,
    e_percentage: PERCENT_FORMAT,
    active_devs: INT_FORMAT,
    num_commits: INT_FORMAT,
    num_files: INT_FORMAT,
    num_emails: INT_FORMAT,
    inactive_c: INT_FORMAT,
    inactive_e: INT_FORMAT,
    c_nodes: INT_FORMAT,
    c_edges: INT_FORMAT,
    c_c_coef: PERCENT_FORMAT,
    e_nodes: INT_FORMAT,
    e_edges: INT_FORMAT,
    e_c_coef: PERCENT_FORMAT,
    c_mean_degree: FLOAT_FORMAT,
    c_long_tail: FLOAT_FORMAT,
    e_mean_degree: FLOAT_FORMAT,
    e_long_tail: FLOAT_FORMAT,
  }),
);

// TODO: prevent tooltip from overflowing page
// TODO: make scrollable; center on month
// TODO: fix default if no project selected.
// TODO: add dropdown selector for feature
export default function FeatureGraph() {
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

  const simContext = useSimulation();
  const selectedFeature = simContext.selectedFeature.feature;
  const display =
    !isEmpty(selectedFeature) &&
    !isEmpty(simContext.simulationData.selectedPeriod);
  const data = simContext.selectedProjectData.features.map((m) => ({
    month: m.month,
    value: m[selectedFeature],
  }));
  const dataDomain = d3.extent(data.map((d) => d.month));
  const dataRange = d3.extent(data.map((d) => d.value));

  useEffect(() => {
    const renderGraph = (data) => {
      const margin = {
        top: size.height * 0.2,
        right: size.width * 0.1,
        bottom: size.height * 0.2,
        left: size.width * 0.15,
      };
      const xScale = d3
        .scalePoint()
        .domain(d3.range(dataDomain[0], dataDomain[1] + 1))
        .range([margin.left, size.width - margin.right]);
      const yScale = d3
        .scaleLinear()
        .domain(dataRange)
        .range([size.height - margin.bottom, margin.top]);
      const xAxis = d3.axisBottom(xScale).ticks(data.length);
      const yAxis = d3
        .axisLeft(yScale)
        .tickFormat(d3.format(formatStrings.get(selectedFeature)));
      const lineGenerator = d3
        .line()
        .x((d) => xScale(d.month))
        .y((d) => yScale(d.value));
      const { width, height } = size;

      // Draw graph
      if (width === 0 || height === 0) return;

      const svg = d3
        .select('#feature-graph')
        .attr('width', size.width)
        .attr('height', size.height);

      svg
        .select('#title')
        .attr('transform', `translate(${size.width / 2}, ${margin.top / 2})`)
        .text(`${selectedFeature} over time`)
        .attr('text-anchor', 'middle')
        .style('font-size', '1.1rem')
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
        .attr('transform', `translate(${width / 2}, ${margin.bottom * 0.6})`)
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
          `translate(${-margin.left * 0.6}, ${height / 2}) rotate(-90)`,
        )
        .attr('fill', 'black')
        .attr('text-anchor', 'middle')
        .text(selectedFeature)
        .style('font-size', '1rem')
        .style('font-family', "'Roboto', sans-serif");

      svg
        .select('#trendline')
        .datum(data)
        .attr('d', lineGenerator)
        .attr('fill', 'none')
        .attr('stroke', 'green')
        .attr('stroke-width', '2px');

      svg
        .select('#markers')
        .selectAll('circle')
        .data(data)
        .join('circle')
        .attr('r', '7px')
        .attr('cx', (d) => xScale(d.month))
        .attr('cy', (d) => yScale(d.value))
        .attr('fill', 'green')
        .on('mouseover', function (event, d) {
          const bbox = this.getBBox(); // Get bounding box of marker

          // Compute center coordinate of marker
          const x = bbox.x + bbox.width / 2;
          const y = bbox.y + bbox.height / 2;

          const { x: offsetX, y: offsetY } = d3
            .select('#feature-graph')
            .node()
            .getBoundingClientRect();

          // TODO: pivot to left side if out of box range
          setTooltip({
            x: offsetX + x,
            y: offsetY + y,
            visible: true,
            text: `${selectedFeature}: ${d.value}\nMonth: ${d.month}`,
          });
        })
        .on('mouseout', () => {
          setTooltip((prev) => ({ ...prev, visible: false }));
        });

      d3.select('#feature-graph')
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

      d3.select('#feature-graph')
        .on('mousemove', (event) => {
          const [mouseX, mouseY] = d3.pointer(event);
          const inBounds =
            mouseX > margin.left &&
            mouseX < width - margin.right &&
            mouseY > margin.top &&
            mouseY < height - margin.bottom;

          d3.select('#feature-graph')
            .select('#y-crosshair')
            .attr('y1', mouseY)
            .attr('y2', mouseY)
            .style('visibility', inBounds ? 'visible' : 'hidden');

          const { x: offsetX, y: offsetY } = d3
            .select('#feature-graph')
            .node()
            .getBoundingClientRect();

          // TODO: pivot to left side if out of box range
          setCrosshairLabel({
            x: offsetX + mouseX,
            y: offsetY + mouseY,
            visible: inBounds,
            text: `${selectedFeature}: ${yScale.invert(mouseY).toFixed(2)}`,
          });
        })
        .on('mouseleave', () => {
          d3.select('#feature-graph')
            .select('#y-crosshair')
            .style('visibility', 'hidden');
          setCrosshairLabel((prev) => ({ ...prev, visible: false }));
        });
    };
    renderGraph(data);
  }, [size, data, selectedFeature, dataDomain, dataRange, display]);

  useEffect(() => {
    // Run once on initialize. See https://react.dev/learn/you-might-not-need-an-effect#initializing-the-application
    if (graphInitialized) return;
    graphInitialized = true;

    // Define SVG elements for graph. These only need to be defined once, and can then be selected
    // by ID and reused across rerenders. This allows the graph to update without duplicating elements,
    // by redrawing the same element instead of appending a new one.
    const svg = d3.select('#feature-graph');
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

  const emptyMessage = (
    <Typography sx={{ fontStyle: 'italic' }} variant="body">
      Select a project, define a change period, then select a feature to examine
      its history.
    </Typography>
  );

  return (
    <Box
      ref={graphRef}
      sx={{
        height: '100%',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        backgroundColor: 'rgba(255, 255, 255, 1)',
        borderRadius: '8px',
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
            transform: 'translateX(10%) translateY(-20%)', // Center horizontally and offset vertically
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
            transform: 'translateX(10%) translateY(-50%)', // Center horizontally and offset vertically
            textAlign: 'center',
            pointerEvents: 'none',
          }}
        >
          <Typography sx={{ whiteSpace: 'pre-wrap', textAlign: 'left' }}>
            {crosshairLabel.text}
          </Typography>
        </Box>
      )}
      {/* {!display && (
        <Typography sx={{ fontStyle: 'italic' }} variant="body">
          Select a project, define a change period, then select a feature to
          examine its history.
        </Typography>
      )} */}
      <svg id="feature-graph"></svg>
    </Box>
  );
}
