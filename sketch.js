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

function draw3DScore() {
  background(255);
  orbitControl();

  let numShapes = int(lerp(3, 20, complexity));
  let shapes = [];
  colorMode(HSB, 360, 100, 100, 255);
  for (let i = 0; i < numShapes; i++) {
    let x = random(-width / 2, width / 2);
    let y = random(-height / 2 + 80, height / 2 - 50);
    let z = random(-200, 200);
    let s = random(30, 120);
    let hue = (i * 360 / numShapes + random(-30, 30)) % 360;
    let sat = random(60, 100);
    let bri = random(70, 100);
    let alpha = random(140, 200);
    let c = color(hue, sat, bri, alpha);
    let shapeType = int(random(3));
    shapes.push(new VisualShape3D(x, y, z, s, shapeType, c));
  }
  for (let shape of shapes) shape.draw();

  let numLines = int(lerp(2, 12, complexity));
  let lines = [];
  for (let j = 0; j < numLines; j++) {
    let hue = (j * 360 / numLines + random(-20, 20)) % 360;
    let sat = random(70, 100);
    let bri = random(60, 100);
    let alpha = random(120, 220);
    let c = color(hue, sat, bri, alpha);
    let lineType = int(random(4));
    let x1 = random(-width / 2, width / 2);
    let y1 = random(-height / 2 + 80, height / 2);
    let z1 = random(-200, 200);
    let x2 = random(-width / 2, width / 2);
    let y2 = random(-height / 2 + 80, height / 2);
    let z2 = random(-200, 200);
    lines.push(new VisualLine3D(x1, y1, z1, x2, y2, z2, lineType, c));
  }
  for (let l of lines) l.draw();
  colorMode(RGB, 255);
}

function draw2DScore() {
  background(255);

  let numShapes = int(lerp(3, 20, complexity));
  let shapes = [];
  colorMode(HSB, 360, 100, 100, 255);
  for (let i = 0; i < numShapes; i++) {
    let x = random(width);
    let y = random(80, height - 50);
    let s = random(30, 120);
    let hue = (i * 360 / numShapes + random(-30, 30)) % 360;
    let sat = random(60, 100);
    let bri = random(70, 100);
    let alpha = random(140, 200);
    let c = color(hue, sat, bri, alpha);
    let shapeType = int(random(3));
    shapes.push(new VisualShape2D(x, y, s, shapeType, c));
  }
  for (let shape of shapes) shape.draw();

  let numLines = int(lerp(2, 12, complexity));
  let lines = [];
  for (let j = 0; j < numLines; j++) {
    let hue = (j * 360 / numLines + random(-20, 20)) % 360;
    let sat = random(70, 100);
    let bri = random(60, 100);
    let alpha = random(120, 220);
    let c = color(hue, sat, bri, alpha);
    let lineType = int(random(4));
    let x1 = random(width);
    let y1 = random(80, height);
    let x2 = random(width);
    let y2 = random(80, height);
    lines.push(new VisualLine2D(x1, y1, x2, y2, lineType, c));
  }
  for (let l of lines) l.draw();
}

function windowResized() {
  let w = min(windowWidth * 0.95, 900);
  let h = min(windowHeight * 0.6, 700);
  resizeCanvas(w, h);
  redraw();
}
