# EZgraph-JS
JavaScript library that generates customizable and reponsive HTML graphs on a web page

All examples on how to implement the graphs onto your web page are available in "examples" folder.

Example on how to implement a bar graph:

 let barGraphProperties = {
    container: document.getElementById("container"),
    type: "bar",
    title: "Horizontal Bar Graph",
    orientation: "horizontal",
    minValue: 0,
    maxValue: 100,
    height: 350,
    width: 420,
    categories: ['Jan','Feb','Mar','Apr','May'],
    intervals: 10,
    xLabel: "xLabel",
    yLabel: "yLabel",
    graphKeyTitle: "Data Sets",
    animate: "all", //Can also use "oneByOne"
    hideValues: false,
    hideIntervalGuides:false,
    hideValueGuides: false,
    data: {
      "Data Set 2": {
        color: "#dc3545",
        values: [
          10,70,80,90,30
        ]
      },
      "Data Set 1": {
        color: "#007bff",
        values: [
          19,24,43,77,38
        ]
      }
    }
  }
  let barGraph = new EZgraph(barGraphProperties);
