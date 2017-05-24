# JS Validator
JS Validator is a Javascript form validator that lets you easily validate multiple input fields. JS Validator comes with an arsenal of build in validator rules but you may also build your own (extending). You can combine multiple fields for validation and set you own custom error messages. Don't forget to validate server side as well. 

We will handle:
-- Creating a new validator instance
-- Execute the validation and retreive the error messages
-- The special required rule
-- All other rules (34 rules)
-- Date formating
-- Combining fields
-- Events
-- Custom messages
-- Custom validator functions

## Create a new instance of the validator:
Creating an instance of the validator is as simple as this:
```
var validator = new Validator([string prefix, object node]);
```
The constructor accepts two optional arguments; prefix and node. 

##### Prefix parameter
The first argument is the prefix and will handle all the fieldnames that are build as an array like:
```
<input name="contact[email]">
<input name="contact[address][street]">
```
Just add the "contact" as prefix and you can point to the input without writing the full name:
```
var validator = new Validator('contact');
validator.field('email')
validator.field('address[street]')
```

##### Node parameter
If you have multiple forms with the same input names, you may select the form to validate by giving the node as second parameter:
```
var validator = new Validator(null, document.querySelector('#form'));
validator.field('email')
```
Now the validator will only validate the email field in the given form node.

## Execute validation
JS Validator comes with a arsenal of build in validation rules. To apply a rule you can do the following:
```
var validator = new Validator();

//In this example we will use the accepted rule
validator.field('fieldname').accepted()

//On fails event
validator.on('fails', function() {
    console.log(validator.getMessages());
});

//On success event
validator.on('passes', function() {
});

//Execute validation
validator.exec();
```
##### Chaining
You may also apply multiple rules by chaining them.
```
validator = new Validator();
validator.field('fieldname').min(0).max(6).lengthmax(1);
```
##### Retreive error messages
You can use the "getMessages" method to return an Object with errors. This method accepts one parameter as a boolean to retreive the fullnames or shortnames of the error fields. This only works when you set the prefix in the validator instance . Default is false (short names).
```
<input name="contact[surname]" value="A">

<script>
var validator = new Validator('contact');
validator.field('surname').lengthmin(2);
validator.exec();

console.log(validator.getMessages()); 
//Output: [surname: "Minimum 2 characters"]

console.log(validator.getMessages(true)); 
//Output: [contact[surname]: "Minimum 2 characters"]
</script>
```
##### Retreive single error messages
You may also retreive a single error message:
```
<input name="contact[surname]" value="A">

<script>
var validator = new Validator();
validator.field('contact[surname]').lengthmin(2);
validator.exec();

console.log(validator.getMessage('contact[surname]')); 
//Output: Minimum 2 characters
</script>
```
## Validation rules
### Special rule "required"
Before explaining all the rules, you need to know the existence of the "required" rule. This rule is a special rule because you can enable and disable other rules based on if the input is empty or not.

For example, if the surname field is not required and thus may be empty, you can set the required to false. If the user leaves the input blank, it will not validate the input:
```
<input name="surname" value="">

<script>
validator.field('fieldname').required(false).lengthmax(20);
</script>
```
### Rule list
##### Accepted
Check whenever a checkbox is checked or not.
```
validator.field('fieldname').accepted();
```
##### After
Check whenever a value is after a given date. You need to pass a date format. See "Date format" section for accepted formats.
```
validator.field('fieldname').after('2000-01-01', 'Y-m-d');
```
##### Alpha
Check whenever a value only contains alpha characters (letters a-z, A-Z).
```
validator.field('fieldname').alpha();
```
##### Alphadash
Check whenever a value only contains alphadash characters (letters a-z, A-Z, digits 0-9, dashes and underscores).
```
validator.field('fieldname').alphadash();
```
##### Alphanumeric
Check whenever a value only contains alphanumeric characters (letters a-z, A-Z and digits 0-9).
```
validator.field('fieldname').alphanumeric();
```
##### Before
Check whenever a value is before a given date. You need to pass a date format. See "Date format" section for accepted formats.
```
validator.field('fieldname').before('2020-01-01', 'Y-m-d');
```
##### Between
Check whenever a value is between two numbers. Between accepts two parameters. A minimum and a maximum in Float, Int or a string number
```
validator.field('fieldname').between(5, 10);
```
##### Contains
Check whenever a value contains a specified string.
```
validator.field('fieldname').contains('abc');
```
##### Different
Check whenever a value is not the same as a value of another fieldname. See the "notequal" rule if you want to compare a given value.
```
validator.field('fieldname-one').different('fieldname-two');
```
##### Email
Check whenever a value is a valid email address. 
```
validator.field('fieldname').email();
```
##### Equals
Check whenever a value is equal to a given string. 
```
validator.field('fieldname').equals('abc');
```
##### Equals
Check whenever a value is equal to a given string. A second parameter can be given if you want to check in strict mode. Strict mode lets you compare not only the value but also the type of the value. Default is false.
```
validator.field('fieldname').equals('abc', true);
```
##### In
Check whenever a value exists in an Array. See the "notin" rule for the opposite.
```
validator.field('fieldname').in(['a', 'b', 'c']);
```
##### IP
Check whenever a value is a valid IPV4 or IPV6 address.
```
validator.field('fieldname').ip();
```
##### IPV4
Check whenever a value is a valid IPV4 address.
```
validator.field('fieldname').ipv4();
```
##### IPV6
Check whenever a value is a valid IPV6 address.
```
validator.field('fieldname').ipv6();
```
##### Isdate
Check whenever a value is a valid date. You need to pass a date format. See "Date format" section for accepted formats.
```
validator.field('fieldname').isdate('Y-m-d');
```
##### Isint
Check whenever a value is a integer number. Isint is not type strict.
```
validator.field('fieldname').isint();
```
##### Isnumeric
Check whenever a value is a valid number. Isnumeric is not type strict.
```
validator.field('fieldname').isnumeric();
```
##### JSON
Check whenever a value is a valid JSON string.
```
validator.field('fieldname').json();
```
##### Length
Check whenever the length of a value is equal to a given length. See also "lengthbetween", "lengthmax" and "lengthmin" rules.
```
validator.field('fieldname').length(10);
```
##### Lengthbetween
Check whenever the length of a value is between to given lengths.
```
validator.field('fieldname').lengthbetween(5, 10);
```
##### Lengthmax
Check whenever the length of a value is equal or less than a given length.
```
validator.field('fieldname').lengthmax(10);
```
##### Lengthmin
Check whenever the length of a value is equal or greater than a given length.
```
validator.field('fieldname').lengthmin(10);
```
##### Max
Check whenever a value is equal or less than a given maximum. Good for comparing numbers.
```
validator.field('fieldname').max(10);
```
##### Maxwords
Check whenever the amount of words is equal or less than a given maximum amount.
```
validator.field('fieldname').maxwords(20);
```
##### Min
Check whenever a value is equal or greater than a given minimum. Good for comparing numbers.
```
validator.field('fieldname').min(5);
```
##### Minwords
Check whenever the amount of words is equal or greater than a given minimum amount.
```
validator.field('fieldname').minwords(5);
```
##### Notcontains
Check whenever a value not contains a specified string. See the "contains" rule for the opposite.
```
validator.field('fieldname').notcontains('abc');
```
##### Notequals
Check whenever a value is not equal to a given string. A second parameter can be given if you want to check in strict mode. Strict mode lets you compare not only the value but also the type of the value. Default is false.
```
validator.field('fieldname').notequals('abc', true);
```
##### Notin
Check whenever a value does not exists in an Array. See the "in" rule for the opposite.
```
validator.field('fieldname').in(['a', 'b', 'c']);
```
##### Present
Check whenever a value is present. If an input is deleted or not submitted, you can check if it exists with the "present" rule.
```
validator.field('fieldname').present();
```
##### Regex
Check whenever a value is valid compared to a given regex. You may give the regex as a String or RegExp object.
```
validator.field('fieldname').regex('^[a-z]+$');
validator.field('fieldname').regex(new RegExp('^[a-z]+$'));
```
##### URL
Check whenever a value is a valid URL.
```
validator.field('fieldname').url();
```
##### Words
Check whenever the amount of words equals a given amount.
```
validator.field('fieldname').words(10);
```


## Date formating
JS Validator has multiple date validation rules that require a date format parameter. The following characters are recognized in the format parameter string:
```
Y:  	A full numeric representation of a year, 4 digits           	Examples: 1999 or 2003
y:  	A two digit representation of a year                        	Examples: 99 or 03
n:  	Numeric representation of a month, without leading zeros    	1 through 12
m:  	Numeric representation of a month, with leading zeros       	01 through 12
d:  	Day of the month, 2 digits with leading zeros               	01 to 31
j:  	Day of the month without leading zeros                  	1 to 31
g:  	12-hour format of an hour without leading zeros             	1 through 12
G:  	24-hour format of an hour without leading zeros             	0 through 23
h:  	12-hour format of an hour with leading zeros                	01 through 12
H:  	24-hour format of an hour with leading zeros                	00 through 23
i:  	Minutes with leading zeros                                  	00 to 59
s:  	Seconds, with leading zeros                                 	00 through 59
```


## Combining
```
<input type="text" name="year" value="2020">
<input type="text" name="month" value="01">
<input type="text" name="day" value="01">
```
##### Combining with the glue method
You can combine multiple fields with the glue method:
```
<script>
validator = new Validator();
validator.combine('year', 'month', 'day').glue('-').name('date');
validator.field('date').isdate('Y-m-d');
validator.exec();
</script>
```
You create a new fieldname called "date" and execute the validation
##### Combining with the format method
You can also combine multiple fields with the format method for more control:
```
<script>
validator = new Validator();
validator.combine('year', 'month', 'day').format('%s-%s/%s).name('date');
validator.field('date').isdate('Y-m/d');
validator.exec();
</script>
```
Each "%s" is replaced with the specified input fieldname order.


## Events
When the validation starts, there are four events that can be triggered. You can map the events to your functions.
##### Passes event
The passes event will raise when there are no validation errors:
```
validator = new Validator();
validator.field('date').isdate('Y-m-d');
validator.on('passes', function() {
    //Success
}
validator.exec();
```
##### Fails event
The fails event will raise when there are validation errors:
```
validator = new Validator();
validator.field('date').isdate('Y-m-d');
validator.on('passes', function() {
    //Fails
    console.log(validator.getMessages());
}
validator.exec();
```
##### Start event
The start event will raise when the validation has begun:
```
validator = new Validator();
validator.field('date').isdate('Y-m-d');
validator.on('start', function() {
    //validation has started
}
validator.exec();
```
##### End event
The end event will raise when the validation has ended:
```
validator = new Validator();
validator.field('date').isdate('Y-m-d');
validator.on('end', function() {
    //validation has ended
}
validator.exec();
```


## Custom messages
Each validation rule has its own error message. If you want to set a custom message per rule or even per rule in combination with a field, you may do so.

##### Custom message per rule
Set custom error message for all fields with the "equals" rule
```
validator = new Validator();
validator.field('amount').equals('1000');
validator.setMessage().equals('Only 1000 as value is accepted');
```
##### Custom message per rule and per field
Set custom error message for the "amount" field with the "equals" rule
```
validator = new Validator();
validator.field('amount').equals('1000');
validator.setMessage('amount').equals('Only 1000 as value is accepted');
```


## Custom validator functions
JS Validator has a lot of build in validation rules. But if you want for example check an e-mail address server side with an ajax request, you have to build your own validation rule. You may use the "extend" method to build a custom validation rule.

The extend fucntion accepts a minimal of three paramaters. The first parameter will be the name of you validation rule. The second parameter is a callable function and the third paramater is the error message when the validation fails.

The callable function (second parameter) will be injected with four parameters. The fieldname, the value of the input and a callable fail and success function.
```
validator = new Validator();
validator.extend('age', function(field, value, fail, success) {
		
	setTimeout(function() {
		if(value !== '10') { 
		    fail(); 
		} else { 
		    success(); 
		}
	}, 1000)

}, 'Value not equals 10');
```
