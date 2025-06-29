function vec_diff(p1,p2) {
    var neg_p2 = p5.Vector.mult(p2,-1)
    var diff = p5.Vector.add(p1, neg_p2)
    return diff
  }
  
  function distance(p1,p2) {
    var diff = vec_diff(p1,p2)
    return diff.mag();
  }

  function print_array_line(arr) {
    var result = "["
    for (let i = 0;i< arr.length; i++) {
        result += str(arr[i]) +"; "
    }
    print(result.substring(0,result.length-2) + "]")
  }