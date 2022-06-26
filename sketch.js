let center;
let len;
//für jedes Grad
let pixelColors = new Array(360);
//welcher Pixel gerade gemalt werden soll
let currPixel;
let direction;
let pic;
let speed = 1;
let gap = 0;
// wo mit drawing angefangen wird
let begin = -90;

function setup() {
  var cnv = createCanvas(windowWidth, windowHeight / 1.6);
  cnv.position((windowWidth - width) / 2, (windowHeight - height) / 2 + 150);
  newImage(
    "https://tse1.mm.bing.net/th?id=OIP.E0Npw3w83846g-H_DKMVqgHaHa&pid=Api"
  );

  currPixel = createVector();
  direction = createVector();
  background(getCssVariable("background-color"));
}

let keep = true;
let currAngle = begin;

function draw() {
  if (!keep) {
    background(getCssVariable("background-color"));
  }
  for (let i = 0; i < speed; i++) {
    drawPicture(currAngle);
  }
}

function mouseClicked() {
  if (mouseX < 0 || mouseX > width || mouseY < 0 || mouseY > height) {
    return;
  }
  keep = !keep;
}

function prepareArray() {
  //für jedes Grad welche Pixel es hat
  for (let i = 0; i < 360; i++) {
    pixelColors[i] = new Array(len);
  }

  let iterator = 0;
  for (let angle = begin; angle >= -360 + begin + 1; angle--) {
    for (let i = 0; i < len; i++) {
      currPixel.set(center);
      let direction = createVector();
      direction.set(p5.Vector.fromAngle(radians(angle), i));
      currPixel.add(direction);
      pixelColors[iterator][i] = pic.get(int(currPixel.x), int(currPixel.y));
    }
    iterator++;
  }
  console.log("prepared");
}

function saveColors() {
  prepareArray();
  const writer = createWriter("color_data.txt");
  for (let angle = 0; angle < 360; angle++) {
    writer.print(angle + "°");
    for (let i = 0; i < len; i++) {
      let pixel = pixelColors[angle][i];
      writer.write("  " + i);
      writer.write("    r: " + red(pixel));
      writer.write("    g: " + green(pixel));
      writer.write("    b: " + blue(pixel));
      writer.print("");
    }
    writer.print("");
  }
  writer.close();
  writer.clear();
}

function saveArray() {
  prepareArray();
  const writer = createWriter("array_data.txt");
  writer.print("static final int[][][] arr = {");

  for (let angle = 0; angle < 360; angle++) {
    writer.print("{");

    for (let i = 0; i < len; i++) {
      writer.write("{");
      let pixel = pixelColors[angle][i];
      writer.write(red(pixel) + ",");
      writer.write(green(pixel) + ",");
      writer.write(blue(pixel) + ",");
      writer.write("},");
    }
    writer.print("},");
  }

  writer.print("};");
  writer.close();
  writer.clear();
  console.log("human readalbe");
}

function saveEncoded() {
  prepareArray();
  const writer = createWriter("data.txt");

  for (let angle = 0; angle < 360; angle++) {
    for (let i = 0; i < len; i++) {
      let pixel = pixelColors[angle][i];
      writer.print(encode(red(pixel), green(pixel), blue(pixel)));
    }
  }
  writer.close();
  writer.clear();
}

let bStates = [0, 85, 170, 255];

function encode(r, g, b) {
  let rEncode = round(r / ((r + g + b) / 6.0));
  let gEncode = round(g / ((r + g + b) / 6.0));
  let blue = 6 - rEncode - gEncode;

  let factor;

  if (gEncode == 2 && rEncode == 2 && blue == 2)
    // White boost
    factor = 255 / 6;
  else if (gEncode == rEncode && blue == 0)
    // yellow boost
    factor = 170 / 6;
  else factor = 85 / 6;

  let bestH = 0;
  // falls es nicht (nahe an) null ist
  if (r + g + b > 10) {
    // irgendein sehr hoher Wert
    let bestHDiff = 1000;

    // prüfen, welche Helligkeitsstufe am besten wäre (brute-force)
    for (let h = 1; h <= 3; h++) {
      rDecode = round(rEncode * factor * h);
      gDecode = round(gEncode * factor * h);
      bDecode = round((6 - rEncode - gEncode) * factor * h);

      if (abs(r + g + b - (rDecode + gDecode + bDecode)) < bestHDiff) {
        bestH = h;
        bestHDiff = r + g + b - (rDecode + gDecode + bDecode);
      }
    }
  }
  return Bytes2Bits(gEncode) + Bytes2Bits(rEncode) + Bytes2Bits(bestH).slice(1);
}

function Bytes2Bits(b) {
  let bytes = b.toString(2);
  let l = bytes.length;

  if (bytes.length < 3) {
    for (let i = 0; i < 3 - l; i++) {
      bytes = "0" + bytes;
    }
  }
  return bytes;
}

function drawPicture(drawAngle) {
  loadPixels();
  for (let i = 0; i < len; i++) {
    currPixel.set(center);
    direction.set(p5.Vector.fromAngle(radians(drawAngle), i));
    currPixel.add(direction);

    let xAdd = gap > 0 ? direction.setMag(gap * i).x : 0;
    let yAdd = gap > 0 ? direction.setMag(gap * i).y : 0;

    set(
      int(currPixel.x) + width / 2 - center.x + xAdd,
      int(currPixel.y) + height / 2 - center.y + yAdd,
      pic.get(int(currPixel.x), int(currPixel.y))
    );
  }
  updatePixels();
  currAngle--;
}

function getCssVariable(name) {
  var root = document.querySelector(":root");
  var rootStyles = getComputedStyle(root);
  return rootStyles.getPropertyValue(name);
}

function windowResized() {
  resizeCanvas(windowWidth, windowHeight / 1.6);
}

function newImage() {
  let userURL = document.getElementById("url-input").value;
  if (userURL == "") {
    background(getCssVariable("background-color"));
    currAngle = begin;
    return;
  }
  pic = loadImage(userURL, prepareImage, errorLoadingImage);
  background(getCssVariable("background-color"));
  currAngle = begin;
}

function newImage(url) {
  pic = loadImage(url, prepareImage, errorLoadingImage);
  background(getCssVariable("background-color"));
  currAngle = begin;
}

function newUsersImage(img) {
  pic = loadImage(img, prepareImage, errorLoadingImage);
  background(getCssVariable("background-color"));
  currAngle = begin;
}

function prepareImage() {
  if (document.getElementById("len-input").value == "") {
    let widthOffset = (width - pic.width) / 2;
    let heightOffset = (height - pic.height) / 2;

    let offset = min(widthOffset, heightOffset);
    pic.resize(pic.width + offset, pic.height + offset);

    len = int(min(pic.width / 2, pic.height / 2));
    center = createVector(pic.width / 2, pic.height / 2);
  }
  // falls der User schon etwas vorgegeben hat
  setLen();
}

function errorLoadingImage() {
  //gucken warum Bilder nicht geladen werden können
  fetch("https://www.gedichtladen.de/images/derdichter.jpg").catch((e) => {
    console.log(e);
  });
  document.getElementById("url-input").value = "can not load image.";
}

function setSpeed() {
  speed = int(document.getElementById("speed-input").value);
  background(getCssVariable("background-color"));
  currAngle = begin;
  keep = true;
}

function setGap() {
  gap = int(document.getElementById("gap-input").value);
  background(getCssVariable("background-color"));
  currAngle = begin;
  keep = true;
}

function setLen() {
  let val = document.getElementById("len-input").value;
  if (val == "") {
    document.getElementById("len-input").value = null;
    val = min(pic.width, pic.height) / 2;
  }

  len = int(val);
  let smallestDim = min(pic.width, pic.height);
  let resize = smallestDim - len;
  pic.resize(2 * (pic.width - resize), 2 * (pic.height - resize));

  center = createVector(pic.width / 2, pic.height / 2);
  background(getCssVariable("background-color"));
  currAngle = begin;
  keep = true;
}
