class EZgraph {

    constructor(props) {
      // GRAPH COMPONENTS
      this.type = props.type ? props.type : false;
      this.randId = Math.floor(Math.random() * 10000);
      this.container = props.container ? props.container : false;
      this.width = props.width ? props.width : 200;
      this.height = props.height ? props.height : 200;
      this.size = props.size ? props.size : 200;
      this.intervals = props.intervals ? props.intervals : 1;
      this.xIntervals = props.xIntervals ? props.xIntervals : 1;
      this.yIntervals = props.yIntervals ? props.yIntervals : 1;
      this.minXValue = props.minXValue ? props.minXValue : 0;
      this.maxXValue = props.maxXValue ? props.maxXValue : 100;
      if(this.type == 'timeline') {
        this.minXValue = props.minXValue ? props.minXValue.getTime() : 0;
        this.maxXValue = props.maxXValue ? props.maxXValue.getTime() : 100;
      }
      this.minYValue = props.minYValue ? props.minYValue : 0;
      this.maxYValue = props.maxYValue ? props.maxYValue : 100;
      this.minValue = props.minValue ? props.minValue : 0;
      this.maxValue = props.maxValue ? props.maxValue : 100;
      this.categories = props.categories ? props.categories : [];
      this.title = props.title ? props.title : "";
      this.xLabel = props.xLabel  ? props.xLabel : "";
      this.yLabel = props.yLabel  ? props.yLabel : "";
      this.values = props.values ? props.values : [];
      this.hideIntervalGuides = props.hideIntervalGuides ? props.hideIntervalGuides : false;
      this.hideValueGuides = props.hideValueGuides ? props.hideValueGuides : false;
      this.hideValues = props.hideValues ? props.hideValues : false;
      this.graphStyle = props.graphStyle ? this.graphStyle : {};
      this.barColorSet = [];
      this.hideGraphKey = props.hideGraphKey ? props.hideGraphKey : false;
      this.graphKeyTitle = props.graphKeyTitle ? props.graphKeyTitle : "Graph Key";
      this.graphKeyValues = [];
      this.animate = props.animate ? props.animate : false;
      this.trendLine = props.trendLine ? props.trendLine : false;
      this.data = props.data ? props.data : false;
      this.orientation = props.orientation ? props.orientation : false;
      this.bubbles = [];
      this.xCoords = [];
      this.yCoords = [];
      this.points = [];
      this.allPoints = [];
      this.connected = props.connected ? props.connected : false;
      if(this.data && this.type != 'pie') {
        this.values = [];
        let index = 0;
        for (let name in this.data) {
          this.graphKeyValues.push(name);
          if (this.data[name].color) {
            this.barColorSet.push(this.data[name].color);
          } else if (this.barColorSet.length > 0){
            this.barColorSet.push("black");
          }

          if(this.type === 'bubble'){
            let bubbles = [];
            this.data[name].bubbles.forEach( bubble => {
              bubbles.push(bubble);
            });
            bubbles.sort(function(a,b) { return a.x - b.x });
            this.bubbles.push(bubbles);
          }

          if(this.type === 'scatter') {
            let points = [];
            this.data[name].points.forEach((point) => {
              points.push(point);
              this.allPoints.push(point);
            });
            points.sort(function(a,b) { return a.x - b.x });
            this.points.push(points);
          }

          if(this.type === 'timeline') {
            let points = [];
            this.data[name].points.forEach((point) => {
              points.push(point);
              this.allPoints.push(point);
            });
            points.sort(function(a,b) { return new Date(a.x).getTime() - new Date(b.x).getTime() });
            this.points.push(points);
          }

          for (let i in this.data[name].values) {
            if(!this.values[i]){
              this.values[i] = [];
            }
            this.values[i][index] = this.data[name].values[i];
          }
          index ++;
        }
        this.barColorSet = this.barColorSet == "" ? ["#222222","#555555","#999999","#b2b2b2","#cccccc"] : this.barColorSet;
      }

      // GRAPH TYPE
    this.barType();
    }

    barType() {
      if(this.type=='pie') {
          this.generatePieChart();
          this.container.style.height = this.size + 130 + "px";
          return;
      }
      this.container.style.width = this.width + 100 + "px";
      this.container.style.height = this.height + 180 + "px";
      if (this.type == "bar") {
        if (this.orientation === "horizontal") {
          this.container.innerHTML = this.generateHorizontalBarGraph();
          return;
        }
        this.container.innerHTML = this.generateBarGraph();
      }
      if (this.type == "line") {
        this.container.innerHTML = this.generateLineGraph();
      }
      if (this.type == "bubble") {
        this.container.innerHTML = this.generateBubbleChart();
        document.getElementById("graphDataDiv" + this.randId).addEventListener("mousedown", (e) => { startZoom(e, this.randId) }, false);
        document.getElementById("graphDataDiv" + this.randId).addEventListener("mousemove", (e) => { setZoom(e, this.randId) }, false);
        document.getElementById("graphDataDiv" + this.randId).addEventListener("mouseup", () => { zoom(this, this.randId) }, false);
      }
      if (this.type == "scatter") {
        this.allPoints.sort(function(a,b) { return a.x - b.x });
        this.container.innerHTML = this.generateScatterPlot();
        document.getElementById("graphDataDiv" + this.randId).addEventListener("mousedown", (e) => { startZoom(e, this.randId) }, false);
        document.getElementById("graphDataDiv" + this.randId).addEventListener("mousemove", (e) => { setZoom(e, this.randId) }, false);
        document.getElementById("graphDataDiv" + this.randId).addEventListener("mouseup", () => { zoom(this, this.randId) }, false);
      }
      if (this.type == "timeline") {
        this.allPoints.sort(function(a,b) { return new Date(a.x).getTime() - new Date(b.x).getTime() });
        this.container.innerHTML = this.generateTimeLine();
        document.getElementById("graphDataDiv" + this.randId).addEventListener("mousedown", (e) => { startZoom(e, this.randId) }, false);
        document.getElementById("graphDataDiv" + this.randId).addEventListener("mousemove", (e) => { setZoom(e, this.randId) }, false);
        document.getElementById("graphDataDiv" + this.randId).addEventListener("mouseup", () => { zoom(this, this.randId) }, false);
      }
    }

    generateLineGraph() {
      var topOfGraphHTML = "";
      var intervalsHTML = "";
      var zoomHTML = "";
      var intervalGuidesHTML = "";
      var graphHTML = "";
      var bottomOfGraphHTML = "";
      topOfGraphHTML += "<div class='mainGraphContainer' style=width:" + ((80 + this.width) + 4) + "px;>";

      //TITLE
      if(this.title != "") {
        topOfGraphHTML += "<div class='titleContainer'>" + this.title + "</div>";
      }

      // GRAPH KEY
      if(this.hideGraphKey == false) {
        topOfGraphHTML += "<div class='graphKeyContainer' style='width:" + (this.width + 4) + "px;'>" + this.graphKeyTitle + ":";
        topOfGraphHTML += "<div style=width:100%;position;relative;>";
        this.graphKeyValues.map( (value, key) => {
          topOfGraphHTML += "<div class='keySection'><div class='keySquare' onMouseOver=showData("+key+","+this.randId+") onMouseOut=showAllData("+this.randId+") style=background:" + this.barColorSet[key] + "></div><div class='keyText'>" + value + "</div></div>";
        });
        topOfGraphHTML += "</div>";
        topOfGraphHTML +="</div>";
      }

      // INTERVALS
      intervalsHTML += "<div class='yIntervalsContainer' style='height:" + this.height + "px;'>";
      intervalsHTML += "<div class='yLabel' style='width:"+this.height+"px;'>" + this.yLabel + "</div>";
      var bottompx = -11;
      for (let i = 0; i <= this.intervals; i ++) {
        intervalsHTML += "<div class='yInterval' style=bottom:" +  (i == 0 ? -6 : bottompx) + "px;>" + parseFloat((i * ((this.maxValue - this.minValue) / this.intervals)) + this.minValue).toFixed(2).replace(".00","") + "</div>";
        bottompx += (this.height / this.intervals);
      }
      intervalsHTML += "</div>";

      // GRAPH DATA DIV
      zoomHTML += "<div id='graphDataDiv" + this.randId + "' class='graphDataContainer' style='width:" + this.width + "px;height:" + this.height + "px;'>";
      // INTERVAL GUIDES
      if (this.hideIntervalGuides == false) {
        bottompx = -2;
          for (let i = 0; i <= this.intervals; i ++) {
            if (i > 0 && i != this.intervals) {
              intervalGuidesHTML += "<div class='yIntervalGuide' style='bottom:" + bottompx + "px;'></div>";
          }
          bottompx += (this.height / this.intervals);
        }
      }

      if (this.minValue < 0) {
          let zeroLineTop = ((0 - this.minValue) / (this.maxValue - this.minValue) * this.height) - 2;
          intervalGuidesHTML += "<div class='zeroLineY' style='bottom:"+zeroLineTop+"px;'></div>";
      }

      // DISPLAYING DOTS
      var uniqueIndex = 0;
      this.values.forEach( (value, valueIndex) => {
        graphHTML += "<div class='dotHolder' style='width:" + this.width / this.categories.length + "px;''>";
          let colorPicker = 0;
          for(let i = 0; i <= value.length - 1; i ++){
            if(!value[i] || value[i] == undefined) {
              uniqueIndex++;
              continue;
            }
            let v = value[i];
            let dIndex = i;
            colorPicker = dIndex;
            graphHTML += "<div class='guideLineX guide"+this.randId+"Line"+uniqueIndex+"' onMouseOver=lineOver(" + uniqueIndex + ","+this.randId+") onMouseOut=lineOut(" + uniqueIndex + ","+this.randId+") onClick=showLine(" + uniqueIndex + ","+this.randId+") style='display:none;top:" + (this.height - (((v - this.minValue) / (this.maxValue - this.minValue)) * this.height)+1)  + "px;'></div>";
            graphHTML += "<div class='d"+this.randId+"data"+ dIndex + " lineDot data" + this.randId + "'"; if (this.hideValueGuides == false) { graphHTML += "onMouseOver=lineOver(" + uniqueIndex + ","+this.randId+") onMouseOut=lineOut(" + uniqueIndex + ","+this.randId+") onClick=showLine(" + uniqueIndex + ","+this.randId+")";} graphHTML += " style='"; if (this.animate == "all" || this.animate == "onebyone" ){ graphHTML += "display:none;visibility:hidden;"; }  graphHTML += ";margin-top:" + ((this.height - (((v - this.minValue) / (this.maxValue - this.minValue)) * this.height)) - 6) + "px;background:" + this.barColorSet[colorPicker] + ";left:" + ((((this.width / this.categories.length) * .8) / 1.5) + 5) + "px;margin-left:-14px;'>";

              if(valueIndex < this.values.length - 1){
                let angleHeight = (this.height - (((v - this.minValue) / (this.maxValue - this.minValue)) * this.height)) - (this.height - (((this.values[valueIndex + 1][colorPicker] - this.minValue) / (this.maxValue - this.minValue)) * this.height));
                let angleWidth = (this.width + 4) / this.categories.length;
                let slopeInRadians = Math.atan(angleHeight / angleWidth);
                let slopeInDegrees =  90 - ((slopeInRadians * 180) / Math.PI);
                let lineLength = Math.sqrt((angleHeight * angleHeight) + (angleWidth * angleWidth));
                graphHTML += "<div class='lineGraphLine l"+this.randId+"line" + dIndex + "' style='height:" + (this.animate ? 0 : lineLength) + "px;max-height:" + lineLength + "px;background:" + this.barColorSet[colorPicker] + ";transform:rotate("+slopeInDegrees+"deg);'></div>";
              }

            graphHTML += "<div class='guideText guide"+this.randId+"Line"+uniqueIndex+"' style='top:-15px;'>" + v +"</div>";
            graphHTML += "</div>";
            uniqueIndex++;
          };
        graphHTML += "</div>";
      });
      graphHTML += "</div>";

      //categories
      bottomOfGraphHTML += "<div class='bottomcategoriesContainer' style=padding-left:80px;>";
      this.categories.forEach( (label) => {
        bottomOfGraphHTML +="<div class='xCategory' style='width:" + this.width / this.categories.length + "px;'>" + label + "</div>";
      });
      if (this.xLabel != "") {
        bottomOfGraphHTML += "<div class='xLabel xLabelAdj' style='width:" + this.width+ "px;'>" + this.xLabel + "</div>";
      }
      bottomOfGraphHTML += "</div>";

      bottomOfGraphHTML += "</div>";

      if (this.animate == "all") {
        setTimeout( () => {
          for (let i = 0; i < this.barColorSet.length; i++) {
            animateOneByOneStartL(0, i, "all",this.randId);
          }
        },0);
      }

      if (this.animate == "onebyone") {
        setTimeout(() => {
          animateOneByOneL(0, this.randId);
        },0);
      }

      return `${topOfGraphHTML}${intervalsHTML}${zoomHTML}${intervalGuidesHTML}${graphHTML}${bottomOfGraphHTML}`;
    }


    generateHorizontalBarGraph() {
      var topOfGraphHTML = "";
      var intervalsHTML = "";
      var zoomHTML = "";
      var intervalGuidesHTML = "";
      var graphHTML = "";
      var bottomOfGraphHTML = "";
      topOfGraphHTML += "<div class='mainGraphContainer' style=width:" + ((80 + this.width) + 4) + "px;>";

      //TITLE
      if(this.title != "") {
        topOfGraphHTML += "<div class='titleContainer'>" + this.title + "</div>";
      }

      // GRAPH KEY
      if(this.hideGraphKey == false) {
        topOfGraphHTML += "<div class='graphKeyContainer' style='width:" + (this.width + 4) + "px;'>" + this.graphKeyTitle + ":";
        topOfGraphHTML += "<div style=width:100%;position;relative;>";
        this.graphKeyValues.map( (value, key) => {
          topOfGraphHTML += "<div class='keySection'><div class='keySquare' onMouseOver=showData("+key+","+this.randId+",'bar') onMouseOut=showAllData("+this.randId+",'bar') style=background:" + this.barColorSet[key] + "></div><div class='keyText'>" + value + "</div></div>";
        });
        topOfGraphHTML += "</div>";
        topOfGraphHTML +="</div>";
      }

      // INTERVALS
      intervalsHTML += "<div class='yIntervalsContainer' style='height:" + this.height + "px;'>";
      intervalsHTML += "<div class='yLabel' style='left:30px;width:"+this.height+"px;'>" + this.yLabel + "</div>";

      var bottompx = 0;
      this.categories.forEach( (label) => {
        intervalsHTML += "<div class='horizontalYLabel' style=bottom:" + bottompx + "px;padding-bottom:"+(((this.height / this.categories.length) / 2) - 8)+"px;>" + label + "</div>";
        bottompx += (this.height / this.categories.length);
      });
      intervalsHTML +="</div>";

      // GRAPH DATA DIV
      zoomHTML += "<div id='graphDataDiv" + this.randId + "' class='graphDataContainer' style='width:" + this.width + "px;height:" + this.height + "px;'>";

      // INTERVAL GUIDES
      if (this.hideIntervalGuides == false) {
        let leftpx = -2;
          for (let i = 0; i <= this.intervals; i ++) {
            if (i > 0 && i != this.intervals) {
              intervalGuidesHTML += "<div class='xIntervalGuide' style='left:" + leftpx + "px;'></div>";
          }
          leftpx += (this.width / this.intervals);
        }
      }

      // DISPLAYING BARS
      var barIndex = 0;
      this.values.forEach( (value) => {
        var actualValue = value;
        if (value > this.maxValue) {
          value = this.maxValue;
        }
        if (value < this.minValue) {
          value = 0;
        }
        graphHTML += "<div style='float:left;width:100%;height:" + this.height / this.categories.length + "px;'>";
        if (!value[1]) {
          let v = value[0];
          graphHTML += "<div class='guide"+this.rand+"Line"+barIndex+" guideLineY' style='display:none;height:" + this.height + "px;right:" + (this.width - (((v - this.minValue) / (this.maxValue - this.minValue)) * this.width) + 1)  + "px;'></div>";
          graphHTML += "<div class='bar"+this.randId+" d"+this.randId+"data0 data" + this.randId + "' "; if (this.hideValueGuides == false) { graphHTML += "onMouseOver=lineOver("+barIndex+","+this.rand+") onMouseOut=lineOut("+barIndex+","+this.rand+") onClick=showLine("+barIndex+","+this.rand+")";} graphHTML += " style='visibility:visible;"; if(this.animate =="all" || this.animate == "onebyone") { graphHTML += "display:none;";  } graphHTML += ";cursor:pointer;width:" + ((((value - this.minValue) / (this.maxValue - this.minValue)) * this.width) - 1) + "px;max-width:" + ((((value - this.minValue) / (this.maxValue - this.minValue)) * this.width) - 1) + "px;height:" + ((this.height / this.categories.length) * .8) + "px;background:" + this.barColorSet[0] + ";position:relative;top:50%;margin-top:-" + (((this.height / this.categories.length) * .8) / 2) + "px'>";
          graphHTML += "<div class=horizontalBarValue style='"; if(this.hideValues){ graphHTML += "display:none;" } graphHTML += "'>" + actualValue +"</div>";
          graphHTML += "<div class='guide"+this.rand+"Line"+barIndex+" guideTextY' style='left:"+ ((((v - this.minValue) / (this.maxValue - this.minValue)) * this.width) + 3)+"px;'>" + v +"</div>";
          graphHTML += "</div>";
          barIndex++;
        } else {
          var colorPicker = 0;
          for(let i = 0; i <= value.length - 1; i ++){
            if(!value[i] || value[i] == undefined) {
              colorPicker++;
              barIndex++;
              continue;
            }
            let v = value[i];
            let actualValue = v;
            if (v > this.maxValue) {
              v = this.maxValue;
            }
            if (v < this.minValue) {
              v = 0;
            }
            graphHTML += "<div class='guide"+this.rand+"Line"+barIndex+" guideLineY' style='display:none;height:" + this.height + "px;right:" + (this.width - (((v - this.minValue) / (this.maxValue - this.minValue)) * this.width) + 1)  + "px;'></div>";
            graphHTML += "<div class='bar"+this.randId+" d"+this.randId+"data"+colorPicker+" data" + this.randId + "' "; if (this.hideValueGuides == false) { graphHTML += "onMouseOver=lineOver("+barIndex+","+this.rand+") onMouseOut=lineOut("+barIndex+","+this.rand+") onClick=showLine("+barIndex+","+this.rand+")";} graphHTML += " style='"; if(this.animate =="all" || this.animate == "onebyone") { graphHTML += "display:none;";  } graphHTML += ";cursor:pointer;width:" + ((((v - this.minValue) / (this.maxValue - this.minValue)) * this.width) - 1) + "px;max-width:" + ((((v - this.minValue) / (this.maxValue - this.minValue)) * this.width) - 1) + "px;height:" + ((this.height / this.categories.length) * (.8 / value.length)) + "px;background:" + this.barColorSet[colorPicker] + ";position:relative;margin-top:" + ((.2 * this.height / this.categories.length) / value.length) + "px;margin-bottom:-" + (((.2 * this.height / this.categories.length) / value.length)) + "px'>";
            graphHTML += "<div class=horizontalBarValue style='"; if(this.hideValues){ graphHTML += "display:none;" } graphHTML += "'>" + actualValue +"</div>";
            graphHTML += "<div class='guide"+this.rand+"Line"+barIndex+" guideTextY' style='left:"+ ((((v - this.minValue) / (this.maxValue - this.minValue)) * this.width) + 3)+"px;'>" + v +"</div>";
            graphHTML += "</div>";
            colorPicker++;
            barIndex++;
          }
        }
        graphHTML += "</div>";
      });
      graphHTML += "</div>";

      //categories
      bottomOfGraphHTML += "<div class='bottomLabelsContainer'>";
      var left = 80;
        for (let i = 0; i <= this.intervals; i ++) {
          if(i == 0) {
            bottomOfGraphHTML += "<div class='xInterval' style=left:"+ (left - 5) +"px;width:" + (this.width / this.xIntervals) * 2 + "px;>" + parseFloat((i * ((this.maxValue - this.minValue) / this.intervals)) + this.minValue).toFixed(2).replace(".00","") + "</div>";
            continue;
          }
          bottomOfGraphHTML += "<div class='xInterval' style=left:"+left+"px;width:" + (this.width / this.intervals) * 2 + "px;text-align:center;>" + parseFloat((i * ((this.maxValue - this.minValue) / this.intervals)) + this.minValue).toFixed(2).replace(".00","") + "</div>";
          left += (this.width / this.intervals);
        }
      if (this.xLabel != "") {
        bottomOfGraphHTML += "<div class='xLabel' style='width:" + this.width+ "px;margin-top:25px;'>" + this.xLabel + "</div>";
      }
      bottomOfGraphHTML += "</div>";
      bottomOfGraphHTML += "</div>";
      if (this.animate == "all") {
        setTimeout( () => {
          animateAllH(this.randId);
        },0);
      }
      if (this.animate == "onebyone") {
        setTimeout( () => {
          animateOneByOneH(this.randId);
        },0);
      }
      return `${topOfGraphHTML}${intervalsHTML}${zoomHTML}${intervalGuidesHTML}${graphHTML}${bottomOfGraphHTML}`;
    }

    generateBarGraph() {
      var topOfGraphHTML = "";
      var intervalsHTML = "";
      var zoomHTML = "";
      var intervalGuidesHTML = "";
      var graphHTML = "";
      var bottomOfGraphHTML = "";
      topOfGraphHTML += "<div class='mainGraphContainer' style=width:" + ((80 + this.width) + 4) + "px;>";

      //TITLE
      if(this.title != "") {
        topOfGraphHTML += "<div class='titleContainer'>" + this.title + "</div>";
      }

      // GRAPH KEY
      if(this.hideGraphKey == false) {
        topOfGraphHTML += "<div class='graphKeyContainer' style='width:" + (this.width + 4) + "px;'>" + this.graphKeyTitle + ":";
        topOfGraphHTML += "<div style=width:100%;position;relative;>";
        this.graphKeyValues.map( (value, key) => {
          topOfGraphHTML += "<div class='keySection'><div class='keySquare' onMouseOver=showData("+key+","+this.randId+",'bar') onMouseOut=showAllData("+this.randId+",'bar') style=background:" + this.barColorSet[key] + "></div><div class='keyText'>" + value + "</div></div>";
        });
        topOfGraphHTML += "</div>";
        topOfGraphHTML +="</div>";
      }

      // INTERVALS
      intervalsHTML += "<div class='yIntervalsContainer' style='height:" + this.height + "px;'>";
      intervalsHTML += "<div class='yLabel' style='width:"+this.height+"px;'>" + this.yLabel + "</div>";
      var bottompx = -11;
      for (let i = 0; i <= this.intervals; i ++) {
        intervalsHTML += "<div class='yInterval' style=bottom:" +  (i == 0 ? -6 : bottompx) + "px;>" + parseFloat((i * ((this.maxValue - this.minValue) / this.intervals)) + this.minValue).toFixed(2).replace(".00","") + "</div>";
        bottompx += (this.height / this.intervals);
      }
      intervalsHTML += "</div>";

      // GRAPH DATA DIV
      zoomHTML += "<div id='graphDataDiv" + this.randId + "' class='graphDataContainer' style='width:" + this.width + "px;height:" + this.height + "px;'>";

      // INTERVAL GUIDES
      if (this.hideIntervalGuides == false) {
        bottompx = -2;
          for (let i = 0; i <= this.intervals; i ++) {
            if (i > 0 && i != this.intervals) {
              intervalGuidesHTML += "<div class='yIntervalGuide' style='bottom:" + bottompx + "px;'></div>";
          }
          bottompx += (this.height / this.intervals);
        }
      }

      // DISPLAYING BARS
      var barIndex = 0;
      this.values.forEach( (value) => {
        var actualValue = value;
        if (value > this.maxValue) {
          value = this.maxValue;
        }
        if (value < this.minValue) {
          value = 0;
        }
        graphHTML += "<div style='float:left;height:100%;width:" + this.width / this.categories.length + "px;''>";
        if (!value[1]) {
          let v = value[0];
          graphHTML += "<div class='guide"+this.rand+"Line"+barIndex+" guideLineX' style='display:none;top:" + ((this.height - (((v - this.minValue) / (this.maxValue - this.minValue)) * this.height)) + 1) + "px;'></div>";
          graphHTML += "<div class='bar"+this.randId+" d"+this.randId+"data0 data" + this.randId + "' bar" + colorPicker + "'"; if (this.hideValueGuides == false) { graphHTML += " onMouseOver=lineOver("+barIndex+","+this.rand+") onMouseOut=lineOut("+barIndex+","+this.rand+") onClick=showLine("+barIndex+","+this.rand+")";} graphHTML += " style='visiblity:visible;"; if(this.animate =="all" || this.animate == "onebyone") { graphHTML += "display:none;";  } graphHTML += ";float:left;cursor:pointer;height:" + ((value - this.minValue) / (this.maxValue - this.minValue)) * this.height + "px;width:" + ((this.width / this.categories.length) * .8) + "px;margin-top:" + (this.height - (((value - this.minValue) / (this.maxValue - this.minValue)) * this.height)) + "px;background:" + this.barColorSet[0] + ";position:relative;left:50%;margin-left:-" + (((this.width / this.categories.length) * .8) / 2) + "px'>";
          if (this.hideValues == false) {
            graphHTML += "<div class='verticalBarValue'>" + actualValue +"</div>";
          }
          graphHTML += "<div class='guide"+this.rand+"Line"+barIndex+" guideTextX'>" + v +"</div>";
          graphHTML += "</div>";
          barIndex++;
        } else {
          var colorPicker = 0;
          for(let i = 0; i <= value.length - 1; i ++){
            if(!value[i] || value[i] == undefined) {
              colorPicker++;
              barIndex++;
              continue;
            }
            let v = value[i];
            let actualValue = v;
            if (v > this.maxValue) {
              v = this.maxValue;
            }
            if (v < this.minValue) {
              v = 0;
            }
            graphHTML += "<div class='guide"+this.rand+"Line"+barIndex+" guideLineX' style='display:none;top:" + ((this.height - (((v - this.minValue) / (this.maxValue - this.minValue)) * this.height)) + 1) + "px;'></div>";
            graphHTML += "<div class='bar"+this.randId+" d"+this.randId+"data"+colorPicker+" data" + this.randId + "' bar" + colorPicker + "'"; if (this.hideValueGuides == false) { graphHTML += " onMouseOver=lineOver("+barIndex+","+this.rand+") onMouseOut=lineOut("+barIndex+","+this.rand+") onClick=showLine("+barIndex+","+this.rand+")";} graphHTML += " style='"; if(this.animate =="all" || this.animate == "onebyone") { graphHTML += "display:none;";  } graphHTML += ";float:left;cursor:pointer;height:" + ((v - this.minValue) / (this.maxValue - this.minValue)) * this.height + "px;width:" + ((this.width / this.categories.length) * (.8 / value.length)) + "px;margin-top:" + (this.height - (((v - this.minValue) / (this.maxValue - this.minValue)) * this.height)) + "px;background:" + this.barColorSet[colorPicker] + ";position:relative;margin-left:" + ((.2 * this.width / this.categories.length) / value.length) + "px;margin-right:-" + (((.2 * this.width / this.categories.length) / value.length)) + "px'>";
            if (this.hideValues == false) {
              graphHTML += "<div class='verticalBarValue'>" + actualValue +"</div>";
            }
            graphHTML += "<div class='guide"+this.rand+"Line"+barIndex+" guideTextX'>" + v +"</div>";
            graphHTML += "</div>";
            colorPicker++;
            barIndex++;
          };
        }
        graphHTML += "</div>";
      });
      graphHTML += "</div>";

      //categories
      bottomOfGraphHTML += "<div class='bottomcategoriesContainer' style=padding-left:80px;>";
      this.categories.forEach( (label) => {
        bottomOfGraphHTML +="<div class='xCategory' style='width:" + this.width / this.categories.length + "px;'>" + label + "</div>";
      });
      if (this.xLabel != "") {
        bottomOfGraphHTML += "<div class='xLabel xLabelAdj' style='width:" + this.width+ "px;'>" + this.xLabel + "</div>";
      }
      bottomOfGraphHTML += "</div>";

      bottomOfGraphHTML += "</div>";

      if (this.animate == "all") {
        setTimeout( () => {
          animateAll(this.randId);
        },0);
      }
      if (this.animate == "onebyone") {
        setTimeout( () => {
          animateOneByOne(this.randId);
        },0);
      }

      return `${topOfGraphHTML}${intervalsHTML}${zoomHTML}${intervalGuidesHTML}${graphHTML}${bottomOfGraphHTML}`;
    }

    generatePieChart() {

      this.container.innerHTML = "<div class='pie pie"+this.randId+"' style='height:" +  this.size+ "px;width:" + this.size + "px;z-'><div class='pie_segment animateSegment animateSegment"+this.randId+"' style='--rotation:180;'></div><div class='pie_segment animateSegment animateSegment"+this.randId+"' style='--rotation:0;'></div></div><div class='pieLabelsContainer pieLabelsContainer"+this.randId+"' style='height:" +  this.size + "px;width:" + this.size + "px;'></div><div class='titleAndKeyContainer titleAndKeyContainer"+this.randId+"' style='height:" +  this.size + "px;width:" + this.size + "px;'></div>";

      var totalValue = 0;
      for (let obj in this.data) {
        totalValue += this.data[obj].value;
        this.graphKeyValues.push(obj);
        this.barColorSet.push(this.data[obj].color);
      }

      var rotation = 0;
      for (let obj in this.data) {
        let percentage = ((this.data[obj].value / totalValue) * 100).toFixed(1);
        if (percentage != "undefined" && percentage > 0 && percentage <= 100) {
          let addedDegree = 0;
          let degrees = 360 * (.01 * percentage);
          if (percentage > 50) {
            degrees = 360 * (.01 * (percentage - 50));
          }
          if(percentage > 50 && percentage < 100){
              addedDegree = 3;
          }
          let textRotation = 0;
          let textAlign = "right";
          let textPos = "right";
          if (rotation < 180) {
             textRotation = 180;
             textAlign = "left";
             textPos = "left";
          }
          let textBottom = "5%";
          if (percentage < 5) {
            if(this.size >= 200) {
              textBottom = "-5%";
            }
            if(this.size >= 250) {
              textBottom = "-4.5%";
            }
            if(this.size >= 300) {
              textBottom = "-4%";
            }
            if(this.size >= 350) {
              textBottom = "-3.5%";
            }
            if(this.size >= 400) {
              textBottom = "-3%";
            }
            if(this.size >= 450) {
              textBottom = "-2.5%";
            }
            if(this.size >= 500) {
              textBottom = "-2%";
            }
            if(this.size >= 550) {
              textBottom = "-1.5%";
            }
          }

          let labelRotation = 90 - rotation;
          if (rotation >= 180) {
            labelRotation = 270 - rotation;
          }

          let labelTransformOrigin = "0% 100%";
          if (rotation >= 180) {
            labelTransformOrigin = "100% 0%";
          }

          document.querySelector(".pie"+this.randId).innerHTML += "<div class=pie_segment style='--degrees: " + (degrees + addedDegree) + "; --rotation: " + rotation + "; --bg:" + this.data[obj].color + ";'></div>";

          if(this.hideValues == false) {
            document.querySelector(".pieLabelsContainer"+this.randId).innerHTML += "<div class=invisibleSegment style='--degrees: " + (degrees + addedDegree) + "; --rotation: " + rotation + ";'><div class=pieLabel style='transform:rotate( " + textRotation + "deg);text-align:" + textAlign + ";bottom:" + textBottom + "'><div style='transform:rotate("+labelRotation+"deg);transform-origin:"+labelTransformOrigin+";'><div class='labelName' style='"+textPos+":102%;' >" + obj + ": <b>" + percentage + "%</b><br>" + this.data[obj].value + "</div><div class='pointerLine'></div></div></div></div>";
          }
          rotation += degrees;
          if (percentage > 50) {
            degrees = 360 * (.01 * (percentage - (percentage - 50)));
            document.querySelector(".pie"+this.randId).innerHTML += "<div class=pie_segment style='--degrees: " + degrees + "; --rotation: " + rotation + "; --bg:" + this.data[obj].color + ";'></div>";
            document.querySelector(".pieLabelsContainer"+this.randId).innerHTML += "<div class=invisibleSegment style='--degrees: " + degrees + "; --rotation: " + rotation + ";bottom:" + textBottom + "'></div>";
            rotation += degrees;
          }
          if(this.barColorSet.length > 1) {
            let lineMargin = 0;
            if (rotation == 180) {
              lineMargin = 1;
            }
            document.querySelector(".pie"+this.randId).innerHTML += "<div class='pieBorder' style='margin-left:"+lineMargin+"px;transform:rotate(" + rotation + "deg);'></div>";
          }
        }
      }

      if (this.title != "") {
        document.querySelector(".titleAndKeyContainer"+this.randId).innerHTML += "<div class='pieTitleAndKeyContainer'>" + this.title + "</div>";
      }

      if (this.hideGraphKey == false) {
        var graphKey = "<div class=graphKeyContainer style='width:100%;margin-left:0px;position:absolute;top:" + (this.size + 40) + "px;'><div style=float:left;width:100%;>" + this.graphKeyTitle + ":</div>";
        this.graphKeyValues.map( (value, key) => {
          graphKey += "<div class='keySection'><div class='keySquare' onMouseOver=showData("+key+","+this.randId+") onMouseOut=showAllData("+this.randId+") style=background:" + this.barColorSet[key] + "></div><div class='keyText'>" + value + "</div></div>";
        });
        graphKey += "</div>";
        document.querySelector(".titleAndKeyContainer"+this.randId).innerHTML += graphKey;
      }

      if (this.animate == true) {
        setTimeout(() => {
          animatePieChart(1, 180, 360, 0, this.randId)
        },0);
      } else {
        document.querySelector('.pie'+this.randId).removeChild(document.querySelector('.pie'+this.randId).childNodes[0]);
        document.querySelector('.pie'+this.randId).removeChild(document.querySelector('.pie'+this.randId).childNodes[0]);
      }
    }


    generateBubbleChart() {
      var topOfGraphHTML = "";
      var intervalsHTML = "";
      var zoomHTML = "";
      var intervalGuidesHTML = "";
      var graphHTML = "";
      var bottomOfGraphHTML = "";
      topOfGraphHTML += "<div class='mainGraphContainer' style=width:" + ((80 + this.width) + 4) + "px;>";

      //TITLE
      if(this.title != "") {
        topOfGraphHTML += "<div class='titleContainer'>" + this.title + "</div>";
      }

      // GRAPH KEY
      if(this.hideGraphKey == false) {
        topOfGraphHTML += "<div class='graphKeyContainer' style='width:" + (this.width + 4) + "px;'>" + this.graphKeyTitle + ":";
        topOfGraphHTML += "<div style=width:100%;position;relative;>";
        this.graphKeyValues.map( (value, key) => {
          topOfGraphHTML += "<div class='keySection'><div class='keySquare' onMouseOver=showData("+key+","+this.randId+") onMouseOut=showAllData("+this.randId+") style=background:" + this.barColorSet[key] + "></div><div class='keyText'>" + value + "</div></div>";
        });
        topOfGraphHTML += "</div>";
        topOfGraphHTML +="</div>";
      }

      // INTERVALS
      intervalsHTML += "<div class='yIntervalsContainer' style='height:" + this.height + "px;'>";

      intervalsHTML += "<div class='yLabel' style='width:"+this.height+"px;'>" + this.yLabel + "</div>";

      var bottompx = -11;
      for (let i = 0; i <= this.yIntervals; i ++) {
        intervalsHTML += "<div class='yInterval' style=bottom:" +  (i == 0 ? -6 : bottompx) + "px;>" + parseFloat((i * ((this.maxYValue - this.minYValue) / this.yIntervals)) + this.minYValue).toFixed(2).replace(".00","") + "</div>";
        bottompx += (this.height / this.yIntervals);
      }
      intervalsHTML += "</div>";

      // GRAPH DATA DIV
      zoomHTML += "<div id='graphDataDiv" + this.randId + "' class='graphDataContainer' style='width:" + this.width + "px;height:" + this.height + "px;'>";

      // ZOOM FUNCTIONALITY
      if (!this.disableZoom) {
        zoomHTML += "<div style='display:none;top:0px;left:0px;' id='"+this.randId+"startZoom' class='startZoom'><div style='bottom:0px;top:0px;left:4px;' id='"+this.randId+"rightBounds' class='rightBounds'><div style='bottom:-4px;left:-4px;top:;' id='"+this.randId+"innerLeftSquare' class='leftSquare'></div></div><div style='left:0px;right:0px;top:4px;' id='"+this.randId+"topBounds' class='topBounds'></div></div>";
        zoomHTML += "<div style='display:none;top:0px;left:0px;' id='"+this.randId+"setZoom' class='setZoom'><div style='bottom:0px;top:0px;left:4px;' id='"+this.randId+"leftBounds' class='leftBounds'><div style='top:-4px;right:-4px;bottom:;' id='"+this.randId+"innerRightSquare' class='rightSquare'></div></div><div style='left:0px;right:0px;top:4px;' id='"+this.randId+"bottomBounds' class='bottomBounds'></div></div>";
        zoomHTML += "<div style='top:0px;left:0px;' id='"+this.randId+"topBoundsBox' class='topBoundsBox'></div>";
        zoomHTML += "<div style='bottom:0px;left:0px;' id='"+this.randId+"bottomBoundsBox' class='bottomBoundsBox'></div>";
        zoomHTML += "<div style='top:0px;left:0px;' id='"+this.randId+"leftBoundsBox' class='leftBoundsBox'></div>";
        zoomHTML += "<div style='top:0px;right:0px;' id='"+this.randId+"rightBoundsBox' class='rightBoundsBox'></div>";
        if (this.zoomed) {
          zoomHTML += "<div id='"+this.randId+"zoomOut' class='zoomOut'><div class='zoomOutMagnifyingGlassBG '><div class='zoomOutMagnifyingGlassInnerBG'><div class='zoomOutMagnifyingGlassLine'></div></div></div><div class='zoomOutMagnifyingGlassHandle'></div></div>";
        }
      }

      // INTERVAL GUIDES
      if (this.hideIntervalGuides == false) {
        let bottompx = -2;
          for (let i = 0; i <= this.yIntervals; i ++) {
            if (i > 0 && i != this.yIntervals) {
              intervalGuidesHTML += "<div class='yIntervalGuide' style='bottom:" + bottompx + "px;'></div>";
          }
          bottompx += (this.height / this.yIntervals);
        }
        let leftpx = (this.width / this.xIntervals);
        for (let i = 0; i <= this.xIntervals; i ++) {
          if (i > 0 && i != this.xIntervals) {
            intervalGuidesHTML += "<div class='xIntervalGuide' style='left:" + leftpx + "px;'></div>";
            leftpx += (this.width / this.xIntervals);
          }
        }
      }

      if (this.minYValue < 0) {
          let zeroLineTop = ((0 - this.minYValue) / (this.maxYValue - this.minYValue) * this.height);
          intervalGuidesHTML += "<div class='zeroLineY' style='bottom:"+zeroLineTop+"px;'></div>";
      }
      if (this.minXValue < 0) {
          let zeroLineLeft = ((0 - this.minXValue) / (this.maxXValue - this.minXValue) * this.width);
          intervalGuidesHTML += "<div class='zeroLineX' style='left:" + zeroLineLeft + "px;'></div>";
      }

      // PLOTTING THE BUBBLES
      var uniqueIndex = 0;
      for (let index in this.bubbles) {

        for(let cIndex in this.bubbles[index]) {
          let x = this.bubbles[index][cIndex].x;
          this.xCoords.push(x);
          let y = this.bubbles[index][cIndex].y;
          this.yCoords.push(y);
          let s = this.bubbles[index][cIndex].size;
          if(s < 0) {
            continue;
          }
          let left = (this.width - (((x - this.minXValue) / (this.maxXValue - this.minXValue)) * this.width)) - 4;
          let marginTop = (this.height - (((y - this.minYValue) / (this.maxYValue - this.minYValue)) * this.height)) - 4;
          let size = (s / (this.maxXValue - this.minXValue) * this.width);
          graphHTML += "<div class='guide"+this.randId+"Line" + uniqueIndex + " guideLineX' onMouseOver=lineOver(" + uniqueIndex + ","+this.randId+") onMouseOut=lineOut(" + uniqueIndex + ","+this.randId+")  style='display:none;top:" + (marginTop + 5)  + "px;'></div>";
          graphHTML += "<div class='guide"+this.randId+"Line" + uniqueIndex + " guideLineY' style='display:none;right:" + (left - (size/2) + 3 )  + "px;'></div>";
          graphHTML += "<div class='guide"+this.randId+"Line" + uniqueIndex + " guideLineY' style='display:none;right:" + (left + (size/2) + 4)  + "px;'></div>";
          graphHTML += "<div class='bubble data"+this.randId+" d"+this.randId+"data" + index + "' "; if (this.hideValueGuides == false) { graphHTML += "onMouseOver=lineOver(" + uniqueIndex + ","+this.randId+") onMouseOut=lineOut(" + uniqueIndex + ","+this.randId+") onClick=showLine(" + uniqueIndex + ","+this.randId+")";} graphHTML += " style='" + (this.animate ? "display:none;visibility:hidden;" : "") + "right:" + (left - (this.animate ? 0 : size/2) + 4) + "px;margin-top:" + (marginTop - (this.animate ? 0 : size/2) + 6) + "px;height:"+(this.animate ? 0 : size)+"px;width:"+(this.animate ? 0 : size) +"px;max-height:"+size+"px;border-radius:"+(size/2)+"px;background:" + this.barColorSet[index] + "'>" + "<div class=bubbleValueText style=max-width:"+s+";>"+ ( this.hideValues == false ? s : "") +"</div>";
          graphHTML += "</div>";
          uniqueIndex++;
        }
        this.maxIndex = parseInt(index) + 1;
      }

      graphHTML += "</div>";

      //LABELS
      bottomOfGraphHTML += "<div class='bottomLabelsContainer'>";
      var left = 80;
        for (let i = 0; i <= this.xIntervals; i ++) {
          if(i == 0) {
            bottomOfGraphHTML += "<div class='xInterval' style=left:"+ (left - 5) +"px;width:" + (this.width / this.xIntervals) * 2 + "px;>" + parseFloat((i * ((this.maxXValue - this.minXValue) / this.xIntervals)) + this.minXValue).toFixed(2).replace(".00","") + "</div>";
            continue;
          }
          bottomOfGraphHTML += "<div class='xInterval' style=left:"+left+"px;width:" + (this.width / this.xIntervals) * 2 + "px;text-align:center;>" + parseFloat((i * ((this.maxXValue - this.minXValue) / this.xIntervals)) + this.minXValue).toFixed(2).replace(".00","") + "</div>";
          left += (this.width / this.xIntervals);
        }
      if (this.xLabel != "") {
        bottomOfGraphHTML += "<div class='xLabel' style='width:" + this.width+ "px;margin-top:25px;'>" + this.xLabel + "</div>";
      }
      bottomOfGraphHTML += "</div>";
      bottomOfGraphHTML += "</div>";

      if (this.animate == "all") {
        setTimeout( () => {
          let size = document.querySelectorAll(".data"+this.randId).length;
          for (let i = 0; i <= size; i++) {
            animateOneByOneStartB(i, "all", this.randId);
          }
        },0);
      }

      if (this.animate == "onebyone") {
        setTimeout(() => {
          animateOneByOneStartB(0, "onebyone", this.randId);
        },0);
      }
      return `${topOfGraphHTML}${intervalsHTML}${zoomHTML}${intervalGuidesHTML}${graphHTML}${bottomOfGraphHTML}`;
    }

    generateTimeLine() {
      var topOfGraphHTML = "";
      var intervalsHTML = "";
      var zoomHTML = "";
      var intervalGuidesHTML = "";
      var graphHTML = "";
      var bottomOfGraphHTML = "";
      topOfGraphHTML += "<div class='mainGraphContainer' style=width:" + ((80 + this.width) + 4) + "px;>";

      //TITLE
      if(this.title != "") {
        topOfGraphHTML += "<div class='titleContainer'>" + this.title + "</div>";
      }

      // GRAPH KEY
      if(this.hideGraphKey == false) {
        topOfGraphHTML += "<div class='graphKeyContainer' style='width:" + (this.width + 4) + "px;'>" + this.graphKeyTitle + ":";
        topOfGraphHTML += "<div style=width:100%;position;relative;>";
        this.graphKeyValues.map( (value, key) => {
          topOfGraphHTML += "<div class='keySection'><div class='keySquare' onMouseOver=showData("+key+","+this.randId+") onMouseOut=showAllData("+this.randId+") style=background:" + this.barColorSet[key] + "></div><div class='keyText'>" + value + "</div></div>";
        });
        topOfGraphHTML += "</div>";
        topOfGraphHTML +="</div>";
      }

      // INTERVALS
      intervalsHTML += "<div class='yIntervalsContainer' style='height:" + this.height + "px;'>";

      intervalsHTML += "<div class='yLabel' style='width:"+this.height+"px;'>" + this.yLabel + "</div>";

      var bottompx = -11;
      for (let i = 0; i <= this.yIntervals; i ++) {
        intervalsHTML += "<div class='yInterval' style=bottom:" +  (i == 0 ? -6 : bottompx) + "px;>" + parseFloat((i * ((this.maxYValue - this.minYValue) / this.yIntervals)) + this.minYValue).toFixed(2).replace(".00","") + "</div>";
        bottompx += (this.height / this.yIntervals);
      }
      intervalsHTML += "</div>";

      // GRAPH DATA DIV
      zoomHTML += "<div id='graphDataDiv" + this.randId + "' class='graphDataContainer' style='width:" + this.width + "px;height:" + this.height + "px;'>";

      // ZOOM FUNCTIONALITY
      if (!this.disableZoom) {
        zoomHTML += "<div style='display:none;top:0px;left:0px;' id='"+this.randId+"startZoom' class='startZoom'><div style='bottom:0px;top:0px;left:4px;' id='"+this.randId+"rightBounds' class='rightBounds'><div style='bottom:-4px;left:-4px;top:;' id='"+this.randId+"innerLeftSquare' class='leftSquare'></div></div><div style='left:0px;right:0px;top:4px;' id='"+this.randId+"topBounds' class='topBounds'></div></div>";
        zoomHTML += "<div style='display:none;top:0px;left:0px;' id='"+this.randId+"setZoom' class='setZoom'><div style='bottom:0px;top:0px;left:4px;' id='"+this.randId+"leftBounds' class='leftBounds'><div style='top:-4px;right:-4px;bottom:;' id='"+this.randId+"innerRightSquare' class='rightSquare'></div></div><div style='left:0px;right:0px;top:4px;' id='"+this.randId+"bottomBounds' class='bottomBounds'></div></div>";
        zoomHTML += "<div style='top:0px;left:0px;' id='"+this.randId+"topBoundsBox' class='topBoundsBox'></div>";
        zoomHTML += "<div style='bottom:0px;left:0px;' id='"+this.randId+"bottomBoundsBox' class='bottomBoundsBox'></div>";
        zoomHTML += "<div style='top:0px;left:0px;' id='"+this.randId+"leftBoundsBox' class='leftBoundsBox'></div>";
        zoomHTML += "<div style='top:0px;right:0px;' id='"+this.randId+"rightBoundsBox' class='rightBoundsBox'></div>";
        if (this.zoomed) {
          zoomHTML += "<div id='"+this.randId+"zoomOut' class='zoomOut'><div class='zoomOutMagnifyingGlassBG '><div class='zoomOutMagnifyingGlassInnerBG'><div class='zoomOutMagnifyingGlassLine'></div></div></div><div class='zoomOutMagnifyingGlassHandle'></div></div>";
        }
      }

      // INTERVAL GUIDES
      if (this.hideIntervalGuides == false) {
        let bottompx = -2;
          for (let i = 0; i <= this.yIntervals; i ++) {
            if (i > 0 && i != this.yIntervals) {
              intervalGuidesHTML += "<div class='yIntervalGuide' style='bottom:" + bottompx + "px;'></div>";
          }
          bottompx += (this.height / this.yIntervals);
        }
        let leftpx = (this.width / this.xIntervals);
        for (let i = 0; i <= this.xIntervals; i ++) {
          if (i > 0 && i != this.xIntervals) {
            intervalGuidesHTML += "<div class='xIntervalGuide' style='left:" + leftpx + "px;'></div>";
            leftpx += (this.width / this.xIntervals);
          }
        }
      }

      if (this.minYValue < 0) {
          let zeroLineTop = ((0 - this.minYValue) / (this.maxYValue - this.minYValue) * this.height);
          intervalGuidesHTML += "<div class='zeroLineY' style='bottom:"+zeroLineTop+"px;'></div>";
      }
      if (this.minXValue < 0) {
          let zeroLineLeft = ((0 - this.minXValue) / (this.maxXValue - this.minXValue) * this.width);
          intervalGuidesHTML += "<div class='zeroLineX' style='left:" + zeroLineLeft + "px;'></div>";
      }

      // PLOTTING THE POINTS
      var yearSet = new Set();
      var daySet = new Set();
      var monthSet = new Set();
      for (let i = 0; i <= this.xIntervals; i ++) {
        let dateMillis = (i * ((this.maxXValue - this.minXValue) / this.xIntervals)) + this.minXValue;
        let date = new Date(dateMillis);
        let dateString = date.toString();
        let splitDate = dateString.split(" ");
        monthSet.add(splitDate[1]);
        yearSet.add(date.getFullYear());
        daySet.add(date.getDate());
      }

      var uniqueIndex = 0;
      for (let index in this.points) {

        for(let cIndex in this.points[index]) {
          let x = this.points[index][cIndex].x;
          let y = this.points[index][cIndex].y;

          let dateMillis = new Date(x);
          let dateString = dateMillis.toString();
          let splitDate = dateString.split(" ");

          let date = splitDate[1] + " " + splitDate[2]  + ", " + splitDate[3];
          if(daySet.size == 1 && monthSet.size == 1 && yearSet.size == 1) {
            date = "";
          }
          if(dateMillis.getMinutes() == 0 && dateMillis.getHours() == 23){
            date += "11:59 pm";
          } else {
            if(dateMillis.getHours() == 0){
              date += 12;
            }
            if(dateMillis.getHours() > 0 && dateMillis.getHours() < 12){
              date += dateMillis.getHours() + 1;
            }
            if(dateMillis.getHours() >= 12){
              date += dateMillis.getHours() - 11;
            }
            date += ":" + (dateMillis.getMinutes() < 10 ? 0 : "") + dateMillis.getMinutes() + (dateMillis.getHours() < 11 ? " am" : " pm");
          }

          let left = (this.width - (((x - this.minXValue) / (this.maxXValue - this.minXValue)) * this.width));
          let marginTop = (this.height - (((y - this.minYValue) / (this.maxYValue - this.minYValue)) * this.height));

          graphHTML += "<div class='guide"+this.randId+"Line"+uniqueIndex+" guideLineX' onMouseOver=lineOver(" + uniqueIndex + ","+this.randId+") onMouseOut=lineOut(" + uniqueIndex + ","+this.randId+") onClick=showLine(" + uniqueIndex + ","+this.randId+") style='display:none;top:" + (marginTop + 1)  + "px;'></div>";
          graphHTML += "<div class='guide"+this.randId+"Line"+uniqueIndex+" guideLineY' onMouseOver=lineOver(" + uniqueIndex + ","+this.randId+") onMouseOut=lineOut(" + uniqueIndex + ","+this.randId+") onClick=showLine(" + uniqueIndex + ","+this.randId+") style='display:none;left:" + (this.width - left) + "px;'></div>";
          graphHTML += "<div class='guide"+this.randId+"Line"+uniqueIndex+" guideText' style='top:" + (marginTop - 16) + "px;left:" + (this.width - left + 4) + "px;'> " + date  +"</div>";
          graphHTML += "<div class='data data"+this.randId+" d"+this.randId+"data"+index+"' "; if (this.hideValueGuides == false) { graphHTML += "onMouseOver=lineOver(" + uniqueIndex + ","+this.randId+") onMouseOut=lineOut(" + uniqueIndex + ","+this.randId+") onClick=showLine(" + uniqueIndex + ","+this.randId+")";} graphHTML += " style='" + (this.animate && this.connected ? "display:none;visibility:hidden;" : "") +"left:" + (this.width - left - 3) + "px;margin-top:" + (marginTop - 3) + "px;background:" + this.barColorSet[index] + "'>";

            if(this.connected && cIndex < this.points[index].length - 1){
              let angleHeight = (this.height - (((y - this.minYValue) / (this.maxYValue - this.minYValue)) * this.height)) - (this.height - (((this.points[index][parseInt(cIndex) + 1].y - this.minYValue) / (this.maxYValue - this.minYValue)) * this.height));
              let angleWidth = (this.width - (((x - this.minXValue) / (this.maxXValue - this.minXValue)) * this.width)) - (this.width - (((this.points[index][parseInt(cIndex) + 1].x - this.minXValue) / (this.maxXValue - this.minXValue)) * this.width));
              let slopeInRadians = Math.atan(angleHeight / angleWidth);
              let slopeInDegrees =  90 - ((slopeInRadians * 180) / Math.PI);
              let lineLength = Math.sqrt((angleHeight * angleHeight) + (angleWidth * angleWidth));
              graphHTML += "<div class='line l"+this.randId+"line" + index+ " ' style='height:" + (this.animate ? 0 : lineLength) + "px;max-height:" + lineLength + "px;background:" + this.barColorSet[index] + ";transform:rotate("+slopeInDegrees+"deg);'></div>";
            }
          graphHTML += "</div>";
          uniqueIndex++;
        }
        this.maxIndex = parseInt(index) + 1;
      }
      graphHTML += "</div>";

      //LABELS
      bottomOfGraphHTML += "<div class='bottomLabelsContainer'>";
        var left = 80;
        var showTimes = false;
          for (let i = 0; i <= this.xIntervals; i++) {
            let dateMillis = new Date((i * ((this.maxXValue - this.minXValue) / this.xIntervals)) + this.minXValue );
            let dateString = dateMillis.toString();
            let splitDate = dateString.split(" ");
            let date = ( daySet.size > 1 ? splitDate[1] + " " + splitDate[2] : "" ) + ( yearSet.size > 1 ? ", " + splitDate[3] : "");
            if (yearSet.size == 1 && this.xIntervals + 1 > daySet.size) {
              date += (daySet.size > 1 ? ", " : "");
              if(dateMillis.getMinutes() == 0 && dateMillis.getHours() == 23){
                date += "11:59 pm";
              } else {
                if(dateMillis.getHours() == 0){
                  date += 12;
                }
                if(dateMillis.getHours() > 0 && dateMillis.getHours() < 12){
                  date += dateMillis.getHours() + 1;
                }
                if(dateMillis.getHours() >= 12){
                  date += dateMillis.getHours() - 11;
                }
                showTimes = true;
                date += ":" + (dateMillis.getMinutes() < 10 ? 0 : "") + dateMillis.getMinutes() + (dateMillis.getHours() < 11 ? " am" : " pm");
              }
            }

            bottomOfGraphHTML += "<div class='timeLabel' style='left:" + (left - 5) + "px;'>" + date+ "</div>";
            left += (this.width / this.xIntervals);
          }
        if (this.xLabel != "") {
          let labelTop = 92;
          if(!showTimes) {
            labelTop = 46;
          }
          if (!showTimes && yearSet.size > 1){
            labelTop = 76;
          }
          if(daySet.size == 1 && monthSet.size == 1 && yearSet.size == 1) {
            labelTop = 56;
          }
          bottomOfGraphHTML += "<div class='xLabel' style='width:" + this.width+ "px;margin-top:"+labelTop+"px;'>";
          if (this.zoomed && yearSet.size == 1) {
            if(monthSet.size == 1 && yearSet.size == 1) {
              bottomOfGraphHTML += monthSet.values().next().value + " ";
            }
            if(monthSet.size == 1 && yearSet.size == 1 && daySet.size == 1) {
              bottomOfGraphHTML += daySet.values().next().value + ", ";
            }
            if(yearSet.size == 1) {
              bottomOfGraphHTML += yearSet.values().next().value;
            }
          } else {
            bottomOfGraphHTML += this.xLabel;
          }
           bottomOfGraphHTML += "</div>";
        }
      bottomOfGraphHTML += "</div>";
      bottomOfGraphHTML += "</div>";

      if (this.animate == "all") {
        setTimeout( () => {
          let size = 0;
          for(let data in this.data) {
            size++;
          }
          for (let i = 0; i <= size; i++) {
            animateOneByOneStartL(0, i, "all", this.randId);
          }
        },0);
      }

      if (this.animate == "onebyone") {
        setTimeout(() => {
          animateOneByOneStartL(0, 0, "onebyone", this.randId);
        },0);
      }
      return `${topOfGraphHTML}${intervalsHTML}${zoomHTML}${intervalGuidesHTML}${graphHTML}${bottomOfGraphHTML}`;
    }

    generateScatterPlot() {
      var topOfGraphHTML = "";
      var intervalsHTML = "";
      var zoomHTML = "";
      var intervalGuidesHTML = "";
      var graphHTML = "";
      var bottomOfGraphHTML = "";
      topOfGraphHTML += "<div class='mainGraphContainer' style=width:" + ((80 + this.width) + 4) + "px;>";

      //TITLE
      if(this.title != "") {
        topOfGraphHTML += "<div class='titleContainer'>" + this.title + "</div>";
      }

      // GRAPH KEY
      if(this.hideGraphKey == false) {
        topOfGraphHTML += "<div class='graphKeyContainer' style='width:" + (this.width + 4) + "px;'>" + this.graphKeyTitle + ":";
        topOfGraphHTML += "<div style=width:100%;position;relative;>";
        this.graphKeyValues.map( (value, key) => {
          topOfGraphHTML += "<div class='keySection'><div class='keySquare' onMouseOver=showData("+key+","+this.randId+") onMouseOut=showAllData("+this.randId+") style=background:" + this.barColorSet[key] + "></div><div class='keyText'>" + value + "</div></div>";
        });
        topOfGraphHTML += "</div>";
        topOfGraphHTML +="</div>";
      }

      // INTERVALS
      intervalsHTML += "<div class='yIntervalsContainer' style='height:" + this.height + "px;'>";
      intervalsHTML += "<div class='yLabel' style='width:"+this.height+"px;'>" + this.yLabel + "</div>";
      var bottompx = -11;
      for (let i = 0; i <= this.yIntervals; i ++) {
        intervalsHTML += "<div class='yInterval' style=bottom:" +  (i == 0 ? -6 : bottompx) + "px;>" + parseFloat((i * ((this.maxYValue - this.minYValue) / this.yIntervals)) + this.minYValue).toFixed(2).replace(".00","") + "</div>";
        bottompx += (this.height / this.yIntervals);
      }
      intervalsHTML += "</div>";

      // GRAPH DATA DIV
      zoomHTML += "<div id='graphDataDiv" + this.randId + "' class='graphDataContainer' style='width:" + this.width + "px;height:" + this.height + "px;'>";
      // ZOOM FUNCTIONALITY
      if (!this.disableZoom) {
        zoomHTML += "<div style='display:none;top:0px;left:0px;' id='"+this.randId+"startZoom' class='startZoom'><div style='bottom:0px;top:0px;left:4px;' id='"+this.randId+"rightBounds' class='rightBounds'><div style='bottom:-4px;left:-4px;top:;' id='"+this.randId+"innerLeftSquare' class='leftSquare'></div></div><div style='left:0px;right:0px;top:4px;' id='"+this.randId+"topBounds' class='topBounds'></div></div>";
        zoomHTML += "<div style='display:none;top:0px;left:0px;' id='"+this.randId+"setZoom' class='setZoom'><div style='bottom:0px;top:0px;left:4px;' id='"+this.randId+"leftBounds' class='leftBounds'><div style='top:-4px;right:-4px;bottom:;' id='"+this.randId+"innerRightSquare' class='rightSquare'></div></div><div style='left:0px;right:0px;top:4px;' id='"+this.randId+"bottomBounds' class='bottomBounds'></div></div>";
        zoomHTML += "<div style='top:0px;left:0px;' id='"+this.randId+"topBoundsBox' class='topBoundsBox'></div>";
        zoomHTML += "<div style='bottom:0px;left:0px;' id='"+this.randId+"bottomBoundsBox' class='bottomBoundsBox'></div>";
        zoomHTML += "<div style='top:0px;left:0px;' id='"+this.randId+"leftBoundsBox' class='leftBoundsBox'></div>";
        zoomHTML += "<div style='top:0px;right:0px;' id='"+this.randId+"rightBoundsBox' class='rightBoundsBox'></div>";
        if (this.zoomed) {
          zoomHTML += "<div id='"+this.randId+"zoomOut' class='zoomOut'><div class='zoomOutMagnifyingGlassBG '><div class='zoomOutMagnifyingGlassInnerBG'><div class='zoomOutMagnifyingGlassLine'></div></div></div><div class='zoomOutMagnifyingGlassHandle'></div></div>";
        }
      }

      // INTERVAL GUIDES
      if (this.hideIntervalGuides == false) {
        let bottompx = -2;
          for (let i = 0; i <= this.yIntervals; i ++) {
            if (i > 0 && i != this.yIntervals) {
              intervalGuidesHTML += "<div class='yIntervalGuide' style='bottom:" + bottompx + "px;'></div>";
          }
          bottompx += (this.height / this.yIntervals);
        }
        let leftpx = (this.width / this.xIntervals);
        for (let i = 0; i <= this.xIntervals; i ++) {
          if (i > 0 && i != this.xIntervals) {
            intervalGuidesHTML += "<div class='xIntervalGuide' style='left:" + leftpx + "px;'></div>";
            leftpx += (this.width / this.xIntervals);
          }
        }
      }

      if (this.minYValue < 0) {
          let zeroLineTop = ((0 - this.minYValue) / (this.maxYValue - this.minYValue) * this.height);
          intervalGuidesHTML += "<div class='zeroLineY' style='bottom:"+zeroLineTop+"px;'></div>";
      }
      if (this.minXValue < 0) {
          let zeroLineLeft = ((0 - this.minXValue) / (this.maxXValue - this.minXValue) * this.width);
          intervalGuidesHTML += "<div class='zeroLineX' style='left:" + zeroLineLeft + "px;'></div>";
      }

      // PLOTTING THE POINTS
      var uniqueIndex = 0;
      for (let index in this.points) {

        for(let cIndex in this.points[index]) {
          let x = this.points[index][cIndex].x;
          let y = this.points[index][cIndex].y;
          let left = (this.width - (((x - this.minXValue) / (this.maxXValue - this.minXValue)) * this.width));
          let marginTop = (this.height - (((y - this.minYValue) / (this.maxYValue - this.minYValue)) * this.height));

          graphHTML += "<div class='guide"+this.randId+"Line"+uniqueIndex+" guideLineX' onMouseOver=lineOver(" + uniqueIndex + ","+this.randId+") onMouseOut=lineOut(" + uniqueIndex + ","+this.randId+") onClick=showLine(" + uniqueIndex + ","+this.randId+") style='display:none;top:" + (marginTop + 1)  + "px;'></div>";
          graphHTML += "<div class='guide"+this.randId+"Line"+uniqueIndex+" guideLineY' onMouseOver=lineOver(" + uniqueIndex + ","+this.randId+") onMouseOut=lineOut(" + uniqueIndex + ","+this.randId+") onClick=showLine(" + uniqueIndex + ","+this.randId+") style='display:none;left:" + (this.width - left) + "px;'></div>";
          graphHTML += "<div class='guide"+this.randId+"Line"+uniqueIndex+" guideText' style='top:" + (marginTop - 16) + "px;left:" + (this.width - left + 4) + "px;'>(" + x + ", "  + y + ")</div>";
          graphHTML += "<div class='data data"+this.randId+" d"+this.randId+"data"+index+"' "; if (this.hideValueGuides == false) { graphHTML += "onMouseOver=lineOver(" + uniqueIndex + ","+this.randId+") onMouseOut=lineOut(" + uniqueIndex + ","+this.randId+") onClick=showLine(" + uniqueIndex + ","+this.randId+")";} graphHTML += " style='" + (this.animate && this.connected ? "display:none;visibility:hidden;" : "") +"left:" + (this.width - left - 3) + "px;margin-top:" + (marginTop - 3) + "px;background:" + this.barColorSet[index] + "'>";

            if(this.connected && cIndex < this.points[index].length - 1){
              let angleHeight = (this.height - (((y - this.minYValue) / (this.maxYValue - this.minYValue)) * this.height)) - (this.height - (((this.points[index][parseInt(cIndex) + 1].y - this.minYValue) / (this.maxYValue - this.minYValue)) * this.height));
              let angleWidth = (this.width - (((x - this.minXValue) / (this.maxXValue - this.minXValue)) * this.width)) - (this.width - (((this.points[index][parseInt(cIndex) + 1].x - this.minXValue) / (this.maxXValue - this.minXValue)) * this.width));
              let slopeInRadians = Math.atan(angleHeight / angleWidth);
              let slopeInDegrees =  90 - ((slopeInRadians * 180) / Math.PI);
              let lineLength = Math.sqrt((angleHeight * angleHeight) + (angleWidth * angleWidth));
              graphHTML += "<div class='line l"+this.randId+"line" + index+ " ' style='height:" + (this.animate ? 0 : lineLength) + "px;max-height:" + lineLength + "px;background:" + this.barColorSet[index] + ";transform:rotate("+slopeInDegrees+"deg);'></div>";
            }
          graphHTML += "</div>";
          uniqueIndex++;
        }
        this.maxIndex = parseInt(index) + 1;
      }
      if(this.trendLine){
        graphHTML += this.generateTrendLine();
      }
      graphHTML += "</div>";

      //LABELS
      bottomOfGraphHTML += "<div class='bottomLabelsContainer'>";
      var left = 80;
        for (let i = 0; i <= this.xIntervals; i ++) {
          if(i == 0) {
            bottomOfGraphHTML += "<div class='xInterval' style=left:"+ (left - 5) +"px;width:" + (this.width / this.xIntervals) * 2 + "px;>" + parseFloat((i * ((this.maxXValue - this.minXValue) / this.xIntervals)) + this.minXValue).toFixed(2).replace(".00","") + "</div>";
            continue;
          }
          bottomOfGraphHTML += "<div class='xInterval' style=left:"+left+"px;width:" + (this.width / this.xIntervals) * 2 + "px;text-align:center;>" + parseFloat((i * ((this.maxXValue - this.minXValue) / this.xIntervals)) + this.minXValue).toFixed(2).replace(".00","") + "</div>";
          left += (this.width / this.xIntervals);
        }
      if (this.xLabel != "") {
        bottomOfGraphHTML += "<div class='xLabel' style='width:" + this.width+ "px;margin-top:25px;'>" + this.xLabel + "</div>";
      }
      bottomOfGraphHTML += "</div>";
      bottomOfGraphHTML += "</div>";

      if (this.animate == "all") {
        setTimeout( () => {
          let size = 0;
          for(let data in this.data) {
            size++;
          }
          for (let i = 0; i <= size; i++) {
            animateOneByOneStartL(0, i, "all", this.randId);
          }
        },0);
      }

      if (this.animate == "onebyone") {
        setTimeout(() => {
          animateOneByOneStartL(0, 0, "onebyone", this.randId);
        },0);
      }
        return `${topOfGraphHTML}${intervalsHTML}${zoomHTML}${intervalGuidesHTML}${graphHTML}${bottomOfGraphHTML}`;
    }

    generateTrendLine() {
      let trendLine = "";
      let xSum = 0;
      let ySum = 0;

      this.allPoints.forEach( (coords) => {
        xSum += coords.x;
        ySum += coords.y;
      });

      let xAvg = xSum / this.allPoints.length;
      let yAvg = ySum / this.allPoints.length;
      let avgLeft = (this.width - (((xAvg - this.minXValue) / (this.maxXValue - this.minXValue)) * this.width)) - 4;
      let avgMarginTop = (this.height - (((yAvg - this.minYValue) / (this.maxYValue - this.minYValue)) * this.height)) - 4;

      let  minYCoord = (yAvg * this.allPoints[0].x) / xAvg;
      let  maxYCoord = (yAvg * this.allPoints[this.allPoints.length - 1].x) / xAvg;
      if (this.allPoints[0].y > this.allPoints[this.allPoints.length -1 ].y) {
        minYCoord = (yAvg * this.allPoints[this.allPoints.length - 1].x) / xAvg;
        maxYCoord = (yAvg * this.allPoints[0].x) / xAvg;
      }

      let minLeft = (this.width - (((this.allPoints[0].x - this.minXValue) / (this.maxXValue - this.minXValue)) * this.width)) - 4;
      let minMarginTop = (this.height - (((minYCoord - this.minYValue) / (this.maxYValue - this.minYValue)) * this.height)) - 4;

      let maxLeft = (this.width - (((this.allPoints[this.allPoints.length - 1].x - this.minXValue) / (this.maxXValue - this.minXValue)) * this.width)) - 4;
      let maxMarginTop = (this.height - (((maxYCoord - this.minYValue) / (this.maxYValue - this.minYValue)) * this.height)) - 4;

      let angleHeight = (this.height - (((minYCoord - this.minYValue) / (this.maxYValue - this.minYValue)) * this.height)) - (this.height - (((maxYCoord - this.minYValue) / (this.maxYValue - this.minYValue)) * this.height));
      let angleWidth = (this.width - (((this.allPoints[0].x - this.minXValue) / (this.maxXValue - this.minXValue)) * this.width)) - (this.width - (((this.allPoints[this.allPoints.length - 1].x  - this.minXValue) / (this.maxXValue - this.minXValue)) * this.width));
      let slopeInRadians = Math.atan(angleHeight / angleWidth);
      let slopeInDegrees =  90 - ((slopeInRadians * 180) / Math.PI);
      let lineLength = Math.sqrt((angleHeight * angleHeight) + (angleWidth * angleWidth));
      trendLine += "<div class='trendLine l"+this.randId+"line" + this.maxIndex + " d"+this.randId+"data"+this.maxIndex+"' style='height:" + (this.animate == "all" || this.animate == "onebyone" ? 0 : lineLength) + "px;max-height:" + lineLength + "px;bottom:"+ ((this.height - minMarginTop) - 4) + "px;right:" + (minLeft+4) + "px;transform:rotate("+slopeInDegrees+"deg);'></div>";
      return trendLine;
    }

    zoom(x1, x2, y1, y2) {
      let minX = ((x1 / this.width) * (this.maxXValue - this.minXValue)) + this.minXValue;
      let maxX = ((x2 / this.width) * (this.maxXValue - this.minXValue)) + this.minXValue;
      let maxY = (((this.height - y1) / this.height) * (this.maxYValue - this.minYValue)) + this.minYValue;
      let minY = (((this.height - y2) / this.height) * (this.maxYValue - this.minYValue)) + this.minYValue;
      if (this.animate) {
         this.isAnimated = true;
         this.animate = false;
      }
      if (!this.origMaxXValue) {
        this.origMinXValue = this.minXValue;
        this.origMaxXValue = this.maxXValue;
        this.origMinYValue = this.minYValue;
        this.origMaxYValue = this.maxYValue;
      }
      this.minXValue = minX;
      this.maxXValue = maxX;
      this.minYValue = minY;
      this.maxYValue = maxY;
      this.zoomed = true;
      if(this.type == "bubble") {
        this.container.innerHTML = this.generateBubbleChart();
      }
      if(this.type == "timeline") {
        this.container.innerHTML = this.generateTimeLine();
      }
      if(this.type == "scatter") {
        this.container.innerHTML = this.generateScatterPlot();
      }
      document.getElementById("graphDataDiv"+this.randId).addEventListener("mousedown", (e) => { startZoom(e, this.randId) }, false);
      document.getElementById("graphDataDiv"+this.randId).addEventListener("mousemove", (e) => { setZoom(e, this.randId) }, false);
      document.getElementById("graphDataDiv"+this.randId).addEventListener("mouseup", () => { zoom(this, this.randId) }, false);
      document.getElementById(this.randId+"zoomOut").addEventListener("mousedown", () => { zoomOut(this) }, false);
      if (this.isAnimated) {
        this.animate = true;
      }
    }

    zoomOut() {
      if (this.animate) {
         this.isAnimated = true;
         this.animate = false;
      }

      this.minXValue = this.origMinXValue;
      this.maxXValue = this.origMaxXValue ;
      this.minYValue = this.origMinYValue;
      this.maxYValue = this.origMaxYValue;
      this.zoomed = false;
      if(this.type == "bubble") {
        this.container.innerHTML = this.generateBubbleChart();
      }
      if(this.type == "timeline") {
        this.container.innerHTML = this.generateTimeLine();
      }
      if(this.type == "scatter") {
        this.container.innerHTML = this.generateScatterPlot();
      }
      document.getElementById("graphDataDiv"+this.randId).addEventListener("mousedown", (e) => { startZoom(e, this.randId) }, false);
      document.getElementById("graphDataDiv"+this.randId).addEventListener("mousemove", (e) => { setZoom(e, this.randId) }, false);
      document.getElementById("graphDataDiv"+this.randId).addEventListener("mouseup", () => { zoom(this, this.randId) }, false);
      if (this.isAnimated) {
        this.animate = true;
      }
    }

    addData(data) {
      this.isAnimated = false;
      if (this.animate) {
        this.isAnimated = this.animate;
      }
      this.animate = false;
      for (let name in data) {
        this.graphKeyValues.push(name);
        if (data[name].color) {
          this.barColorSet.push(data[name].color);
        } else if (this.barColorSet.length > 0){
          this.barColorSet.push("black");
        }
        for (let i in data[name].values){
          if(!this.values[i]){
            this.values[i] = [];
          }
          this.values[i].push(data[name].values[i]);
        }
      }
      this.barType();
      // SET NEW ANIMATION
      if (this.isAnimated && this.type == "line") {
        let newIndex = this.barColorSet.length - 1;
        let lines = document.querySelectorAll('.line' + newIndex);
        for (let l = 0; l < lines.length; l ++) {
          lines[l].style.height = "0px";
        }
          let height = parseInt(lines[0].style.maxHeight.replace("px",""));
          animateLine(lines[0], 0, height, 0, newIndex);
      }
      if (this.isAnimated && this.type == "bar" && this.orientation == "horizontal") {
        let newIndex = this.barColorSet.length - 1;
        let bars = document.querySelectorAll('.bar' + newIndex);
        for (let b = 0; b < bars.length; b++) {
          let width = parseInt(bars[b].style.width.replace("px",""));
          bars[b].style.width = "0px";
          animateBarH(bars[b], 0, width);
        }
      }
      if (this.isAnimated && this.type == "bar" && this.orientation != "horizontal") {
        let newIndex = this.barColorSet.length - 1;
        let bars = document.querySelectorAll('.bar' + newIndex);
        for (let b = 0; b < bars.length; b++) {
          let height = parseInt(bars[b].style.height.replace("px",""));
          let margin = parseInt(bars[b].style.marginTop.replace("px",""));
          bars[b].style.marginTop = parseInt(height + margin) + "px";
          animateBar(bars[b], height);
        }
      }
    this.animate = this.isAnimated;
    this.isAnimated = false;
    }

    changeGraphSize() {
      this.width = 800;
      this.height = 800;
      this.barType();
    }

    setGraphType(type) {
      if(this.type == "bar") {
        this.type = "line";
      }
      else this.type = "bar";
      this.barType();
    }

}

class Bubble {
  constructor(coords) {
    this.x = coords.x;
    this.y = coords.y;
    this.size = coords.size;
  }
}

class Point {
  constructor(coords) {
    this.x = coords.x;
    this.y = coords.y;
  }
}

var startZoom = (e, randId) => {
  let bounds = document.getElementById("graphDataDiv" + randId).getBoundingClientRect();
  let graphLeft = Math.abs(parseInt(e.clientX  - bounds.left) );
  let graphTop = Math.abs(parseInt(e.clientY - bounds.top) );
  let startZoom = document.getElementById(randId+"startZoom");
  if (graphLeft < 0) {
    graphLeft = 0;
  }
  if (graphTop < 0) {
    graphTop = 0;
  }
  startZoom.style.left = graphLeft + "px";
  startZoom.style.top =  graphTop + "px";
  startZoom.style.display = "block";

  document.getElementById(randId+"leftBounds").style.height = "0px";
  document.getElementById(randId+"rightBounds").style.height = "0px";
  document.getElementById(randId+"topBounds").style.width = "0px";
  document.getElementById(randId+"bottomBounds").style.width = "0px";

}

var setZoom = (e, randId) => {
  if(document.getElementById(randId+"startZoom").style.display == "block") {
    let graph = document.getElementById("graphDataDiv" + randId);
    let bounds = graph.getBoundingClientRect();
    let graphLeft = Math.abs(parseInt(e.clientX  - bounds.left) );
    let graphTop = Math.abs(parseInt(e.clientY - bounds.top) );
    let graphHeight = graph.style.height.replace("px","");
    let graphWidth = graph.style.width.replace("px","");
    let setZoom = document.getElementById(randId+"setZoom");
    if (graphLeft < 0) {
      graphLeft = 0;
    }
    if (graphTop < 0) {
      graphTop = 0;
    }
    setZoom.style.left = graphLeft + "px";
    setZoom.style.top =  graphTop + "px";
    setZoom.style.display = "block";

    let startZoom = document.getElementById(randId+"startZoom");
    let leftBounds = document.getElementById(randId+"leftBounds");
    let rightBounds = document.getElementById(randId+"rightBounds");
    let topBounds = document.getElementById(randId+"topBounds");
    let bottomBounds = document.getElementById(randId+"bottomBounds");
    let startTop = startZoom.style.top.replace("px","");
    let setTop = setZoom.style.top.replace("px","");
    let startLeft= startZoom.style.left.replace("px","");
    let setLeft = setZoom.style.left.replace("px","");
    document.getElementById(randId+"topBoundsBox").style.height = Math.min(startTop, setTop) + 4 + "px";
    document.getElementById(randId+"bottomBoundsBox").style.height = Math.min(graphHeight - startTop, graphHeight - setTop) - 4 + "px";
    document.getElementById(randId+"leftBoundsBox").style.width = Math.min(startLeft, setLeft) + 4 + "px";
    document.getElementById(randId+"rightBoundsBox").style.width = Math.min(graphWidth - startLeft, graphWidth - setLeft) - 4 + "px";
    document.getElementById(randId+"leftBoundsBox").style.top = document.getElementById(randId+"topBoundsBox").style.height;
    document.getElementById(randId+"rightBoundsBox").style.top = document.getElementById(randId+"topBoundsBox").style.height;
    leftBounds.style.height = Math.abs(parseInt(startTop - setTop)) + 6 + "px";
    document.getElementById(randId+"leftBoundsBox").style.height = Math.abs(parseInt(startTop - setTop)) + "px";
    document.getElementById(randId+"rightBoundsBox").style.height = Math.abs(parseInt(startTop - setTop)) + "px";
    if(parseInt(startTop - setTop) < 0) {
      leftBounds.style.top = "";
      leftBounds.style.bottom = "0px";
      document.getElementById(randId+"innerLeftSquare").style.top = "";
      document.getElementById(randId+"innerLeftSquare").style.bottom = "-4px";
    } else {
      leftBounds.style.top = "0px";
      leftBounds.style.bottom = "";
      document.getElementById(randId+"innerLeftSquare").style.top = "-4px";
      document.getElementById(randId+"innerLeftSquare").style.bottom = "";
    }
    rightBounds.style.height = Math.abs(parseInt(startTop - setTop)) + 6 + "px";
    if(parseInt(startTop - setTop) < 0) {
      rightBounds.style.top = "0px";
      rightBounds.style.bottom = "";
      document.getElementById(randId+"innerRightSquare").style.top = "-4px";
      document.getElementById(randId+"innerRightSquare").style.bottom = "0px";
    } else {
      rightBounds.style.top = "";
      rightBounds.style.bottom = "0px";
      document.getElementById(randId+"innerRightSquare").style.top = "";
      document.getElementById(randId+"innerRightSquare").style.bottom = "-4px";
    }
    topBounds.style.width = Math.abs(parseInt(startLeft - setLeft)) + 1 + "px";
    if(parseInt(startLeft - setLeft) < 0) {
      topBounds.style.left = "0px";
      topBounds.style.right= "";
    } else {
      topBounds.style.left = "";
      topBounds.style.right = "0px";
    }
    bottomBounds.style.width = Math.abs(parseInt(startLeft - setLeft)) + "px";
    if(parseInt(startLeft - setLeft) < 0) {
      bottomBounds.style.left = "";
      bottomBounds.style.right= "0px";
    } else {
      bottomBounds.style.left = "0px";
      bottomBounds.style.right = "";
    }

  }
}

var zoom = (obj,randId)  => {
  let data = document.querySelectorAll(".data" + randId);
  if(document.getElementById(randId+"setZoom").style.display == "block" && data[data.length-1].style.visibility!= "hidden") {
    let xValues = [];
    let yValues = [];
    xValues.push(document.getElementById(randId+"startZoom").style.left.replace("px",""));
    xValues.push(document.getElementById(randId+"setZoom").style.left.replace("px",""));
    yValues.push(document.getElementById(randId+"startZoom").style.top.replace("px",""));
    yValues.push(document.getElementById(randId+"setZoom").style.top.replace("px",""));
    xValues.sort(function(a,b) { return a - b });
    yValues.sort(function(a,b) { return a - b });
    obj.zoom(xValues[0],xValues[1],yValues[0],yValues[1]);
  }
  document.getElementById(randId+"setZoom").style.display = "none";
  document.getElementById(randId+"startZoom").style.display = "none";
  document.getElementById(randId+"topBoundsBox").style.height = "0px";
  document.getElementById(randId+"bottomBoundsBox").style.height = "0px";
  document.getElementById(randId+"leftBoundsBox").style.width = "0px";
  document.getElementById(randId+"rightBoundsBox").style.width = "0px";
}

function zoomOut(obj){
  obj.zoomOut();
}

var animateOneByOneStartB = (i,  type, randId) => {
  var bubble = document.querySelectorAll('.data'+randId)[i];
  if (bubble) {
    let currentTop = bubble.style.marginTop.replace("px","");
    let currentRight = bubble.style.right.replace("px","");
    let height = parseInt(bubble.style.maxHeight.replace("px",""));
    animateBubble(bubble, 0, height, currentTop, currentRight, i, type, null, randId);
  } else if (document.querySelector('.data'+randId)[i + 1] && type != "all") {
      animateOneByOneStartB(i + 1, type, randId);
  }
}

var animateBubble = (bubble, currentHeight, targetHeight, currentTop, currentRight, i, type, targetValue, randId) => {
  if (currentHeight >= targetHeight) {
    if (type != 'all') {
      animateOneByOneStartB(i + 1,  type, randId);
    }
    return;
  }
  bubble.style.display = "block";
  bubble.style.visibility = "visible";
  bubble.style.marginTop = currentTop - ((currentHeight + (targetHeight/500) * 5)/2) + "px";
  bubble.style.right = currentRight - ((currentHeight + (targetHeight/500) * 5)/2) + "px";
  bubble.style.height = (currentHeight + (targetHeight/500) * 5) + "px";
  bubble.style.width = (currentHeight + (targetHeight/500) * 5) + "px";

  if(!targetValue || targetValue == undefined){
    var targetValue = bubble.childNodes[0].innerHTML;
  }
  bubble.childNodes[0].innerHTML = Math.ceil((currentHeight / targetHeight) * targetValue);

  setTimeout(function(){
    animateBubble(bubble, currentHeight + (targetHeight/500 * 5), targetHeight, currentTop, currentRight, i, type, targetValue, randId);
  },1);
}

var animateOneByOne = (randId) => {
  var bars = document.querySelectorAll('.bar' + randId);
  for (let i = 0; i < bars.length; i++){
    var height = parseInt(bars[i].style.height.replace("px",""));
    var margin = parseInt(bars[i].style.marginTop.replace("px",""));
    bars[i].style.marginTop = parseInt(height + margin) + "px";
  }
  animateOneByOneStart(0, randId);
}

var animateOneByOneStart = (i, randId) => {
  let bar = document.querySelectorAll('.bar' + randId)[i];
  if (bar) {
    let height = parseInt(bar.style.height.replace("px",""));
    bar.style.display = "block";
    if(height == 0) {
      animateOneByOneStart(i+1, randId);
      return;
    }
    animateBar(bar, height, i, null, null, randId);
  }
}

var animateAll = (randId) => {
  let bars = document.querySelectorAll('.bar' + randId);
  for (let i = 0; i < bars.length; i++) {
    let height = parseInt(bars[i].style.height.replace("px",""));
    let margin = parseInt(bars[i].style.marginTop.replace("px",""));
    if(height > 0) {
      bars[i].style.marginTop = parseInt(height + margin) + "px";
      bars[i].style.display = "block";
      animateBar(bars[i], height);
    } else {
      bars[i].style.marginTop = margin + "px";
      bars[i].style.display = "block";
    }
  }
}


var animateBar = (el, height, i, targetValue, targetHeight, randId) => {
  if (height == 1) {
      el.style.marginTop == "1px";
      if (i != undefined) {
        animateOneByOneStart(i+1, randId);
      }
    return;
  }
  if(!targetValue || targetValue == undefined){
    var targetValue = parseInt(el.childNodes[0].innerHTML);
    var targetHeight = height;
  }
  el.childNodes[0].innerHTML = Math.floor(((targetHeight - height) / targetHeight) * targetValue) + (targetValue < 0 ? -1 : 1 );
  let margin = parseInt(el.style.marginTop.replace("px",""));
  el.style.marginTop = parseInt(margin - 1) + "px";
  setTimeout( () =>{
    animateBar(el, height - 1, i, targetValue, targetHeight, randId);
  },2);
}

var animateOneByOneH = (randId) => {
  var bars = document.querySelectorAll('.bar'+randId);
  for (let i = 0; i < bars.length; i++){
    var width = parseInt(bars[i].style.width.replace("px",""));
    bars[i].style.width = "0px";
  }
  animateOneByOneStartH(0, randId);
}

var animateOneByOneStartH = (i, randId) => {
  var bar = document.querySelectorAll('.bar' + randId)[i];
  if (bar) {
    var width = parseInt(bar.style.maxWidth.replace("px",""));
    bar.style.display = "block";
    animateBarH(bar, 0, width, i, null, randId);
  }
}

var animateAllH = (randId) => {
  var bars = document.querySelectorAll('.bar'+randId);
  for (let i = 0; i < bars.length; i++) {
    var width = parseInt(bars[i].style.width.replace("px",""));
    bars[i].style.width = "0px";
    bars[i].style.display = "block";
    animateBarH(bars[i], 0, width, null, null, randId);
  }
}


var animateBarH = (el, currentWidth, targetWidth, i, targetValue, randId) => {
  if (currentWidth >= targetWidth + 1) {
      if (i != undefined) {
        animateOneByOneStartH(i+1, randId);
      }
    return;
  }
  if(!targetValue || targetValue == undefined){
    var targetValue = el.childNodes[0].innerHTML;
  }
  el.childNodes[0].innerHTML = Math.floor((currentWidth/targetWidth) * targetValue);
  el.style.width = currentWidth + "px";
  setTimeout( () => {
    animateBarH(el, currentWidth + 1, targetWidth, i, targetValue, randId);
  },2);
}

var animateOneByOneL = (lineIndex, randId) => {
  animateOneByOneStartL(0, lineIndex, "onebyone", randId);
}
var animateOneByOneStartL = (i, lineIndex, type, randId) => {
  let line = document.querySelectorAll('.l'+randId+'line' + lineIndex)[i];
  let height = line ? parseInt(line.style.maxHeight.replace("px","")) : false;
  if (line && height) {
    animateLine(line, 0, height, i, lineIndex, type, randId);
  } else {
    document.querySelectorAll(".d"+randId+"data" + lineIndex)[i].style.display = "block";
    document.querySelectorAll(".d"+randId+"data" + lineIndex)[i].style.visibility = "visible";
    if(type != "all") {
      animateOneByOneStartL(0, lineIndex + 1, "onebyone", randId);
    }
  }
}

var animateLine = (line, currentHeight, targetHeight, i, lineIndex, type, randId) => {
  if (currentHeight >= targetHeight) {
    if (i != undefined) {
      animateOneByOneStartL(i + 1, lineIndex, type, randId);
    }
    return;
  }
  document.querySelectorAll(".d"+randId+"data" + lineIndex)[i].style.display = "block";
  document.querySelectorAll(".d"+randId+"data" + lineIndex)[i].style.visibility = "visible";
  line.style.height = (currentHeight + (targetHeight/500) * 5) + "px";
  setTimeout(function() {
    animateLine(line, currentHeight + (targetHeight/500 * 5), targetHeight, i, lineIndex, type, randId);
  },1);
}

var animatePieChart = (index, degrees, target, rotation, randId) => {
  if (degrees > target) {
    if(index == 1){
      animatePieChart(0, 180 , 360, 180, randId);
    } else {
      document.querySelector('.pie'+randId).removeChild(document.querySelector('.pie'+randId).childNodes[0]);
      document.querySelector('.pie'+randId).removeChild(document.querySelector('.pie'+randId).childNodes[0]);
    }
    return;
  }
  document.querySelectorAll(".animateSegment"+randId)[index].setAttribute("style","z-index:10;--degrees:" + degrees + "; --rotation: " + rotation + "; --bg:white;");
  setTimeout(function(){
    animatePieChart(index, degrees + 1.5, target, rotation, randId)
  },0);
}

var showLine = (i,randId) =>  {
  document.querySelectorAll(".guide"+randId+"Line"+i).forEach( el => {
    if(el.style.display == "none") {
      el.style.display = "block";
    } else {
      el.style.display = "none";
    }
  });
}
var lineOver = (i,randId) => {
  document.querySelectorAll(".guide"+randId+"Line"+i).forEach( el => {
    el.style.display="block";
  });
}
var lineOut = (i,randId) => {
  document.querySelectorAll(".guide"+randId+"Line"+i).forEach( el => {
    el.style.display="none";
  });
}

var showData = (i, randId, t) => {
  let data = document.querySelectorAll(".data"+randId);
  if (data[data.length-1].style.visibility=="hidden") {
    return;
  }
  data.forEach( el => {
    if (t != 'bar') el.style.display = "none"; else el.style.visibility = "hidden";
  });
  data = document.querySelectorAll(".d"+randId+"data" + i);
  data.forEach( el => {
    if (t != 'bar') el.style.display = "block"; else el.style.visibility = "visible";
  });
}

var showAllData = (randId, t) => {
  let data = document.querySelectorAll(".data"+randId);
  if (data[data.length-1].style.visibility=="hidden" && t != 'bar') {
    return;
  }
  data.forEach( el => {
    if (t != 'bar') el.style.display = "block"; else el.style.visibility = "visible";
  });
}
