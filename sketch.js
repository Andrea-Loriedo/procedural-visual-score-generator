// sketch.js
// Procedural Visual Score Generator in p5.js

let generateButton, saveButton, mode3DButton, complexitySlider, complexityLabel;
let hDensitySlider, hDensityLabel, hDensityValue;
let vDensitySlider, vDensityLabel, vDensityValue;
let use3D = localStorage.getItem('use3D') === 'true';
let complexity = 0.5;
let hDensity = 0.5;
let vDensity = 0.5;

let angleX = 0;
let angleY = 0;
let lastMouseX, lastMouseY;
let spinning = false;

let shapes3D = [], lines3D = [];
let shapes2D = [], lines2D = [];

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
  complexityValue = createSpan('50%');
  complexityValue.parent('button-row');
  complexitySlider.input(() => {
    complexity = complexitySlider.value();
    complexityValue.html(Math.round(complexity * 100) + '%');
    generateScore();
  });

  // Horizontal density slider and label
  hDensityLabel = createSpan('Horizontal Density: ');
  hDensityLabel.parent('button-row');
  hDensitySlider = createSlider(0, 1, 0.5, 0.01);
  hDensitySlider.parent('button-row');
  hDensityValue = createSpan('50%');
  hDensityValue.parent('button-row');
  hDensitySlider.input(() => {
    hDensity = hDensitySlider.value();
    hDensityValue.html(Math.round(hDensity * 100) + '%');
    generateScore();
  });

  // Vertical density slider and label
  vDensityLabel = createSpan('Vertical Density: ');
  vDensityLabel.parent('button-row');
  vDensitySlider = createSlider(0, 1, 0.5, 0.01);
  vDensitySlider.parent('button-row');
  vDensityValue = createSpan('50%');
  vDensityValue.parent('button-row');
  vDensitySlider.input(() => {
    vDensity = vDensitySlider.value();
    vDensityValue.html(Math.round(vDensity * 100) + '%');
    generateScore();
  });

  generateButton = createButton('🎲 Generate Score');
  generateButton.parent('button-row');
  generateButton.mousePressed(generateScore);

  saveButton = createButton('💾 Save Score');
  saveButton.parent('button-row');
  saveButton.mousePressed(() => saveCanvas('visual_score', 'png'));

  mode3DButton = createButton('🌀 3D Mode: ' + (use3D ? 'ON' : 'OFF'));
  mode3DButton.parent('button-row');
  mode3DButton.mousePressed(toggle3DMode);

  generateScore();
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

class VisualShape3D {
  constructor(x, y, z, s, type, color) {
    this.x = x;
    this.y = y;
    this.z = z;
    this.s = s;
    this.type = type; // 0: sphere, 1: box, 2: triangle
    this.color = color;
  }

  draw() {
    push();
    translate(this.x, this.y, this.z);
    fill(this.color);
    noStroke();
    if (this.type === 0) {
      sphere(this.s / 2);
    } else if (this.type === 1) {
      box(this.s);
    } else {
      beginShape();
      vertex(0, 0, 0);
      vertex(this.s, 0, 0);
      vertex(this.s / 2, -this.s, 0);
      endShape(CLOSE);
    }
    pop();
  }
}

class VisualShape2D {
  constructor(x, y, s, type, color) {
    this.x = x;
    this.y = y;
    this.s = s;
    this.type = type; // 0: ellipse, 1: rect, 2: triangle
    this.color = color;
  }

  draw() {
    fill(this.color);
    noStroke();
    if (this.type === 0) {
      ellipse(this.x, this.y, this.s);
    } else if (this.type === 1) {
      rect(this.x, this.y, this.s, this.s);
    } else {
      triangle(this.x, this.y, this.x + this.s, this.y, this.x + this.s / 2, this.y - this.s);
    }
  }
}

class VisualLine3D {
  constructor(x1, y1, z1, x2, y2, z2, type, color) {
    this.x1 = x1; this.y1 = y1; this.z1 = z1;
    this.x2 = x2; this.y2 = y2; this.z2 = z2;
    this.type = type; // 0: straight, 1: bezier, 2: zigzag, 3: wave
    this.color = color;
    // For wave/zigzag
    this.freq = random(1, 3);
    this.amp = random(10, 30);
    this.phase = random(TWO_PI);
    this.angle = random(TWO_PI);
  }

  draw() {
    stroke(this.color);
    strokeWeight(2);
    if (this.type === 0) {
      line(this.x1, this.y1, this.z1, this.x2, this.y2, this.z2);
    } else if (this.type === 1) {
      noFill();
      beginShape();
      vertex(this.x1, this.y1, this.z1);
      let cx1 = lerp(this.x1, this.x2, 0.33) + random(-50, 50);
      let cy1 = lerp(this.y1, this.y2, 0.33) + random(-50, 50);
      let cz1 = lerp(this.z1, this.z2, 0.33) + random(-50, 50);
      let cx2 = lerp(this.x1, this.x2, 0.66) + random(-50, 50);
      let cy2 = lerp(this.y1, this.y2, 0.66) + random(-50, 50);
      let cz2 = lerp(this.z1, this.z2, 0.66) + random(-50, 50);
      bezierVertex(cx1, cy1, cz1, cx2, cy2, cz2, this.x2, this.y2, this.z2);
      endShape();
    } else if (this.type === 2) {
      let steps = int(random(3, 7));
      let prevX = this.x1, prevY = this.y1, prevZ = this.z1;
      for (let k = 1; k <= steps; k++) {
        let t = k / steps;
        let nx = lerp(this.x1, this.x2, t) + random(-20, 20);
        let ny = lerp(this.y1, this.y2, t) + random(-20, 20);
        let nz = lerp(this.z1, this.z2, t) + random(-20, 20);
        line(prevX, prevY, prevZ, nx, ny, nz);
        prevX = nx; prevY = ny; prevZ = nz;
      }
    } else {
      let steps = int(random(20, 40));
      let prevX = this.x1, prevY = this.y1, prevZ = this.z1;
      for (let k = 1; k <= steps; k++) {
        let t = k / steps;
        let baseX = lerp(this.x1, this.x2, t);
        let baseY = lerp(this.y1, this.y2, t);
        let baseZ = lerp(this.z1, this.z2, t);
        let wave = sin(TWO_PI * this.freq * t + this.phase) * this.amp;
        let nx = baseX + cos(this.angle) * wave;
        let ny = baseY + sin(this.angle) * wave;
        let nz = baseZ + sin(this.angle + HALF_PI) * wave * 0.3;
        line(prevX, prevY, prevZ, nx, ny, nz);
        prevX = nx; prevY = ny; prevZ = nz;
      }
    }
  }
}

class VisualLine2D {
  constructor(x1, y1, x2, y2, type, color) {
    this.x1 = x1; this.y1 = y1;
    this.x2 = x2; this.y2 = y2;
    this.type = type; // 0: straight, 1: bezier, 2: zigzag, 3: wave
    this.color = color;
    this.freq = random(1, 3);
    this.amp = random(10, 30);
    this.phase = random(TWO_PI);
    this.angle = random(TWO_PI);
  }

  draw() {
    stroke(this.color);
    strokeWeight(2);
    if (this.type === 0) {
      line(this.x1, this.y1, this.x2, this.y2);
    } else if (this.type === 1) {
      noFill();
      let cx1 = lerp(this.x1, this.x2, 0.33) + random(-50, 50);
      let cy1 = lerp(this.y1, this.y2, 0.33) + random(-50, 50);
      let cx2 = lerp(this.x1, this.x2, 0.66) + random(-50, 50);
      let cy2 = lerp(this.y1, this.y2, 0.66) + random(-50, 50);
      bezier(this.x1, this.y1, cx1, cy1, cx2, cy2, this.x2, this.y2);
    } else if (this.type === 2) {
      let steps = int(random(3, 7));
      let prevX = this.x1, prevY = this.y1;
      for (let k = 1; k <= steps; k++) {
        let t = k / steps;
        let nx = lerp(this.x1, this.x2, t) + random(-20, 20);
        let ny = lerp(this.y1, this.y2, t) + random(-20, 20);
        line(prevX, prevY, nx, ny);
        prevX = nx; prevY = ny;
      }
    } else {
      let steps = int(random(20, 40));
      let prevX = this.x1, prevY = this.y1;
      for (let k = 1; k <= steps; k++) {
        let t = k / steps;
        let baseX = lerp(this.x1, this.x2, t);
        let baseY = lerp(this.y1, this.y2, t);
        let wave = sin(TWO_PI * this.freq * t + this.phase) * this.amp;
        let nx = baseX + cos(this.angle) * wave;
        let ny = baseY + sin(this.angle) * wave;
        line(prevX, prevY, nx, ny);
        prevX = nx; prevY = ny;
      }
    }
  }
}

function mousePressed() {
  if (use3D && mouseY < height && mouseY > 0 && mouseX < width && mouseX > 0) {
    spinning = true;
    lastMouseX = mouseX;
    lastMouseY = mouseY;
  }
}

function mouseDragged() {
  if (use3D && spinning) {
    angleY += (mouseX - lastMouseX) * 0.003;
    angleX += (mouseY - lastMouseY) * 0.003;
    lastMouseX = mouseX;
    lastMouseY = mouseY;
    redraw();
  }
}

function mouseReleased() {
  spinning = false;
}

function generateScore() {
  shapes3D = [];
  lines3D = [];
  if (use3D) {
    colorMode(HSB, 360, 100, 100, 255);
    let numShapes = int(lerp(3, 40, complexity));
    let xSpread = lerp(width * 0.3, width, hDensity);
    let ySpread = lerp(height * 0.2, height, vDensity);
    for (let i = 0; i < numShapes; i++) {
      let x = random(-xSpread / 2, xSpread / 2);
      let y = random(-ySpread / 2 + 80, ySpread / 2 - 50);
      let z = random(-200, 200);
      let s = random(20, 140);
      let hue = (i * 360 / numShapes + random(-30, 30)) % 360;
      let sat = random(60, 100);
      let bri = random(70, 100);
      let alpha = random(140, 200);
      let c = color(hue, sat, bri, alpha);
      let shapeType = int(random(3));
      shapes3D.push(new VisualShape3D(x, y, z, s, shapeType, c));
    }
    let numLines = int(lerp(2, 30, complexity));
    for (let j = 0; j < numLines; j++) {
      let hue = (j * 360 / numLines + random(-20, 20)) % 360;
      let sat = random(70, 100);
      let bri = random(60, 100);
      let alpha = random(120, 220);
      let c = color(hue, sat, bri, alpha);
      let lineType = int(random(4));
      let xSpread = lerp(width * 0.3, width, hDensity);
      let ySpread = lerp(height * 0.2, height, vDensity);
      let x1 = random(-xSpread / 2, xSpread / 2);
      let y1 = random(-ySpread / 2 + 80, ySpread / 2);
      let z1 = random(-200, 200);
      let x2 = random(-xSpread / 2, xSpread / 2);
      let y2 = random(-ySpread / 2 + 80, ySpread / 2);
      let z2 = random(-200, 200);
      lines3D.push(new VisualLine3D(x1, y1, z1, x2, y2, z2, lineType, c));
    }
    colorMode(RGB, 255);
  }

  // Generate 2D shapes/lines
  shapes2D = [];
  lines2D = [];
  if (!use3D) {
    colorMode(HSB, 360, 100, 100, 255);
    let numShapes = int(lerp(3, 30, complexity));
    let xSpread = lerp(width * 0.3, width, hDensity);
    let ySpread = lerp((height - 50) * 0.2, height - 50, vDensity);
    for (let i = 0; i < numShapes; i++) {
      let x = random((width - xSpread) / 2, (width + xSpread) / 2);
      let y = random(80, 80 + ySpread);
      let s = random(20, 140);
      let hue = (i * 360 / numShapes + random(-30, 30)) % 360;
      let sat = random(60, 100);
      let bri = random(70, 100);
      let alpha = random(140, 200);
      let c = color(hue, sat, bri, alpha);
      let shapeType = int(random(3));
      shapes2D.push(new VisualShape2D(x, y, s, shapeType, c));
    }
    let numLines = int(lerp(2, 12, complexity));
    for (let j = 0; j < numLines; j++) {
      let hue = (j * 360 / numLines + random(-20, 20)) % 360;
      let sat = random(70, 100);
      let bri = random(60, 100);
      let alpha = random(120, 220);
      let c = color(hue, sat, bri, alpha);
      let lineType = int(random(4));
      let xSpread = lerp(width * 0.3, width, hDensity);
      let ySpread = lerp((height - 50) * 0.2, height - 50, vDensity);
      let x1 = random((width - xSpread) / 2, (width + xSpread) / 2);
      let y1 = random(80, 80 + ySpread);
      let x2 = random((width - xSpread) / 2, (width + xSpread) / 2);
      let y2 = random(80, 80 + ySpread);
      lines2D.push(new VisualLine2D(x1, y1, x2, y2, lineType, c));
    }
    colorMode(RGB, 255);
  }
  redraw();
}

function draw3DScore() {
  background(255);
  rotateX(angleX);
  rotateY(angleY);
  orbitControl();
  for (let shape of shapes3D) shape.draw();
  for (let l of lines3D) l.draw();
}

function draw2DScore() {
  background(255);
  for (let shape of shapes2D) shape.draw();
  for (let l of lines2D) l.draw();
}

function windowResized() {
  let w = min(windowWidth * 0.95, 900);
  let h = min(windowHeight * 0.6, 700);
  resizeCanvas(w, h);
  redraw();
}
