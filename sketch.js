// sketch.js
// Procedural Visual Score Generator in p5.js

let generateButton, saveButton;

function setup() {
  createCanvas(800, 600);
  noLoop();

  generateButton = createButton('🎲 Generate Score');
  generateButton.position(10, height + 20);
  generateButton.mousePressed(redraw);

  saveButton = createButton('💾 Save Score');
  saveButton.position(150, height + 20);
  saveButton.mousePressed(() => saveCanvas('visual_score', 'png'));

  textFont('Helvetica');
}

function draw() {
  background(255);

  fill(30);
  textSize(20);
  text('Procedural Visual Score', 20, 30);

  let numShapes = int(random(6, 15));
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
  let numLines = int(random(3, 8));
  for (let j = 0; j < numLines; j++) {
    line(random(width), random(80, height), random(width), random(80, height));
  }

  noStroke();
  fill(0);
  textSize(14);
  text("🎨 Key: Circle = sustained tone | Square = chord | Triangle = staccato | Color = mood | Position = time", 20, height - 20);
}
