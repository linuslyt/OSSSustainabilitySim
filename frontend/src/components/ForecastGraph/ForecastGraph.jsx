import * as d3 from 'd3';
import React, { useEffect, useMemo, useRef, useState } from 'react';
import './index.css';

export default function ForecastGraph() {
  // TODO: get data from API
  const data = useMemo(
    () => [
      { month: 0, pGraduate: 0.1 },
      { month: 2, pGraduate: 0.15 },
      { month: 4, pGraduate: 0.4 },
      { month: 6, pGraduate: 0.5 },
      { month: 8, pGraduate: 0.7 },
      { month: 10, pGraduate: 0.85 },
      { month: 12, pGraduate: 0.9 },
      { month: 14, pGraduate: 0.95 },
    ],
    [],
  );

  // TODO: fix resize
  const [size, setSize] = useState({ width: 1028, height: 360 });
  const graphRef = useRef(null); // When ref is created as null, React will map it to the JSX node it's assigned to on render.
  // const handleResize = useCallback(
  //   debounce((entry) => setSize(entry.contentRect), 100), // On window resize, call setSize with debounce of 50ms
  //   [],
  // );
  // // useResizeObserver(graphRef, handleResize);

  // // Cancel pending debounced calls on component unmount
  // useEffect(() => {
  //   return () => {
  //     handleResize.cancel();
  //   };
  // }, [handleResize]);

  useEffect(() => {
    // TODO: make graph span screen
    // TODO: make graph scrollable
    // TODO: make markers selectable
    const width = size.width,
      height = size.height,
      margin = { top: 50, right: 30, bottom: 50, left: 50 };

    const svg = d3
      .select('#forecast-graph')
      .attr('width', width)
      .attr('height', height);

    const xScale = d3
      .scaleLinear()
      .domain([0, 15])
      .range([margin.left, width - margin.right]);

    const yScale = d3
      .scaleLinear()
      .domain([0, 1])
      .range([height - margin.bottom, margin.top]);

    const xAxis = d3.axisBottom(xScale).ticks(8);
    const yAxis = d3.axisLeft(yScale).ticks(5);

    // Add X axis
    svg
      .append('g')
      .attr('transform', `translate(0,${height - margin.bottom})`)
      .call(xAxis)
      .append('text')
      .attr('x', width / 2)
      .attr('y', 35)
      .attr('fill', 'black')
      .attr('class', 'axis-label')
      .text('Month');

    // Add Y axis
    svg
      .append('g')
      .attr('transform', `translate(${margin.left},0)`)
      .call(yAxis)
      .append('text')
      .attr('transform', 'rotate(-90)')
      .attr('x', -height / 2)
      .attr('y', -40)
      .attr('fill', 'black')
      .attr('text-anchor', 'middle')
      .attr('class', 'axis-label')
      .text('P(Graduate)');

    // Line generator
    const line = d3
      .line()
      .x((d) => xScale(d.month))
      .y((d) => yScale(d.pGraduate));

    // Draw the line
    svg.append('path').datum(data).attr('class', 'line').attr('d', line);

    // Add markers (crosses)
    const markerSize = 6; // Adjust the cross size
    svg
      .selectAll('.cross')
      .data(data)
      .enter()
      .append('g')
      .each(function (d) {
        const g = d3.select(this);

        // First diagonal line (\)
        g.append('line')
          .attr('class', 'cross')
          .attr('x1', xScale(d.month) - markerSize)
          .attr('x2', xScale(d.month) + markerSize)
          .attr('y1', yScale(d.pGraduate) - markerSize)
          .attr('y2', yScale(d.pGraduate) + markerSize);

        // Second diagonal line (/)
        g.append('line')
          .attr('class', 'cross')
          .attr('x1', xScale(d.month) - markerSize)
          .attr('x2', xScale(d.month) + markerSize)
          .attr('y1', yScale(d.pGraduate) + markerSize)
          .attr('y2', yScale(d.pGraduate) - markerSize);
      });

    svg
      .selectAll('.cross')
      .data(data)
      .enter()
      .append('line')
      .attr('class', 'cross')
      .attr('x1', (d) => xScale(d.month) - 5)
      .attr('x2', (d) => xScale(d.month) + 5)
      .attr('y1', (d) => yScale(d.pGraduate) + 5)
      .attr('y2', (d) => yScale(d.pGraduate) - 5);

    // Add title
    svg
      .append('text')
      .attr('class', 'title')
      .attr('x', width / 2)
      .attr('y', margin.top - 20)
      .text('Sustainability forecast for month X+1 for Project 1');
  }, [data, size]);

  return (
    <div className="forecast-graph-container" ref={graphRef}>
      <svg id="forecast-graph"></svg>
    </div>
  );
}
