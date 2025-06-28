

var tile_borders;
var connections;
var curve_radius;
var dragged_node;
const DRAG_NODE_RADIUS = 10;
var mousePosWorldCoords;
let checkbox_drag_tileborder;
let checkbox_edit_tracks;
var clicked_entry;

let button_add_tileborder;
let button_remove_tileborder;
var controlpoints;
var MIN_CURVE_RADIUS = 40
let tracks

function setup() {
  createCanvas(800, 800);

  tracks = [];
  controlpoints = []

  dragged_node = null;
  mousePosWorldCoords = createVector(0,0);

  checkbox_drag_tileborder = createCheckbox(' edit tile');
  checkbox_drag_tileborder.position(200, 800);

  button_add_tileborder = createButton("add incoming road")
  button_add_tileborder.position(390, 800);
  button_remove_tileborder = createButton("remove incoming road")
  button_remove_tileborder.position(520, 800);


  checkbox_edit_tracks = createCheckbox(' edit tracks');
  checkbox_edit_tracks.position(200, 820);

  tile_borders = [
    new TileEdgeControlpoint(0.1,180),
    new TileEdgeControlpoint(2.3,210),
    new TileEdgeControlpoint(3.3,240),
    new TileEdgeControlpoint(4.8,300),
    new TileEdgeControlpoint(2.8,300)
  ]

  //add_track([1,2],[0,-3])
  // region Hello world
}

function mousePressed() {
  dragged_node = null;
  clicked_entry = null

  for (let i = 0; i < tile_borders.length; i++) {
    if (distance(mousePosWorldCoords,tile_borders[i].get_cardinal_pos()) < DRAG_NODE_RADIUS) {
      dragged_node = i;
      //print("drag",i)
    }
  }

  
  clicked_entry = get_hovered_entrypoint();
}


function add_track(from, to) {
  tracks.push(new Track(from,to))//))
  let arc_center = tracks[tracks.length-1].get_arc_center(50)
  tile_borders.push(new CurveRadiusControlpoint(arc_center,tracks.length-1))
}

function get_hovered_entrypoint() {
  var result = null
  for (let i = 0; i < tile_borders.length; i++) {
    if (! (tile_borders[i] instanceof TileEdgeControlpoint)) {
      continue;
    }

    var hovered_entry = tile_borders[i].hover_possible_entry(mousePosWorldCoords)
    if (hovered_entry != null) {
      if (result != null) print("ERROR: unhandled clicked on two different entries...")
      result = [i,hovered_entry];
    }
  }
  return result
}

function draw() {
  ellipseMode(CENTER)
  mousePosWorldCoords = createVector(mouseX - width/2, mouseY - height/2)

  //1. move dragged node
  if (mouseIsPressed && dragged_node != null) {
    tile_borders[dragged_node].drag(mousePosWorldCoords);
  }

  background("#F8EDE3");
  translate(width/2, height/2)

  // drag and drop controlpoints:
  
  // draw tile border
  for (let i = 0; i < tile_borders.length; i++) {
    tile_borders[i].draw();
  }

  //add tracks from releases
  if (!mouseIsPressed) {
    if (clicked_entry != null) {
      var hovered_entry = get_hovered_entrypoint()
      if (hovered_entry != null) {
        if (clicked_entry[0] != hovered_entry[0]) {
          //add new Track!
          add_track(clicked_entry, hovered_entry)
        } else {
          print("not added track, because both ends on same entrypoint")
        }
      }
      clicked_entry = null;
    }
  }

  //draw tracks
  for (let i = 0; i < tracks.length; i++) {
    tracks[i].draw()
  }

  // draw in-progress track
  if (mouseIsPressed) {
    if (clicked_entry != null) {
      var start = tile_borders[clicked_entry[0]].get_possible_entry_pos(clicked_entry[1])
      var end = mousePosWorldCoords;
      //snap
      var hovered_entry = get_hovered_entrypoint()
      if (hovered_entry != null) {
        end = tile_borders[hovered_entry[0]].get_possible_entry_pos(hovered_entry[1])
      }

      stroke("#9BBEC8")
      strokeWeight(6)
      line(start.x,start.y,end.x,end.y)
    }
  }
}




class Track {
  constructor(start, end) {
    this.start = start
    this.end = end
    this.curve_radius = 100
  }

  static preview(from, to) {

  }

  get_arc_center(diameter) {
    var p1_shifted = tile_borders[this.start[0]].get_possible_entry_pos(this.start[1])
    var p2_shifted = tile_borders[this.end[0]].get_possible_entry_pos(this.end[1])

    var norm1 = tile_borders[this.start[0]].get_normal_right()
    var norm2 = tile_borders[this.end[0]].get_normal_right()


    // var possible_centerpoint = intersection_2d_lines(
    //   p1_shifted,
    //   norm1,
    //   p2_shifted,
    //   norm2,
    // );

    //ellipse(possible_centerpoint.x,possible_centerpoint.y,5,5)

    // var radius1 = possible_centerpoint.dist(p1_shifted)
    // var radius2 = possible_centerpoint.dist(p2_shifted)
    // var smaller_radius = min(radius1,radius2)
    // var diameter = smaller_radius * 2
    if (this.curve_radius == "max") {
      print("Not implemented")
    }
    var diameter = this.curve_radius * 2
    //print(radius1, radius2, smaller_radius)

    //shift circle
    //1. find support vectors for intersecting lines:
    //TODO: make flippable!
    //var shift_along_norm1 = sign(this.start[1]) * 
    //var shift_along_norm2 = sign(this.end[1]) * diameter / 2
    var flip_aslongas_road_conform = 1
    var flip1 = flip_aslongas_road_conform //1
    var flip2 = -flip_aslongas_road_conform//-1

    let s1 =  p5.Vector.add(p1_shifted,p5.Vector.mult(norm1,flip1 * diameter / 2 ))
    let s2 =  p5.Vector.add(p2_shifted,p5.Vector.mult(norm2,flip2 * diameter / 2 ))

    //2. find vectors in dir of entrypoint_road
    let dir1 = tile_borders[this.start[0]].get_pos_at_dist(-1);
    let dir2 = tile_borders[this.end[0]].get_pos_at_dist(-1);
    
    strokeWeight(1)
    // ellipse(s1.x,s1.y,4,4)
    // ellipse(s2.x,s2.y,4,4)
    // line(s1.x,s1.y,s1.x+dir1.x*100,s1.y+dir1.y*100)
    // line(s2.x,s2.y,s2.x+dir2.x*100,s2.y+dir2.y*100)

    let arc_center = intersection_2d_lines(s1,dir1,s2,dir2)
    if (arc_center == null) {
      print("NO INTERSECTION")
    } else {
      //print(tile_borders[this.start[0]].get_cardinal_pos(), arc_center)      
      
      var normdir1 = tile_borders[this.start[0]].get_cardinal_pos()
      normdir1.normalize()
      var dot_prod1 = arc_center.dot(normdir1)
      // var targ1 = tile_borders[this.start[0]].get_cardinal_pos()
      // targ1.normalize()
      // print("dot prod1",dot_prod1)
      // targ1.mult(dot_prod1)
      // line(0,0,targ1.x,targ1.y)

      var normdir2 = tile_borders[this.end[0]].get_cardinal_pos()
      normdir2.normalize()
      var dot_prod2 = arc_center.dot(normdir2)

      if (dot_prod1 > tile_borders[this.start[0]].distance) {
        print("CENTER IS TO FAR AWAY!", )
      }
      if (dot_prod2 > tile_borders[this.end[0]].distance) {
        print("CENTER IS TO FAR AWAY!", )
      }
      return arc_center
    }
    return null
  }

  get_p_and_dir() {
    var p1_shifted = tile_borders[this.start[0]].get_possible_entry_pos(this.start[1])
    var p2_shifted = tile_borders[this.end[0]].get_possible_entry_pos(this.end[1])

    let dir1 = tile_borders[this.start[0]].get_pos_at_dist(-1);
    let dir2 = tile_borders[this.end[0]].get_pos_at_dist(-1);
    
    return [p1_shifted,dir1, p2_shifted,dir2]
  }


  get_intersection_straightroads() {
    var p_and_dir = this.get_p_and_dir()
    return intersection_2d_lines(p_and_dir[0], p_and_dir[1], p_and_dir[2], p_and_dir[3]);
  }


  draw() {
    
    var p_and_dir = this.get_p_and_dir()
    var dir1 = p_and_dir[1]
    var dir2 = p_and_dir[3]
    var arc_center = this.get_arc_center()
    var diameter = this.curve_radius*2
    stroke("#85586F")
    strokeWeight(4)
    noFill()
    
    //ellipse(arc_center.x,arc_center.y,this.curve_radius*2,this.curve_radius*2)

    // straight sections:
    var straight_section1_target = arc_center.copy()
    var offset_rad1 = orth_2dvec(dir1,true)
    offset_rad1.mult(this.curve_radius)
    straight_section1_target.add(offset_rad1)
    linev(p_and_dir[0], straight_section1_target)

    var straight_section2_target = arc_center.copy()
    var offset_rad2 = orth_2dvec(dir2,false)
    offset_rad2.mult(this.curve_radius)
    straight_section2_target.add(offset_rad2)
    linev(p_and_dir[2], straight_section2_target)

    // arc:
    var p1 = straight_section1_target.copy()
    p1.sub(arc_center)
    var p2 = straight_section2_target.copy()
    p2.sub(arc_center)
    var p3 = arc_center.copy()

    //var angle_between = p1.heading() -p2.heading()
    //print(p1.heading(),p2.heading())

    //todo: this is a convoluted way to calculate, whether to draw arc "outside" or "inside"

    //construct, whether clockwise or counterclockwise

    var center_to_sst1 = straight_section1_target.copy()
    center_to_sst1.sub(arc_center)
    var slightly_more_rotated1 = center_to_sst1.copy()
    slightly_more_rotated1.add(dir1)
    var headd1 = center_to_sst1.heading()
    var clockwise1 = slightly_more_rotated1.heading() - headd1 > 0

    var center_to_sst2 = straight_section2_target.copy()
    center_to_sst2.sub(arc_center)
    var slightly_more_rotated2 = center_to_sst2.copy()
    slightly_more_rotated2.add(dir2)
    var headd2 = center_to_sst2.heading()
    var clockwise2 = slightly_more_rotated2.heading() - headd2 > 0
    //print("clockwise1",clockwise1,"clockwise2",clockwise2)

    if (clockwise1 && !clockwise2) {
      if (center_to_sst1.heading() < center_to_sst2.heading()) {
        arc(arc_center.x,arc_center.y,diameter,diameter,headd1, headd2)
      } else {
        //print("head1,2",headd1,headd2,headd2+2*PI,(headd2 + 2*PI)*180/PI,"°")
        arc(arc_center.x,arc_center.y,diameter,diameter, headd1, headd2 + 2*PI)
      }
    }

    if (!clockwise1 && clockwise2) {
      if (center_to_sst2.heading() < center_to_sst1.heading()) {
        arc(arc_center.x,arc_center.y,diameter,diameter,headd2, headd1)
      } else {
        //print("head1,2",headd1,headd2,headd2+2*PI,(headd2 + 2*PI)*180/PI,"°")
        arc(arc_center.x,arc_center.y,diameter,diameter, headd2, headd1 + 2*PI)
      }
    }

    if (clockwise1 == clockwise2) {
      print("ERROR, same clockwise value :/")
    }



    //line(arc_center.x,arc_center.y,arc_center.x + slightly_more_rotated1.x,arc_center.y + slightly_more_rotated1.y)


    // var int_str_roads = this.get_intersection_straightroads()
    // var dist1 = p_and_dir[0].dist(int_str_roads)
    // var dist2 = p_and_dir[0].dist(straight_section1_target)
    // print(dist1,dist2)
    // var smaller_heading = min(p1.heading(), p2.heading())
    // var greater_heading = max(p1.heading(), p2.heading())
    // if (dist2 < dist1) { //(can never be 0 because of minradius)
    //   arc(arc_center.x,arc_center.y,diameter,diameter,smaller_heading, greater_heading)
    // } else {
    //   arc(arc_center.x,arc_center.y,diameter,diameter,greater_heading, smaller_heading)
    // }
  }

  draw_calculation_stepbystep() {  
    var p1_shifted = tile_borders[this.start[0]].get_possible_entry_pos(this.start[1])
    var p2_shifted = tile_borders[this.end[0]].get_possible_entry_pos(this.end[1])
    //print(this.start[1],this.end[1])
    stroke("#9BBEC8")
    strokeWeight(6)
    stroke("#85586F")
    strokeWeight(5)
    noFill()
    //line(p1_shifted.x,p1_shifted.y,p2_shifted.x,p2_shifted.y)

    var norm1 = tile_borders[this.start[0]].get_normal_right()
    var norm2 = tile_borders[this.end[0]].get_normal_right()


    // var possible_centerpoint = intersection_2d_lines(
    //   p1_shifted,
    //   norm1,
    //   p2_shifted,
    //   norm2,
    // );

    //ellipse(possible_centerpoint.x,possible_centerpoint.y,5,5)

    // var radius1 = possible_centerpoint.dist(p1_shifted)
    // var radius2 = possible_centerpoint.dist(p2_shifted)
    // var smaller_radius = min(radius1,radius2)
    // var diameter = smaller_radius * 2
    if (this.curve_radius == "max") {
      print("Not implemented")
    }
    var diameter = this.curve_radius * 2
    //print(radius1, radius2, smaller_radius)

    //shift circle
    //1. find support vectors for intersecting lines:
    //TODO: make flippable!
    //var shift_along_norm1 = sign(this.start[1]) * 
    //var shift_along_norm2 = sign(this.end[1]) * diameter / 2
    var flip_aslongas_road_conform = 1
    var flip1 = flip_aslongas_road_conform //1
    var flip2 = -flip_aslongas_road_conform//-1

    let s1 =  p5.Vector.add(p1_shifted, p5.Vector.mult(norm1,flip1 * this.curve_radius ))
    let s2 =  p5.Vector.add(p2_shifted, p5.Vector.mult(norm2,flip2 * this.curve_radius ))

    //2. find vectors in dir of entrypoint_road
    let dir1 = tile_borders[this.start[0]].get_pos_at_dist(-1);
    let dir2 = tile_borders[this.end[0]].get_pos_at_dist(-1);
    
    strokeWeight(1)
    // ellipse(s1.x,s1.y,4,4)
    // ellipse(s2.x,s2.y,4,4)
    // line(s1.x,s1.y,s1.x+dir1.x*100,s1.y+dir1.y*100)
    // line(s2.x,s2.y,s2.x+dir2.x*100,s2.y+dir2.y*100)

    let arc_center = intersection_2d_lines(s1,dir1,s2,dir2)
    if (arc_center == null) {
      print("NO INTERSECTION")
    } else {
      //print(tile_borders[this.start[0]].get_cardinal_pos(), arc_center)      
      
      var normdir1 = tile_borders[this.start[0]].get_cardinal_pos()
      normdir1.normalize()
      var dot_prod1 = arc_center.dot(normdir1)
      // var targ1 = tile_borders[this.start[0]].get_cardinal_pos()
      // targ1.normalize()
      // print("dot prod1",dot_prod1)
      // targ1.mult(dot_prod1)
      // line(0,0,targ1.x,targ1.y)

      var normdir2 = tile_borders[this.end[0]].get_cardinal_pos()
      normdir2.normalize()
      var dot_prod2 = arc_center.dot(normdir2)

      if (dot_prod1 > tile_borders[this.start[0]].distance) {
        print("CENTER IS TO FAR AWAY!", )
      }
      if (dot_prod2 > tile_borders[this.end[0]].distance) {
        print("CENTER IS TO FAR AWAY!", )
      }
      //ellipse(arc_center.x,arc_center.y,4,4)
      ellipse(arc_center.x,arc_center.y,diameter,diameter)

      strokeWeight(4)
      var straight_section1_target = arc_center.copy()
      var offset_rad1 = orth_2dvec(dir1,true)
      offset_rad1.mult(diameter/2)
      straight_section1_target.add(offset_rad1)
      linev(p1_shifted, straight_section1_target)

      var straight_section2_target = arc_center.copy()
      var offset_rad2 = orth_2dvec(dir2,false)
      offset_rad2.mult(diameter/2)
      straight_section2_target.add(offset_rad2)
      linev(p2_shifted, straight_section2_target)
    }

    //ellipse(possible_centerpoint.x, possible_centerpoint.y,diameter, diameter)

    /*
    var min_dist = min(tile_borders[i].distance,tile_borders[j].distance)
      //print(min_dist)


      var p1 = tile_borders[i].get_pos_at_dist(min_dist);
      var p2 = tile_borders[j].get_pos_at_dist(min_dist);
      var norm1 = tile_borders[i].get_normal_right()
      var norm2 = tile_borders[j].get_normal_right()

      //get min dist of the borderpositions

      var int1 = intersection_2d_lines(
        p1,
        norm1,
        p2,
        norm2,
      );
      ellipse(int1.x,int1.y,DRAG_NODE_RADIUS*2,DRAG_NODE_RADIUS*2);
      var diff1 = vec_diff(p1, int1)
      var diff2 = vec_diff(p2,int1)
    
      var diameter = diff1.mag() * 2;
      noFill()
      stroke("#D0B8A8")
      strokeWeight(2)

      if (p2.heading() - p1.heading() < 0 && p2.heading() - p1.heading() > -PI) {
        arc(int1.x,int1.y,diameter,diameter,diff1.heading(),diff2.heading());
      } else {
        arc(int1.x,int1.y,diameter,diameter,diff2.heading(),diff1.heading());
      }
    

      if (min_dist < tile_borders[i].distance) {
        //print("a")
        var p_to = tile_borders[i].get_cardinal_pos()
        line(p1.x,p1.y,p_to.x, p_to.y);
      }
      if (min_dist < tile_borders[j].distance ) { //- 0.0001
        //print("b")
        var p_to = tile_borders[j].get_cardinal_pos()
        line(p2.x,p2.y,p_to.x, p_to.y);
      }


    */

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
    stroke("#85586F")
    strokeWeight(1)
    fill("#DFD3C3")
    ellipseMode(CENTER)

    var pos = this.get_cardinal_pos()
    ellipse(pos.x,pos.y,20,20)
  }

  draw() {
    this.draw_pin()
  }

  drag(to) {
    this.set_cardinal_pos(to);
  }
}

// region: CurveRadiusControlpoint
class CurveRadiusControlpoint extends ControlPoint {
  constructor(pos, controlled_track) {
    super(0,100)
    this.set_cardinal_pos(pos)
    this.controlled_track = controlled_track
  }

  get_allowed_path() {
    var focuspoint = tracks[this.controlled_track].get_intersection_straightroads()

    var dir = createVector(0,0)
    var dirs = tracks[this.controlled_track].get_p_and_dir();
    dir.sub(dirs[1])
    dir.sub(dirs[3])
    dir = dir.normalize()


    return [focuspoint, dir]
  }

  drag(to) {
    var allowed_path = this.get_allowed_path()

    // 1. move point
    var new_pos = to
    new_pos.sub(allowed_path[0])
    var move_amount = p5.Vector.dot(new_pos, allowed_path[1])
    var newnew_pos = allowed_path[0].copy()
    var move_along = allowed_path[1]

    move_along.mult(move_amount)
    newnew_pos.add(move_along)

    var CURVE_CONTROLPOINT_SNAP_RADIUS = 10

    // 2. snap controlpoint
    // if (!keyIsDown(CONTROL)) {
    //   for (let i = 0; i < tile_borders.length; i++) {
    //     if (tile_borders[i] instanceof CurveRadiusControlpoint) {
    //       if (tile_borders[i].get_cardinal_pos().dist(newnew_pos) < CURVE_CONTROLPOINT_SNAP_RADIUS) {
    //         print("SNAP")
    //         newnew_pos = tile_borders[i].get_cardinal_pos()
    //       } 
    //     }
    //   }
    // }
    // 1. continuation: set new pos
    this.set_cardinal_pos(newnew_pos)


    // 3. calc radius
    var dirs = tracks[this.controlled_track].get_p_and_dir();
    var dir1 = dirs[1]
    var orth_dir1 = orth_2dvec(dir1)
    var newnew_pos_shifted = newnew_pos.copy()
    newnew_pos_shifted.sub(dirs[0])
    var new_radius = p5.Vector.dot(newnew_pos_shifted, orth_dir1)
    //print("new radius",new_radius)

    // 3.5 snap radius
    var snap_candidates = get_snap_radius_track(tracks[this.controlled_track]);
    print("snap candidates:",snap_candidates, "target radius:",new_radius)

    // min by diff to new_radius:
    var closest_candidate = null;
    for (let i = 0; i < snap_candidates.length; i++) {
      if (closest_candidate == null || abs(closest_candidate-new_radius) > abs(snap_candidates[i]-new_radius)) {
        //ith candidate is better
        if (abs(snap_candidates[i]-new_radius) <= CURVE_CONTROLPOINT_SNAP_RADIUS) {
          closest_candidate = snap_candidates[i];    
        }
      }
    }
    if (closest_candidate != null) {
      new_radius = closest_candidate;
    }


    // 4. clamp radius
    if (abs(new_radius) < MIN_CURVE_RADIUS) { //TODO fix: do on diameter, not this!
      if ( new_radius >= 0)
        new_radius = MIN_CURVE_RADIUS
      else new_radius = -MIN_CURVE_RADIUS
    }

    // 5. update radius
    tracks[this.controlled_track].curve_radius = new_radius
    // 5.2 update control point position:
    var newpos = allowed_path[1].copy()
    newpos.mult(1/abs(newpos.mag()))
    newpos.mult(new_radius)
    newpos.add(allowed_path[0])

    //TODO faulty this.set_cardinal_pos(newpos)
  }


  draw() {
    stroke("#85586F")
    strokeWeight(1)
    fill("#DFD3C3")
    ellipseMode(CENTER)

    var pos = this.get_cardinal_pos()
    ellipse(pos.x,pos.y,10,10)
  }
}


var ENTRY_SPACING = 14
var ENTRY_DOTSIZE = 6
var ENTRIES_TO_EITHER_SIDE = 6
var ENTRY_HOVER_RADIUS = 7 //spacing / 2

class TileEdgeControlpoint extends ControlPoint {
  constructor(angle, dist) {
    super(angle,dist)
    this.outbound_tracks = 4
  }

  set_pos(target_pos) { //TODO
    this.angle = target_pos.heading()
    this.distance = target_pos.mag()
  }

  get_pos_at_dist(dist) {
    return createVector(cos(this.angle)*dist, sin(this.angle) * dist)
  
  }

  get_normal_right() {
    return createVector(cos(this.angle - PI/2), sin(this.angle - PI/2))
  }


  get_possible_entry_pos(i) {
    var pos = this.get_cardinal_pos()
    var norm = this.get_normal_right()

    var entry_pos = pos.copy()
    entry_pos.add(p5.Vector.mult(norm, i * ENTRY_SPACING))
    return entry_pos //pos and radius
    //ellipse(entry_pos.x,entry_pos.y,ENTRY_DOTSIZE,ENTRY_DOTSIZE)
  }

  closest_possible_entry(pos) {
    var norm = this.get_normal_right()
    var pos_along_norm = p5.Vector.dot(pos,norm)
    var index_possentr = round(pos_along_norm / ENTRY_SPACING)
    return index_possentr
  }

  hover_possible_entry(pos) {
    var closest = this.closest_possible_entry(pos)
    //print("closest ",closest)
    if (abs(closest) <= ENTRIES_TO_EITHER_SIDE) {
      if (this.get_possible_entry_pos(closest).dist(pos) <= ENTRY_HOVER_RADIUS) {
        //print("hover",closest)
        return closest
      }
    }
    return null
  }

  draw_possible_entries() {
    stroke("#85586F")
    strokeWeight(1)
    fill("#DFD3C3")
    ellipseMode(CENTER)

    for (let i = -ENTRIES_TO_EITHER_SIDE; i <= ENTRIES_TO_EITHER_SIDE; i++) {
      var entry_pos = this.get_possible_entry_pos(i)
      ellipse(entry_pos.x,entry_pos.y,ENTRY_DOTSIZE,ENTRY_DOTSIZE)
    }
  }

  draw() {
    fill("#DFD3C3")
    stroke("#85586F")
    var pos = this.get_cardinal_pos()
    var normal = createVector(pos.y,-pos.x).normalize()
    //print("normal",normalMaterial)
    //print(normal)
    var p1 = createVector(pos.x + normal.x * 500.0,pos.y + normal.y * 500.0)
    var p2 = createVector(pos.x - normal.x * 500.0,pos.y - normal.y * 500.0)

    strokeWeight(1);
    stroke("#DFD3C3")
    //line(0,0,100,100)
    line(p1.x,p1.y, p2.x,p2.y) //tile border

    //stroke("#85586F")
    
    //ellipseMode(CENTER)
    //ellipse(pos.x,pos.y,20,20)
    
    stroke("#D0B8A8")
    strokeWeight(2)
    var p3 = createVector(pos.x * 1000, pos.y * 1000)
    var norm = this.get_normal_right()
    var p4 = createVector(pos.x +norm.x* 20,pos.y +norm.y* 20)
    line(pos.x,pos.y,p3.x,p3.y)


    if (checkbox_drag_tileborder.checked()) {
      this.draw_pin()
    }
    this.draw_possible_entries()
  }

  draw_edge(left_neighbor, right_neighbor) {

  }

  drag(to) {
    if (checkbox_drag_tileborder.checked()) {
      this.set_cardinal_pos(to);
    }
  }

}



function get_snap_radius_track(track) {
  return get_snap_radius(track.start, track.end);
}

function same_entry_combination(from1,to1,from2,to2) {
  if (from1[0] == from2[0] && to1[0] == to2[0]) return true
  if (from1[0] == to2[0] && from2[0] == to1[0]) return true
  return false
}

function tracks_are_parallel(from1,to1,from2,to2) {
  if (from1[0] == from2[0] && to1[0] == to2[0]) {
    if (from1[1] - from2[1] == -to1[1] + to2[1]) return true
  }
  if (from1[0] == to2[0] && from2[0] == to1[0]) {
    if (from1[1] - to2[1] == from2[1] - to1[1]) return true
  }
  return false
}

function get_snap_radius(start, end) {
  var snap_candidates = []

  for (let i = 0; i < tracks.length; i++) {
      var tracks_parallel = null

      var from1 = start
      var to1 = end
      var from2 = tracks[i].start
      var to2 = tracks[i].end

      if (from1[0] == from2[0] && to1[0] == to2[0]) {
        if (from1[1] - from2[1] == -to1[1] + to2[1]) {
          tracks_parallel = "same dir"

          if (from1[1] == from2[1]) {
            tracks_parallel = "equal"
          }
        }
      }
      if (from1[0] == to2[0] && from2[0] == to1[0]) {
        if (from1[1] - to2[1] == from2[1] - to1[1]) {
          tracks_parallel = "reversed"
          
          if (from1[1] == to2[1]) {
            tracks_parallel = "equal reversed"
          }
        }
      }

      if (tracks_parallel == "same dir") {
        snap_candidates.push(tracks[i].curve_radius)
        snap_candidates.push(tracks[i].curve_radius + ENTRY_SPACING)
        snap_candidates.push(tracks[i].curve_radius - ENTRY_SPACING)
      }

      if (tracks_parallel == "reversed") {
        snap_candidates.push(-tracks[i].curve_radius)
        snap_candidates.push(-tracks[i].curve_radius + ENTRY_SPACING)
        snap_candidates.push(-tracks[i].curve_radius - ENTRY_SPACING)
      }

  }
  return snap_candidates;

}

