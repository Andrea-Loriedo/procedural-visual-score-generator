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
    let c = color(random(255), random(255), random(255), 180);
    fill(c);
    noStroke();

    let shapeType = int(random(3));
    push();
    translate(x, y, z);
    if (shapeType === 0) sphere(s / 2); // sustained tone
    else if (shapeType === 1) box(s);   // chord cluster
    else {
      beginShape();
      vertex(0, 0, 0);
      vertex(s, 0, 0);
      vertex(s / 2, -s, 0);
      endShape(CLOSE);
    }
    pop();
  }

  stroke(0, 120);
  strokeWeight(2);
  let numLines = int(lerp(2, 12, complexity));
  for (let j = 0; j < numLines; j++) {
    let x1 = random(-width / 2, width / 2);
    let y1 = random(-height / 2 + 80, height / 2);
    let z1 = random(-200, 200);
    let x2 = random(-width / 2, width / 2);
    let y2 = random(-height / 2 + 80, height / 2);
    let z2 = random(-200, 200);
    line(x1, y1, z1, x2, y2, z2);
  }
}

function draw2DScore() {
  background(255);

  let numShapes = int(lerp(3, 20, complexity));
  for (let i = 0; i < numShapes; i++) {
    let x = random(width);
    let y = random(80, height - 50);
    let s = random(30, 120);
    let c = color(random(255), random(255), random(255), 180);
    fill(c);
    noStroke();

    let shapeType = int(random(3));
    if (shapeType === 0) ellipse(x, y, s);            // sustained tone
    else if (shapeType === 1) rect(x, y, s, s);       // chord cluster
    else triangle(x, y, x + s, y, x + s / 2, y - s);  // staccato burst
  }

  stroke(0, 120);
  strokeWeight(2);
  let numLines = int(lerp(2, 12, complexity));
  for (let j = 0; j < numLines; j++) {
    line(random(width), random(80, height), random(width), random(80, height));
  }
}

function windowResized() {
  let w = min(windowWidth * 0.95, 900);
  let h = min(windowHeight * 0.6, 700);
  resizeCanvas(w, h);
  redraw();
}
