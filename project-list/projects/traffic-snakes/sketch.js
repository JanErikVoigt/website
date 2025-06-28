let snake_spawn_countdown
let x_meters_to_pxl
let car_length
let lanes
let min_speed_diff_for_overtake


let min_car_cooldown = 0.4
let max_car_cooldown = 2
let min_car_speed_ms
let expected_car_speed_ms

let run_time = 0.0
let recent_spawns = []
let recent_despawns = []

function setup() {
  createCanvas(800, 400);
  
  //rectMode(CENTER)
  
  
  snakes = []
  lanes = [new Lane(), new Lane()]
  snake_spawn_countdown = [0,0]
  x_meters_to_pxl = 1.0
  car_length = 8
  min_speed_diff_for_overtake = 3.0
  
  
  spawn_addlane_buttons()
}



function draw() {
  background("#4A4947");
  translate(10, height - 100)
  
  //params
  update_configs()
  run_time += deltaTime * 0.001
  
  //plotter.draw()
  
  //spawn cars
  for (let i = 0; i < lanes.length; i++) {
    if (snake_spawn_countdown[i] <= 0) {
      let new_speed = min_car_speed_ms + (random(0,1) + random(0,1))/2 * (expected_car_speed_ms-min_car_speed_ms)
      
      lanes[i].insert_new_car(new Car(new_speed))
      snake_spawn_countdown[i] = random(min_car_cooldown,max_car_cooldown)
      recent_spawns.push(run_time)
    } else {
      snake_spawn_countdown[i] -= deltaTime / 1000.0
    }
  }
  
  
  // 1. update positions
  for (let i = 0; i < lanes.length; i++) {
    lanes[i].move_snakes()
  }
  
  
  //2. split up snakes:
  for (let lane_i = 0; lane_i < lanes.length; lane_i++) {
    let lane = lanes[lane_i]
    for (let snake_i = lane.snakes.length-1; snake_i >= 0 ; snake_i--) {
      let amount_cars = lane.snakes[snake_i].cars.length
      if (amount_cars > 1) {
        let snakespeed = lanes[lane_i].snakes[snake_i].get_speed()
        for (let car_i = 1; car_i < lane.snakes[snake_i].cars.length; car_i++) {
          //assert that speed always greater or eq to snake_speed!
          if (lane.snakes[snake_i].cars[car_i].target_speed < snakespeed) {
            //print("split up snake!")
            let cars_infront_faster = subset(lane.snakes[snake_i].cars, 0, car_i)
            let cars_behind_slower = subset(lane.snakes[snake_i].cars, car_i, lane.snakes[snake_i].cars.length)

            let snake_behind = new Snake(null, lanes[lane_i].snakes[snake_i].front - car_length * cars_infront_faster.length) //TODO also subtract speeddiff * timeDelta from front...
            snake_behind.cars = cars_behind_slower
            
            snake_behind.front -= (snakespeed-snake_behind.get_speed() ) * deltaTime / 1000
            
            lanes[lane_i].snakes[snake_i].cars = cars_infront_faster
            lanes[lane_i].insert_snake_at_right_position(snake_behind)
            car_i = 1
          }
        }
      } 
    }
  }
  
  //try switch lane back down
  for (let lane_i = 1; lane_i < lanes.length; lane_i++) {
    for (let i = lanes[lane_i].snakes.length - 1; i >= 0 ; i--) {
      //...
      //subject range:
      let subject_range = [lanes[lane_i].snakes[i].front - car_length - 0.543, lanes[lane_i].snakes[i].front + 0.543] //also dont, if there is not a carlength infront (??)
      //space on lane below
      if (!lanes[lane_i -1].area_blocked(subject_range[0],subject_range[1])) {
        //print("subject area free:", subject_range)
        let ovetaker = lanes[lane_i].pop_front_car_of_snake(i)
        let success = lanes[lane_i-1].insert_snake_at_right_position(ovetaker)
        if (!success) {
          print("FAILED INSERTION OF CAR ON SWITCH TO RIGHT LANE")
        }
      }
    }
  }
  
  
  
  // 2. connect snakes, overtake on connect
  for (let lane_i = 0; lane_i < lanes.length; lane_i++) {
    for (let i = lanes[lane_i].snakes.length - 1; i >= 0 ; i--) {
      if (i+1 < lanes[lane_i].snakes.length) {
        if (lanes[lane_i].snakes[i].front >= lanes[lane_i].snakes[i+1].rear()) {
          //either join snake or switch lanes...
          let overtake = false
          
          if (lane_i+1 < lanes.length) { //another lane exists
            //check, if there is anything in the way! 
            //todo maybe overtake with longest possible snake!
            let subject = lanes[lane_i].snakes[i]
            let snake_infront = lanes[lane_i].snakes[i+1]
            if (!lanes[lane_i+1].area_blocked(subject.front-car_length, subject.front)) {
              // can overtake
              
              let wanted_speed = subject.get_speed()
              let snake_in_front_speed = snake_infront.get_speed()
              if (wanted_speed - snake_in_front_speed >= min_speed_diff_for_overtake) { 
                //setup diff needed for overtake here!
                overtake = true
              }
              
            }
            
            
          }
          
          if (overtake) {
            //TODO only ovetake with front car (if fast enough)
            let ovetaker = lanes[lane_i].pop_front_car_of_snake(i)
            let success = lanes[lane_i+1].insert_snake_at_right_position(ovetaker)
            if (!success) {
              print("FAILED INSERTION OF CAR ON OVERTAKE")
            }
          } else { //dont overtake and connect to end!
            lanes[lane_i].snakes[i+1].cars = lanes[lane_i].snakes[i+1].cars.concat(lanes[lane_i].snakes[i].cars)
            //remove ith element
            lanes[lane_i].snakes = concat(
              subset(lanes[lane_i].snakes,0,i),
              subset(lanes[lane_i].snakes,i+1,
                     lanes[lane_i].snakes.length))
          }
        }
      }
    }
  }
  
  //disconnect snake, if possible:
  //try overtaking from cars further back in snakes:
  for (let lane_i = 0; lane_i < lanes.length -1; lane_i++) {
    for (let snake_i = lanes[lane_i].snakes.length - 1; snake_i >= 0 ; snake_i--) {
      let amount_cars = lanes[lane_i].snakes[snake_i].cars.length
      if (amount_cars > 1) {
        let snakespeed = lanes[lane_i].snakes[snake_i].get_speed()
        for (let car_i = amount_cars-1; car_i > 0; car_i--) {
          amount_cars = lanes[lane_i].snakes[snake_i].cars.length
          
          //iter from back to front and check, if i want and can overtake
          //dont check for first car, as it cant leave snake in that sense...
          
          if (lanes[lane_i].snakes[snake_i].cars[car_i].target_speed >= snakespeed + min_speed_diff_for_overtake) {
            //print("want overtake")
            //want overtake
            let car_area = [lanes[lane_i].snakes[snake_i].front - (car_i+1)*car_length,
                            lanes[lane_i].snakes[snake_i].front - car_i*car_length    ]
            //print("car area: ",car_area)
            if (lanes[lane_i+1].area_free(car_area[0],car_area[1])) {
              //can overtake!
              //print("can overtake")
              //split snake into three. then overtake with middle snake!
              
              
              if (car_i == amount_cars-1 || car_i == 0) {
                if (car_i == amount_cars-1) {
                  // if last car, split into two:
                  let ovetaker = lanes[lane_i].pop_last_car_from_snake(snake_i)
                  let success = lanes[lane_i+1].insert_snake_at_right_position(ovetaker)
                  if (!success) {
                    print("FAILED INSERTION OF CAR ON DISCONNECT LAST CAR")
                  }
                } else {
                  if (car_i == 0) {
                      // if first car, split into two:
                    let ovetaker = lanes[lane_i].pop_first_car_from_snake(snake_i)
                    let success = lanes[lane_i+1].insert_snake_at_right_position(ovetaker)
                    if (!success) {
                      print("FAILED INSERTION OF CAR ON DISCONNECT FIRST CAR")
                    }
                  }
                }
                
              } else {
                //split into three
                print("Split into three!")
                let new_snakes = lanes[lane_i].pop_car_from_snake(snake_i, car_i)
                //insert behind at same lane
                let success1 = lanes[lane_i].insert_snake_at_right_position(new_snakes[0])
                
                //insert ovetaker at lane above
                let success2 = lanes[lane_i+1].insert_snake_at_right_position(new_snakes[1])
                
                //increase snake_i, as one new snake is inserted before the current one
                snake_i ++
                
                if (!success1 || !success2) {
                  print("FAILED INSERTION OF CAR ON DISCONNECT A MIDDLE CAR",car_i,success1,success2)
                }
                
              }
              
               
            }  
          }
          
          
        }
      }
    }
  }
  
  //split up snakes with slower cars in it!
  /*for (let lane_i = 0; lane_i < lanes.length -1; lane_i++) {
    for (let snake_i = 0; snake_i < lanes[lane_i].snakes.length; snake_i++) {
      let amount_cars = lanes[lane_i].snakes[snake_i].cars.length
      if (amount_cars > 1) {
        let snakespeed = lanes[lane_i].snakes[snake_i].get_speed()
        for (let car_i = 1; car_i < lanes[lane_i].snakes[snake_i].cars.length; car_i++) {    
          //assert that speed always greater or eq to snake_speed!
          if (lanes[lane_i].snakes[snake_i].cars[car_i].target_speed < snakespeed) {
            print("split up snake here!")
            let cars_infront_faster = subset(lanes[lane_i].snakes[snake_i].cars, 0, car_i)
            let cars_behind_slower = subset(lanes[lane_i].snakes[snake_i].cars, car_i, lanes[lane_i].snakes[snake_i].cars.length)
            
            let snake_behind = new Snake(null, lanes[lane_i].snakes[snake_i].front + car_length * cars_infront_faster.length)
            snake_behind.cars = cars_behind_slower
            lanes[lane_i].snakes[snake_i].cars = cars_infront_faster
            lanes[lane_i].insert_snake_at_right_position(snake_behind)
            
          }
        }
      }
    }
  }*/
  //One could try to only split differently fast snakes on operations when needed. For now, I do it on every snake!

  
  
  for (let i = 0; i < lanes.length; i++) {
    // 2. remove to far gone ones...
    let amount_removed = lanes[i].remove_far_gone_ones(780)
    if (amount_removed > 0) {
      recent_despawns.push([run_time, amount_removed])  
    }
    
    // 3. draw
    lanes[i].draw(-i*20)
  }
  
  
  
  
  draw_analytics()
  
  
  
  
  
}

//This should be an ab-tree i think? 
class Lane {
  constructor() {
    this.snakes = []
  }
  
  
  //One could try to only split differently fast snakes on operations when needed. For now, I do it on every snake!
  pop_front_car_of_snake(i) {
    if (this.snakes[i].cars.length == 1) {
      return this.pop_snake(i)
    } else {
      let removed_car = this.snakes[i].cars[0]
      //let old_speed = this.snakes[i].get_speed()
      
      this.snakes[i].cars = subset(this.snakes[i].cars,1, this.snakes[i].cars.length)
      
      //move snake back by one car
      this.snakes[i].front -= car_length
      
      /*//TODO split into many,if speed increases!
      let new_speed = this.snakes[i].get_speed()
      if (old_speed < new_speed) {
        //iterate through cars from 0 to len-1; whenever a car is slower then the snake infront, split!
      }*/
      
      
      return new Snake(removed_car, this.snakes[i].front + car_length) //plus car_length, as snake[i] already moved back!
    }
  }
  
  pop_last_car_from_snake(i) {
    if (this.snakes[i].cars.length == 1) {
      return this.pop_snake(i)
    } else {
      let removed_car = this.snakes[i].cars.pop()

      return new Snake(removed_car, this.snakes[i].rear() ) //not +car_Len, as already rear further forward because of pop()
    }
  }
  
  pop_car_from_snake(snake_i, car_i) {
    if (car_i >= this.snakes[snake_i].cars.length -1 || car_i <= 0) {
      print("CAR ",car_i," DOESNT EXIST; also 0 and len-1 are not allowed  len=", this.snakes[snake_i].cars.length)
      return null
    }
    
    
    if (this.snakes[snake_i].cars.length == 1) {
      return this.pop_snake(snake_i)
    } else {
      let cars_infront = subset(this.snakes[snake_i].cars,0,car_i)
      let cars_behind = subset(this.snakes[snake_i].cars, car_i+1, this.snakes[snake_i].cars.length)
      let middle_car = this.snakes[snake_i].cars[car_i]
      
      let snake_behind = new Snake(cars_behind[0], this.snakes[snake_i].front - car_length * (car_i+1))
      snake_behind.cars = cars_behind
      let snake_overtaker = new Snake(middle_car, this.snakes[snake_i].front - car_length * car_i)
      
      this.snakes[snake_i].cars = cars_infront
      

      return [snake_behind, snake_overtaker]
    }
  }
  
  
  pop_snake(i) {
    let removed_element = this.snakes[i]
    this.snakes = concat(
      subset(this.snakes,0,i),
      subset(this.snakes, i+1, this.snakes.length)
    )
    return removed_element
  }
  
  insert_snake_at_right_position(snake) {
    
    if (this.snakes.length == 0) {
      //print("insert as first element")
      this.snakes = [snake]
      return true
    }
    
    let insert_i = null
    let insert_inner_outer = null
    
    for (let i = 0; i < this.snakes.length; i++) {
      
      if (this.snakes[i].rear() >= snake.front) {
        if (i > 0) {
          if (this.snakes[i-1].front <= snake.rear()) {
            //print("insert at " + str(i) + "(inner)")
            insert_i = i
            insert_inner_outer = "inner"
            
            this.snakes = splice(this.snakes, snake, i)
            return true
          }
        } else {
          //print("insert at " + str(i))
          insert_i = i
          insert_inner_outer = "outer"
          
          this.snakes = splice(this.snakes, snake, i)
            return true
        }
      }
    }
    
    if (this.snakes[this.snakes.length-1].front <= snake.rear()) {
      this.snakes = concat(this.snakes, [snake])
      return true
    }
    
    //print debug info!
    print("insert info:")
    print(this.snakes)
    print(snake, "rear",snake.rear())
    print("insert at " + str(insert_i) + " ("+ str(insert_inner_outer)+")")
    return false
  }
  
  move_snakes() {
    for (let i = 0; i < this.snakes.length; i++) {
      this.snakes[i].update()
    }
  }
  
  move_snakes_and_split() {
    this.snakes[i].update()
    //= this.front += this.get_speed() * deltaTime / 1000
    
    
  }
    
    /*for (let lane_i = 0; lane_i < lanes.length -1; lane_i++) {
    for (let snake_i = 0; snake_i < lanes[lane_i].snakes.length; snake_i++) {
      
      
        
           
          
            print("split up snake here!")
            let cars_infront_faster = subset(lanes[lane_i].snakes[snake_i].cars, 0, car_i)
            let cars_behind_slower = subset(lanes[lane_i].snakes[snake_i].cars, car_i, lanes[lane_i].snakes[snake_i].cars.length)
            
            let snake_behind = new Snake(null, lanes[lane_i].snakes[snake_i].front + car_length * cars_infront_faster.length)
            snake_behind.cars = cars_behind_slower
            lanes[lane_i].snakes[snake_i].cars = cars_infront_faster
            lanes[lane_i].insert_snake_at_right_position(snake_behind)
            
          }
        }
      }
    }
  }*/
  
  
  area_free(from, to) {
    for (let i = 0; i < this.snakes.length; i++) {
      // a) 
      if (from <= this.snakes[i].rear() && to > this.snakes[i].rear()) {
        return false
      }
      
      //b)
      if (from >= this.snakes[i].rear() && from < this.snakes[i].front) {
        return false
      }
    }
    return true
  }
  
  
  area_blocked(from, to) {
    for (let i = 0; i < this.snakes.length; i++) {
      
      // a) 
      if (from <= this.snakes[i].rear() && to > this.snakes[i].rear()) {
        return true
      }
      
      //b)
      if (from >= this.snakes[i].rear() && from < this.snakes[i].front) {
        return true
      }
    }
    return false
  }
  
  insert_new_car(new_speed) {
    this.snakes = splice(this.snakes, [new Snake(new_speed, 0.0)], 0)
  }
  
  remove_far_gone_ones(road_end) {
    let removed_cars = 0
    
    let last_i = this.snakes.length -1
    while (last_i >= 0 && this.snakes[last_i].rear() > road_end) {
      let despawned_snake = this.snakes.pop()
      last_i = this.snakes.length -1
      removed_cars += despawned_snake.cars.length
    }
    return removed_cars
  }
  
  draw(y) {
    stroke("#D8D2C2")
    strokeWeight(1)
    //drawingContext.setLineDash([10, 10]);
    noFill()
    rect(-20,y-10,width+40,20)

    noStroke();
    fill("#D8D2C2");
    for (let i = this.snakes.length - 1; i >= 0 ; i--) {
      this.snakes[i].draw(y)
    }
  }
  
  
  
}


class Car {
  constructor(target_speed) {
    this.target_speed = target_speed
    //type?
  }
  
  draw(front_pos, y) {
    let rear = front_pos - car_length
    //rect(rear * x_meters_to_pxl,-7, car_length * x_meters_to_pxl,14)
    //draw 1px smaller on both sides
    rect((rear+1) * x_meters_to_pxl,y-7, (car_length-2) * x_meters_to_pxl,14)
  }
}


class Snake {
  
  constructor(car, front) {
    this.front = front
    this.cars = [car]
  }
  
  rear() {
    return this.front - car_length * this.cars.length
  }
  
  update() {
    this.front += this.get_speed() * deltaTime / 1000
  }
  
  draw(y) {
    for (let i = 0; i < this.cars.length; i++) {
         this.cars[i].draw(this.front - car_length*i,y)
    }
  }
  
  get_speed() {
    return this.cars[0].target_speed
  }
}




let slider_min_cd
let slider_max_cd
let slider_min_speed
let slider_ev_speed

function spawn_addlane_buttons() {
  let button_add = createButton('add lane');
  button_add.position(10, 124);
  button_add.mousePressed(addLane);
  //describe('');
  
  let button_pop = createButton('remove lane');
  button_pop.position(80, 124);
  button_pop.mousePressed(removeLane);
  //describe('');
  
  
  slider_min_cd = createSlider(0, 4, 0.1, 0.1);
  slider_min_cd.position(40, 40);
  slider_min_cd.size(80);
  
  slider_max_cd = createSlider(0, 4, 2.0, 0.1);
  slider_max_cd.position(162, 40);
  slider_max_cd.size(80);
  
  
  //both in kmh
  slider_min_speed = createSlider(10, 100, 60, 10);
  slider_min_speed.position(40, 90);
  slider_min_speed.size(60);
  
  slider_ev_speed = createSlider(10, 200, 100, 10);
  slider_ev_speed.position(125, 90);
  slider_ev_speed.size(100);

  
}



function update_configs() {
  min_car_cooldown = min(slider_min_cd.value(), slider_max_cd.value())
  max_car_cooldown = max(slider_min_cd.value(), slider_max_cd.value())
  
  fill("#B17457")
  textSize(12)
  text("spawn a car every: " + str(min_car_cooldown)+ " to "+ str(max_car_cooldown) + " sec",0,-264)
  text("min:", 0, -244)
  text("max:", 120, -244)
  
  min_car_speed_ms = slider_min_speed.value() * 0.27778
  expected_car_speed_ms = slider_ev_speed.value() * 0.27778
  expected_car_speed_ms = max(min_car_speed_ms, expected_car_speed_ms)
  
  let diff1 = expected_car_speed_ms - min_car_speed_ms
  text("car target speed: " + str(round(min_car_speed_ms * 3.6))+ "km/h to "+ str(round((expected_car_speed_ms+diff1) * 3.6) ) + "km/h with μ="+ str(round(expected_car_speed_ms * 3.6)) + "km/h",0,-214)
  text("min:", 0, -194)
  text("μ:", 100, -194)
  
  
  
}



function draw_analytics() {
  textSize(20);
  fill("#A27B5C")
  let carcount = 0
  let snakecount = 0
  for (let lane_i = 0; lane_i < lanes.length; lane_i++) {
    snakecount += lanes[lane_i].snakes.length
    for (let snakei = 0; snakei < lanes[lane_i].snakes.length; snakei++) {
      carcount += lanes[lane_i].snakes[snakei].cars.length
    }
  }
  text("Cars:       " + str(carcount),550,-250)
  text("'Snakes': " + str(snakecount),550,-230)
  
  
  while(!recent_despawns.length==0 && recent_despawns[0][0] < run_time -10 ) {
    recent_despawns = subset(recent_despawns,1,recent_despawns.length)
  }
  while(!recent_spawns.length==0 && recent_spawns[0] < run_time -10 ) {
    recent_spawns = subset(recent_spawns,1,recent_spawns.length)
  }
  
  let despawned_sum =0

  for (let i = 0; i < recent_despawns.length; i++) {
    despawned_sum += recent_despawns[i][1]
  }
  //print(recent_despawns)
  
  text("Throughput last 10s:",550,-200)
  textSize(16);
  text("spawned:     " + str(round(recent_spawns.length/10.0,1)) + " cars/s",550,-180)
  text("despawned: " + str(round(despawned_sum/10.0,1)) + " cars/s",550,-162)
  //text(str(run_time),600,-210)
}

function addLane() {
  if (lanes.length >= 8) {
    return
  }
  lanes = concat(lanes, new Lane())
  snake_spawn_countdown.push(0)
}

function removeLane() {
  if (lanes.length <= 1) {
    return
  }
  lanes = subset(lanes, 0, lanes.length-1)
  snake_spawn_countdown.pop()
}