var control_points;
var dragged_node;
const DRAG_NODE_STYLE = [10,"#FCF9EA",1,"#3C3D37"];
var mousePosWorldCoords;

function setup() {
  createCanvas(800, 800);

  dragged_node = null;
  mousePosWorldCoords = createVector(0,0);

  control_points = [
    new ControlPoint(0.1,180),
    new ControlPoint(2.3,210),
    new ControlPoint(3.3,240),
    //new ControlPoint(4.8,300)
  ];

}

var print_once = false
var print_debug = true

function draw() {
  mousePosWorldCoords = createVector(mouseX - width/2, mouseY - height/2)

  if (mouseIsPressed && dragged_node != null) {
    control_points[dragged_node].set_cardinal_pos(mousePosWorldCoords);
  }

  translate(width/2, height/2)
  

  background("#BADFDB");
  

  for (let i = 0; i < control_points.length; i++) {
    control_points[i].draw_pin();
  }
  
  let i = 0

  //iterate clockwise from gegenüber:
  let dir_order = []
  let start_angle = control_points[i].angle + PI;
  

  line(0,0,cos(start_angle)*1000, sin(start_angle) * 1000)

  var all_other_angles = []
  for (let j = 0; j < control_points.length; j++) {
    if (j!=i) {
      var angle =control_points[j].angle - start_angle
      
      while(angle > 2*PI) angle -= 2*PI;
      while(angle < 0) angle += 2*PI;
      
      
      all_other_angles.push([j,angle])

    }
  }

  all_other_angles.sort(function(a,b) {return a[1]-b[1]});

  if (print_debug) {
    print_array_line(all_other_angles)
  }
  if (print_once) {
    print_debug = false
  }
  

  /*
  // 1. if no node is greater then startangle, first is best!
  let start_node = 0;
  if (i==0) start_node = 1

  for (let j = 0; j < control_points.length; j++) {
    print("j",j," ",start_angle,control_points[j].angle)
    if (control_points[j].angle > start_angle) {
      if (i!=j) {
        start_node = j;
        break;
      }
    }
  }
  print("i=",i, "start_node",start_node)
*/

  let start_j = i;
  for (let j=0; j < control_points.length; j++) {
    
  }

  //print("i=",i)
  for (let j = (i+1) % control_points.length; j != i; j = (j+1)%control_points.length) {
    //print(j);
    // iterates through all neighbors in clockwise direction (array is ordered clockwise)
    var angle_to_target = control_points[j].angle - control_points[i].angle
    if (j < i) {
      angle_to_target += 2*PI
    }
    //while (angle_to_target < 0) {
    //  angle_to_target += 2*PI;
    //}
    
    //print(angle_to_target)
  }


}



class ControlPoint {
  constructor(angle, dist) {
    this.angle = angle
    this.distance = dist
  }

  get_cardinal_pos() {
    return createVector(cos(this.angle)*this.distance, sin(this.angle) * this.distance)
  }

  set_cardinal_pos(target_pos) { //TODO
    this.angle = target_pos.heading()
    this.distance = target_pos.mag()
  }

  draw_pin() {
    fill(DRAG_NODE_STYLE[1])
    strokeWeight(DRAG_NODE_STYLE[2])
    stroke(DRAG_NODE_STYLE[3])
    ellipseMode(CENTER)

    var pos = this.get_cardinal_pos()
    ellipse(pos.x,pos.y,DRAG_NODE_STYLE[0]*2,DRAG_NODE_STYLE[0]*2)
  }
}

function mousePressed() {
  dragged_node = null;

  for (let i = 0; i < control_points.length; i++) {
    if (distance(mousePosWorldCoords, control_points[i].get_cardinal_pos()) < DRAG_NODE_STYLE[0]) {
      dragged_node = i;
    }
  }
}