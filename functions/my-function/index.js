import {
  getPossibleStartPositions,
  removeRowsUsedByElement,
  getSections,
  getIntersectionOffset,
  getRowsFromElements,
  getRandomSubsetSections,
  choice,
  flipCoin,
  randInt,
} from "./utils.js";

import fontRegular from "./assets/PPObjectSans-Regular.otf";
import fontHeavy from "./assets/PPObjectSans-Heavy.otf";
import fontHeavySlanted from "./assets/PPObjectSans-HeavySlanted.otf";
import { prominent } from 'color.js';
export const handler = ({ inputs, mechanic, sketch }) => {

  const { width, height, dates, url, image, color, x, y } =
    inputs;
  let titleText = "";
  let descriptionText = "";
  const datesText = dates.toUpperCase();
  const urlText = url.split('https://it.wikipedia.org/wiki/')[1];
  let prominentColor = "";
  let artistElement;
  let datesElement;
  let titleElement;

  let t = 5;

  const rows = 42;
  const separation = height / rows;
  const availableRows = Array.from({ length: rows }, (_, k) => k);

  let img;
  let imgGraphic;
  let objSansRegular;
  let objSansHeavy;
  let objSansHeavySlanted;

  const loadImageAndAddFilter = () => {
    imgGraphic = sketch.createGraphics(img.width, img.height);
    imgGraphic.image(img, 0, 0);
/*     imgGraphic.filter(imgGraphic.GRAY);
    imgGraphic.blendMode(imgGraphic.MULTIPLY);
    imgGraphic.noStroke();
    imgGraphic.fill(color);
    imgGraphic.rect(0, 0, img.width, img.height);
    imgGraphic.blendMode(imgGraphic.BLEND); */
  };

  const drawGrid = () => {
    sketch.strokeWeight(width / (6 * 500));
    for (let i = 0; i <= 32; i++) {
      sketch.line(0, separation * i, width, separation * i);
    }
    sketch.strokeWeight(1);
  };

  const setStylingBase = () => {
    sketch.background("white");
    sketch.stroke(color);
    sketch.fill(color);
    sketch.textFont(objSansRegular);
  };

  const drawArtistElement = () => {
    const element = {};
    element.baseRowSize = randInt(2, 3);
    element.baseSize = element.baseRowSize * separation;

    sketch.fill(prominentColor);
    
    const words = descriptionText.split(" ");
    sketch.textSize(element.baseSize * 0.5);
    sketch.textFont(objSansHeavySlanted);
    const lengths = words.map((t) => sketch.textWidth(t));
    element.length = Math.max(width / 3, ...lengths) + width / 20;

    element.startRow = choice(
      getPossibleStartPositions(
        availableRows,
        element.baseRowSize * words.length + 1
      )
    );
    element.endRow =
      element.startRow + words.length * (element.baseRowSize - 1);
    element.y = element.startRow * separation;
    element.x1 = 0;
    element.x2 = element.length + element.x1;

    let x = element.x1;
    while (x < width) {
      for (let i = 0; i < words.length; i++) {
        sketch.text(
          words[i],
          x,
          element.y + (i + 1) * (element.baseSize - separation)
        );
      }
      x += element.length;
    }

    return element;
  };

  const drawTitleElement = () => {
    const element = {};
    element.baseRowSize = 3;
    element.baseSize = element.baseRowSize * separation;
    sketch.fill(prominentColor);

    sketch.textSize(element.baseSize);
    sketch.textStyle(sketch.NORMAL);
    element.length = sketch.textWidth(titleText) + width / 20;

    element.startRow = choice(
      getPossibleStartPositions(availableRows, element.baseRowSize + 1)
    );
    element.endRow = element.startRow + element.baseRowSize;
    element.y = element.startRow * separation;
    element.x1 = 0;
    element.x2 = element.x1 + element.length;

    sketch.text(titleText, 0, element.y + element.baseSize);

    return element;
  };

  const drawDatesElement = () => {
    const element = {};
    element.isSingleRow = flipCoin();
    element.baseRowSize = 1;
    element.baseSize = element.baseRowSize * separation;

    sketch.textSize(element.baseSize * 0.8);
    sketch.textFont(objSansHeavy);
    const minLength =
      (element.isSingleRow
        ? sketch.textWidth(datesText) +
          width / 20 +
          sketch.textWidth(urlText)
        : Math.max(
            sketch.textWidth(datesText),
            sketch.textWidth(urlText)
          )) +
      width / 20;

    if (minLength + titleElement.length >= width) {
      const rowsWithoutDescription = [...availableRows];
      removeRowsUsedByElement(rowsWithoutDescription, titleElement);
      element.startRow = choice(
        getPossibleStartPositions(
          rowsWithoutDescription,
          (element.isSingleRow ? 1 : 2) * element.baseRowSize + 1
        )
      );
    } else {
      element.startRow = choice(
        getPossibleStartPositions(
          availableRows,
          (element.isSingleRow ? 1 : 2) * element.baseRowSize + 1
        )
      );
    }
    element.endRow =
      element.startRow + (element.isSingleRow ? 1 : 2) * element.baseRowSize;
    element.y = element.startRow * separation;
    const offset = getIntersectionOffset(element, [titleElement]);
    const leftWidth = width - offset;
    element.midDistance = randInt(
      Math.floor(leftWidth / 20),
      Math.floor(leftWidth / 4)
    );
    element.length =
      (element.isSingleRow
        ? Math.max(
            leftWidth / 2,
            sketch.textWidth(datesText) +
              element.midDistance +
              sketch.textWidth(urlText)
          )
        : Math.max(
            leftWidth / 4,
            Math.max(
              sketch.textWidth(datesText),
              sketch.textWidth(urlText)
            )
          )) +
      leftWidth / 20;
    element.x1 =
      offset +
      (flipCoin() ? 0 : randInt(0, Math.floor(leftWidth - element.length)));
    element.x2 = element.x1 + element.length;

    const [first, second] = flipCoin()
      ? [datesText, urlText]
      : [urlText, datesText];

    if (element.isSingleRow) {
      sketch.text(first, element.x1, element.y + element.baseSize);
      sketch.text(
        second,
        element.x1 + sketch.textWidth(first) + element.midDistance,
        element.y + element.baseSize
      );
    } else {
      const alignDateRight = flipCoin();
      if (alignDateRight) {
        sketch.textAlign(sketch.RIGHT);
      }
      sketch.text(
        first,
        alignDateRight ? element.x2 - leftWidth / 20 : element.x1,
        element.y + element.baseSize
      );
      sketch.text(
        second,
        alignDateRight ? element.x2 - leftWidth / 20 : element.x1,
        element.y + 2 * element.baseSize
      );
      if (alignDateRight) {
        sketch.textAlign(sketch.LEFT);
      }
    }

    return element;
  };
  const drawBackground = () => {
    sketch.background(y / 2, 100, 100);
  
    sketch.fill(360 - y / 2, 100, 100);
    sketch.rect(360, 360, x + 1, x + 1);
  }
  const drawRectangle = ({ rx, ry, rw, rh }) => {
    if (img) {
      const rectRatio = rw / rh;
      const imageRatio = imgGraphic.width / imgGraphic.height;
      const sw =
        rectRatio > imageRatio
          ? imgGraphic.width
          : imgGraphic.height * rectRatio;
      const sh =
        rectRatio > imageRatio
          ? imgGraphic.width / rectRatio
          : imgGraphic.height;
      const sx = (imgGraphic.width - sw) / 2;
      const sy = (imgGraphic.height - sh) / 2;
      sketch.image(imgGraphic, rx, ry, rw, rh, sx, sy, sw, sh);
    } else {
      sketch.rect(rx, ry, rw, rh);
    }
  };

  const drawRectangles = () => {
    const maxUsedSpace = Math.max(
      artistElement.x2,
      titleElement.x2,
      datesElement.x2
    );
    const canThereBeTwoColumns = width - maxUsedSpace > width / 4 + width / 20;
    const columnLength = width / 4;
    let bigColumnDrawn = false;
    if (canThereBeTwoColumns && flipCoin()) {
      bigColumnDrawn = true;
    }

    const elementRows = getRowsFromElements([titleElement, datesElement]);
    const usedSections = getSections(elementRows, 3);
    const freeSections = getSections(availableRows, 3);
    const sections = [
      ...getRandomSubsetSections(
        freeSections,
        freeSections.length > 2
          ? randInt(freeSections.length - 2, freeSections.length)
          : freeSections.length
      ),
      ...getRandomSubsetSections(usedSections, randInt(0, usedSections.length)),
    ];

    for (const section of sections) {
      const [row, rowLength] = section;
      const rectRowHeight = rowLength;
      const separateInColumns = bigColumnDrawn || flipCoin();
      const offset = getIntersectionOffset(
        {
          startRow: row,
          endRow: row + rowLength - 1,
        },
        [titleElement, datesElement]
      );
      const leftWidth = width - offset;
      const rectY = row * separation;
      const rectHeight = rectRowHeight * separation;
      if (separateInColumns) {
        drawRectangle({
          rx: offset,
          ry: rectY,
          rw: leftWidth - (columnLength + width / 20),
          rh: rectHeight,
        });
        drawRectangle({
          rx: width - columnLength,
          ry: rectY,
          rw: columnLength,
          rh: rectHeight,
        });
      } else {
        drawRectangle({
          rx: offset,
          ry: rectY,
          rw: leftWidth,
          rh: rectHeight,
        });
      }
    }

    if (bigColumnDrawn) {
      drawRectangle({
        rx: width - columnLength,
        ry: 0,
        rw: width - columnLength,
        rh: height,
      });
    }
  };

  sketch.preload = () => {

    fetch('https://it.wikipedia.org/api/rest_v1/page/summary/'+urlText)
    .then(function(response){
      var content = response.json()
      return content;
    })
    .then(function(content){
      console.log(content)
        titleText = content.title;
        descriptionText = content.description;
        return content;
    })
    .then((content)=>{
      if (content.originalimage) {
        sketch.loadImage(content.originalimage.source,(data)=>{
          img = data;
          

prominent(content.originalimage.source, { amount: 1, format: 'hex' }).then(color => {
  prominentColor = color
})

          loadImageAndAddFilter();
        });
      }
    })
    
    
    objSansRegular = sketch.loadFont(fontRegular);
    objSansHeavy = sketch.loadFont(fontHeavy);
    objSansHeavySlanted = sketch.loadFont(fontHeavySlanted);
  };
  
  sketch.setup = () => {
    
    sketch.createCanvas(width, height);
    
    sketch.noCursor();
  
    sketch.colorMode(sketch.HSB,10,100);
    sketch.rectMode(sketch.CENTER);
    sketch.noStroke();
  };

  // function to change initial x co-ordinate of the line
function x1(t){
  return Math.sin(t/10)*125+Math.sin(t/20)*125+Math.sin(t/30)*125;
}

// function to change initial y co-ordinate of the line
function y1(t){
  return Math.cos(t/10)*125+Math.cos(t/20)*125+Math.cos(t/30)*125;
}

// function to change final x co-ordinate of the line
function x2(t){
  return Math.sin(t/15)*125+Math.sin(t/25)*125+Math.sin(t/35)*125;
}

// function to change final y co-ordinate of the line
function y2(t){
  return Math.cos(t/15)*125+Math.cos(t/25)*125+Math.cos(t/35)*125;
}

  sketch.draw = () => {

    
    if(titleText != "" && descriptionText != "" ){
      //sketch.background(prominentColor);
      drawBackground();
      
  
/*       setStylingBase();

      drawGrid(); */

      artistElement = drawArtistElement();

      removeRowsUsedByElement(availableRows, artistElement);

      titleElement = drawTitleElement();
      datesElement = drawDatesElement();

      removeRowsUsedByElement(availableRows, titleElement);
      removeRowsUsedByElement(availableRows, datesElement);
      drawRectangles();

      
      t+=0.15;
      
      
      mechanic.done();
    }
    
  };
};

export const inputs = {
  dates: {
    type: "text",
    default: "",
  },
  url: {
    type: "text",
    default: "",
  },
  image: {
    type: "image",
  },
  color: {
    type: "color",
    default: "#E94225",
    model: "hex",
  },
  width: {
    type: "number",
    default: 500,
    editable: false,
  },
  height: {
    type: "number",
    default: 600,
    editable: false,
  },
  x: {
    type: "number", 
    min: 0, 
    max: 500, 
    step: 5, 
    slider: true, 
    default: 400 
  },
  y: {
    type: "number", 
    min: 0, 
    max: 500, 
    step: 5, 
    slider: true, 
    default: 400 
  },

};

export const presets = {
  x2: {
    width: 1000,
    height: 1200,
  },
  x4: {
    width: 1500,
    height: 1800,
  },
};

export const settings = {
  engine: require("@mechanic-design/engine-p5"),
};
