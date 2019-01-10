// Version: 1.0

var SnTScripts = {};

SnTScripts.ElementActions = function () {

	this.DisableElementOnRequest = function (object, className) {
		var _class;
		if (typeof className == 'undefined') {
			_class = "ActionInProgress";
		}
		else {
			_class = className;
		}

		disableElementOnRequest(object, _class);
	};

	this.EnableElementOnResponse = function (object, className) {
		var _class;
		if (typeof className == 'undefined') {
			_class = "ActionInProgress";
		}
		else {
			_class = className;
		}

		enableElementOnResponse(object, _class);
	};

	this.DisableAllElementsOnRequest = function (selector, className) {
		var _class;
		if (typeof className == 'undefined') {
			_class = "ActionInProgress";
		}
		else {
			_class = className;
		}

		$(selector).each(function (i) {
			$this = $(this);
			disableElementOnRequest($this, _class);
		});
	};

	this.EnableAllElementsOnResponse = function (selector, className) {
		var _class;
		if (typeof className == 'undefined') {
			_class = "ActionInProgress";
		}
		else {
			_class = className;
		}

		$(selector).each(function (i) {
			$this = $(this);
			enableElementOnResponse($this, _class);
		});
	};

	function disableElementOnRequest(object, className) {
		$this = $(object);
		$this.data('savedEvents', obj_copy($this.data('events')));
		$this.data('clickData', $this.attr('onclick'));
		$this.attr('obsoleteClick', $this.attr('onclick'));
		$this.attr('onclick', '');
		$this.unbind();

		if (className.length != 0) {
			$this.addClass(className);
		}
	};

	function enableElementOnResponse(object, className) {
		$this = $(object);
		var events = $this.data('savedEvents');
		if (events) {
			$this.unbind();
			for (var type in events) {
				for (var handler in events[type]) {
					$this.bind(type, events[type][handler]["handler"]);
				}
			}
		}

		var click = $this.attr('obsoleteClick');
		$this.click(function () {
			eval(click);
		});

		$this.attr('onclick', $this.data('clickData'));
		if (className.length != 0) {
			$this.removeClass(className);
		}
	};

	function obj_copy(obj) {
		var out = {};
		for (i in obj) {
			if (typeof obj[i] == 'object') {
				out[i] = $.extend({}, out[i], obj[i]);
			}
			else
				out[i] = obj[i];
		}
		return out;
	}
};
