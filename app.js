var imageDataArray = [];
var RGBA = 4; //4 for each rgba channel
var canvasCount = 25;

// Change canvasCount for phones to improve performance
if(window.screen.width < 481){
	canvasCount = 15;
}

function snap(){
	console.log(canvasCount);
  html2canvas($(".content")[0], {
  scale:1
}).then(canvas => {
    //capture all div data as image
    ctx = canvas.getContext("2d");
    var imageData = ctx.getImageData(0, 0, canvas.width, canvas.height);
    var pixelArr = imageData.data;
    createBlankImageData(imageData);
    //put pixel info to imageDataArray (Weighted Distributed)
    for (let i = 0; i < pixelArr.length; i+=RGBA) {
      //find the highest probability canvas the pixel should be in
      let p = Math.floor((i/pixelArr.length) *canvasCount);
      // Make a point to the most probable canvas in the array
      let a = imageDataArray[weightedRandomDistrib(p)];
      // Add those pixels into the array
      for(let batch=0; batch<RGBA; batch++){
      	a[i+batch] = pixelArr[i + batch];	//put in each of the rgba pixels into the array sequentially
      };
    }
    //create canvas for each imageData and append to target element
    for (let i = 0; i < canvasCount; i++) {
      let c = newCanvasFromImageData(imageDataArray[i], canvas.width, canvas.height);
      c.classList.add("dust");
      $(".content").append(c);
    }
    // clear all children except the canvas. Fade and not remove so doesnt mess up margins during animation
    $(".content").children().not(".dust").fadeTo(1500, 0);
    // apply animation
    // Fade to so doesn't mess up margins during animation
    $(".upload").fadeTo(500,0);
    $(".dust").each(function(index){
      animateBlur($(this),0.8,600);
      setTimeout(() => {
        animateTransform($(this),100,-100,chance.integer({ min: -0.2*Math.pow(index,1.3), max: 0.2*Math.pow(index,1.3) }),1200+(110*index));
      }, 70*index); 
      //remove the canvas from DOM tree when faded
      $(this).delay(50*index).fadeOut((150*index)+800,"easeInQuint");
    });

    // create the promise to handle the reappearance after the snapping is complete
    $(".dust").promise().done(()=>{
    	// finally remove once animations are complete
    	$(".upload").remove();
    	$(".content").remove();
    	// $('#refresh-btn').css('display', 'flex');
    	$('#refresh-btn').fadeIn(1000);
    })
    // $(".upload").fadeTo(500,1);
  })
}

var loadFile = function(event) {
	var image = document.getElementById('output');
	image.src = URL.createObjectURL(event.target.files[0]);
};

function weightedRandomDistrib(peak) {
  var prob = [], seq = [];
  for(let i=0;i<canvasCount;i++) {
    prob.push(Math.pow(canvasCount-Math.abs(peak-i),3));
    seq.push(i);
  }
  return chance.weighted(seq, prob);
}


function animateBlur(elem,radius,duration) {
  var r =0;
  $({rad:0}).animate({rad:radius}, {
      duration: duration,
      easing: "easeOutQuad",
      step: function(now) {
        elem.css({
              filter: 'blur(' + now + 'px)'
          });
      }
  });
}

function animateTransform(elem,sx,sy,angle,duration) {
  var td = tx = ty =0;
  $({x: 0, y:0, deg:0}).animate({x: sx, y:sy, deg:angle}, {
      duration: duration,
      easing: "easeInQuad",
      step: function(now, fx) {
        if (fx.prop == "x") 
          tx = now;
        else if (fx.prop == "y") 
          ty = now;
        else if (fx.prop == "deg") 
          td = now;
        elem.css({
              transform: 'rotate(' + td + 'deg)' + 'translate(' + tx + 'px,'+ ty +'px)'
          });
      }
  });
}

function createBlankImageData(imageData) {
  for(let i=0;i<canvasCount;i++)
  {
    let arr = new Uint8ClampedArray(imageData.data);
    for (let j = 0; j < arr.length; j++) {
        arr[j] = 0;
    }
    imageDataArray.push(arr);
  }
}

function newCanvasFromImageData(imageDataArray ,w , h) {
  var canvas = document.createElement('canvas');
      canvas.width = w;
      canvas.height = h;
      tempCtx = canvas.getContext("2d");
      tempCtx.putImageData(new ImageData(imageDataArray, w , h), 0, 0);
      
  return canvas;
}