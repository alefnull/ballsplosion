// canvas setup
const cnvs = document.getElementById('cnvs');
const ctx = cnvs.getContext('2d');
cnvs.width = window.innerWidth;
cnvs.height = window.innerHeight;
// --------------------------------------------------
// variables
let max_radius = 40;
let min_radius = 2;
let colorArray = [];
let mouseheld = false;
for (let j = 0; j < 3; j++) {
  const r = Math.floor(Math.random() * 256);
  const g = Math.floor(Math.random() * 256);
  const b = Math.floor(Math.random() * 256);
  colorArray.push(`rgb(${r}, ${g}, ${b})`);
}
// --------------------------------------------------
// functions
class Vec {
  constructor(x, y) {
    this.x = x;
    this.y = y;
  }
  add(vec) {
    this.x += vec.x;
    this.y += vec.y;
  }
  sub(vec) {
    this.x -= vec.x;
    this.y -= vec.y;
  }
  mult(num) {
    this.x *= num;
    this.y *= num;
  }
  div(num) {
    this.x /= num;
    this.y /= num;
  }
  mag() {
    return Math.sqrt(this.x * this.x + this.y * this.y);
  }
  normalize() {
    const mag = this.mag();
    if (mag !== 0) {
      this.div(mag);
    }
  }
  dist(vec) {
    const x = this.x - vec.x;
    const y = this.y - vec.y;
    return Math.sqrt(x * x + y * y);
  }
  limit(max) {
    if (this.mag() > max) {
      this.normalize();
      this.mult(max);
    }
  }
}

class Circle {
  constructor(x, y, radius, color) {
    this.pos = new Vec(x, y);
    this.vel = new Vec(Math.random() * 2 - 1, Math.random() * 2 - 1);
    this.acc = new Vec(0, 0);
    this.max_speed = 1.5;
    this.original_radius = radius;
    this.radius = radius;
    this.color = color;
  }
  update() {
    if (mouse.x - this.pos.x < 50 && mouse.x - this.pos.x > -50 && mouse.y - this.pos.y < 50 && mouse.y - this.pos.y > -50) {
      if (this.radius < max_radius) {
        this.radius += 1;
      }
    } else if (this.radius > this.original_radius) {
      this.radius -= 1;
    }
    this.acc.limit(this.max_speed);
    this.vel.add(this.acc);
    this.pos.add(this.vel);
    this.acc.mult(0);
  }
  draw() {
    ctx.beginPath();
    ctx.arc(this.pos.x, this.pos.y, this.radius, 0, Math.PI * 2);
    ctx.fillStyle = this.color;
    ctx.fill();
    ctx.closePath();
  }
  applyForce(force) {
    this.acc.add(force);
  }
  seek(target) {
    const desired = new Vec(target.x - this.pos.x, target.y - this.pos.y);
    desired.normalize();
    desired.mult(this.vel.mag());
    const steer = new Vec(desired.x - this.vel.x, desired.y - this.vel.y);
    this.applyForce(steer);
  }
  avoid(other) {
    // pick a random direction
    const desired = new Vec(Math.random() * 2 - 1, Math.random() * 2 - 1);
    if (this.pos.dist(other) < this.radius + 250) {
      desired.normalize();
      desired.mult(this.vel.mag() * 2);
      const steer = new Vec(desired.x - this.vel.x, desired.y - this.vel.y);
      this.applyForce(steer);
    }
  }
  checkEdges(w, h) {
    // restrict to box of width w and height h
    // in the center of the canvas
    if (this.pos.x + this.radius > innerWidth - w / 2) {
      this.pos.x = innerWidth - w / 2 - this.radius;
      this.vel.x *= -1;
    }
    if (this.pos.x - this.radius < w / 2) {
      this.pos.x = w / 2 + this.radius;
      this.vel.x *= -1;
    }
    if (this.pos.y + this.radius > innerHeight - h / 2) {
      this.pos.y = innerHeight - h / 2 - this.radius;
      this.vel.y *= -1;
    }
    if (this.pos.y - this.radius < h / 2) {
      this.pos.y = h / 2 + this.radius;
      this.vel.y *= -1;
    }
  }
}
// --------------------------------------------------
// animation loop
let mouse = new Vec(0, 0);
let circleArray = [];
const hspace = 300;
const vspace = 300;
for (let i = 0; i < 500; i++) {
  let radius = Math.random() * 3 + 1;
  let x = Math.random() * (innerWidth - hspace) + hspace / 2;
  let y = Math.random() * (innerHeight - vspace) + vspace / 2;
  let color = colorArray[Math.floor(Math.random() * 3)];
  circleArray.push(new Circle(x, y, radius, color));
}
function animate() {
  ctx.clearRect(0, 0, innerWidth, innerHeight);
  for (let i = 0; i < circleArray.length; i++) {
    if (mouseheld) {
      // if circle is within 100px of mouse, seek mouse
      if (circleArray[i].pos.dist(mouse) < 250) {
        circleArray[i].seek(mouse);
      }
    }
    circleArray[i].update();
    circleArray[i].checkEdges(hspace, vspace);
    circleArray[i].draw();
  }
  requestAnimationFrame(animate);
}
animate();
// --------------------------------------------------
// event listeners
window.addEventListener('mousemove', function(event) {
  mouse.x = event.clientX;
  mouse.y = event.clientY;
});
cnvs.addEventListener('mouseleave', function() {
  mouse.x = undefined;
  mouse.y = undefined;
});
window.addEventListener('resize', function() {
  cnvs.width = window.innerWidth;
  cnvs.height = window.innerHeight;
});
window.addEventListener('mousedown', function(event) {
  mouseheld = true;
});
window.addEventListener('mouseup', function(event) {
  mouseheld = false;
  // repel nearby circles from mouse
  for (let i = 0; i < circleArray.length; i++) {
    circleArray[i].avoid(mouse);
  }
});
// --------------------------------------------------
// end
