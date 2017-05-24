/**
 * JS Validator
 *
 * @link      http://github.com/Kris-Kuiper/JS-Validator
 * @copyright Copyright (c) 2017 JS-Validator.
 * @license   GNU AFFERO GENERAL PUBLIC LICENSE
 */

function Validator(prefix, form) {

	function Combine() {
		
		var data = {

			values 		: [],
			fieldnames 	: [],
			glue 		: null,
			name 		: null,
			format 		: null
		}

		this.setValues = function(values) {
			data.values = values;
		}

		this.setFieldnames = function(fieldnames) {
			data.fieldnames = fieldnames;
		}

		this.getFieldnames = function() {
			return data.fieldnames;
		}

		this.glue = function(glue) {
			
			data.glue = glue;
			return this;
		}

		this.format = function(format) {
			
			data.format = format;
			return this;
		}

		this.name = function(name) {
			
			data.name = name;
			return this;
		}

		this.getName = function() {
			return data.name;
		}

		this.combine = function() {

			if(data.values.length > 0) {

				if(null !== data.glue) {
					return data.values.join(data.glue);
				}
				
				for(var i in data.values) {
					data.format = data.format.replace('%s', data.values[i]);
				}

				return data.format;
			}
		}
	}

	var Rule = {

	    field 		: null,
	    prefix 		: null,
	    parameters 	: null,
	    message 	: null,
	    value 		: null,
	    values 		: null,
	    object 		: null,

	    getField : function() {
	        return this.field;
	    },

	    getPrefix : function() {
	        return this.prefix;
	    },

	    getParameters : function() {
	        return this.parameters;
	    },

	    getMessage : function() {
	        return this.message;
	    },

	    getValue : function() {
	        return this.value;
	    },

	    getValues : function() {
	        return this.values;
	    },

	    getObject : function() {
	        return this.object;
	    },

	    setField : function(field) {
	        this.field = field;
	    },

	    setPrefix : function(prefix) {
	        this.prefix = prefix;
	    },

	    setParameters : function(parameters) {
	        this.parameters = parameters;
	    },

	    setMessage : function(message) {
	        this.message = message;
	    },

	    setValue : function(value) {
	    	this.value = value;
	    },

	    setValues : function(fieldname, value) {
	        this.values[fieldname] = value;
	    },

	    setObject : function(object) {
	        this.object = object;
	    }
	}

	var rules    = [];
	var combine  = [];
	var events 	 = {};
	var passes   = true;
	var prefix   = prefix;
	var errors 	 = {short : [], full : []};
	var required = {};

	var ruleset = {
		
		accepted : {

			message : 'Must be accepted',

			isValid : function() {
				return true === this.getObject().checked;
			}
		}, 

		after : {

			message : 'Date should be after %s',

			isValid : function() {
				
				var data 	= this.getValue();
				var params 	= this.getParameters();
				var before  = params[0];
				var format 	= params[1];
				var d1, d2;
				
				if((d1 = parseDate(data, format)) && (d2 = parseDate(before, format))) {
					return d1.getTime() > d2.getTime();
				}

				return false;
			}
		}, 

		alpha : {

			message : 'Only letters allowed (a-z)',

			isValid : function() {
				return this.getValue() && null !== this.getValue().match(/^[a-zA-Z]+$/);
			}
		}, 

		alphadash : {

			message : 'Only letters a-z, digits 0-9, dashes and underscores allowed',

			isValid : function() {
				return this.getValue() && null !== this.getValue().match(/^[a-zA-Z0-9_-]+$/);
			}
		},

		alphanumeric : {

			message : 'Only letters and numbers allowed (a-z, 0-9)',

			isValid : function() {
				return this.getValue() && null !== this.getValue().match(/^[a-zA-Z0-9]+$/);
			}
		}, 

		before : {
			
			message : 'Date should be before %s',

			isValid : function() {
				
				var data 	= this.getValue();
				var params 	= this.getParameters();
				var before  = params[0];
				var format 	= params[1];
				var d1, d2;
				
				if((d1 = parseDate(data, format)) && (d2 = parseDate(before, format))) {
					return d1.getTime() < d2.getTime();
				}

				return false;
			}
		}, 

		between : {
			
			message : 'Must be between "%s" and "%s"',

			isValid : function() {
				
				var data   = this.getValue();
				var params = this.getParameters();

				if(undefined === params[0]) {
					throw 'Missing argument 1 for "between" rule';
				}

				if(undefined === params[1]) {
					throw 'Missing argument 2 for "between" rule';
				}

				if('string' === typeof(data)) {
					return parseFloat(data) >= parseFloat(params[0]) && parseFloat(data) <= parseFloat(params[1]);
				}

				return false;
			}
		}, 

		contains : {
			
			message : 'Must contain "%s"',

			isValid : function() {
				
				var data   = this.getValue();
				var params = this.getParameters();

				if(undefined === params[0]) {
					throw 'Missing argument 1 for "contains" rule';
				}

				if('string' === typeof(data)) {
					return null !== data.match(params[0]);
				}

				return false;
			}
		}, 

		different : {
			
			message : 'Can not have the same value as "%s" field',

			isValid : function() {

				var params = this.getParameters();

				return !(this.getValue() === getValue(params[0], this.prefix));
			}
		}, 

		email : {
			
			message : 'Should be a valid email address',

			isValid : function() {

				var data = this.getValue();

				if('string' === typeof(data)) {
					
					var re = /^(([^<>()\[\]\.,;:\s@\"]+(\.[^<>()\[\]\.,;:\s@\"]+)*)|(\".+\"))@(([^<>()[\]\.,;:\s@\"]+\.)+[^<>()[\]\.,;:\s@\"]{2,})$/i;
					return re.test(data);
				}

				return false;
			}
		}, 

		equals : {
			
			message : 'Must be equal to "%s"',

			isValid : function() {
				
				var data   = this.getValue();
				var params = this.getParameters();
				var strict = false;

				if(undefined === params[0]) {
					throw 'Missing argument 1 for "equals" rule';
				}

				if(undefined !== params[1]) {
					strict = params[1];
				}

				if('string' === typeof(data)) {
					return true === (strict === true ? (data === params[0]) : (data == params[0]));
				}

				return false;
			}
		}, 

		in : {
			
			message : 'Invalid input',

			isValid : function() {
				
				var data   = this.getValue();
				var params = this.getParameters();

				if(undefined === params[0]) {
					throw 'Missing argument 1 for "in" rule';
				}

				return params[0].indexOf(data) >= 0;
			}
		}, 

		ip : {
			
			message : 'Invalid IP address',

			isValid : function() {
				
				var data = this.getValue();

				if('string' === typeof(data)) {

					var ipv4 = /^(25[0-5]|2[0-4][0-9]|[01]?[0-9][0-9]?)\.(25[0-5]|2[0-4][0-9]|[01]?[0-9][0-9]?)\.(25[0-5]|2[0-4][0-9]|[01]?[0-9][0-9]?)\.(25[0-5]|2[0-4][0-9]|[01]?[0-9][0-9]?)$/;
					var ipv6 = /^((?:[0-9A-Fa-f]{1,4}))((?::[0-9A-Fa-f]{1,4}))*::((?:[0-9A-Fa-f]{1,4}))((?::[0-9A-Fa-f]{1,4}))*|((?:[0-9A-Fa-f]{1,4}))((?::[0-9A-Fa-f]{1,4})){7}$/;
					
					return ipv4.test(data) || ipv6.test(data);
				}

				return false;
			}
		}, 

		ipv4 : {
			
			message : 'Invalid IPv4 address',

			isValid : function() {
				
				var data = this.getValue();

				if('string' === typeof(data)) {

					var re = /^(25[0-5]|2[0-4][0-9]|[01]?[0-9][0-9]?)\.(25[0-5]|2[0-4][0-9]|[01]?[0-9][0-9]?)\.(25[0-5]|2[0-4][0-9]|[01]?[0-9][0-9]?)\.(25[0-5]|2[0-4][0-9]|[01]?[0-9][0-9]?)$/;
					return re.test(data);
				}

				return false;
			}
		}, 

		ipv6 : {
			
			message : 'Invalid IPv6 address',

			isValid : function() {
				
				var data = this.getValue();

				if('string' === typeof(data)) {

					var re = /^((?:[0-9A-Fa-f]{1,4}))((?::[0-9A-Fa-f]{1,4}))*::((?:[0-9A-Fa-f]{1,4}))((?::[0-9A-Fa-f]{1,4}))*|((?:[0-9A-Fa-f]{1,4}))((?::[0-9A-Fa-f]{1,4})){7}$/;
					return re.test(data);
				}

				return false;
			}
		}, 

		isdate : {
			
			message : 'Must be a valid date',

			isValid : function() {
				
				var data 	= this.getValue();
				var params 	= this.getParameters();
				var format 	= params[0];
				
				return false !== parseDate(data, format);
			}
		}, 

		isint : {
			
			message : 'Must be an integer number',

			isValid : function() {
				return parseInt(this.getValue()) == this.getValue();
			}
		}, 

		isnumeric : {
			
			message : 'Must be a number',

			isValid : function() {
				
				var data = this.getValue();

				return !isNaN(parseFloat(data)) && isFinite(data);
			}
		}, 

		json : {
			
			message : 'Invalid JSON string',

			isValid : function() {
				
				try { JSON.parse(this.getValue()); } catch (e) { return false; }
			    return true;
			}
		}, 

		length : {
			
			message : 'Should be %s characters long',

			isValid : function() {
				
				var data   = this.getValue();
				var params = this.getParameters();

				if(undefined === params[0]) {
					throw 'Missing argument 1 for "length" rule';
				}

				if('string' === typeof(data)) {
					return data.length == params[0];
				}

				return false;
			}
		}, 

		lengthbetween : {
			
			message : 'Should be between %s and %s characters long',

			isValid : function() {
				
				var data   = this.getValue();
				var params = this.getParameters();

				if(undefined === params[0]) {
					throw 'Missing argument 1 for "lengthbetween" rule';
				}

				if(undefined === params[1]) {
					throw 'Missing argument 2 for "lengthbetween" rule';
				}

				if('string' === typeof(data)) {
					return data.length >= params[0] && data.length <= params[1];
				}

				return false;
			}
		}, 

		lengthmax : {
			
			message : 'Maximum %s characters',

			isValid : function() {
				
				var data   = this.getValue();
				var params = this.getParameters();

				if(undefined === params[0]) {
					throw 'Missing argument 1 for "lengthmax" rule';
				}

				if('string' === typeof(data)) {
					return data.length <= params[0];
				}

				return false;
			}
		}, 

		lengthmin : {
			
			message : 'Minimum %s characters',

			isValid : function() {

				var data   = this.getValue();
				var params = this.getParameters();

				if(undefined === params[0]) {
					throw 'Missing argument 1 for "lengthmin" rule';
				}

				if('string' === typeof(data)) {
					return data.length >= params[0];
				}

				return false;
			}
		}, 

		max : {

			message : 'Must be less than or equal to %s',

			isValid : function() {
				
				var data   = this.getValue();
				var params = this.getParameters();

				if(undefined === params[0]) {
					throw 'Missing argument 1 for "max" rule';
				}

				if('string' === typeof(data)) {
					return parseFloat(data) <= parseFloat(params[0]);
				}

				return false;
			}
		},

		maxwords : {

			message : 'Maximum of %s words exceeded',

			isValid : function() {

				var data = this.getValue();
				var params = this.getParameters();

				if(undefined === params[0]) {
					throw 'Missing argument 1 for "words" rule';
				}

				if('' === data.trim() && parseInt(params[0]) === 0) {
					return true;
				}
				
				return data.trim().split(' ').length <= parseInt(params[0]);
			}
		} , 

		min : {

			message : 'Must be greater than or equal to %s',

			isValid : function() {
				
				var data   = this.getValue();
				var params = this.getParameters();

				if(undefined === params[0]) {
					throw 'Missing argument 1 for "max" rule';
				}

				if('string' === typeof(data)) {
					return parseFloat(data) >= parseFloat(params[0]);
				}

				return false;
			}
		},

		minwords : {

			message : 'A minimum of %s words is required',

			isValid : function() {

				var data   = this.getValue();
				var params = this.getParameters();

				if(undefined === params[0]) {
					throw 'Missing argument 1 for "words" rule';
				}

				if('' === data.trim() && parseInt(params[0]) === 0) {
					return true;
				}
				
				return data.trim().split(' ').length >= parseInt(params[0]);
			}
		},

		notcontains : {

			message : 'May not contain "%s"',

			isValid : function() {
				
				var data   = this.getValue();
				var params = this.getParameters();

				if(undefined === params[0]) {
					throw 'Missing argument 1 for "notcontains" rule';
				}

				if('string' === typeof(data)) {
					return null === data.match(params[0]);
				}

				return false;
			}
		}, 

		notequals : {

			message : 'Must not be equal to "%s"',

			isValid : function() {
				
				var data   = this.getValue();
				var params = this.getParameters();
				var strict = false;

				if(undefined === params[0]) {
					throw 'Missing argument 1 for "notequals" rule';
				}

				if(undefined !== params[1]) {
					strict = params[1];
				}

				if('string' === typeof(data)) {
					return true !== (strict === true ? (data !== params[0]) : (data != params[0]));
				}

				return false;
			}
		}, 

		notin : {

			message : 'Invalid input',

			isValid : function() {
				
				var data   = this.getValue();
				var params = this.getParameters();

				if(undefined === params[0]) {
					throw 'Missing argument 1 for "in" rule';
				}

				return params[0].indexOf(data) < 0;
			}
		}, 

		present : {

			message : 'Required',

			isValid : function() {
				return !(null === this.getValue() || undefined === this.getValue());
			}
		}, 

		regex : {

			message : 'Invalid value',

			isValid : function() {
				
				var data = this.getValue();
				var params = this.getParameters();

				if(undefined === params[0]) {
					throw 'Missing argument 1 for "regex" rule';
				}

				var rg = params[0];

				if('string' === typeof(params[0])) {
					rg = new RegExp(params[0]);
				}

				if('object' !== typeof(rg)) {
					throw 'Argument 1 for "regex" rule should be a valid Regex object';
				}

				if('string' === typeof(data)) {
					return rg.test(data);
				}

				return false;
			}
		}, 

		url : {

			message : 'No valid URL',

			isValid : function() {
				
				var data = this.getValue();

				if('string' === typeof(data)) {
					
					var re = /^(?:(?:(?:https?|ftp):)?\/\/)(?:\S+(?::\S*)?@)?(?:(?!(?:10|127)(?:\.\d{1,3}){3})(?!(?:169\.254|192\.168)(?:\.\d{1,3}){2})(?!172\.(?:1[6-9]|2\d|3[0-1])(?:\.\d{1,3}){2})(?:[1-9]\d?|1\d\d|2[01]\d|22[0-3])(?:\.(?:1?\d{1,2}|2[0-4]\d|25[0-5])){2}(?:\.(?:[1-9]\d?|1\d\d|2[0-4]\d|25[0-4]))|(?:(?:[a-z\u00a1-\uffff0-9]-*)*[a-z\u00a1-\uffff0-9]+)(?:\.(?:[a-z\u00a1-\uffff0-9]-*)*[a-z\u00a1-\uffff0-9]+)*(?:\.(?:[a-z\u00a1-\uffff]{2,})))(?::\d{2,5})?(?:[/?#]\S*)?$/i;
  					return re.test(data);
  				}

  				return false;
			}
		},

		words : {

			message : 'Amount of words is not equal to %s',

			isValid : function() {

				var data = this.getValue();
				var params = this.getParameters();

				if(undefined === params[0]) {
					throw 'Missing argument 1 for "words" rule';
				}

				if('' === data.trim() && parseInt(params[0]) === 0) {
					return true;
				}
				
				return data.trim().split(' ').length === parseInt(params[0]);
			}
		}
	}

	var addRule = function(rule, fieldnames, parameters, closue, message) {

		for(var field in fieldnames) {

			rules.push({

				rule 		: rule, 
				field 		: fieldnames[field],
				object 		: getObject(fieldnames[field], prefix) ,
				parameters	: parameters,
				closure		: closue,
				prefix 		: prefix,
				message		: message
			});
		}
	};

	var setErrorMessage = function(rule) {

		message = rule.message;

		if(undefined === rule.message) {
			message = ruleset[rule.rule].message;
		}

		for(var i in rule.parameters) {
			message = message.replace('%s', rule.parameters[i]);
		}

		errors.short[rule.field] = message;

		if(undefined !== rule.prefix) {
			
			var full = rule.prefix + '[' + rule.field + ']';
			errors.full[full] = message;
		}
		else {
			errors.full[rule.field]  = message;
		}
	}

	var getObject = function(field, prefix) {

		//Prefix
		if(null !== prefix && undefined !== prefix) {
			field = prefix + '[' + field + ']';
		}

		var obj = undefined !== form && undefined !== form.querySelector ? form : document;
		return obj.querySelector('[name="'+ field +'"]');
	}

	var getValue = function(field, prefix) {

		for(var i in combine) {
			
			if(combine[i].getName() === field) {
				return combine[i].combine();
			}
		}

		//Prefix
		if(null !== prefix && undefined !== prefix) {
			field = prefix + '[' + field + ']';
		}

		var obj   = getObject(field);
		var value = null;

		if(null !== obj) {

			switch(obj.nodeName.toLowerCase()) {

				case 'input' 	: 
				case 'textarea' : value = obj.value; break;
				case 'select' 	: value = obj.options[obj.selectedIndex].value; break;
			}
		}

		return value;
	}

	var check = function(index) {

		var amount = rules.length;

		if(index === amount) {

			events.end && events.end();

			if(0 === Object.keys(errors.short).length) {
				return events.passes && events.passes();
			}
	
			return events.fails && events.fails();
		}
	}

	var parseDate = function(data, format) {

		var rg 	  = '';
		var types = [];

		if('string' === typeof(data)) {

			for(var a in format) {

				switch(format[a]) {

					case 'Y' : rg += '([0-9]{4})'; types.push('year'); break;
					case 'y' : rg += '([0-9]{2})'; types.push('year');break;
					case 'n' : rg += '([1-9]|1[0-2])'; types.push('month'); break;
					case 'm' : rg += '(0[1-9]|1[0-2])'; types.push('month'); break;
					case 'd' : rg += '(0[1-9]|1[0-9]|2[0-9]|3[0-1])'; types.push('day'); break;
					case 'j' : rg += '([1-9]|1[0-9]|2[0-9]|3[0-1])'; types.push('day');  break;
					case 'g' : rg += '([1-9]|1[0-2])'; types.push('hour'); break;
					case 'G' : rg += '([0-9]|1[0-9]|2[0-3])'; types.push('hour'); break;
					case 'h' : rg += '([0-9]|[1-5][0-9])'; types.push('hour'); break;
					case 'H' : rg += '(0[0-9]|[1-5][0-9])'; types.push('hour'); break;
					case 'i' : rg += '([0-5][0-9])'; types.push('minute'); break;
					case 's' : rg += '([0-5][0-9])'; types.push('second'); break;

					default : rg += '\\' + format[a]; break;
				}
			}

			var matches = data.match('^' + rg + '$');

			if(null !== matches) {

				var date = {year : null, month : null, day : null, hours : null, minutes : null, seconds : null};

				for(var a in types) {
					date[types[a]] = matches[1 + parseInt(a)];
				}

				var t = new Date(date.year, date.month - 1, date.day, date.hours, date.minutes, date.seconds, 0);

				if(t.getDate() === parseInt(date.day)) {
					return t;
				}
			}
		}

		return false;
	}

	var isRequired = function(field, value) {

		if(undefined !== required[field]) {
			
			if(false === required[field] && value.trim() === '') {
			    return true;
			}
		}

		return false;
	}

	this.exec = function() {

		events.start && events.start();

		var index = 0;

		for(var i in rules) {

			var value = getValue(rules[i].field, rules[i].prefix);

			//Execute custom extended validator
			if('function' === typeof(rules[i].closure)) {

				rules[i].closure(rules[i].field, value, function() {
					
					setErrorMessage(rules[i]);
					return check(++index);

				}, function() {
					check(++index);
				});

				continue;
			}

			//Execute build in validator
			var obj  = rules[i].rule;
			var rule = ruleset[obj];

			//Set rule data
			rule.setField(rules[i].field);
			rule.setValue(value);
			rule.setPrefix(rules[i].prefix);
			rule.setParameters(rules[i].parameters);
			rule.setObject(getObject(rules[i].field, rules[i].prefix));

			//Check if rule passes
			if(false === isRequired(rules[i].field, value) && false === rule.isValid()) {
				
				setErrorMessage(rules[i]);

				for(var a in combine) {
						
					if(combine[a].getName() === rules[i].field) {

						var fieldnames = combine[a].getFieldnames();

						for(var b in fieldnames) {
							
							rules[i].field = fieldnames[b];
							setErrorMessage(rules[i]);
						}

						break;
					}
				}
			}

			check(++index);
		}
	};

	this.extend = function(fields, closure, message) {
		
		if('string' === typeof(fields)) {
			fields = [fields];
		}

		addRule(null, fields, null, closure, message);
	}

	this.combine = function() {

		var fields = arguments;
		var values = [];
		
		for(field in fields) {
			values.push(getValue(fields[field], prefix));
		}

		comb = new Combine();
		comb.setValues(values);
		comb.setFieldnames(fields);

		combine.push(comb);
		
		return comb;
	}

	this.field = function() {

		var fieldnames = arguments;
		var tmp 	   = {};

		for(var i in ruleset) {
			
			(function(i) {

				tmp[i] = function() {

					addRule(i, fieldnames, arguments);
					return this;
				}
			})(i);
		}

		tmp.required = function(req) {
			
			if(undefined === req) {
				req = true;
			}

			for(var i in fieldnames) {
				required[fieldnames[i]] = req;
			}

			return this;
		}

		return tmp;
	}

	this.setMessage = function() {

		var fieldnames = arguments;
		var tmp 	   = {};

		for(var i in ruleset) {
			
			(function(i) {

				tmp[i] = function(message) {

					if(0 === fieldnames.length) {

						for(var a in rules) {

							if(rules[a].rule === i) {
								rules[a].message = message;
							}
						}
					}
					else {

						for(var a in rules) {

							for(var b in fieldnames) {

								if(rules[a].rule === i && fieldnames[b] === rules[a].field) {
									rules[a].message = message;
								}
							}
						}
					}

					return this;
				}
			})(i);
		}

		return tmp;
	}

	this.getMessages = function(fullnames) {
		
		if(true === fullnames) {
			return errors.full;
		}

		return errors.short;
	},

	this.getMessage = function(field) {

		if(undefined !== errors.short[field]) {
			return errors.short[field];
		}

		return errors.full[field];
	},

	this.on = function(type, callback) {
		events[type] = callback;
	}

	for(var i in ruleset) {

		var obj = ruleset[i];

		ruleset[i] = Object.create(Rule);

		for(var attr in obj) { 
			ruleset[i][attr] = obj[attr]; 
		}
	}
}