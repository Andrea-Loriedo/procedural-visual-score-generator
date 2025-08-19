// sketch.js
// Procedural Visual Score Generator in p5.js

let generateButton, saveButton, mode3DButton, complexitySlider, complexityLabel;
let use3D = localStorage.getItem('use3D') === 'true';
let complexity = 0.5;

function setup() {
  let w = min(windowWidth * 0.95, 900);
  let h = min(windowHeight * 0.6, 700);
  let cnv;
  if (use3D) {
    cnv = createCanvas(w, h, WEBGL);
  } else {
    cnv = createCanvas(w, h);
  }
  cnv.parent('score-container');
  noLoop();

  // Complexity slider and label
  complexityLabel = createSpan('Complexity: ');
  complexityLabel.parent('button-row');
  complexitySlider = createSlider(0, 1, 0.5, 0.01);
  complexitySlider.parent('button-row');
  complexitySlider.input(() => {
    complexity = complexitySlider.value();
    redraw();
  });

  generateButton = createButton('🎲 Generate Score');
  generateButton.parent('button-row');
  generateButton.mousePressed(redraw);

  saveButton = createButton('💾 Save Score');
  saveButton.parent('button-row');
  saveButton.mousePressed(() => saveCanvas('visual_score', 'png'));

  mode3DButton = createButton('🌀 3D Mode: ' + (use3D ? 'ON' : 'OFF'));
  mode3DButton.parent('button-row');
  mode3DButton.mousePressed(toggle3DMode);
}

function toggle3DMode() {
  use3D = !use3D;
  localStorage.setItem('use3D', use3D);
  location.reload();
}

function draw() {
  if (use3D) {
    draw3DScore();
  } else {
    draw2DScore();
  }
}

function draw3DScore() {
  background(255);
  orbitControl();

  // Use complexity to control number of shapes/lines
  let numShapes = int(lerp(3, 20, complexity));
  for (let i = 0; i < numShapes; i++) {
    let x = random(-width / 2, width / 2);
    let y = random(-height / 2 + 80, height / 2 - 50);
    let z = random(-200, 200);
    let s = random(30, 120);

    colorMode(HSB, 360, 100, 100, 255);
    let hue = (i * 360 / numShapes + random(-30, 30)) % 360;
    let sat = random(60, 100);
    let bri = random(70, 100);
    let alpha = random(140, 200);
    let c = color(hue, sat, bri, alpha);
    fill(c);
    noStroke();

    let shapeType = int(random(3));
    push();
    translate(x, y, z);
    if (shapeType === 0) sphere(s / 2);
    else if (shapeType === 1) box(s);
    else {
      beginShape();
      vertex(0, 0, 0);
      vertex(s, 0, 0);
      vertex(s / 2, -s, 0);
      endShape(CLOSE);
    }
    pop();
  }

  let numLines = int(lerp(2, 12, complexity));
  for (let j = 0; j < numLines; j++) {
    colorMode(HSB, 360, 100, 100, 255);
    let hue = (j * 360 / numLines + random(-20, 20)) % 360;
    let sat = random(70, 100);
    let bri = random(60, 100);
    let alpha = random(120, 220);
    stroke(color(hue, sat, bri, alpha));
    strokeWeight(2);

    let lineType = int(random(3));
    let x1 = random(-width / 2, width / 2);
    let y1 = random(-height / 2 + 80, height / 2);
    let z1 = random(-200, 200);
    let x2 = random(-width / 2, width / 2);
    let y2 = random(-height / 2 + 80, height / 2);
    let z2 = random(-200, 200);

    if (lineType === 0) {
      line(x1, y1, z1, x2, y2, z2);
    } else if (lineType === 1) {
      noFill();
      beginShape();
      vertex(x1, y1, z1);
      let cx1 = lerp(x1, x2, 0.33) + random(-50, 50);
      let cy1 = lerp(y1, y2, 0.33) + random(-50, 50);
      let cz1 = lerp(z1, z2, 0.33) + random(-50, 50);
      let cx2 = lerp(x1, x2, 0.66) + random(-50, 50);
      let cy2 = lerp(y1, y2, 0.66) + random(-50, 50);
      let cz2 = lerp(z1, z2, 0.66) + random(-50, 50);
      bezierVertex(cx1, cy1, cz1, cx2, cy2, cz2, x2, y2, z2);
      endShape();
    } else {
      let steps = int(random(3, 7));
      let prevX = x1, prevY = y1, prevZ = z1;
      for (let k = 1; k <= steps; k++) {
        let t = k / steps;
        let nx = lerp(x1, x2, t) + random(-20, 20);
        let ny = lerp(y1, y2, t) + random(-20, 20);
        let nz = lerp(z1, z2, t) + random(-20, 20);
        line(prevX, prevY, prevZ, nx, ny, nz);
        prevX = nx; prevY = ny; prevZ = nz;
      }
    }
  }
  colorMode(RGB, 255);
}

function draw2DScore() {
  background(255);

  let numShapes = int(lerp(3, 20, complexity));
  for (let i = 0; i < numShapes; i++) {
    colorMode(HSB, 360, 100, 100, 255);
    let x = random(width);
    let y = random(80, height - 50);
    let s = random(30, 120);
    let hue = (i * 360 / numShapes + random(-30, 30)) % 360;
    let sat = random(60, 100);
    let bri = random(70, 100);
    let alpha = random(140, 200);
    let c = color(hue, sat, bri, alpha);
    fill(c);
    noStroke();

    let shapeType = int(random(3));
    if (shapeType === 0) ellipse(x, y, s);
    else if (shapeType === 1) rect(x, y, s, s);
    else triangle(x, y, x + s, y, x + s / 2, y - s);
  }

  let numLines = int(lerp(2, 12, complexity));
  for (let j = 0; j < numLines; j++) {
    colorMode(HSB, 360, 100, 100, 255);
    let hue = (j * 360 / numLines + random(-20, 20)) % 360;
    let sat = random(70, 100);
    let bri = random(60, 100);
    let alpha = random(120, 220);
    stroke(color(hue, sat, bri, alpha));
    strokeWeight(2);

    let lineType = int(random(3));
    let x1 = random(width);
    let y1 = random(80, height);
    let x2 = random(width);
    let y2 = random(80, height);

    if (lineType === 0) {
      line(x1, y1, x2, y2);
    } else if (lineType === 1) {
      noFill();
      let cx1 = lerp(x1, x2, 0.33) + random(-50, 50);
      let cy1 = lerp(y1, y2, 0.33) + random(-50, 50);
      let cx2 = lerp(x1, x2, 0.66) + random(-50, 50);
      let cy2 = lerp(y1, y2, 0.66) + random(-50, 50);
      bezier(x1, y1, cx1, cy1, cx2, cy2, x2, y2);
    } else {
      let steps = int(random(3, 7));
      let prevX = x1, prevY = y1;
      for (let k = 1; k <= steps; k++) {
        let t = k / steps;
        let nx = lerp(x1, x2, t) + random(-20, 20);
        let ny = lerp(y1, y2, t) + random(-20, 20);
        line(prevX, prevY, nx, ny);
        prevX = nx; prevY = ny;
      }
    }
  }
  colorMode(RGB, 255);
}

function windowResized() {
  let w = min(windowWidth * 0.95, 900);
  let h = min(windowHeight * 0.6, 700);
  resizeCanvas(w, h);
  redraw();
}
