// Check what wheel-event is supported by the browser
var wheelEvt = "onwheel" in document.createElement("div") ? "wheel" :	// Modern browsers support "wheel"
	document.onmousewheel !== undefined ? "mousewheel" :				// Webkit and IE support at least "mousewheel"
	"DOMMouseScroll";													// let's assume that remaining browsers are older Firefox

// Add event listener in order to fire the MouseWheelHandler() function on mouse wheel events.
if (document.addEventListener) {
	document.addEventListener(wheelEvt, MouseWheelHandler(), false);
	document.addEventListener('contextmenu', event => event.preventDefault(), false);
	document.addEventListener('click', MouseButtonHandler(), false);

	if (typeof(eval('window.TouchEvent')) != 'undefined') {
		console.log('Detected TouchEvent support.');
		var el = document.getElementById('output');
		var hammertime = Hammer(el);
		
		hammertime.get('swipe').set({ direction: Hammer.DIRECTION_ALL });
		
		hammertime.on('swipe tap', function(ev) {
			var direction = '';
			
			if (ev.type == 'swipe') {
			    switch(ev.direction) {
			    	case Hammer.DIRECTION_LEFT:
						PreviousStream();
						PlayStream(true);
			    		break;
			    	case Hammer.DIRECTION_RIGHT:
						NextStream();
						PlayStream(true);
			    		break;
			    	case Hammer.DIRECTION_UP:
						VolumeUp();
			    		break;
			    	case Hammer.DIRECTION_DOWN:
						VolumeDown();
			    		break;
			    }
			}
			
			if (ev.type == 'tap') {
				// Toggle stream
				if (audioObj.paused) {
					PlayStream();
				} else {
					PauseStream();
				}
				
				// Toggle animation
				toggleAnimation();
			}
			
		    console.log(ev.type + ' ' + direction);
		});
	} else {
		console.log('TouchEvent not supported.');
	}
} else {
	console.log('This requires a modern browser (no IE8 or older crap).');
}

// Position where the touch event starts.
var xDown = null;                                                        
var yDown = null; 

// List of audio stream servers
var stations = [{
		name: 'Technomania',
		url : 'http://stream.nauticradio.net:14240/;stream.mp3'
	},{
		name: 'Breaks and Beats',
		url: 'http://stream.nauticradio.net:14280/;stream.mp3'
	},{
		name: 'Zwarte Hemel show',
		url: 'http://stream.nauticradio.net:14220/;stream.mp3'
	},{
		name: 'Next Movement',
		url: 'http://stream.nauticradio.net:14230/;stream.mp3'
	},{
		name: 'Voodoo Gospels',
		url: 'http://stream.nauticradio.net:14260/;stream.mp3'
	}];

// Get previous listened station index or default to first station in list.
var i = getCookie('station');
if (i == null || typeof(stations[i]) == 'undefined' || typeof(stations[i].url) == 'undefined') {
	i = 0;
}

// Object of the HTML audio element
var audioObj = document.getElementById('livestream');

// Object of the stream title
var stationObj = document.getElementById('station');

// Object of the audio volume
var volumeObj = document.getElementById('volume');

// Initialize the stream
if (audioObj.paused || audioObj.currentTime == 0) {
	PlayStream();
}


/************************
	Required functions
************************/

// Set a cookie.
function setCookie(name, value, days) {
	var expires = '';
	
	if (typeof(days) != 'undefined') {
		var date = new Date();
		date.setTime(date.getTime() + (days * 24 * 60 * 60 * 1000));
		expires = '; expires=' + date.toGMTString();
	}
	
	document.cookie = name + '=' + value + expires + '; path=/';
	
	return false;
}// END: setCookie()

// Read a cookie and return its value.
function getCookie(name) {
	var nameEQ = name + '=';
	var ca = document.cookie.split(';');
	
	for (var i = 0; i < ca.length; i++) {
		var c = ca[i];
		while (c.charAt(0) == ' ') {
			c = c.substring(1, c.length);
		}
		
		if (c.indexOf(nameEQ) == 0) {
			return c.substring(nameEQ.length,c.length);
		}
	}
	
	return null;
}// END: getCookie()


// Delete a cookie.
function deleteCookie(name) {
	setCookie(name, '', -1);
	return false;
}// END: deleteCookie()


function NextStream() {
	i++;
	
	// If reaching the end of the list, then flip over to the beginning.
	if (typeof(stations[i]) == 'undefined') {
		i = 0;
    }
	
	return false;
}// END: NextStream()


function PreviousStream() {
	i--;
	
	// If reaching the beginning of the list, then flip over to its end.
	if (typeof(stations[i]) == 'undefined') {
    	i = stations.length - 1;
    }
	
	return false;
}// END: PreviousStream()


function VolumeDown() {
	var vol = audioObj.volume.toPrecision(2);
	
	if (vol <= 0) {
		vol = 0;
	} else {
		vol = parseFloat(vol) - parseFloat(0.1);
	}
	
	audioObj.volume = vol;
	showVolume();
	return false;
}// END: VolumeDown();


function VolumeUp() {
	var vol = audioObj.volume.toPrecision(2);

	if (vol >= 1) {
		vol = 1;
	} else {
		vol = parseFloat(vol) + parseFloat(0.1);
	}
	
	audioObj.volume = vol;
	showVolume();
	return false;
}// END: VolumeDown();


function showVolume() {
	var vol = audioObj.volume.toPrecision(2) * 100;
	volumeObj.innerHTML = ' at ' + vol + '% volume';
}// END: showVolume()


function PauseStream() {
	if (audioObj.paused) {
		return false;
	} else {
		audioObj.pause();
		stationObj.innerHTML = 'paused <a href="http://www.nauticradio.net" target="_blank" rel="noreferrer">' + stations[i].name + '</a>';
	}
}// END: PauseStream()


function PlayStream(pause) {
	// Pause the audio object, set a a new stream URL and continue playing.
	if (typeof(pause) != 'undefined' && pause == true) {
		audioObj.pause();
	}
	
	audioObj.src = stations[i].url;
	audioObj.play();
	
	// Store the current station id in a cookie in order to automatically play that station on page (re)load.
	setCookie('station', i);
	
	// Show which station is playing.
	stationObj.innerHTML = 'playing <a href="http://www.nauticradio.net" target="_blank" rel="noreferrer">' + stations[i].name + '</a>';
	showVolume();
	return false;
}// END: PlayStream()


function toggleAnimation() {
	if (document.getElementById('playground').offsetParent === null) {
		// Show animation
		document.getElementById('playground').style.display = 'inline';
		document.getElementById('spin').style.display = 'inline';
	} else {
		// Hide animation
		document.getElementById('playground').style.display = 'none';
		document.getElementById('spin').style.display = 'none';
	}

	return false;
}// END: toggleAnimation()


// Cross-browser mouse button handler.
function MouseButtonHandler() {
	return function(e) {
		var e = window.event || e;
		e.preventDefault();
        e.stopPropagation();
        
		// Check which mouse button has been clicked ...
		if (!e.which && e.button) {
			if (e.button & 1) {
				e.which = 1;	// Left
			} else if (e.button & 4) {
				e.which = 2;	// Middle
			} else if (e.button & 2) {
				e.which = 3;	// Right
			}
		}
		
		// ... and decide what to do on which button click.
		switch(e.which) {
			case 1:
				// Toggle stream
				if (audioObj.paused) {
					PlayStream();
				} else {
					PauseStream();
				}
				
				// Toggle animation
				toggleAnimation();
				break;
				
			case 2:
				// Just toggle the animation
				toggleAnimation();
				break;
				
			case 3:
				// Just toggle the animation
				toggleAnimation();
				break;
		}
		return false;
	}
}// END: MouseButtonHanlder()


// Cross-browser mouse wheel handler.
function MouseWheelHandler() {
	return function(e) {
		// Grab wheel delta.
		var e = window.event || e;
		
		if (e.deltaY < 0) {
			// Scrolling down.
			VolumeDown();
		} else if (e.deltaY > 0) {
			// Scrolling up.
			VolumeUp();
		}
		
		if (e.deltaX < 0) {
			// Scrolling left.
			PreviousStream();
			PlayStream(true);
		} else if (e.deltaX > 0) {
			// Scrolling right.
			NextStream();
			PlayStream(true);
		}
		
		return false;
	}
}// END: MouseWheelHandler()