
function vec_diff(p1,p2) {
    var neg_p2 = p5.Vector.mult(p2,-1)
    var diff = p5.Vector.add(p1, neg_p2)
    return diff
}

function distance(p1,p2) {
    var diff = vec_diff(p1,p2)
    return diff.mag();
}
  
function intersection_2d_lines(origin1, direction1, origin2, direction2) {
    // Unpack the points
    let x1 = origin1.x, y1 = origin1.y;
    let dx1 = direction1.x, dy1 = direction1.y;
    let x3 = origin2.x, y3 = origin2.y;
    let dx2 = direction2.x, dy2 = direction2.y;
    
    // Calculate the denominator
    let denom = dx1 * dy2 - dy1 * dx2;
    
    // Lines are parallel if denominator is 0
    if (denom === 0) {
        return null;
    }
    
    // Calculate the values of t and u
    let t = ((x3 - x1) * dy2 - (y3 - y1) * dx2) / denom;
    
    // Calculate the intersection point
    let ix = x1 + t * dx1;
    let iy = y1 + t * dy1;
    
    return createVector(ix, iy);
}



  
function linev(p1,p2) {
    line(p1.x,p1.y,p2.x,p2.y)
}
  
  
function orth_2dvec(vec, flip=false) {
    if (flip) {
        return createVector(vec.y,-vec.x)
    }
    return createVector(-vec.y,vec.x)
}