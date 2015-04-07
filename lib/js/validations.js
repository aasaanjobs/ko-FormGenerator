var validations = {
    required: function(value, message, viewmodel) {
        var val = "";
        if (Array.isArray(value)) {
            val = value.join("");
        } else {
            val = value;
        }
        if (val.length > 0) {
            return null;
        } else {
            return message;
        }
    },
    pattern: function(value, message, viewmodel) {
        if (Array.isArray(value)) {
            return null;
        } else if (value.match(message) !== null) {
            return null;
        } else {
            return "Please check this value.";
        }
    },
    minValue: function(value, message, viewmodel) {
        if (isNaN(value)) {
            return "Please enter a number";
        } else {
            var num = parseInt(value);
            if (message > num) {
                return "Please enter a value greater than or equal to " + message;
            } else {
                return null;
            }
        }
    },
    maxValue: function(value, message, viewmodel) {
        if (isNaN(value)) {
            return "Please enter a number";
        } else {
            var num = parseInt(value);
            if (message < num) {
                return "Please enter a value less than or equal to " + message;
            } else {
                return null;
            }
        }
    },
    minLength: function(value, message, viewmodel) {
        if (value.length < message) {
            return "Please enter at least " + message + " characters.";
        } else {
            return null;
        }
    },
    maxLength: function(value, message, viewmodel) {
        if (value.length > message) {
            return "Please enter no more than " + message + " characters.";
        } else {
            return null;
        }
    },
    email: function(value, message, viewmodel) {
        var validator = new RegExp(/^((([a-z]|\d|[!#\$%&'\*\+\-\/=\?\^_`{\|}~]|[\u00A0-\uD7FF\uF900-\uFDCF\uFDF0-\uFFEF])+(\.([a-z]|\d|[!#\$%&'\*\+\-\/=\?\^_`{\|}~]|[\u00A0-\uD7FF\uF900-\uFDCF\uFDF0-\uFFEF])+)*)|((\x22)((((\x20|\x09)*(\x0d\x0a))?(\x20|\x09)+)?(([\x01-\x08\x0b\x0c\x0e-\x1f\x7f]|\x21|[\x23-\x5b]|[\x5d-\x7e]|[\u00A0-\uD7FF\uF900-\uFDCF\uFDF0-\uFFEF])|(\\([\x01-\x09\x0b\x0c\x0d-\x7f]|[\u00A0-\uD7FF\uF900-\uFDCF\uFDF0-\uFFEF]))))*(((\x20|\x09)*(\x0d\x0a))?(\x20|\x09)+)?(\x22)))@((([a-z]|\d|[\u00A0-\uD7FF\uF900-\uFDCF\uFDF0-\uFFEF])|(([a-z]|\d|[\u00A0-\uD7FF\uF900-\uFDCF\uFDF0-\uFFEF])([a-z]|\d|-|\.|_|~|[\u00A0-\uD7FF\uF900-\uFDCF\uFDF0-\uFFEF])*([a-z]|\d|[\u00A0-\uD7FF\uF900-\uFDCF\uFDF0-\uFFEF])))\.)+(([a-z]|[\u00A0-\uD7FF\uF900-\uFDCF\uFDF0-\uFFEF])|(([a-z]|[\u00A0-\uD7FF\uF900-\uFDCF\uFDF0-\uFFEF])([a-z]|\d|-|\.|_|~|[\u00A0-\uD7FF\uF900-\uFDCF\uFDF0-\uFFEF])*([a-z]|[\u00A0-\uD7FF\uF900-\uFDCF\uFDF0-\uFFEF])))$/i);
        if (!validator.test(value)) {
            return message;
        } else {
            return null;
        }
    },
    number: function(value, message, viewmodel) {
        if (isNaN(value)) {
            return message;
        } else {
            return null;
        }
    },
    digit: function(value, message, viewmodel) {
        if (/^\d+$/.test(value)) {
            return null;
        } else {
            return message;
        }
    },
    equal: function(value, message, viewmodel) {
        var val = "";
        var valid = "";
        if (Array.isArray(value) && Array.isArray(message)) {
            val = value.join("");
            valid = message.join("");
            if (val === valid) {
                return null;
            } else {
                return "Values must be equal to " + message;
            }
        } else {
            if (value === message) {
                return null;
            } else {
                return "Values must be equal to " + message;
            }
        }
    },
    notEqual: function(value, message, viewmodel) {
        var val = "";
        var valid = "";
        if (Array.isArray(value) && Array.isArray(message)) {
            val = value.join("");
            valid = message.join("");
            if (val !== valid) {
                return null;
            } else {
                return "Values must be equal to " + message;
            }
        } else {
            if (value !== message) {
                return null;
            } else {
                return "Values must be equal to " + message;
            }
        }
    },
    externalCall: function(value, params, viewmodel) {
        console.log("Make External Call");
        if (params.functParam) {
            var functParam = params.functParam;
            var dataToSent = {};
            if (Array.isArray(functParam)) {
                for (var f = 0; f < functParam.length; f++) {
                    var tempIndex = viewmodel.FieldsID().indexOf(functParam[f]);
                    dataToSent[viewmodel.Fields()[tempIndex].Name()] = viewmodel.Fields()[tempIndex].Value();
                }
            } else {
                var tempIndex = viewmodel.FieldsID().indexOf(functParam);
                dataToSent[viewmodel.Fields()[tempIndex].Name()] = viewmodel.Fields()[tempIndex].Value();
            }
            var temp = window[params.funct](value, dataToSent);
        } else {
            var temp = window[params.funct](value);
        }
        console.log("externalCall ", temp);
        return temp;
    },
    isGreaterTime: function(value, params, viewmodel) {

        var ValToCheck = viewmodel.Fields()[viewmodel.FieldsID().indexOf(params)].Value();
        var name = viewmodel.Fields()[viewmodel.FieldsID().indexOf(params)].labelName();

        console.log("isGreaterTime ", value, ValToCheck);
        value = moment(value, 'hh:mm A').unix();
        ValToCheck = moment(ValToCheck, 'hh:mm A').unix();

        if (value < ValToCheck) {
            return "Selected Time should be greater than " + name;
        } else {
            return null;
        }
    },
    isLesserTime: function(value, params, viewmodel) {

        var ValToCheck = viewmodel.Fields()[viewmodel.FieldsID().indexOf(params)].Value();
        var name = viewmodel.Fields()[viewmodel.FieldsID().indexOf(params)].labelName();

        console.log("isGreaterTime ", value, ValToCheck);
        value = moment(value, 'hh:mm A').unix();
        ValToCheck = moment(ValToCheck, 'hh:mm A').unix();

        if (value > ValToCheck) {
            return "Selected Time should be lesser than " + name;
        } else {
            return null;
        }
    }
}
