//////////////////////////
// Class ImagePreloader //
//////////////////////////

/* broadcasts
	onImageLoad - event Object - img url string
	onAllImagesLoad + event Object - array of imgs url string
*/

function ImagePreloader(imgUrlArray) {
	this.imgUrlArray=imgUrlArray;
	this.imgPreloadingIndex=0;
	this.isPreloading=false;
	this.preloadInterval=null;
	this.imageIsPreloaded=false;
}

ImagePreloader.prototype=implementsInterface(Observable);

ImagePreloader.prototype.preload=function() {
	
	var obj=this;
	if (this.imgPreloadingIndex>=this.imgUrlArray.length) return; 
	this.preloadInterval=window.setInterval(function () {
		if (obj.imageIsPreloaded===false && obj.isPreloading==false) {
			obj.preloadImage(obj.imgPreloadingIndex);
			return;
		}
		if (obj.imgPreloadingIndex==(obj.imgUrlArray.length-1)) {
			window.clearInterval(obj.preloadInterval);
		} else {
			if (obj.imageIsPreloaded===true) {
				obj.imgPreloadingIndex++;
				obj.preloadImage(obj.imgPreloadingIndex);
			}
		}
													  
	}, 150);	
}

ImagePreloader.prototype.preloadImage=function (imageNum) {
	var obj=this;
	this.isPreloading=true;
	var img=new Image();
	this.imageIsPreloaded=false;
	img.onload=img.onerror=function () {
		obj.notifyListeners("onImageLoad",obj.imgUrlArray[obj.imgPreloadingIndex]);
		obj.imageIsPreloaded=true;
		if ((obj.imgUrlArray.length-1)==obj.imgPreloadingIndex) {
			obj.notifyListeners("onAllImagesLoad",obj.imgUrlArray);
		}
	}
	img.src=this.imgUrlArray[imageNum];
}

ImagePreloader.prototype.start=function () {
	this.preload();
}

ImagePreloader.prototype.stop=function () {
	this.isPreloading=false;
	this.imageIsPreloaded=false;
	if (this.preloadInterval!==null) {
		window.clearInterval(this.preloadInterval);
		this.preloadInterval=null;
	}
	return this.imgUrlArray.slice(this.imgPreloadingIndex+1);
}

///////////////////////////
// class SlidesPreloader //
///////////////////////////

/* 
data= [string filenames]
*/

// broadcasts onImageLoad(fileName)

function SlidesPreloader(data) {
	this.slidesCue=data;
	this.loadedSlides=[];
	this.preloader=null;
}

SlidesPreloader.prototype=implementsInterface(Observable);

SlidesPreloader.prototype.startPreload=function () {
	if (this.slidesCue.length==0) return;
	if (this.preloader != null && this.preloader.isPreloading) this.preloader.stop();
	this.preloader=new ImagePreloader(this.slidesCue);
	this.preloader.addListener(this);
	this.preloader.start();
}

SlidesPreloader.prototype.startPreloadSlide=function (imageFile) {
	var preloadsLeft;
	var slideCue=[];	
	if (this.isInArray(this.slidesCue,imageFile)===false) return;
	if (this.preloader !== null && this.preloader.isPreloading) this.preloader.stop();
	slideCue.push(imageFile);
	if (this.preloader !== null) {
		this.preloader.removeListener(this);
	}
	this.preloader=new ImagePreloader(slideCue);
	this.preloader.addListener(this);
	this.preloader.start();
}

SlidesPreloader.prototype.isLoaded=function (imageFile) {
	if (this.isInArray(this.loadedSlides,imageFile)) return true;
	return false;
}

SlidesPreloader.prototype.onImageLoad=function (imageFile) {
	this.firstSlidesCue=this.removeFromArray(this.slidesCue,imageFile);
	this.loadedSlides.push(imageFile);
	this.notifyListeners("onImageLoad",imageFile);
}

SlidesPreloader.prototype.removeFromArray=function (array,element) {
	var index=null;
	var newArray=[];
	for (var i=0; i<array.length; i++) {
		if (array[i]==element) {
			index=i;
			break;
		}
	}
	if (index!==null) {
		newArray=array.slice(0,index);
		newArray=newArray.concat(array.slice(index+1));
		return newArray;
	} else {
		return array;
	}
}

SlidesPreloader.prototype.isInArray=function (array,element) {
	for (var i=0; i<array.length; i++) {
		if (array[i]==element) return true;
	}
	return false;
}

///////////////////////
// Package Animation //
///////////////////////

Animation= new Object();

Animation.FRAME_RATE=50; // miliseconds

//////////////////////////
// Class Animation.Fade //
//////////////////////////

Animation.Fade=function (fadeObject, currentOpacityPercentage) {
	this.fadeObject=fadeObject;
	this.currentOpacityPercentage=currentOpacityPercentage;
	this.interval=null;
	this.targetOpacityPercentage=null;
	this.currentAnimationStep=null;
	this.numOfAnimationSteps=null;
	DHTMLApi.Visibility.setOpacity(this.fadeObject,Math.round(this.currentOpacityPercentage));
}

Animation.Fade.prototype=implementsInterface(Observable);

Animation.Fade.prototype.setFade=function (targetOpacityPercentage, numOfSteps) {
	this.stop();
	var animationObject=this;
	this.targetOpacityPercentage=targetOpacityPercentage;
	this.opacityStep=1.0*(targetOpacityPercentage-this.currentOpacityPercentage)/numOfSteps;
	this.numOfAnimationSteps=numOfSteps;
	this.currentAnimationStep=0;
	this.notifyListeners("onAnimationStart",null);
	this.animate();
	this.interval=window.setInterval(function() {animationObject.animate()},Animation.FRAME_RATE);
}

Animation.Fade.prototype.animate=function () {
	if (this.currentAnimationStep<this.numOfAnimationSteps) {
		this.currentOpacityPercentage+=this.opacityStep;
		DHTMLApi.Visibility.setOpacity(this.fadeObject,Math.round(this.currentOpacityPercentage));
		this.notifyListeners("onAnimationStep",this.currentAnimationStep);
		++this.currentAnimationStep;
		return this.numOfAnimationStep;
	} else {
		this.currentOpacityPercentage=this.targetOpacityPercentage;
		DHTMLApi.Visibility.setOpacity(this.fadeObject,Math.round(this.currentOpacityPercentage));
		this.notifyListeners("onAnimationStep",this.currentAnimationStep);
		window.clearInterval(this.interval);
		this.interval=null;
		this.notifyListeners("onAnimationEnd",null);
		this.numOfAnimationStep=null;
		return false;
	}
}

Animation.Fade.prototype.stop=function() {
	if (this.interval!==null) {
		window.clearInterval(this.interval);
		this.interval=null;
		this.notifyListeners("onAnimationEnd",null);
	}
}

Animation.Fade.prototype.isPlaying=function () {
	if (this.interval!==null) return true;
	return false;
}

/////////////////////////////////
// Class Animation.SmoothHMove //
/////////////////////////////////

Animation.SmoothHMove=function(movingObject, relativeToObject) {
	this.movingObject=movingObject;
	this.relativeToObject=relativeToObject;
	this.currentXPos=DHTMLApi.Position.getXPosInElement(movingObject,relativeToObject);
	this.targetXPos=null;
	this.interval=null;
	this.numOfAnimationStep=null;
}

Animation.SmoothHMove.prototype=implementsInterface(Observable);

Animation.SmoothHMove.prototype.setPosition=function (targetPosition) {
	if (this.interval!==null) {
		window.clearInterval(this.interval);
		this.interval=null;
		this.notifyListeners("onAnimationEnd",null);
	}
	var animationObject=this;
	this.targetXPos=targetPosition;
	this.numOfAnimationStep=0;
	this.notifyListeners("onAnimationStart",null);
	this.animate();
	this.interval=window.setInterval(function() {animationObject.animate()},Animation.FRAME_RATE);
}

Animation.SmoothHMove.prototype.animate=function () {
	var stepDistance=(this.targetXPos-this.currentXPos)/3;
	if (Math.abs(stepDistance)>0.3) {
		this.currentXPos+=stepDistance;
		DHTMLApi.Position.setXPos(this.movingObject, this.currentXPos, this.relativeToObject);
		++this.numOfAnimationStep;
		this.notifyListeners("onAnimationStep",this.numOfAnimationSteps);
		return this.numOfAnimationStep;
	} else {
		this.currentXPos=this.targetXPos;
		DHTMLApi.Position.setXPos(this.movingObject, this.currentXPos, this.relativeToObject);
		this.notifyListeners("onAnimationStep",++this.numOfAnimationSteps);
		window.clearInterval(this.interval);
		this.interval=null;
		this.notifyListeners("onAnimationEnd",null);
		this.numOfAnimationStep=null;
		return false;
	}
}

Animation.SmoothHMove.prototype.getAnimationStep=function () {
	return this.numOfAnimationStep;
}

Animation.SmoothHMove.prototype.stop=function() {
	if (this.interval!==null) {
		window.clearInterval(this.interval);
		this.interval=null;
		this.notifyListeners("onAnimationEnd",null);
	}
}

Animation.SmoothHMove.prototype.isPlaying=function () {
	if (this.interval!==null) return true;
	return false;
}

/////////////////////////////////
// Class Animation.SmoothVMove //
/////////////////////////////////

Animation.SmoothVMove=function(movingObject, relativeToObject) {
	this.movingObject=movingObject;
	this.relativeToObject=relativeToObject;
	this.currentYPos=DHTMLApi.Position.getYPosInElement(movingObject,relativeToObject);
	this.targetYPos=null;
	this.interval=null;
	this.numOfAnimationStep=null;
}

Animation.SmoothVMove.prototype=implementsInterface(Observable);

Animation.SmoothVMove.prototype.setPosition=function (targetPosition) {
	if (this.interval!==null) {
		window.clearInterval(this.interval);
		this.interval=null;
		this.notifyListeners("onAnimationEnd",null);
	}
	var animationObject=this;
	this.targetYPos=targetPosition;
	this.numOfAnimationStep=0;
	this.notifyListeners("onAnimationStart",null);
	this.animate();
	this.interval=window.setInterval(function() {animationObject.animate()},Animation.FRAME_RATE);
}

Animation.SmoothVMove.prototype.animate=function () {
	var stepDistance=(this.targetYPos-this.currentYPos)/3;
	if (Math.abs(stepDistance)>0.3) {
		this.currentYPos+=stepDistance;
		DHTMLApi.Position.setYPos(this.movingObject, this.currentYPos, this.relativeToObject);
		++this.numOfAnimationStep;
		this.notifyListeners("onAnimationStep",this.numOfAnimationSteps);
		return this.numOfAnimationStep;
	} else {
		this.currentYPos=this.targetYPos;
		DHTMLApi.Position.setYPos(this.movingObject, this.currentYPos, this.relativeToObject);
		this.notifyListeners("onAnimationStep",++this.numOfAnimationSteps);
		window.clearInterval(this.interval);
		this.interval=null;
		this.notifyListeners("onAnimationEnd",null);
		this.numOfAnimationStep=null;
		return false;
	}
}

Animation.SmoothVMove.prototype.getAnimationStep=function () {
	return this.numOfAnimationStep;
}

Animation.SmoothVMove.prototype.stop=function() {
	if (this.interval!==null) {
		window.clearInterval(this.interval);
		this.interval=null;
		this.notifyListeners("onAnimationEnd",null);
	}
}

Animation.SmoothVMove.prototype.isPlaying=function () {
	if (this.interval!==null) return true;
	return false;
}

///////////////////////////////////
// Class Animation.SmoothHResize //
///////////////////////////////////

Animation.SmoothHResize=function(resizeObject) {
	this.resizeObject=resizeObject;
	this.currentWidth=DHTMLApi.Size.getElementWidth(resizeObject);
	this.targetWidth=null;
	this.interval=null;
	this.numOfAnimationStep=null;
}

Animation.SmoothHResize.prototype=implementsInterface(Observable);

Animation.SmoothHResize.prototype.setSize=function (targetWidth) {
	if (this.interval!==null) {
		window.clearInterval(this.interval);
		this.interval=null;
		this.notifyListeners("onAnimationEnd",null);
	}
	var animationObject=this;
	this.targetWidth=targetWidth;
	this.numOfAnimationStep=0;
	this.notifyListeners("onAnimationStart",null);
	this.animate();
	this.interval=window.setInterval(function() {animationObject.animate()},Animation.FRAME_RATE);
}

Animation.SmoothHResize.prototype.animate=function () {
	var stepWidth=(this.targetWidth-this.currentWidth)/3;
	if (Math.abs(stepWidth)>0.3) {
		this.currentWidth+=stepWidth;
		DHTMLApi.CSS.setProperties(this.resizeObject,{width: this.currentWidth+"px", overflow: "hidden"});
		++this.numOfAnimationStep;
		this.notifyListeners("onAnimationStep",this.numOfAnimationSteps);
		return this.numOfAnimationStep;
	} else {
		this.currentWidth=this.targetWidth;
		DHTMLApi.CSS.setProperties(this.resizeObject,{width: this.currentWidth+"px", overflow: "hidden"});
		this.notifyListeners("onAnimationStep",++this.numOfAnimationSteps);
		window.clearInterval(this.interval);
		this.interval=null;
		this.notifyListeners("onAnimationEnd",null);
		this.numOfAnimationStep=null;
		return false;
	}
}

Animation.SmoothHResize.prototype.getAnimationStep=function () {
	return this.numOfAnimationStep;
}

Animation.SmoothHResize.prototype.stop=function() {
	if (this.interval!==null) {
		window.clearInterval(this.interval);
		this.interval=null;
		this.notifyListeners("onAnimationEnd",null);
	}
}

Animation.SmoothHResize.prototype.isPlaying=function () {
	if (this.interval!==null) return true;
	return false;
}

///////////////////////////////////
// Class Animation.SmoothVResize //
///////////////////////////////////


Animation.SmoothVResize=function(resizeObject) {
	this.resizeObject=resizeObject;
	this.currentHeight=DHTMLApi.Size.getElementHeight(resizeObject);
	this.targetHeight=null;
	this.interval=null;
	this.numOfAnimationStep=null;
}

Animation.SmoothVResize.prototype=implementsInterface(Observable);

Animation.SmoothVResize.prototype.setSize=function (targetHeight) {
	if (this.interval!==null) {
		window.clearInterval(this.interval);
		this.interval=null;
		this.notifyListeners("onAnimationEnd",null);
	}
	var animationObject=this;
	this.targetHeight=targetHeight;
	this.numOfAnimationStep=0;
	this.notifyListeners("onAnimationStart",null);
	this.animate();
	this.interval=window.setInterval(function() {animationObject.animate()},Animation.FRAME_RATE);
}

Animation.SmoothVResize.prototype.animate=function () {
	var stepHeight=(this.targetHeight-this.currentHeight)/3;
	if (Math.abs(stepHeight)>0.3) {
		this.currentHeight+=stepHeight;
		DHTMLApi.CSS.setProperties(this.resizeObject,{height: Math.round(this.currentHeight)+"px", overflow: "hidden"});
		++this.numOfAnimationStep;
		this.notifyListeners("onAnimationStep",this.numOfAnimationSteps);
		return this.numOfAnimationStep;
	} else {
		this.currentHeight=this.targetHeight;
		DHTMLApi.CSS.setProperties(this.resizeObject,{height: this.currentHeight+"px", overflow: "hidden"});
		this.notifyListeners("onAnimationStep",++this.numOfAnimationSteps);
		window.clearInterval(this.interval);
		this.interval=null;
		this.notifyListeners("onAnimationEnd",null);
		this.numOfAnimationStep=null;
		return false;
	}
}

Animation.SmoothVResize.prototype.getAnimationStep=function () {
	return this.numOfAnimationStep;
}

Animation.SmoothVResize.prototype.stop=function() {
	if (this.interval!==null) {
		window.clearInterval(this.interval);
		this.interval=null;
		this.notifyListeners("onAnimationEnd",null);
	}
}

Animation.SmoothVResize.prototype.isPlaying=function () {
	if (this.interval!==null) return true;
	return false;
}

/////////////////////////////
// Static Class PopUpLayer //
/////////////////////////////

PopUpLayer= {
	
	containerZIndex: 10000,
	
	init: function (popUpDivNode,backgroundCssClass,backgroundAlpha,closeButtonElement,onCloseCallback) {
		this.popUpDivNode=popUpDivNode;
		this.parentpopUpDivNode=popUpDivNode.parentNode;
		this.nextSiblingpopUpDivNode=popUpDivNode.nextSibling;
		this.popupContainerNode=null;
		this.backgroundNode=null;
		this.backgroundCssClass=backgroundCssClass;
		this.backgroundAlpha=backgroundAlpha;
		this.closeButtonElement=null;
		this.onCloseCallback=null;
		if (typeof closeButtonElement != "undefined") {
			this.closeButtonElement=closeButtonElement;
		}
		if (typeof onCloseCallback != "undefined") {
			this.onCloseCallback=onCloseCallback;
		}
		this.resizeHandler=null;
		this.closeHandler=null;
		this.closeButtonHandler=null;
		this.tempPopUpDivNodeStyles={position: DHTMLApi.CSS.getStyle(this.popUpDivNode, "position"), top: DHTMLApi.CSS.getStyle(this.popUpDivNode, "top"), left: DHTMLApi.CSS.getStyle(this.popUpDivNode, "left"), zIndex: DHTMLApi.CSS.getStyle(this.popUpDivNode, "z-index"), display: DHTMLApi.CSS.getStyle(this.popUpDivNode, "display")};
	},
	
	initHandlers: function () {
		var obj=this;
		this.resizeHandler=DOMEvent.addDomListener(window, "resize", function () {
			obj.centerOnPage();
		});
		this.closeHandler=DOMEvent.addDomListener(this.backgroundNode, "click", function () {
			obj.hide();
			if (obj.onCloseCallback!==null) (obj.onCloseCallback)();
		});
		if (this.closeButtonElement!==null) {
			this.closeButtonHandler=DOMEvent.addDomListener(this.closeButtonElement, "click", function () {
				obj.hide();
				if (obj.onCloseCallback!==null) (obj.onCloseCallback)();
			});
		}
	},
	
	removeHandlers: function () {
		DOMEvent.removeListener(this.resizeHandler);
		DOMEvent.removeListener(this.closeHandler);
		if (this.closeButtonHandler!==null) {
			DOMEvent.removeListener(this.closeButtonHandler);
		}
		this.resizeHandler=null;
		this.closeHandler=null;
		this.closeButtonHandler=null;
	},
	
	build: function () {
		var popUpNode;
		this.popupContainerNode=document.createElement("DIV");
		document.body.appendChild(this.popupContainerNode);
		if (document.documentElement) {
			DHTMLApi.CSS.setProperties(document.documentElement,{overflowX: "hidden", overflowY: "hidden"});
		} else {
			DHTMLApi.CSS.setProperties(document.body,{overflowX: "hidden", overflowY: "hidden"});
		}
		DHTMLApi.CSS.setProperties(this.popupContainerNode,{position: "absolute", top: "0px", left: "0px", width: this.getPageWidth()+"px", height: this.getPageHeight()+"px", zIndex: this.containerZIndex, overflow:"hidden"});
		this.backgroundNode=document.createElement("DIV");
		this.popupContainerNode.appendChild(this.backgroundNode);
		DHTMLApi.CSS.setProperties(this.backgroundNode,{position: "absolute", top: "0px", left: "0px", zIndex: 1, cursor: "pointer", width: "100%", height: "100%"});
		DHTMLApi.CSS.setClass(this.backgroundNode,new Array(this.backgroundCssClass),new Array());
		
		popUpNode=this.parentpopUpDivNode.removeChild(this.popUpDivNode);
		this.popupContainerNode.appendChild(popUpNode);
		DHTMLApi.CSS.setProperties(popUpNode, {position: "absolute", zIndex: 2, display: "block"});
		DHTMLApi.Visibility.setOpacity(this.backgroundNode,this.backgroundAlpha);
		this.initHandlers();
	},
	
	restorePopUpNode: function() {
		if (this.nextSiblingpopUpDivNode!==null) {
			this.parentpopUpDivNode.insertBefore(this.popUpDivNode,this.nextSiblingpopUpDivNode);
		} else {
			this.parentpopUpDivNode.appendChild(this.popUpDivNode);
		}
		
		DHTMLApi.CSS.setProperties(this.popUpDivNode,this.tempPopUpDivNodeStyles);
	},
	
	centerOnPage: function (targetWidth,targetHeight) {
		var leftPos,topPos,elementWidth,elementHeight;
		elementWidth=(typeof targetWidth=="undefined") ? DHTMLApi.Size.getElementWidth(this.popUpDivNode) : targetWidth;
		elementHeight=(typeof targetHeight=="undefined") ? DHTMLApi.Size.getElementHeight(this.popUpDivNode) : targetHeight;
		leftPos=Math.round((DHTMLApi.Browser.getViewportWidth()-elementWidth)/2+DHTMLApi.Browser.getScrollX());
		topPos=Math.round((DHTMLApi.Browser.getViewportHeight()-elementHeight)/2+DHTMLApi.Browser.getScrollY());
		if (topPos+elementHeight>DHTMLApi.Size.getPageHeight()) {
			topPos=DHTMLApi.Size.getPageHeight()-elementHeight;
		}
		DHTMLApi.CSS.setProperties(this.popUpDivNode, {left: leftPos+"px", top: topPos+"px"});
		DHTMLApi.CSS.setProperties(this.popupContainerNode, {width: DHTMLApi.Browser.getViewportWidth()+"px", height: DHTMLApi.Size.getPageHeight()+"px"});
	},
	
	display: function (popUpDivNode,backgroundCssClass,backgroundAlpha,closeButtonElement,onCloseCallback) {
		this.init(popUpDivNode,backgroundCssClass,backgroundAlpha,closeButtonElement,onCloseCallback);
		this.build();
		this.centerOnPage();
	},
	
	hide: function () {
		this.removeHandlers();
		this.restorePopUpNode();
		document.body.removeChild(this.popupContainerNode);
		if (document.documentElement) {
			DHTMLApi.CSS.setProperties(document.documentElement,{overflowX: "scroll", overflowY: "scroll"});
		} else {
			DHTMLApi.CSS.setProperties(document.body,{overflowX: "scroll", overflowY: "scroll"});
		}
	},
	
	getPageHeight: function () {
		return DHTMLApi.Size.getPageHeight();
	},
	
	getPageWidth: function () {
		return DHTMLApi.Size.getPageWidth();
	}
	
}


/*
PopUpLayer= {
	
	containerZIndex: 10000,
	
	init: function (popUpDivNode,backgroundCssClass,backgroundAlpha,closeButtonElement,onCloseCallback) {
		this.popUpDivNode=popUpDivNode;
		this.parentpopUpDivNode=popUpDivNode.parentNode;
		this.nextSiblingpopUpDivNode=popUpDivNode.nextSibling;
		this.popupContainerNode=null;
		this.backgroundNode=null;
		this.backgroundCssClass=backgroundCssClass;
		this.backgroundAlpha=backgroundAlpha;
		this.closeButtonElement=null;
		this.onCloseCallback=null;
		if (typeof closeButtonElement != "undefined") {
			this.closeButtonElement=closeButtonElement;
		}
		if (typeof onCloseCallback != "undefined") {
			this.onCloseCallback=onCloseCallback;
		}
		this.resizeHandler=null;
		this.closeHandler=null;
		this.closeButtonHandler=null;
		this.tempPopUpDivNodeStyles={position: DHTMLApi.CSS.getStyle(this.popUpDivNode, "position"), top: DHTMLApi.CSS.getStyle(this.popUpDivNode, "top"), left: DHTMLApi.CSS.getStyle(this.popUpDivNode, "left"), zIndex: DHTMLApi.CSS.getStyle(this.popUpDivNode, "z-index"), display: DHTMLApi.CSS.getStyle(this.popUpDivNode, "display")};
	},
	
	initHandlers: function () {
		var obj=this;
		this.resizeHandler=DOMEvent.addDomListener(window, "resize", function () {
			obj.centerOnPage();
		});
		this.closeHandler=DOMEvent.addDomListener(this.backgroundNode, "click", function () {
			obj.hide();
			if (obj.onCloseCallback!==null) (obj.onCloseCallback)();
		});
		if (this.closeButtonElement!==null) {
			this.closeButtonHandler=DOMEvent.addDomListener(this.closeButtonElement, "click", function () {
				obj.hide();
				if (obj.onCloseCallback!==null) (obj.onCloseCallback)();
			});
		}
	},
	
	removeHandlers: function () {
		DOMEvent.removeListener(this.resizeHandler);
		DOMEvent.removeListener(this.closeHandler);
		if (this.closeButtonHandler!==null) {
			DOMEvent.removeListener(this.closeButtonHandler);
		}
		this.resizeHandler=null;
		this.closeHandler=null;
		this.closeButtonHandler=null;
	},
	
	build: function () {
		var popUpNode;
		this.popupContainerNode=document.createElement("DIV");
		document.body.appendChild(this.popupContainerNode);
		DHTMLApi.CSS.setProperties(this.popupContainerNode,{position: "absolute", top: "0px", left: "0px", width: this.getPageWidth()+"px", height: this.getPageHeight()+"px", zIndex: this.containerZIndex, overflow:"hidden"});
		this.backgroundNode=document.createElement("DIV");
		this.popupContainerNode.appendChild(this.backgroundNode);
		DHTMLApi.CSS.setProperties(this.backgroundNode,{position: "absolute", top: "0px", left: "0px", zIndex: 1, cursor: "pointer", width: "100%", height: "100%"});
		DHTMLApi.CSS.setClass(this.backgroundNode,new Array(this.backgroundCssClass),new Array());
		
		popUpNode=this.parentpopUpDivNode.removeChild(this.popUpDivNode);
		this.popupContainerNode.appendChild(popUpNode);
		DHTMLApi.CSS.setProperties(popUpNode, {position: "absolute", zIndex: 2, display: "block"});
		DHTMLApi.Visibility.setOpacity(this.backgroundNode,this.backgroundAlpha);
		this.initHandlers();
	},
	
	restorePopUpNode: function() {
		if (this.nextSiblingpopUpDivNode!==null) {
			this.parentpopUpDivNode.insertBefore(this.popUpDivNode,this.nextSiblingpopUpDivNode);
		} else {
			this.parentpopUpDivNode.appendChild(this.popUpDivNode);
		}
		
		DHTMLApi.CSS.setProperties(this.popUpDivNode,this.tempPopUpDivNodeStyles);
	},
	
	centerOnPage: function (targetWidth,targetHeight) {
		var leftPos,topPos,elementWidth,elementHeight;
		elementWidth=(typeof targetWidth=="undefined") ? DHTMLApi.Size.getElementWidth(this.popUpDivNode) : targetWidth;
		elementHeight=(typeof targetHeight=="undefined") ? DHTMLApi.Size.getElementHeight(this.popUpDivNode) : targetHeight;
		leftPos=Math.round((DHTMLApi.Browser.getViewportWidth()-elementWidth)/2+DHTMLApi.Browser.getScrollX());
		topPos=Math.round((DHTMLApi.Browser.getViewportHeight()-elementHeight)/2+DHTMLApi.Browser.getScrollY());
		if (topPos+elementHeight>DHTMLApi.Size.getPageHeight()) {
			topPos=DHTMLApi.Size.getPageHeight()-elementHeight;
		}
		if (topPos<0) topPos=0;
		DHTMLApi.CSS.setProperties(this.popUpDivNode, {left: leftPos+"px", top: topPos+"px"});
	},
	
	display: function (popUpDivNode,backgroundCssClass,backgroundAlpha,closeButtonElement,onCloseCallback) {
		this.init(popUpDivNode,backgroundCssClass,backgroundAlpha,closeButtonElement,onCloseCallback);
		this.build();
		this.centerOnPage();
	},
	
	hide: function () {
		this.removeHandlers();
		this.restorePopUpNode();
		document.body.removeChild(this.popupContainerNode);
	},
	
	getPageHeight: function () {
		return DHTMLApi.Size.getPageHeight();
	},
	
	getPageWidth: function () {
		return DHTMLApi.Size.getPageWidth();
	}
	
}
*/


THT={};

THT.MainMenu=function (menuItems) {
	this.menuData=menuItems;
	this.fadeInAnimation=null;
	this.selectedSubmenu=null;
	this.submenuDisplayed=null;
	this.mouseInInterval=null;
	this.mouseOutInterval=null;
	this.init();
}

THT.MainMenu.prototype.init=function () {
	var obj=this;
	for (var i=0; i<this.menuData.length; i++) {
		(function (){
			var j=i;
			DOMEvent.addDomListener(obj.menuData[j].menuItemElement,"mouseover",function () {
				obj.selectedSubmenu=j;
				if (obj.mouseInInterval!==null) {
					window.clearInterval(obj.mouseInInterval);
				}
				obj.mouseInInterval=window.setInterval(function () {obj.showSubmenu();window.clearInterval(obj.mouseInInterval);},60);
			});
			DOMEvent.addDomListener(obj.menuData[j].submenuContainer,"mouseout",function () {
				obj.selectedSubmenu=null;
				if (obj.mouseOutInterval!==null) {
					window.clearInterval(obj.mouseOutInterval);
				}
				obj.mouseOutInterval=window.setInterval(function () {obj.hideSubmenu();window.clearInterval(obj.mouseOutInterval);},30);
			});
			DOMEvent.addDomListener(obj.menuData[j].submenuContainer,"mouseover",function () {
				obj.selectedSubmenu=j;
			});
			DOMEvent.addDomListener(obj.menuData[j].menuItemElement,"mouseout",function () {																		 				obj.selectedSubmenu=null;
				if (obj.mouseOutInterval!==null) {
					window.clearInterval(obj.mouseOutInterval);
				}
				obj.mouseOutInterval=window.setInterval(function () {obj.hideSubmenu();window.clearInterval(obj.mouseOutInterval);},50);
			});
		})();
	}
}

THT.MainMenu.prototype.calculateSubmenuXPosition=function (menuItem) {
	var anchorIndex=this.menuData[menuItem].submenuPosition.anchor-1;
	var anchorXPos=DHTMLApi.Position.getXPosOnPage(this.menuData[anchorIndex].menuItemElement)+1;
	if (this.menuData[menuItem].submenuPosition.align=='left') {
		return anchorXPos;
	} else if (this.menuData[menuItem].submenuPosition.align=='center') {
		return anchorXPos-Math.round((DHTMLApi.Size.getElementWidth(this.menuData[menuItem].submenuContainer)-DHTMLApi.Size.getElementWidth(this.menuData[menuItem].menuItemElement))/2);
	} else {
		return 0;
	}
}

THT.MainMenu.prototype.calculateSubmenuYPosition=function () {
	return (DHTMLApi.Position.getYPosOnPage(this.menuData[0].menuItemElement)+1+DHTMLApi.Size.getElementHeight(this.menuData[0].menuItemElement));
}

THT.MainMenu.prototype.showSubmenu=function () {
	var obj=this;
	if (this.submenuDisplayed===null && this.selectedSubmenu!==null) {
		this.submenuDisplayed=this.selectedSubmenu;
		DHTMLApi.Position.setXPosOnPage(this.menuData[this.selectedSubmenu].submenuContainer,this.calculateSubmenuXPosition(this.selectedSubmenu));
		DHTMLApi.Position.setYPosOnPage(this.menuData[this.selectedSubmenu].submenuContainer,this.calculateSubmenuYPosition());
		DHTMLApi.Visibility.show(this.menuData[this.selectedSubmenu].submenuContainer);
		DHTMLApi.Visibility.setOpacity(this.menuData[this.selectedSubmenu].submenuContainer,1);
		DHTMLApi.CSS.setClass(this.menuData[this.selectedSubmenu].menuItemElement,['main_menu_container_selected'],[]);
		this.fadeInAnimation=new Animation.Fade(this.menuData[this.selectedSubmenu].submenuContainer, 1);
		this.fadeInAnimation.setFade(100, 3)
	}
}

THT.MainMenu.prototype.hideSubmenu=function () {
	if (this.submenuDisplayed!==null && this.submenuDisplayed!=this.selectedSubmenu) {
		DHTMLApi.Visibility.hide(this.menuData[this.submenuDisplayed].submenuContainer);
		DHTMLApi.CSS.setClass(this.menuData[this.submenuDisplayed].menuItemElement,[],['main_menu_container_selected']);
		this.submenuDisplayed=null;
	}
}

THT.MainMenu.prototype.fixWidths=function (submenuContainerIndex) {
	var totalSubcontainerWidth;
	var submenuSectionsContainers=this.menuData[submenuContainerIndex].submenuContainer.getElementsByTagName("UL");
	totalSubcontainerWidth=0;
	for (var j=0; j<submenuSectionsContainers.length; j++) {
		var submenuSectionsContainerItems=submenuSectionsContainers[j].getElementsByTagName("LI");
		var submenuSectionContainerWidth=0;
		for (var k=0; k<submenuSectionsContainerItems.length; k++) {
			if (submenuSectionContainerWidth<DHTMLApi.Size.getElementWidth(submenuSectionsContainerItems[k])) {
				submenuSectionContainerWidth=DHTMLApi.Size.getElementWidth(submenuSectionsContainerItems[k]);
			}
		}
		for (var k=0; k<submenuSectionsContainerItems.length; k++) {
			DHTMLApi.CSS.setProperties(submenuSectionsContainerItems[k],{width: submenuSectionContainerWidth+"px"});
		}
		DHTMLApi.CSS.setProperties(submenuSectionsContainers[j],{width: submenuSectionContainerWidth+"px"});
		totalSubcontainerWidth+=submenuSectionContainerWidth;
	}
	DHTMLApi.CSS.setProperties(this.menuData[submenuContainerIndex].submenuContainer,{width: (totalSubcontainerWidth+(submenuSectionsContainers.length-1))+"px"});
}

/*
elements={openDialogue: element, modalWindow: element, closeWindow: element, cancelButton: element, [scrollContainer: element]}
*/

THT.ModalDialogue=function (elements) {
	var obj=this;
	this.elements=elements;
	this.verticalPadding=40;
	DOMEvent.addDomListener(this.elements.openDialogue,"click",function (e) {DOMEvent.preventDefault(e);
		if (DHTMLApi.Size.getElementHeight(obj.elements.modalWindow)<(DHTMLApi.Browser.getViewportHeight()-obj.verticalPadding*2)) {
			PopUpLayer.display(obj.elements.modalWindow,"popup_background",50,obj.elements.closeWindow);
		} else {
			if (typeof obj.elements.scrollContainer!="undefined") {
				if (!document.documentElement) DHTMLApi.CSS.setProperties(obj.elements.modalWindow,{display: "block", left: "-20000px"});
				obj.setWindowScroll();
			}
			PopUpLayer.display(obj.elements.modalWindow,"popup_background",50,obj.elements.closeWindow);
		}
	});
	DOMEvent.addDomListener(this.elements.cancelButton,"click",function (e) {DOMEvent.preventDefault(e);PopUpLayer.hide();});
}

THT.ModalDialogue.prototype.setWindowScroll=function () {
	var windowScrollHeight=this.getWindowScrollHeight();
	var windowWidth=DHTMLApi.Size.getElementWidth(this.elements.modalWindow);
	var paddingRight=(navigator.appName == 'Microsoft Internet Explorer') ? 40:20;
	DHTMLApi.CSS.setProperties(this.elements.scrollContainer,{overflowY: "scroll", overflowX: "hidden", height: windowScrollHeight+"px", paddingRight: paddingRight+"px", marginRight: "20px", width: windowWidth+"px"});
	DHTMLApi.CSS.setProperties(this.elements.modalWindow,{width: (windowWidth+paddingRight)+"px"});
}
	
THT.ModalDialogue.prototype.getWindowScrollHeight=function () {
	var windowWithoutContentHeight=(DHTMLApi.Size.getElementHeight(this.elements.modalWindow)-DHTMLApi.Size.getElementHeight(this.elements.scrollContainer));
	return DHTMLApi.Browser.getViewportHeight()-windowWithoutContentHeight-this.verticalPadding*2;
}

/*
tabMenuElements=[{tab: element, content: element},]
selectedTabIndex= int: 0 ... (tabMenuElements.length-1)
cssClasses={selected_tab: "selected", roll_over: "mouse_over"}
*/

THT.TabMenu=function (tabMenuElements, tabMenuContentContainerElement, selectedTabIndex) {
	this.selectedTabIndex=(typeof selectedTabIndex=="undefined") ? 0 : selectedTabIndex;
	this.cssClasses={selected_tab: "selected", rollover: "mouse_over"};
	this.tabMenuElements=tabMenuElements;
	this.tabMenuContentContainerElement=tabMenuContentContainerElement;
	this.setTabSelected(this.selectedTabIndex);
	this.containerResizeAnimation=new Animation.SmoothVResize(this.tabMenuContentContainerElement);
	this.fadeOutAnimation=null;
	this.fadeInAnimation=null;
	this.init();
}

THT.TabMenu.prototype=implementsInterface(Observable);

THT.TabMenu.prototype.setTabSelected=function (tabIndex) {
	DHTMLApi.CSS.setProperties(this.tabMenuContentContainerElement,{height: DHTMLApi.Size.getElementHeight(this.tabMenuElements[tabIndex].content)+"px"});
	DHTMLApi.Visibility.show(this.tabMenuElements[tabIndex].content);
	DHTMLApi.CSS.setClass(this.tabMenuElements[tabIndex].tab,[this.cssClasses.selected_tab],[]);
}

THT.TabMenu.prototype.init=function () {
	var obj=this;
	for (var i=0; i<this.tabMenuElements.length; i++) {
		(function () {
			var j=i;
			
			DOMEvent.addDomListener(obj.tabMenuElements[j].tab,"mouseover",function () {
				if (j!=obj.selectedTabIndex) {
					DHTMLApi.CSS.setClass(this,[obj.cssClasses.rollover],[]);
				}
			});
			
			DOMEvent.addDomListener(obj.tabMenuElements[j].tab,"mouseout",function () {
				if (j!=obj.selectedTabIndex) {
					DHTMLApi.CSS.setClass(this,[],[obj.cssClasses.rollover]);
				}
			});
			
			DOMEvent.addDomListener(obj.tabMenuElements[j].tab,"click",function () {
				if (j!=obj.selectedTabIndex) {
					DHTMLApi.CSS.setClass(obj.tabMenuElements[j].tab,[obj.cssClasses.selected_tab],[obj.cssClasses.rollover]);
					DHTMLApi.CSS.setClass(obj.tabMenuElements[obj.selectedTabIndex].tab,[],[obj.cssClasses.selected_tab]);
					if (obj.fadeOutAnimation!==null) {
						obj.fadeOutAnimation.stop();
						DHTMLApi.Visibility.hide(obj.tabMenuElements[obj.selectedTabIndex].content);
						obj.fadeOutAnimation=null
					} 
					obj.fadeOutAnimation=new Animation.Fade(obj.tabMenuElements[obj.selectedTabIndex].content, 100);
					obj.fadeOutAnimation.addListener({onAnimationEnd : function () {
						DHTMLApi.Visibility.hide(obj.fadeOutAnimation.fadeObject);
						obj.fadeOutAnimation=null;
					}});
					obj.fadeOutAnimation.setFade(0,5);
					if (obj.fadeInAnimation!==null) {
						obj.fadeInAnimation.stop();
						obj.fadeInAnimation=null;
					}
					DHTMLApi.Visibility.show(obj.tabMenuElements[j].content);
					obj.fadeInAnimation=new Animation.Fade(obj.tabMenuElements[j].content, 0);
					obj.fadeInAnimation.addListener({onAnimationEnd : function () {obj.fadeInAnimation=null;}});
					obj.fadeInAnimation.setFade(100,5);
					obj.containerResizeAnimation.setSize(DHTMLApi.Size.getElementHeight(obj.tabMenuElements[j].content));
					obj.selectedTabIndex=j;
					obj.notifyListeners("onTabSelected",obj.selectedTabIndex);
				}
			});
		})();
	}
}

/*
THT.TabMenu.prototype.onDeviceCarouselSlideDisplay=function (eventObject) {
	var foundContainer=false;
	var searchNode=eventObject.slideElement.parentNode;
	while (!foundContainer && searchNode!==document.body) {
		for (var i=0; i<this.tabMenuElements.length; i++) {
			if (this.tabMenuElements[i].content===searchNode) {
				foundContainer=true;
				DHTMLApi.CSS.setProperties(searchNode,{height: eventObject.targetHeight+"px"});
				this.containerResizeAnimation.setSize(eventObject.targetHeight);
			}
		}
		searchNode=searchNode.parentNode;
	}
}
*/

/*
elements={panel_container: element}
css={control_button: string, selected_control_button: string}
data={transparent_button_file: string, button_space: int}
*/

THT.CarouselMenu=function (numOfButtons,elements,css,data) {
	this.numOfButtons=numOfButtons;
	this.elements=elements;
	this.controlButtons=[];
	this.css=css;
	this.data=data;
}

THT.CarouselMenu.prototype.build=function () {
	if (this.numOfButtons==1) return false;
	for (var i=0; i<this.numOfButtons; i++) {
		var button=document.createElement("DIV");
		var transparent_overlay=document.createElement("IMG");
		transparent_overlay.setAttribute("src",this.data.transparent_button_file);
		button.appendChild(transparent_overlay);
		this.elements.panel_container.appendChild(button);
		DHTMLApi.CSS.setClass(button,[this.css.control_button],[]);
		if (i<(this.numOfButtons-1)) {
			DHTMLApi.CSS.setProperties(button,{styleFloat: "left", cssFloat: "left", marginRight: this.data.button_space+"px"});
		} else {
			DHTMLApi.CSS.setProperties(button,{styleFloat: "left", cssFloat: "left"});
		}
		this.controlButtons.push(button);
	}
	DHTMLApi.CSS.setProperties(this.elements.panel_container,{width: this.getPanelWidth()+"px"});
	this.setPosition();
}

THT.CarouselMenu.prototype.setSelectedButton=function (slideNum) {
	for (var i=0; i<this.controlButtons.length; i++) {
		if (i==slideNum) {
			DHTMLApi.CSS.setClass(this.controlButtons[i],[this.css.selected_control_button],[this.css.control_button]);
		} else {
			DHTMLApi.CSS.setClass(this.controlButtons[i],[this.css.control_button],[this.css.selected_control_button]);
		}
	}
}

THT.CarouselMenu.prototype.setClickAction=function (buttonIndex,clickHandler) {	
	DOMEvent.addDomListener(this.controlButtons[buttonIndex],"click",clickHandler);
}

THT.CarouselMenu.prototype.setPosition=function () {
	DHTMLApi.CSS.setProperties(this.elements.panel_container,{marginLeft: -Math.round(this.getPanelWidth()/2)+"px"});
}

THT.CarouselMenu.prototype.getPanelWidth=function () {
	return this.numOfButtons*DHTMLApi.Size.getElementWidth(this.controlButtons[0])+(this.numOfButtons-1)*this.data.button_space;
}


/*
elements={background_container: element, html_container: element, panel_container: element}
slides=[{background_image: string, text_position: {x: int, y: int}, text_dimensions: {width: int, height: int}, text_html: string},]
css={control_button: string, selected_control_button: string}
*/



THT.MainCarousel=function (elements,slides,css,data) {
	this.elements=elements;
	this.slides=slides;
	this.backgroundImages=[];
	this.currentImageNum=0;
	this.currentBackgroundImage=null;
	this.textContainer=null;
	this.fadeAnimation=null;
	this.carouselMenu= new THT.CarouselMenu(this.slides.length,elements,css,{transparent_button_file: data.transparent_button_file, button_space: 6});
	this.numOfTransitionSteps=10;
	this.textAnimations=[];
	this.textAnimationsTimeouts=[];
	this.status=THT.MainCarousel.STATUS_IDLE;
	this.parseData();
	this.preloader=new SlidesPreloader(this.backgroundImages);
	this.preloader.startPreload();
	this.preloadingOnDemandFileName=null;
	this.initialized=false;
	this.loopInterval=null;
	this.build();
	this.init();
	this.renderText(this.currentImageNum);
	this.displayBackground(this.backgroundImages[this.currentImageNum],100);
}

THT.MainCarousel.prototype=implementsInterface(Observable);

THT.MainCarousel.STATUS_IDLE=1;
THT.MainCarousel.STATUS_PRELOADING=2;
THT.MainCarousel.STATUS_FADE_OUT=3;
THT.MainCarousel.STATUS_FADE_IN=4;

THT.MainCarousel.prototype.parseData=function () {
	for (var i=0; i<this.slides.length; i++) {
		this.backgroundImages.push(this.slides[i].background_image);
	}
}

THT.MainCarousel.prototype.build=function () {
	this.textContainer=document.createElement("DIV");
	this.elements.html_container.appendChild(this.textContainer);
	this.carouselMenu.build();
	this.carouselMenu.setSelectedButton(this.currentImageNum);
}

THT.MainCarousel.prototype.init=function () {
	var obj=this;
	if (this.slides.length>1) {
		for (var i=0; i<this.slides.length; i++) {
			(function () {
				var j=i;
				obj.carouselMenu.setClickAction(j,function () {
					obj.stopLoop();
					if (j!=obj.currentImageNum) {
						obj.currentImageNum=j;
						obj.carouselMenu.setSelectedButton(j);
						obj.showTransition(j);
					}
				});
			})();
		}
	}
	
	
	DOMEvent.addDomListener(window,"resize",function () {
		if (obj.currentBackgroundImage!==null) {
			DHTMLApi.CSS.setProperties(obj.currentBackgroundImage, {position:"absolute", left: Math.round((DHTMLApi.Size.getElementWidth(obj.elements.background_container)-obj.currentBackgroundImage.width)/2)+"px", top: "0px"});
		}
	
	});
}

THT.MainCarousel.prototype.getBackgroundIndex=function (fileName) {
	for (var i=0; i<this.backgroundImages.length; i++) {
		if (this.backgroundImages[i].image==fileName) return i;
	}
	return false;
}

THT.MainCarousel.prototype.displayBackground=function(file,opacity) {
	var obj=this;
	var img=new Image();
	img.onload=function () {
		obj.elements.background_container.innerHTML="";
		obj.currentBackgroundImage=document.createElement("IMG");
		DHTMLApi.Visibility.show(obj.currentBackgroundImage);
		obj.currentBackgroundImage.setAttribute("src",file);
		obj.elements.background_container.appendChild(obj.currentBackgroundImage);
		DHTMLApi.Visibility.setOpacity(obj.currentBackgroundImage,opacity);		
		DHTMLApi.CSS.setProperties(obj.currentBackgroundImage, {position:"absolute", left: Math.round((DHTMLApi.Size.getElementWidth(obj.elements.background_container)-this.width)/2)+"px", top: "0px"});
		obj.initialized=true;
	}
	img.src=file;
}

THT.MainCarousel.prototype.showTransition=function (imageNum) {
	var obj=this;
	var fadeOutListenerObj={};
	var fadeInListenerObject={};
	if (this.fadeAnimation!==null) this.fadeAnimation.stop();
	this.notifyListeners("onFadeOutStart",this.currentImageNum);
	function __local__fadeIn() {
		obj.currentBackgroundImage=null;
			obj.displayBackground(obj.backgroundImages[obj.currentImageNum],1);
			var generateImgInt=setInterval(function () {
				if (obj.currentBackgroundImage!==null) {
					obj.setAnimation(new Animation.Fade(obj.currentBackgroundImage, 1));
					obj.fadeAnimation.addListener(fadeInListenerObject);
					obj.fadeAnimation.setFade(100,obj.numOfTransitionSteps);
					obj.status=THT.MainCarousel.STATUS_FADE_IN;
					clearInterval(generateImgInt);
				}
			},50);
	}
	fadeOutListenerObj.onAnimationEnd=function () {
		if (obj.preloader.isLoaded(obj.backgroundImages[obj.currentImageNum])) {
			__local__fadeIn();
		} else {
			obj.status=THT.MainCarousel.STATUS_PRELOADING;
			obj.preloadingOnDemandFileName=obj.backgroundImages[obj.currentImageNum];
			obj.preloader.startPreloadSlide(obj.currentImageNum,0);
			var onLoadFileObject={};
			onLoadFileObject.onImageLoad=function (fileName) {
				if (fileName==obj.preloadingOnDemandFileName) {
					__local__fadeIn();
					obj.preloadingOnDemandFileName=null;
					obj.preloader.removeListener(onLoadFileObject);
				} else {
					obj.preloader.startPreloadSlide(obj.currentImageNum,0);
				}
			};
			obj.preloader.addListener(onLoadFileObject);
		}
	}
	fadeInListenerObject.onAnimationEnd=function () {
		obj.status=THT.MainCarousel.STATUS_IDLE;
		obj.notifyListeners("onFadeInStop",imageNum);
	}
	
	fadeInListenerObject.onAnimationStart=function () {
		obj.carouselMenu.setSelectedButton(obj.currentImageNum);
		obj.renderText(obj.currentImageNum);
	}
			
	if (this.initialized) {
		if (this.status==THT.MainCarousel.STATUS_IDLE || this.status==THT.MainCarousel.STATUS_FADE_IN) {
			if (this.status==THT.MainCarousel.STATUS_IDLE) {
				this.setAnimation(new Animation.Fade(this.currentBackgroundImage, 100)); 
				this.fadeAnimation.setFade(0, this.numOfTransitionSteps);
			} else {
				var currentStep=this.fadeAnimation.currentAnimationStep;
				var currentOpacity=this.fadeAnimation.currentOpacityPercentage;
				this.setAnimation(new Animation.Fade(this.currentBackgroundImage, currentOpacity)); 
				this.fadeAnimation.setFade(0,this.numOfTransitionSteps-currentStep);
			}
			this.fadeAnimation.addListener(fadeOutListenerObj);
			this.status=THT.MainCarousel.STATUS_FADE_OUT;
			if (!this.preloader.isLoaded(this.backgroundImages[imageNum])) {
				this.preloader.startPreloadSlide(this.backgroundImages[imageNum]);
				this.preloadingOnDemandFileName=this.backgroundImages[imageNum];
			}
		}	
		if (this.status==THT.MainCarousel.STATUS_FADE_OUT || this.status==THT.MainCarousel.STATUS_PRELOADING) {
			if (!this.preloader.isLoaded(this.backgroundImages[imageNum])) {
				this.preloadingOnDemandFileName=this.backgroundImages[imageNum];
			}
		}
	}
	this.currentImageNum=imageNum;
}

THT.MainCarousel.prototype.renderText=function (slideNum) {
	var obj=this;
	this.clearTextAnimations();
	this.textContainer.innerHTML=this.slides[slideNum].text_html;
	for (var i=0; i<this.textContainer.childNodes.length; i++) {
		DHTMLApi.Visibility.setOpacity(this.textContainer.childNodes[i],1);	
		this.textAnimations.push(new Animation.Fade(this.textContainer.childNodes[i], 1));
		(function () {		
			var j=i;	
			obj.textAnimationsTimeouts[j]=window.setTimeout(function () {obj.textAnimations[j].setFade(100,10);},500*(j+1));
		})();
	}
	DHTMLApi.CSS.setProperties(this.textContainer,{position: "absolute", width: this.slides[slideNum].text_dimensions.width+"px", height: this.slides[slideNum].text_dimensions.height+"px", top: this.slides[slideNum].text_position.y+"px", left: this.slides[slideNum].text_position.x+"px"});
}


THT.MainCarousel.prototype.clearTextAnimations=function () {
	for (var i=0; i<this.textAnimations.length; i++) {
		this.textAnimations[i].stop();
		window.clearTimeout(this.textAnimationsTimeouts[i]);
	}
	this.textAnimations=[];
	this.textAnimationsTimeouts=[];
}

THT.MainCarousel.prototype.setAnimation=function (animationObject) {
	if (this.fadeAnimation!==null) this.fadeAnimation.stop();
	this.fadeAnimation=animationObject;
}

THT.MainCarousel.prototype.startLoop=function () {
	var obj=this;
	if (this.slides.length>1) {
		if (this.loopInterval===null) {
			this.loopInterval=window.setInterval(function () {
				if (obj.currentImageNum<(obj.slides.length-1)) {
					obj.currentImageNum++;
				} else {
					obj.currentImageNum=0;
				}
				obj.showTransition(obj.currentImageNum);
			},10000);
		}
	}
}

THT.MainCarousel.prototype.stopLoop=function () {
	if (this.loopInterval!==null) {
		window.clearInterval(this.loopInterval);
		this.loopInterval=null;
	}
}




/*
elements={viewport: element, container: element, panel_container: element}
css={control_button: string, selected_control_button: string}
data={num_of_slides: int}
*/



THT.DevicesCarousel=function (elements,css,data) {
	var obj=this;
	this.elements=elements;
	this.currentImageNum=0;
	this.numOfSlides=0;
	this.slideContainers=[];
	this.slideWidth=0;
	this.currentSlideNum=0;
	this.fadeAnimation=null;
	this.numOfTransitionSteps=10;
	this.status=THT.DevicesCarousel.STATUS_IDLE;
	this.parseData();
	this.loopInterval=null;
	this.carouselMenu=new THT.CarouselMenu(this.numOfSlides,elements,css,{transparent_button_file: data.transparent_button_file, button_space: 6});
	this.carouselMenu.setPosition=function () {};
	this.build();
	this.init();
	this.displaySlide(this.currentSlideNum);
}

THT.DevicesCarousel.prototype=implementsInterface(Observable);

THT.DevicesCarousel.STATUS_IDLE=1;
THT.DevicesCarousel.STATUS_FADE_OUT=3;
THT.DevicesCarousel.STATUS_FADE_IN=4;

THT.DevicesCarousel.prototype.parseData=function () {
	this.numOfSlides=0;
	var divs=this.elements.container.getElementsByTagName("DIV");
	for (var i=0; i<divs.length; i++) {
		if (divs[i].parentNode===this.elements.container) {
			this.numOfSlides++;
			this.slideWidth=DHTMLApi.Size.getElementWidth(divs[i]);
			this.slideContainers.push(divs[i]);
		}
	}
}

THT.DevicesCarousel.prototype.build=function () {
	//DHTMLApi.CSS.setProperties(this.elements.container,{width: this.numOfSlides*this.slideWidth+"px"});
	this.carouselMenu.build();
	this.carouselMenu.setSelectedButton(this.currentImageNum);
}

THT.DevicesCarousel.prototype.init=function () {
	var obj=this;
	if (this.numOfSlides>1) {
		for (var i=0; i<this.numOfSlides; i++) {
			(function () {
				var j=i;
				obj.carouselMenu.setClickAction(j,function () {
					obj.stopLoop();
					
					if (j!=obj.currentSlideNum) {
						obj.carouselMenu.setSelectedButton(j);
						obj.showTransition(j);
					}
					
				});
			})();
		}
	}
}

THT.DevicesCarousel.prototype.displaySlide=function (slideNum) {
	DHTMLApi.CSS.setProperties(this.elements.viewport,{height: DHTMLApi.Size.getElementHeight(this.slideContainers[slideNum])+"px"});
	DHTMLApi.CSS.setProperties(this.elements.container, {left: (-1*slideNum*this.slideWidth)+"px"});
	this.notifyListeners("onDeviceCarouselSlideDisplay",{slideElement: this.slideContainers[slideNum], targetHeight: DHTMLApi.Size.getElementHeight(this.elements.viewport)+DHTMLApi.Size.getElementHeight(this.elements.panel_container.parentNode)});
}

THT.DevicesCarousel.prototype.showTransition=function (slideNum) {
	var obj=this;
	var fadeOutListenerObj={};
	var fadeInListenerObject={};
	if (this.fadeAnimation!==null) this.fadeAnimation.stop();
	this.notifyListeners("onFadeOutStart",this.currentImageNum);
	function __local__fadeIn() {
			obj.displaySlide(obj.currentSlideNum);
			DHTMLApi.Visibility.setOpacity(obj.slideContainers[obj.currentSlideNum],1);
			obj.setAnimation(new Animation.Fade(obj.slideContainers[obj.currentSlideNum], 1));
			obj.fadeAnimation.addListener(fadeInListenerObject);
			obj.fadeAnimation.setFade(100,obj.numOfTransitionSteps);
			obj.status=THT.DevicesCarousel.STATUS_FADE_IN;
	}
	fadeOutListenerObj.onAnimationEnd=function () {
		__local__fadeIn();
	}
	fadeInListenerObject.onAnimationEnd=function () {
		obj.status=THT.DevicesCarousel.STATUS_IDLE;
		obj.notifyListeners("onFadeInStop",slideNum);
	}
	
	fadeInListenerObject.onAnimationStart=function () {
		obj.carouselMenu.setSelectedButton(obj.currentSlideNum);
	}
			
	if (this.status==THT.DevicesCarousel.STATUS_IDLE || this.status==THT.DevicesCarousel.STATUS_FADE_IN) {
		if (this.status==THT.DevicesCarousel.STATUS_IDLE) {
			this.setAnimation(new Animation.Fade(this.slideContainers[this.currentSlideNum], 100)); 
			this.fadeAnimation.setFade(0, this.numOfTransitionSteps);
		} else {
			var currentStep=this.fadeAnimation.currentAnimationStep;
			var currentOpacity=this.fadeAnimation.currentOpacityPercentage;
			this.setAnimation(new Animation.Fade(this.slideContainers[this.currentSlideNum], currentOpacity)); 
			this.fadeAnimation.setFade(0,this.numOfTransitionSteps-currentStep);
		}
		this.fadeAnimation.addListener(fadeOutListenerObj);
		this.status=THT.DevicesCarousel.STATUS_FADE_OUT;
	}	
	this.currentSlideNum=slideNum;
}


THT.DevicesCarousel.prototype.setAnimation=function (animationObject) {
	if (this.fadeAnimation!==null) this.fadeAnimation.stop();
	this.fadeAnimation=animationObject;
}

THT.DevicesCarousel.prototype.startLoop=function () {
	var obj=this;
	if (this.numOfSlides>1) {
		if (this.loopInterval===null) {
			this.loopInterval=window.setInterval(function () {
				if (obj.currentSlideNum<(obj.numOfSlides-1)) {
					obj.currentSlideNum++;
				} else {
					obj.currentSlideNum=0;
				}
				obj.showTransition(obj.currentSlideNum);
			},10000);
		}
	}
}

THT.DevicesCarousel.prototype.stopLoop=function () {
	if (this.loopInterval!==null) {
		window.clearInterval(this.loopInterval);
		this.loopInterval=null;
	}
}

/*

tabMenuObject=THT.TabMenu object
tabMenuCarouselLinks=[{tab_menu_index: int, devices_carousel: THT.DevicesCarousel object}]
*/

THT.TabMenuWithDevicesCarousel=function (tabMenuObject,tabMenuCarouselLinks) {
	this.tabMenuObject=tabMenuObject;
	this.links=tabMenuCarouselLinks;
	this.init();
}

THT.TabMenuWithDevicesCarousel.prototype.init=function () {
	var obj=this;
	var tabMenuObject=this.tabMenuObject;
	this.links[0].devices_carousel.startLoop();
	this.tabMenuObject.onDeviceCarouselSlideDisplay=function (eventObject) {
		var foundContainer=false;
		var searchNode=eventObject.slideElement.parentNode;
		while (!foundContainer && searchNode!==document.body) {
			for (var i=0; i<tabMenuObject.tabMenuElements.length; i++) {
				if (tabMenuObject.tabMenuElements[i].content===searchNode) {
					foundContainer=true;
					DHTMLApi.CSS.setProperties(searchNode,{height: eventObject.targetHeight+"px"});
					tabMenuObject.containerResizeAnimation.setSize(eventObject.targetHeight);
				}
			}
			searchNode=searchNode.parentNode;
		}
	}
	
	for (var i=0; i<this.links.length; i++) {
		(function () {
			var j=i;
			obj.links[j].devices_carousel.onTabSelected=function (tabIndex) {
				if (j==tabIndex) {
					obj.links[j].devices_carousel.startLoop();
				}
			}
		})();
		
		this.links[i].devices_carousel.addListener(this.tabMenuObject);
		this.tabMenuObject.addListener(this.links[i].devices_carousel);
	}
}


//////////////////////////////
// class THT.CheckBoxReveal //
//////////////////////////////

/*
elements={checkbox: element, container: element}
*/

THT.CheckBoxReveal=function (elements) {
	this.elements=elements;
	this.boxHeight=DHTMLApi.Size.getElementHeight(this.elements.container);
	this.revealed=false;
	DHTMLApi.CSS.setProperties(this.elements.container,{overflow: "hidden", height: "0px", display: "inline"});
	this.animation=new Animation.SmoothVResize(this.elements.container);
	this.init();
}

THT.CheckBoxReveal.prototype.init=function () {
	var obj=this;
	DOMEvent.addDomListener(this.elements.checkbox,"click",function () {
		if (obj.revealed) {
			obj.animation.setSize(0);
		} else {
			obj.animation.setSize(obj.boxHeight);
		}
		obj.revealed=!obj.revealed;
	});
}


//////////////////////////////
// static class THT.Tooltip //
//////////////////////////////

THT.Tooltip=new Object();
THT.Tooltip.cssClass="tooltip_container";
THT.Tooltip.zIndex=500000;
THT.Tooltip.handleId=1;
THT.Tooltip.xPositionFromCursor=20;
THT.Tooltip.delay=200;
THT.Tooltip.defaultWidth=300;

THT.Tooltip.init=function() {
	var obj=this;
	this.mouseOverHandlers={};
	this.mouseOutHandlers={};
	this.mouseClickHandlers={};
	this.mouseMoveHandler=null;
	this.tooltipElements={};
	this.intervals={};
	this.isVisible=false;
	this.currentMousePosX=0;
	this.currentMousePosY=0;
	this.mouseTrackerHandler=DOMEvent.addDomListener(window.document,"mousemove", function (eventObject) {
		obj.currentMousePosX=MousePositionOnPage.getX(eventObject);
		obj.currentMousePosY=MousePositionOnPage.getY(eventObject);
	});
}

THT.Tooltip.add=function (element,title,innerHTML,width) {
	var handleId;
	if (typeof this.mouseOverHandlers =="undefined") this.init();
	var obj=this;
	var tooltipWidth=(typeof width=="undefined") ? THT.Tooltip.defaultWidth : width;
	this.create(title,innerHTML,tooltipWidth);
	
	(function () {
		var handleId=THT.Tooltip.handleId;
		
		function showTooltip() {
			obj.display(handleId);
			obj.setPosition(handleId,obj.currentMousePosX,obj.currentMousePosY);
			obj.mouseMoveHandler=DOMEvent.addDomListener(window.document,"mousemove",function (eventObject) {
				obj.setPosition(handleId,obj.currentMousePosX,obj.currentMousePosY);
			});
			if (obj.intervals[handleId]!==null) {
				window.clearInterval(obj.intervals[handleId]);
			}
		}
		
		obj.mouseOverHandlers[handleId]=DOMEvent.addDomListener(element,"mouseover",function () {
			if (obj.intervals[handleId]!==null) {
				window.clearInterval(obj.intervals[handleId]);
			}
			
			obj.intervals[handleId]=window.setInterval(function () {
				showTooltip();
				
			},THT.Tooltip.delay);
			
	
		});
		
		obj.mouseClickHandlers[handleId]=DOMEvent.addDomListener(element,"click",function (eventObject) {
			if (obj.intervals[handleId]!==null) {
				window.clearInterval(obj.intervals[handleId]);
			}
			showTooltip();
			if (obj.intervals[handleId]!==null) {
				window.clearInterval(obj.intervals[handleId]);
			}
		});
		
		obj.mouseOutHandlers[handleId]=DOMEvent.addDomListener(element,"mouseout",function (eventObject) {
			if (obj.intervals[handleId]!==null) {
				window.clearInterval(obj.intervals[handleId]);
			}
			if (obj.mouseMoveHandler!==null) {
				DOMEvent.removeListener(obj.mouseMoveHandler);
			}
			obj.mouseMoveHandler=null;
			obj.hide(handleId);		
		});
		
	})();
	return THT.Tooltip.handleId++;
}


THT.Tooltip.hide=function (handleId) {
	if (typeof this.mouseOverHandlers =="undefined") this.init();
	DHTMLApi.Visibility.hide(this.tooltipElements[handleId]);
}

THT.Tooltip.remove=function (handleId) {
	this.hide();
	if (this.intervals[handleId]!==null) {
		window.clearInterval(this.intervals[handleId]);
	}
	if (typeof this.mouseOverHandlers[handleId]!="undefined") {
		DOMEvent.removeListener(this.mouseOverHandlers[handleId]);
	}
	if (typeof this.mouseOutHandlers[handleId]!="undefined") {
		DOMEvent.removeListener(this.mouseOutHandlers[handleId]);
	}
	if (this.mouseMoveHandler!==null) {
		DOMEvent.removeListener(this.mouseMoveHandler);
	}
}

THT.Tooltip.create=function (title,innerHTML,width) {
	if (typeof this.mouseOverHandlers =="undefined") this.init();
	this.tooltipElements[THT.Tooltip.handleId]=document.createElement("DIV");
	this.tooltipElements[THT.Tooltip.handleId].innerHTML='<span class="tooltip_title">'+title+'</span>'+innerHTML;
	DHTMLApi.CSS.setClass(this.tooltipElements[THT.Tooltip.handleId],["modal_dialogue_container"],[]);
	DHTMLApi.CSS.setProperties(this.tooltipElements[THT.Tooltip.handleId], {position: "absolute", zIndex: THT.Tooltip.zIndex, display: "none", width: width+"px"});
	document.body.appendChild(this.tooltipElements[THT.Tooltip.handleId]);
}

THT.Tooltip.display=function (handleId) {
	if (typeof this.mouseOverHandlers =="undefined") this.init();
	DHTMLApi.Visibility.show(this.tooltipElements[handleId]);
}


THT.Tooltip.setPosition=function (handleId,x,y) {
	var xPos, yPos;
	var mouseViewPortPositionX=x-DHTMLApi.Browser.getScrollX();
	var mouseViewPortPositionY=y-DHTMLApi.Browser.getScrollY();
	if (mouseViewPortPositionX>Math.round(DHTMLApi.Browser.getViewportWidth()/2)) {
		xPos=x-THT.Tooltip.xPositionFromCursor-DHTMLApi.Size.getElementWidth(this.tooltipElements[handleId]);
	} else {
		xPos=x+THT.Tooltip.xPositionFromCursor;
	}
	if (mouseViewPortPositionY<DHTMLApi.Size.getElementHeight(this.tooltipElements[handleId])) {
		yPos=y;
	} else if (mouseViewPortPositionY>(DHTMLApi.Browser.getViewportHeight()-DHTMLApi.Size.getElementHeight(this.tooltipElements[handleId]))) {
		yPos=y-DHTMLApi.Size.getElementHeight(this.tooltipElements[handleId]);
	} else {
		yPos=y-Math.round(DHTMLApi.Size.getElementHeight(this.tooltipElements[handleId])/2);
	}
	DHTMLApi.CSS.setProperties(this.tooltipElements[handleId], {top: yPos+"px", left: xPos+"px"});
}


function GoToNextStepFeatured(nextStepFeatured, entityId, bundlefilename, activeServiceIdToken){
//	var nextStepUrlArray = _nextStepUrl.split('?');
//	if(nextStepUrlArray){
		var redirectUrl = nextStepFeatured + "/" + bundlefilename + "?"+"entityId=" + entityId;

		if(typeof(activeServiceIdToken) != 'undefined')
		{
			redirectUrl += "&activeServiceIdToken=" + activeServiceIdToken;
		}

		window.location = redirectUrl;
//	}
}

/*info modal box*/
$(document).ready(function(){
	if ($('.info-modal-box').is('*')) {
		var speed = 175;
		var modalBox = '.info-modal-box';
		$(modalBox).each(function(){
			$(this).wrapInner('<div class="box-text"></div>');
			$(this).prepend('<span class="arrow"></span>');
		});
		$('.info-modal-trigger').click(function(e){
			var target = $(this).attr('rel');
			var trigger = $(this);
			var triggerPosRight = $(window).width() - (trigger.offset().left + trigger.width());
			var triggerPosLeft = trigger.offset().left;
			e.preventDefault();
			e.stopPropagation();
			$(modalBox).not($('#' + target)).fadeOut(speed);
			if (trigger.children(modalBox).is(':visible')) {
				trigger.children(modalBox).fadeOut(speed);
			} else {
				$('#' + target).children('.arrow').css('left', triggerPosLeft);
				if (triggerPosRight < 330) {
					$('#' + target).addClass('desni');
				} else {
					$('#' + target).removeClass('desni');
				}
				trigger.append($('#' + target).fadeIn(speed));
			}
		});
		$(modalBox).click(function(e){
			e.stopPropagation();
		});
		$(document).click(function() {
			$(modalBox).fadeOut(speed);
		});
	}
});
