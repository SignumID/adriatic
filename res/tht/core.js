function implementsInterface(obj) {
	var prototypeObj={};
	for (var i=0; i<arguments.length; i++) {
		for (var method in arguments[i]) {
			prototypeObj[method]=arguments[i][method];
		}	
	}
	return prototypeObj;
}

function addObjectMethods(targetClass, methodObject) {
	for (var method in methodObject) {
		targetClass.prototype[method]=methodObject[method];
	}
}

DHTMLApi = {
	
	CSS : {
		getStyle: function (element, name) {
			var styleObj;
			if (element.style[name]) return element.style[name];
			if (element.currentStyle) {	
				name=name.replace(/-([a-z])/g, function (matched) {
					return matched.toUpperCase().slice(1, matched.length);
				});
				return element.currentStyle[name];
			}
			if (document.defaultView && document.defaultView.getComputedStyle) {
				name=name.replace(/([A-Z])/g,"-$1");
				name=name.toLowerCase();
				styleObj=document.defaultView.getComputedStyle(element,"");
				return styleObj && styleObj.getPropertyValue(name);
			} else {
				return null;
			}
		},
		
		setProperties: function (element, properties) {
			var oldProperties={};
			for (var i in properties) {
				oldProperties[i]=element.style[i];
				element.style[i]=properties[i];
			}
			return oldProperties;
		},
		
		setClass:function (element,addClassesArray,removeClassesArray) {
			var currentClasses=new Array();
			var newClasses=new Array();
			var removedClasses=new Array();
			findWordsExp=new RegExp("\\w+", "g");
			var result;
			while ((result= findWordsExp.exec(element.className))!= null) currentClasses.push(result[0]); 
			for (var i=0; i<addClassesArray.length; i++) {
				var classExists=false;
				for (var j=0; j<currentClasses.length; j++) {
					if (currentClasses[j]==addClassesArray[i]) {
						classExists=true;
						break;
					}					
				}
				if (!classExists) newClasses.push(addClassesArray[i]);
			}
			currentClasses=currentClasses.concat(newClasses);
			if (removeClassesArray==null) return removedClasses;
			for (var i=0; i<removeClassesArray.length; i++) {
				for (var j=0; j<currentClasses.length; j++) {
					if (currentClasses[j]==removeClassesArray[i]) {
						removedClasses=removedClasses.concat(currentClasses.splice(j,1));
						break;
					}					
				}
			}
			element.className=currentClasses.join(" ");
			return removedClasses;
		}
	},
	
	Position : {
		getXPosOnPage: function (element) {
			return element.offsetParent?element.offsetLeft+DHTMLApi.Position.getXPosOnPage(element.offsetParent):element.offsetLeft;
		},
		
		getYPosOnPage: function (element) {
			return element.offsetParent?element.offsetTop+DHTMLApi.Position.getYPosOnPage(element.offsetParent):element.offsetTop;
		},
		
		getXPosInElement: function (element,container) {
			return DHTMLApi.Position.getXPosOnPage(element)-DHTMLApi.Position.getXPosOnPage(container);
		},
		
		getYPosInElement: function (element,container) {
			return DHTMLApi.Position.getYPosOnPage(element)-DHTMLApi.Position.getYPosOnPage(container);
		},
		
		setXPosOnPage: function (element,posX) {
			var propertiesArray={};
			if (element.parentNode!=document.body) {
				element=element.parentNode.removeChild(element);
				document.body.appendChild(element);
			}
			if (DHTMLApi.CSS.getStyle(element,"position")!="absolute") {
				propertiesArray={position: "absolute"};
			}
			propertiesArray.left=posX+"px";
			DHTMLApi.CSS.setProperties(element,propertiesArray);
		},
		
		setYPosOnPage: function (element,posY) {
			var propertiesArray={};
			if (element.parentNode!=document.body) {
				element=element.parentNode.removeChild(element);
				document.body.appendChild(element);
			}
			if (DHTMLApi.CSS.getStyle(element,"position")!="absolute") {
				propertiesArray={position: "absolute"};
			}
			propertiesArray.top=posY+"px";
			DHTMLApi.CSS.setProperties(element,propertiesArray);
		},
		
		setXPos: function (element, posX, relativeToElement) {
			if (relativeToElement==undefined) {
				element.style.left=posX+"px";
			} else {
				if(DHTMLApi.CSS.getStyle(element.parentNode,"position")=="static"){
					element.parentNode.style.position="relative";
				}
				element.style.position="absolute";
				element.style.left=(posX-DHTMLApi.Position.getXPosInElement(element.parentNode,relativeToElement))+"px";
			}
		},
		
		setYPos: function (element, posY, relativeToElement) {
			if (relativeToElement==undefined) {
				element.style.top=posY+"px";
			} else {
				if(DHTMLApi.CSS.getStyle(element.parentNode,"position")=="static"){
					element.parentNode.style.position="relative";
				}
				element.style.position="absolute";
				element.style.top=(posY-DHTMLApi.Position.getYPosInElement(element.parentNode,relativeToElement))+"px";
			}
		}
		
	},
	
	Size : { 
		
		getElementWidth : function (element) {
			var tempProperties, width;
			if (DHTMLApi.CSS.getStyle(element, "display" ) != "none") {
				return element.offsetWidth || parseInt(DHTMLApi.CSS.getStyle(element, "width"));
			}
			tempProperties=DHTMLApi.CSS.setProperties(element, {display: "block", visibility: "hidden", position: "absolute"});
			width=element.clientWidth || parseInt(DHTMLApi.CSS.getStyle(element, "width"));
			DHTMLApi.CSS.setProperties(element, {display: "", visibility: "", position: ""});
			DHTMLApi.CSS.setProperties(element,tempProperties);
			return width;		
		},
		
		getElementHeight : function (element) {
			var tempProperties, height;
			if (DHTMLApi.CSS.getStyle(element, "display" ) != "none") {
				height=element.offsetHeight || parseInt(DHTMLApi.CSS.getStyle(element, "height"));
				if (!isNaN(height)) return height;
			}
			tempProperties=DHTMLApi.CSS.setProperties(element, {display: "block", visibility: "hidden", position: "absolute"});
			height=element.clientHeight || parseInt(DHTMLApi.CSS.getStyle(element, "height"));
			DHTMLApi.CSS.setProperties(element, {display: "", visibility: "", position: ""});
			DHTMLApi.CSS.setProperties(element,tempProperties);
			if (!isNaN(height)) return height;
			duplicateNode=element.cloneNode(true);
			DHTMLApi.CSS.setProperties(duplicateNode, {marginLeft: "-30000px", visibility: "hidden", display: "block"});
			document.body.appendChild(duplicateNode);
			height=duplicateNode.offsetHeight;
			document.body.removeChild(duplicateNode);
			if (!isNaN(height)) return height;
			return 0;
		},
		
		getPageWidth: function () {
			//return Math.max(document.body.scrollWidth,document.body.offsetWidth);
			return (document.documentElement && document.documentElement.scrollWidth) ? document.documentElement.scrollWidth : (document.body.scrollWidth > document.body.offsetWidth) ? document.body.scrollWidth : document.body.offsetWidth;
		},
		
		getPageHeight: function () {
			var height=(document.documentElement && document.documentElement.scrollHeight) ? document.documentElement.scrollHeight : (document.body.scrollHeight > document.body.offsetHeight) ? document.body.scrollHeight : document.body.offsetHeight;
			return Math.max(height,DHTMLApi.Browser.getViewportHeight());
			
		}
	
	},
	
	Visibility: {
		
		show: function (element) {
			element.style.display=element.__display__ || 'block';
		},
		
		hide: function (element) {
			var currentDisplay=DHTMLApi.CSS.getStyle(element,"display");
			if (currentDisplay != 'none') element.__display__=currentDisplay;
			element.style.display='none';
		},
		
		setOpacity: function (element,percent) {
			if ((element.currentStyle && !element.currentStyle.hasLayout) || (!element.currentStyle && element.style.zoom == 'normal')) element.style.zoom = 1;
			if (element.filters) {
				if (typeof element.style!="undefined") {
					element.style.filter='alpha(opacity='+percent+')';
					if (percent==100) {
						element.style.filter='none';
					}
				}
			} else {
				element.style.opacity=percent/100;
			}
		}
	},
	
	Browser : {
		
		getViewportWidth: function () {
			return self.innerWidth || (document.documentElement && document.documentElement.clientWidth) || document.body.clientWidth;
		},
		
		getViewportHeight: function () {
			return self.innerHeight || (document.documentElement && document.documentElement.clientHeight) || document.body.clientHeight;
		},
		
		getScrollX: function () {
			return self.pageXOffset || (document.documentElement && document.documentElement.scrollLeft) || document.body.scrollLeft;
		},
		
		getScrollY: function () {
			return self.pageYOffset || (document.documentElement && document.documentElement.scrollTop) || document.body.scrollTop;
		}
		
	}
};

MousePositionOnPage = {
	getX: function (mouseEvent) {
		if (typeof mouseEvent.touches!="undefined") return mouseEvent.touches[0].pageX;
		return mouseEvent.pageX || mouseEvent.clientX+DHTMLApi.Browser.getScrollX();
	},
	getY: function (mouseEvent) {
		if (typeof mouseEvent.touches!="undefined") return mouseEvent.touches[0].pageY;
		return mouseEvent.pageY || mouseEvent.clientY+DHTMLApi.Browser.getScrollY();
	}
};


function DOMEventHandle(element, type, handler) {
	this.element=element;
	this.type=type;
	this.handler=handler;
}

DOMEvent = {	

	// public

	addDomListener: function (element, type, handler) {
		var handlers, newHandler;
		newHandler=this.modifyHandlerExceptions(element, type, handler);
		if (newHandler!==false) handler=newHandler;
		if (!handler.__id__) handler.__id__ = DOMEvent.currentId++;
		if (!element.events) element.events = {};
		handlers = element.events[type];
		if (!handlers) {
    		handlers = element.events[type] = {};
		    if (element["on" + type]) {
      			handlers[0] = element["on" + type];
    		}
  		}
		handlers[handler.__id__] = handler;
		if (this.isNonTradiditonalEventType(type)) {
			element.addEventListener(type, handler);
		} else {
			element["on" + type] = DOMEvent.handleEvent;
		}
		return new DOMEventHandle(element, type, handler);
	},
	
	modifyHandlerExceptions : function (element, type, handler) {
		var newHandler;
		if (type == "mouseover" && element.nodeName == 'DIV') {
			newHandler=function (eventObject) {
				var relatedTarget= (typeof eventObject.relatedTarget !="undefined") ? eventObject.relatedTarget : eventObject.fromElement;
				while (relatedTarget !==null && relatedTarget !== element && relatedTarget.nodeName != 'BODY') {
					relatedTarget= relatedTarget.parentNode;
				}
				if (relatedTarget !== element) {
					handler(eventObject);
				}
			}
			return newHandler;
		}
		
		if (type == "mouseout" && element.nodeName == 'DIV') {
			newHandler=function (eventObject) {
				var relatedTarget= (typeof eventObject.relatedTarget !="undefined") ? eventObject.relatedTarget : eventObject.toElement;
				while (relatedTarget !==null && relatedTarget !== element && relatedTarget.nodeName != 'BODY') {
					relatedTarget= relatedTarget.parentNode;
				}
				if (relatedTarget !== element) {
					handler(eventObject);
				}
			}
			return newHandler;
		}
		
		//if (window.addEventListener)
        /** DOMMouseScroll is for mozilla. */
        //window.addEventListener('DOMMouseScroll', wheel, false);
/** IE/Opera. */
//window.onmousewheel = document.onmousewheel = wheel;
		return false;
	},
	
	removeListener: function (domEventHandleObj) {
		var element,type,handler;
		element=domEventHandleObj.element;
		type=domEventHandleObj.type;
		handler=domEventHandleObj.handler;
		if (element.events && element.events[type]) {
			if (this.isNonTradiditonalEventType(type)) {
   				element.removeEventListener(type,handler,false);
			} 
			delete element.events[type][handler.__id__];
  		}
	},
	
	preventDefault: function (eventObj) {
		if (eventObj.preventDefault) {
			eventObj.preventDefault();
		} else {
			eventObj.returnValue=false;
		}
	},
	
	stopPropagation: function (eventObj) {
		if (eventObj.stopPropagation) {
			eventObj.stopPropagation();
		} else {
			eventObj.cancelBubble=true;
		}
	},
	
	// private
	
	currentId: 1,
	
	nonTraditionalBindingEventType: ['touchstart','touchmove','touchend'],
	
	isNonTradiditonalEventType: function (type) {
		for (var i=0; i<this.nonTraditionalBindingEventType.length; i++) {
			if (this.nonTraditionalBindingEventType[i]==type) return true;
		}
		return false;
	},
	
	handleEvent: function (event) {
  		var handlers;
		event = event || window.event;
  		handlers = this.events[event.type];
  		for (var i in handlers) {
    		this.__handleEvent = handlers[i];
    		this.__handleEvent(event);
  		}
		this.__handleEvent=null;
	}
};


JSON={
	serialize: function (JSONObject) {
		var elementArray=new Array();
		var resultString;			
		var objectTypeIsArray=false;
		if (JSONObject.constructor==Array) {
			objectTypeIsArray=true;
			for (var i=0; i<JSONObject.length; i++) {
				if (typeof JSONObject[i] == "object") {
					elementArray.push(JSON.serialize(JSONObject[i]));
				} else if (typeof JSONObject[i] == "string") {
					elementArray.push('"'+encodeURIComponent(JSONObject[i])+'"');
				} else {
					elementArray.push(JSONObject[i]);
				}
			}
		} else if (JSONObject.constructor==Object) {
			for (var property in JSONObject) {
				if (typeof JSONObject[property] == "object") {
					elementArray.push(property+':'+JSON.serialize(JSONObject[property]));
				} else if (typeof JSONObject[property] == "string") {
					elementArray.push(property+':'+'"'+encodeURIComponent(JSONObject[property])+'"');
				} else {
					elementArray.push(property+':'+JSONObject[property]);
				}
			}
		} else 	{
			return encodeURIComponent(JSONObject);
		}
		resultString=elementArray.join(",");
		if (objectTypeIsArray) {
			return "["+resultString+"]";
		} else {
			return "{"+resultString+"}";
		}
	},
	
	unserialize: function (JSONString) {
		var JSONObject;
		try {
			eval("JSONObject="+JSONString);
		} catch (e) {
			JSONObject=new Object();
		};
		return JSON.urlDecodeJSONObject(JSONObject);
	},
	
	urlDecodeJSONObject: function (JSONObject) {
		var decodedObject;
		if (JSONObject===null) {
			decodedObject=null;
		} else 	if (JSONObject.constructor==Array) {
			decodedObject=new Array();
			for (var i=0; i<JSONObject.length; i++) {
				if (typeof JSONObject[i] == "object") {
					decodedObject.push(JSON.urlDecodeJSONObject(JSONObject[i]));
				} else if (typeof JSONObject[i] == "string") {
					decodedObject.push(decodeURIComponent(JSONObject[i]));
				} else {
					decodedObject.push(JSONObject[i]);
				}
			}
		} else if (JSONObject.constructor==Object) {
			decodedObject=new Object();
			for (var property in JSONObject) {
				if (typeof JSONObject[property] == "object") {
					decodedObject[property]=JSON.urlDecodeJSONObject(JSONObject[property]);
				} else if (typeof JSONObject[property] == "string") {
					decodedObject[property]=decodeURIComponent(JSONObject[property]);
				} else {
					decodedObject[property]=JSONObject[property];
				}
			}
		} else 	{
			decodedObject=decodeURIComponent(JSONObject);
		}
		return decodedObject;
	}
};


Ajax={ 
	getXMLHttpRequest : function () {
	
		if ((typeof XMLHttpRequest) == "undefined") {
			XMLHttpRequest=function() {
				return new ActiveXObject(navigator.userAgent.indexOf("MSIE 5") >= 0 ? "Microsoft.XMLHTTP" : "Msxml2.XMLHTTP");
			}
		} 	
		return (new XMLHttpRequest());
	},
	
	isSuccess : function (xmlHttpRequestObj) {
		try {
			return (!xmlHttpRequestObj.status && location.protocol=="file:") || (xmlHttpRequestObj.status >=200 && xmlHttpRequestObj.status < 300) || xmlHttpRequestObj.status==304 || (navigator.userAgent.indexOf("Safari") >= 0 && typeof xmlHttpRequestObj.status == "undefined");
		} catch(e){};
		return false;		
	},
	
	/* dataType is string, values: xml, html, json */
	
	getResponseData : function (xmlHttpRequestObj,dataType) {
		var ct=xmlHttpRequestObj.getResponseHeader("content-type");
		var xmlData= !dataType && ct && ct.indexOf("xml")>=0;
		var data= (dataType == "xml" || xmlData)? xmlHttpRequestObj.responseXML: xmlHttpRequestObj.responseText;
		if (dataType=="json") {
			data=JSON.unserialize(data);
		}
		return data;
	}
}

//////////////////////////
// Interface Observable //
//////////////////////////

Observable = {
	addListener : function(listenerObj) {
		if (typeof this.listeners == 'undefined') {
			this.listeners=[];
		}
		for (var i=0; i<this.listeners.length; i++) {
			if (this.listeners[i]==listenerObj) return;
		}
		this.listeners[this.listeners.length]=listenerObj;
	},

	removeListener : function(listenerObj) {
		for (var i=0; i<this.listeners.length; i++) {
			if (this.listeners[i]==listenerObj) {
				this.listeners.splice(i,1);
				return;
			}
		}
	},
	
	notifyListeners : function (eventName,eventObj) {
		if (typeof this.listeners == 'undefined') return;
		for (var i=0; i< this.listeners.length; i++) {
			if (typeof this.listeners[i][eventName]!="undefined") {
				this.listeners[i][eventName](eventObj);
			}
		}
	}
};
