var AJ = AJ || {};
AJ.utils = AJ.utils || {};
AJ.utils.slugify = function(str) {
    var $slug = '';
    var trimmed = $.trim(str);
    $slug = trimmed.replace(/[^a-z0-9-]/gi, '-').
    replace(/-+/g, '-').
    replace(/^-|-$/g, '');
    return $slug.toLowerCase();
}

AJ.koFormBuilder = function() {

    //Binding Handlers for Select2 (multiselect)
    ko.bindingHandlers.select2 = {
        init: function(element, valueAccessor, allBindingsAccessor) {
            var obj = valueAccessor(),
                allBindings = allBindingsAccessor(),
                lookupKey = allBindings.lookupKey;

            $(element).select2(obj);
            if (lookupKey) {
                var value = ko.utils.unwrapObservable(allBindings.value);
                $(element).select2('data', ko.utils.arrayFirst(obj.data.results, function(item) {
                    return item[lookupKey] === value;
                }));
            }
            if (allBindings.value) { // FIX no initial values   
                allBindings.value.subscribe(function(v) {
                    $(element).trigger('change');
                });
            }
            ko.utils.domNodeDisposal.addDisposeCallback(element, function() {
                $(element).select2('destroy');
            });
        },
        update: function(element, valueAccessor, allBindingsAccessor) {

            //$(element).val(ko.utils.unwrapObservable(valueAccessor()));
            //$(element).trigger('change');

            var allBindings = allBindingsAccessor(),
                value = ko.utils.unwrapObservable(allBindings.value || allBindings.selectedOptions);
            if (value) {
                $(element).select2('val', value);
            }
        }
    };


    /* Adds the binding dateValue to use with bootstra-datepicker
     Usage :
     <input type="text" data-bind="dateValue:eventDate"/>
     <input type="text" data-bind="dateValue:eventDate,format='MM/DD/YYY'"/>

       */
    ko.bindingHandlers.datePicker = {
        init: function(element, valueAccessor, allBindingsAccessor, viewModel) {
            var unwrap = ko.utils.unwrapObservable;
            var dataSource = valueAccessor();
            var binding = allBindingsAccessor();
            var options = {
                keyboardNavigation: true,
                todayHighlight: true,
                autoclose: true,
                daysOfWeekDisabled: [],
                format: 'yyyy/mm/dd'
            };
            if (typeof allBindingsAccessor == 'function') {
                options.format = allBindingsAccessor().format || options.format;
                options.daysOfWeekDisabled = allBindingsAccessor().daysOfWeekDisabled || options.daysOfWeekDisabled;
            } else {
                options.format = allBindingsAccessor.get('format') || options.format;
                options.daysOfWeekDisabled = allBindingsAccessor().daysOfWeekDisabled || options.daysOfWeekDisabled;
            }

            if (binding.datePickerOptions) {
                options = $.extend(options, binding.datePickerOptions);
            }
            $(element).datepicker(options);
            $(element).datepicker('update', dataSource());
            $(element).on("changeDate", function(ev) {
                var observable = valueAccessor();
                if ($(element).is(':focus')) {
                    // Don't update while the user is in the field...
                    // Instead, handle focus loss
                    $(element).one('blur', function(ev) {
                        var dateVal = $(element).datepicker("getDate");
                        observable(dateVal);
                    });
                } else {
                    observable(ev.date);
                }
            });
            //handle removing an element from the dom
            ko.utils.domNodeDisposal.addDisposeCallback(element, function() {
                $(element).datepicker('remove');
            });
        },
        update: function(element, valueAccessor) {
            var value = ko.utils.unwrapObservable(valueAccessor());
            $(element).datepicker('update', value);
        }
    };

    /* Adds the binding timeValue to use with bootstra-timepicker 
     This works with the http://jdewit.github.io/bootstrap-timepicker/index.html
     component.
     Use: use with an input, make sure to use your input with this format
     <div class="bootstrap-timepicker pull-right">
         <input id="timepicker3" type="text" class="input-small">
     </div>date
      */
    ko.bindingHandlers.timeValue = {
        init: function(element, valueAccessor, allBindingsAccessor, viewModel, bindingContext) {
            var tpicker = $(element).timepicker();
            tpicker.on('changeTime.timepicker', function(e) {
                //Asignar la hora y los minutos
                var value = valueAccessor();
                if (!value) {
                    throw new Error('timeValue binding observable not found');
                }
                var date = ko.unwrap(value);
                var mdate = moment(date || new Date());
                var hours24;
                if (e.time.meridian == "AM") {
                    if (e.time.hours == 12)
                        hours24 = 0;
                    else
                        hours24 = e.time.hours;
                } else {
                    if (e.time.hours == 12) {
                        hours24 = 12;
                    } else {
                        hours24 = e.time.hours + 12;
                    }
                }

                mdate.hours(hours24)
                mdate.minutes(e.time.minutes);
                $(element).data('updating', true);
                value(mdate.toDate());
                $(element).data('updating', false);
            })
        },
        update: function(element, valueAccessor, allBindings, viewModel, bindingContext) {
            //Avoid recursive calls
            if ($(element).data('updating')) {
                return;
            }
            var date = ko.unwrap(valueAccessor());

            if (date) {
                var time = moment(date).format("hh:mm a");
                $(element).timepicker('setTime', time);
            }
        }
    }

    ko.unwrap = ko.unwrap || ko.utils.unwrapObservable;

    ko.bindingHandlers.fadeVisible = {
        init: function(element, valueAccessor) {
            // Start visible/invisible according to initial value
            var shouldDisplay = valueAccessor();
            $(element).toggle(shouldDisplay);
        },
        update: function(element, valueAccessor) {
            // On update, fade in/out
            var shouldDisplay = valueAccessor();
            shouldDisplay ? $(element).fadeIn() : $(element).fadeOut();
        }
    };
    //Data to be Submitted
    ToSubmitData = function(field) {
        this.id = field.idElm();
        this.name = field.Name();
        this.value = field.Value();
        this.componentID = field.componentID();
    }

    getDataFromURL = function(url, header, get_opt_callback) {
        var xmlhttp;
        var data;
        var jsonData;
        var returnData;
        if (window.XMLHttpRequest) {
            xmlhttp = new XMLHttpRequest();
        } else {
            xmlhttp = new ActiveXObject("Microsoft.XMLHTTP");
        }
        xmlhttp.onreadystatechange = function() {
            if (xmlhttp.readyState == 4 && xmlhttp.status == 200) {
                data = JSON.parse(xmlhttp.responseText);
                return get_opt_callback(data);
            }
        }
        xmlhttp.open("GET", url, true);
        if (typeof(header) === "object") {
            for (var key in header) {
                xmlhttp.setRequestHeader(key, header[key]);
            }
        }
        xmlhttp.send();
    }


    //Get Options from API
    getOptions = function(dataSource, viewmodel, opt_callback) {
        var api = dataSource.api;
        console.log("api before", api);

        for (var key in externalVariables) {
            api = api.replace('##' + key + '##', externalVariables[key]);
        }
        var matched = api.match(/\/\?[^\/\?]+$/);
        console.log("matched ", matched);
        if (matched) {
            var params = (matched[0]).match(/(\/|\&)([^=]+)\=([^&]+)/g);
            var apiParams = "";
            var fParam = true;
            for (var p = 0; p < params.length; p++) {
                if (!params[p].match(/##(.)*##/)) {
                    if (!fParam) {
                        apiParams = apiParams + params[p];
                    } else {
                        apiParams = "?" + params[p].substring(1);
                        fParam = false;
                    }
                }
            }

            api = api.substring(0, api.indexOf(matched[0]) + 1) + apiParams;
        }
        var options = [];
        var header;
        if (typeof(dataSource.header) != "undefined") {
            header = dataSource.header;
        }
        console.log("api after", api);
        getDataFromURL(api, header, function(data) {
            var pathToArray = dataSource.pathToArray.split(".");
            var pathToValue = dataSource.pathToValue.split(".");
            var pathToDisplayText = dataSource.pathToDisplayText.split(".");
            var objects = data;

            for (var i = 0; i < pathToArray.length; i++) {
                if (Array.isArray(objects)) {
                    objects = objects[pathToArray[i]][0];
                } else {
                    objects = objects[pathToArray[i]];
                }
            }

            var returnData = [];
            for (var i = 0; i < objects.length; i++) {
                var temp_value = objects[i];
                var temp_txt = objects[i];
                //console.log("temp  ",temp[i], " i== ",i);
                for (var j = 0; j < pathToValue.length; j++) {
                    if (Array.isArray(temp_value)) {
                        temp_value = temp_value[pathToValue[j]][0];
                    } else {
                        temp_value = temp_value[pathToValue[j]];
                    }
                }

                for (var j = 0; j < pathToDisplayText.length; j++) {
                    if (Array.isArray(temp_txt)) {
                        temp_txt = temp_txt[pathToDisplayText[j]][0];
                    } else {
                        temp_txt = temp_txt[pathToDisplayText[j]];
                    }
                }
                var exist_flag = false;
                for (var e = 0; e < returnData.length; e++) {
                    if (returnData[e].displayText === temp_txt) {
                        exist_flag = true;
                    }
                }
                if (!exist_flag) {
                    var temp_obj = {};
                    temp_obj["displayText"] = temp_txt;
                    temp_obj["value"] = temp_value;
                    returnData.push(temp_obj);
                }
                //console.log("returnData  ",returnData, "  i == ",i);
            }
            return opt_callback(returnData);
        });
    }


    ///Options Format Change
    optionNameValueAssign = function(options) {
        var dataReturn = new Array();
        for (var i = 0; i < options.length; i++) {
            var exist_flag = false;
            for (var e = 0; e < dataReturn.length; e++) {
                if (dataReturn[e].value === options[i]) {
                    exist_flag = true;
                }
            }
            if (!exist_flag) {
                var temp_obj = {}
                temp_obj["displayText"] = options[i];
                temp_obj["value"] = options[i];
                dataReturn.push(temp_obj);
            }
        }
        return dataReturn;
    }

    ////Actions Defined in Variable Format
    var actions = {
        hide: function(index, params, ConditionCheck, CallBackFalse, viewmodel) {
            if (typeof(params.visibility) != "undefined" && ConditionCheck && CallBackFalse) {
                viewmodel.Fields()[index].Visibility(params.visibility);
            } else if (typeof(params.visibility) != "undefined") {
                viewmodel.Fields()[index].Visibility(!params.visibility);
                //var reset = viewmodel.ResetField(index);
                if (typeof(viewmodel.Fields()[index].Events()) != "undefined" && CallBackFalse === false) {
                    this.callBack = CallbackFormDataChange(viewmodel.Fields()[index], viewmodel);
                }
            }
        },
        show: function(currentval, index, params, ConditionCheck, CallBackFalse, viewmodel) {
            if (typeof(params.visibility) != "undefined" && ConditionCheck && CallBackFalse) {
                viewmodel.Fields()[index].Visibility(params.visibility);
            } else if (typeof(params.visibility) != "undefined") {
                viewmodel.Fields()[index].Visibility(!params.visibility);
                //var reset = viewmodel.ResetField(index);
                if (typeof(viewmodel.Fields()[index].Events()) != "undefined" && CallBackFalse === false) {
                    //console.log("Calling Callback",index);
                    this.callBack = CallbackFormDataChange(index, viewmodel);
                }
            }
        },
        enable: function(currentval, index, params, ConditionCheck, CallBackFalse, viewmodel) {
            if (typeof(params.enable) != "undefined" && ConditionCheck && CallBackFalse) {
                viewmodel.Fields()[index].Editable(params.enable);
            } else if (typeof(params.enable) != "undefined") {
                viewmodel.Fields()[index].Value(!params.enable);
                //var reset = viewmodel.ResetField(index);
                if (typeof(viewmodel.Fields()[index].Events()) != "undefined" && CallBackFalse === false) {
                    this.callBack = CallbackFormDataChange(viewmodel.Fields()[index], viewmodel);
                }
            }
        },
        disable: function(currentval, index, params, ConditionCheck, CallBackFalse, viewmodel) {
            if (typeof(params.enable) != "undefined" && ConditionCheck && CallBackFalse) {
                viewmodel.Fields()[index].Editable(params.enable);
            } else if (typeof(params.enable) != "undefined") {
                viewmodel.Fields()[index].Editable(!params.enable);
                //var reset = viewmodel.ResetField(index);
                if (typeof(viewmodel.Fields()[index].Events()) != "undefined" && CallBackFalse === false) {
                    this.callBack = CallbackFormDataChange(viewmodel.Fields()[index], viewmodel);
                }
            }
        },
        loadOption: function(currentval, index, params, ConditionCheck, CallBackFalse, viewmodel) {
            if (typeof(params.options) != "undefined" && ConditionCheck && CallBackFalse) {

                if (typeof(params.options) != "undefined") {
                    if (Array.isArray(params.options)) {
                        if (typeof(params.options[0]) != "object")
                            viewmodel.Fields()[index].Options(optionNameValueAssign(params.options));
                        else
                            viewmodel.Fields()[index].Options(params.options);
                    } else if (typeof(params.options) === "object") {
                        var optionsFromUrl;
                        initialData = [{
                            "value": "",
                            "displayText": params.options.placeholder
                        }];
                        viewmodel.Fields()[index].Options(initialData);
                        getOptions(params.options, viewmodel, function(dataOption) {
                            optionsFromUrl = dataOption;
                            console.log("optionsFromUrl = ", optionsFromUrl);
                            if (Array.isArray(optionsFromUrl)) {
                                initialData = [{
                                    "value": "",
                                    "displayText": params.options.placeholder
                                }];
                                if (typeof(optionsFromUrl[0]) != "object") {
                                    optionsFromUrl = initialData.concat(optionNameValueAssign(optionsFromUrl));
                                    viewmodel.Fields()[index].Options(optionsFromUrl);
                                } else {
                                    viewmodel.Fields()[index].Options(initialData.concat(optionsFromUrl));
                                }
                            }
                        });
                    }
                }
            } else if (typeof(params.options) != "undefined") {
                viewmodel.Fields()[index].Options([]);
                var reset = viewmodel.ResetField(index);
                if (typeof(viewmodel.Fields()[index].Events()) != "undefined" && CallBackFalse === false) {
                    this.callBack = CallbackFormDataChange(viewmodel.Fields()[index], viewmodel);
                }
            }
        },
        valueChange: function(currentval, index, params, ConditionCheck, CallBackFalse, viewmodel) {
            if (typeof(params.value) != "undefined" && ConditionCheck && CallBackFalse) {
                viewmodel.Fields()[index].Value(params.value);
            }
        },
        addClass: function(currentval, index, params, ConditionCheck, CallBackFalse, viewmodel) {
            if (typeof(params.class) != "undefined" && ConditionCheck && CallBackFalse) {
                viewmodel.Fields()[index].Class(params.class);
            }
        },
        addVariable: function(currentval, index, params, ConditionCheck, CallBackFalse, viewmodel) {
            if (typeof(params.key) != "undefined" && ConditionCheck && CallBackFalse) {
                var obj = {};
                if (Array.isArray(currentval)) {
                    obj[params.key] = currentval[0];
                    addExtVariable(obj);
                } else {
                    obj[params.key] = currentval;
                    addExtVariable(obj);
                }
            }
        }
    };


    var errors = {
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
                }
                else{
                    var temp = window[params.funct](value);
                }
                console.log("externalCall ",temp);
                return temp;
            },
            isGreaterTime : function(value, params, viewmodel){

                var ValToCheck = viewmodel.Fields()[viewmodel.FieldsID().indexOf(params)].Value();
                var name = viewmodel.Fields()[viewmodel.FieldsID().indexOf(params)].labelName();

                console.log("isGreaterTime ",value,ValToCheck);
                value = moment(value, 'hh:mm A').unix();
                ValToCheck = moment(ValToCheck, 'hh:mm A').unix();

                if(value < ValToCheck){
                    return "Selected Time should be greater than "+ name;
                } else{
                    return null;
                }
            },
            isLesserTime : function(value, params, viewmodel){

                var ValToCheck = viewmodel.Fields()[viewmodel.FieldsID().indexOf(params)].Value();
                var name = viewmodel.Fields()[viewmodel.FieldsID().indexOf(params)].labelName();

                console.log("isGreaterTime ",value,ValToCheck);
                value = moment(value, 'hh:mm A').unix();
                ValToCheck = moment(ValToCheck, 'hh:mm A').unix();

                if(value > ValToCheck){
                    return "Selected Time should be lesser than "+ name;
                } else{
                    return null;
                }
            }
        }
        // A compare function which is used to compare the current Value of the Form Field and the Value in params
    comparatorFunction = function(currentVal, params, viewmodel) {
        var currentValue, paramsVal;

        if (Array.isArray(currentVal)) {
            currentValue = currentVal.join(",");
        } else {
            currentValue = currentVal;
        }

        if (Array.isArray(params.val)) {
            paramsVal = params.val.join(",");
        } else {
            paramsVal = params.val;
        }
        switch (params.comparator) {
            case "eq":
                return (paramsVal === currentValue);
                break;

            case "neq":
                return (paramsVal != currentValue);
                break;

            case "lt":
                return (parseFloat(currentValue) < parseFloat(paramsVal));
                break;

            case "lte":
                return (parseFloat(currentValue) <= parseFloat(paramsVal));
                break;

            case "gt":
                return (parseFloat(currentValue) > parseFloat(paramsVal));
                break;

            case "gte":
                return (parseFloat(currentValue) >= parseFloat(paramsVal));
                break;

            default:
                return true;
                break;
        }
    }

    ////CallBackOnFormChange
    CallbackFormDataChange = function(index, viewmodel) {
        //console.log("I m here");
        if (typeof(viewmodel.Fields()[index].Events().onChange) != "undefined") {
            viewmodel.OnFormDatachange(viewmodel.Fields()[index].Name(), viewmodel.Fields()[index].Events().onChange, false);
        }

        if (typeof(viewmodel.Fields()[index].Events().onBlur) != "undefined") {
            viewmodel.OnFormDatachange(viewmodel.Fields()[index].Name(), viewmodel.Fields()[index].Events().onBlur, false);
        }

        if (typeof(viewmodel.Fields()[index].Events().onFocus) != "undefined") {
            viewmodel.OnFormDatachange(viewmodel.Fields()[index].Name(), viewmodel.Fields()[index].Events().onFocus, false);
        }

        if (typeof(viewmodel.Fields()[index].Events().onCheck) != "undefined") {
            viewmodel.OnFormDatachange(viewmodel.Fields()[index].Name(), viewmodel.Fields()[index].Events().onCheck, false);
        }

        if (typeof(viewmodel.Fields()[index].Events().onClick) != "undefined") {
            viewmodel.OnFormDatachange(viewmodel.Fields()[index].Name(), viewmodel.Fields()[index].Events().onClick, false);
        }
    }

    ////********* Function to create Fileds/Elements*********////
    FormField = function(data, viewmodel) {
        var self = this;
        self.labelName = ko.observable("");
        self.idDiv = ko.observable(data.idDiv); //Id of Div containing this Field
        self.DivClass = ko.observable("col-xs-12"); //Class for the Div containing this Field
        if (typeof(data.classDiv) != "undefined") {
            self.DivClass(data.classDiv);
        }
        if (data.Element != "break") {
            self.Name = ko.observable(data.name);
            self.Element = ko.observable(data.element + "-template");
            self.idElm = ko.observable(data.idElm); //Id of the Element of this Field

            self.Options = ko.observableArray([]); //Options if in the Field
            self.Placeholder = ko.observable(""); //Palceholder if in the Field

            if (Array.isArray(data.value)) {
                self.Value = ko.observableArray([]); //Value of this Field
            } else {
                self.Value = ko.observable("");
            }

            self.Events = ko.observableArray([]); //Events to be called for this Field

            self.ElementClass = ko.observable(""); //Class for the Element of this Field
            self.labelClass = ko.observable("");
            self.Editable = ko.observable(true); //Specifies Enability of this Field 
            self.Visibility = ko.observable(true); //Specifies Visibility of this Field 
            self.Duplicable = ko.observable(false); //Indicates if Field is Duplicable  
            self.selected2 = ko.observableArray([]); //Selected2 used for multiselect to get selected values
            self.eventDate = ko.observable(new Date());
            self.dateFormat = ko.observable("yyyy/mm/dd");
            self.daysOfWeekDisabled = ko.observable([]);
            self.fieldsToDuplicate = ko.observableArray([]);
            self.fieldsToRemove = ko.observableArray([]);
            self.controlButton = ko.observable("");
            self.componentID = ko.observable("independent");
            self.Validation = {};

            //Each if specifies that if Attributes are defined in JSON formSchema then collect values from there

            if (typeof(data.labelName) != "undefined") {
                self.labelName(data.labelName);
            }

            if (typeof(data.idDiv) != "undefined") {
                self.idDiv(data.idDiv);
            }

            if (typeof(data.options) != "undefined") {
                if (Array.isArray(data.options)) {
                    if (typeof(data.options[0]) != "object")
                        self.Options(optionNameValueAssign(data.options));
                    else
                        self.Options(data.options);
                } else if (typeof(data.options) === "object") {
                    initialData = [{
                        "value": "",
                        "displayText": data.options.placeholder
                    }];
                    self.Options(initialData);
                    var optionsFromUrl;
                    getOptions(data.options, viewmodel, function(dataOption) {
                        optionsFromUrl = dataOption;
                        console.log("optionsFromUrl = ", optionsFromUrl);
                        if (Array.isArray(optionsFromUrl)) {
                            initialData = [{
                                "value": "",
                                "displayText": data.options.placeholder
                            }];
                            if (typeof(optionsFromUrl[0]) != "object") {
                                optionsFromUrl = initialData.concat(optionNameValueAssign(optionsFromUrl));
                                self.Options(optionsFromUrl);
                            } else {
                                self.Options(initialData.concat(optionsFromUrl));
                            }
                        }
                    });
                }
            }
        }

        if (typeof(data.placeholder) != "undefined") {
            self.Placeholder(data.placeholder);
        }

        if (typeof(data.value) != "undefined") {
            self.Value(data.value);
        }

        if (typeof(data.events) != "undefined") {
            self.Events(data.events);
        }


        if (typeof(data.classElement) != "undefined") {
            self.ElementClass(data.classElement);
        }

        if (typeof(data.labelClass) != "undefined") {
            self.labelClass(data.labelClass);
        }

        if (typeof(data.enable) != "undefined") {
            self.Editable(data.enable);
        }

        if (typeof(data.visibility) != "undefined") {
            self.Visibility(data.visibility);
        }

        if (typeof(data.duplicable) != "undefined") {
            self.Duplicable(data.duplicable);
        }

        if (typeof(data.selectedValues) != "undefined") {
            self.selected2(data.selectedValues);
            self.Value(self.selected2());
        }

        if (typeof(data.dateFormat) != "undefined") {
            self.dateFormat(data.dateFormat);
        }

        if (typeof(data.daysOfWeekDisabled) != "undefined") {
            self.daysOfWeekDisabled(data.daysOfWeekDisabled);
        }

        if (typeof(data.fieldsToDuplicate) != "undefined") {
            self.fieldsToDuplicate(data.fieldsToDuplicate);
        }

        if (typeof(data.fieldsToRemove) != "undefined") {
            self.fieldsToRemove(data.fieldsToRemove);
        }

        if (typeof(data.controlButton) != "undefined") {
            self.controlButton(data.controlButton);
        }

        if (typeof(data.componentID) != "undefined") {
            self.componentID(data.componentID);
        }
        if (typeof(data.validation) != "undefined") {
            self.Validation = data.validation;
        }
        /*if (self.Visibility() === true && self.Editable() === true) {
            self.Value.extend(data.validation);
        }*/

        if (self.Element() === "addfield-template") {
            if (typeof(data.duplicateLimit) != "undefined") {
                self.DuplicateLimit = ko.observable(data.duplicateLimit);
            }
            self.DuplicatedCount = ko.observable(1);
        }

        if (self.Duplicable() === true || self.Element() === "removefield-template") {
            if (typeof(data.duplicateCount) != "undefined") {
                self.duplicateCount = data.duplicateCount;
            } else
                self.duplicateCount = 1;
            self.idDiv(data.idDiv + "-dup-" + self.duplicateCount);
            self.idElm(self.idElm() + "-dup-" + self.duplicateCount);
            self.Name(self.Name() + "-dup-" + self.duplicateCount);
        }
    }

    ////********* ViewModel Initialization*********////

    ViewModel = function(data) {
        var self = this;
        self.Fields = ko.observableArray([]); //Array of Fields with Attributes
        self.FieldsID = ko.observableArray([]); //Array of Fields ID corresponding to Fileds Maintaining Indexes
        self.FormID = ko.observable(data.name);

        self.updateModel = function(data) {
            self.Fields([]);
            self.FieldsID([]);
            self.FormID("");
            if (data !== null) {
                self.FormID(data.name);
                //Creating Fields and FieldsID array//
                for (var key in data.fields) {
                    self.Fields.push(new FormField(data.fields[key], self));

                    if (self.Fields()[self.Fields().length - 1].Duplicable() === true) {
                        self.FieldsID.push(self.Fields()[self.Fields().length - 1].idDiv());
                    } else {
                        self.FieldsID.push(key);
                    }
                }
            }
        }

        self.updateModel(data);

        /*self.addVariable = function(abc) {
            for (key in abc) {
                self.externalVariables[key] = abc[key];
            }
            console.log(self.externalVariables);
        }*/

        self.errors = ko.validation.group(this, {
            deep: true,
            observable: true
        });

        self.getError = function() {
            var errorData = {};
            for (var i = 0; i < self.Fields().length; i++) {
                if ((!self.Fields()[i].Element().match(/^(label-template|addfield-template|removefield-template|button-template|submit-template|break-template)$/)) && self.Fields()[i].Visibility() === true) {
                    var err = null;
                    for (var key in self.Fields()[i].Validation) {
                        err = errors[key](self.Fields()[i].Value(), self.Fields()[i].Validation[key], self);
                        if (err !== null) {
                            break;
                        }
                    }
                    if (err !== null) {
                        errorData[self.Fields()[i].Name()] = err;
                    }
                    /*var err = "";
                    if(Array.isArray(self.Fields()[i].Value())){
                        err = self.Fields()[i].Value().join("");
                    }
                    else
                    {
                        err = err + self.Fields()[i].Value();
                    }
                    //console.log(self.Fields()[i].Validation,"type ",typeof(self.Fields()[i].Validation));
                    if((err.trim()).length===0 && !(jQuery.isEmptyObject(self.Fields()[i].Validation)))
                        errorData[self.Fields()[i].Name()] = self.Fields()[i].Validation;*/
                }
            }
            //console.log(ko.toJSON(self.Fields().length));
            console.log(ko.toJSON(errorData));
            if (jQuery.isEmptyObject(errorData))
                return null;
            return ko.toJSON(errorData);
        }

        //SaveForm to check if errors don't submit else give the JSON output of Form Data
        self.SaveForm = function() {
            if (self.errors().length > 0) {
                console.log("error ", self.errors());
                //self.errors.showAllMessages();
                console.log("errors");
                return;
            }
            var submitData = [];
            for (var i = 0; i < self.Fields().length; i++) {
                if ((!self.Fields()[i].Element().match(/^(label-template|addfield-template|removefield-template|button-template|submit-template|break-template)$/)) && self.Fields()[i].Visibility() === true) {
                    submitData.push(new ToSubmitData(self.Fields()[i]));
                }
                //console.log(self.Fields()[i].Validation);       

            }
            //console.log(ko.toJSON(self.Fields().length));
            console.log(ko.toJSON(submitData));
            return ko.toJSON(submitData);
        };


        self.SaveFormKV = function() {
            /*if (self.errors().length > 0) {
                //self.errors.showAllMessages();
                console.log("errors");
                return;
            }*/

            var submitData = {};
            for (var i = 0; i < self.Fields().length; i++) {
                if ((!self.Fields()[i].Element().match(/^(label-template|addfield-template|removefield-template|button-template|submit-template|break-template)$/)) && self.Fields()[i].Visibility() === true) {
                    submitData[self.Fields()[i].Name()] = self.Fields()[i].Value();
                }
            }
            //console.log(ko.toJSON(self.Fields().length));
            console.log(ko.toJSON(submitData));
            return ko.toJSON(submitData);
        };
        self.ResetForm = function() {
            self.updateModel(data);
        }


        //Add Field OnClick event 
        self.DupField = function(Element) {
            var index = self.FieldsID().indexOf(Element);
            console.log("I m here");
            console.log(index);
            self.Fields()[index].DuplicatedCount(self.Fields()[index].DuplicatedCount() + 1);
            //console.log("total click ",self.Fields()[index].DuplicateLimit());
            if (self.Fields()[index].Element() === "addfield-template") {
                var fieldsToDupArray = self.Fields()[index].fieldsToDuplicate();
                var duplicateCount = self.Fields()[index].DuplicatedCount();
                for (var i = 0; i < fieldsToDupArray.length; i++) {
                    index = self.FieldsID().indexOf(Element);
                    var newField = data.fields[fieldsToDupArray[i]];
                    newField["duplicateCount"] = duplicateCount;
                    if (Array.isArray(newField["value"])) {
                        newField["value"] = [];
                    } else {
                        newField["value"] = "";
                    }
                    //console.log("newField ",  newField);
                    var add = self.Fields.splice(index, 0, new FormField(newField, self));
                    console.log("here index is ", index, " and field is ", self.Fields()[index].idDiv(), self.Fields()[index].fieldsToRemove());
                    var addName = self.FieldsID.splice(index, 0, newField.idDiv + "-dup-" + duplicateCount);
                }
            }
        }

        //Remove Duplicated Field
        self.RemoveField = function(Element) {

            var index = self.FieldsID().indexOf(Element);
            var controlButton = self.FieldsID().indexOf(self.Fields()[index].controlButton());
            self.Fields()[controlButton].DuplicatedCount(self.Fields()[controlButton].DuplicatedCount() - 1);
            var removeCount = self.Fields()[index].fieldsToRemove().length + 1;
            console.log(self.Fields()[index].fieldsToRemove().length);
            var add = self.Fields.splice(index - removeCount + 1, removeCount);
            var addName = self.FieldsID.splice(index - removeCount + 1, removeCount);
        }


        //Reset Field value and Initializes Again with initial Values
        self.ResetField = function(index) {
            var removed = self.Fields.splice(index, 1, new FormField(data.fields[self.FieldsID()[index]], self));
            return true;
        }

        //A function Which is being called Every time An Event Occurs on the Form
        self.OnFormDatachange = function(Element, Eventdata, CallBackTrue) {
            //console.log("ELELELELELELELELEL", Element, Eventdata, self.Fields()[self.FieldsID().indexOf(Element)].Value());
            if (typeof(Eventdata) != "undefined") {
                var index = self.FieldsID().indexOf(Element);
                var currentVal = self.Fields()[index].Value();
                for (var i = 0; i < Eventdata.length; i++) {
                    //console.log("hello",index, currentVal, Element, Eventdata[i],"i== ",i);
                    var compareBool = comparatorFunction(currentVal, Eventdata[i], self); //Comparing CurrentValue to the Value On which event should occur Either True/False
                    var effIndex = self.FieldsID().indexOf(Eventdata[i].depElement); //Retrieve index of the Element Which is affected by that event
                    var actionToCall = Eventdata[i].funct; //For an Event Specifyiing the Action to be called
                    if (typeof(actions[actionToCall]) != "undefined") {
                        if (typeof(CallBackTrue) != "undefined") {
                            self.actioncall = actions[actionToCall](currentVal, effIndex, Eventdata[i].params, compareBool, CallBackTrue, self); //Action Call
                            var reset = self.ResetField(index); //Reset Form Field
                        } else
                            console.log(self.actioncall);
                        self.actioncall = actions[actionToCall](currentVal, effIndex, Eventdata[i].params, compareBool, true, self); //Action Call
                    } else {
                        console.log("Make External Call");
                        if (Eventdata[i].params.functParam) {
                            var functParam = Eventdata[i].params.functParam;
                            var dataToSent = {};
                            if (Array.isArray(functParam)) {
                                for (var f = 0; f < functParam.length; f++) {
                                    var tempIndex = self.FieldsID().indexOf(functParam[f]);
                                    dataToSent[self.Fields()[tempIndex].Name()] = self.Fields()[tempIndex].Value();
                                }
                            } else {
                                var tempIndex = self.FieldsID().indexOf(functParam);
                                dataToSent[self.Fields()[tempIndex].Name()] = self.Fields()[tempIndex].Value();
                            }
                        }
                        window[actionToCall](self.Fields()[index].Name(), self.Fields()[index].Value(), dataToSent);
                    }
                }
            }
        }
    };

    ////********* Calling Template File to get All Available Templates*********////
    var externalVariables = {};
    tplLoad = function(tplSrc, callback) {
        tplSrc = (!tplSrc) ? "bower_components/ko-form-generator/template/srcAll.html" : tplSrc;
        $.get(tplSrc, function(template) {
            $("body").append(template);
            console.log("loading template");
            return callback();
        });
    }

    formLoad = function(JSONdata, vm, id, type) {
        var vmtemp = vm;
        if (vmtemp == null) {
            child_id = id + "_chhotu";
            if (type != null && type!= undefined && type == 'unform')
                $('#' + id).append("<div id='" + child_id + "' data-bind=\"template: {name: 'unform-template'}\"> </div>")
            else
                $('#' + id).append("<div id='" + child_id + "' data-bind=\"template: {name: 'form-template'}\"> </div>")
            vmtemp = new ViewModel(JSONdata);
            ko.applyBindings(vmtemp, document.getElementById(child_id));
            console.log(child_id);
            return vmtemp;
        } else {
            vmtemp.updateModel(JSONdata);
        }
    }

    addExtVariable = function(data, callback) {

        for (key in data) {
            externalVariables[key] = data[key];
        }
        console.log(externalVariables);
        if (callback)
            return callback(true);
    }

    getKoData = function(vm) {
        return vm.SaveForm();
    }

    getKoDataKV = function(vm) {
        return vm.SaveFormKV();
    }
    resetForm = function(vm) {
        vm.ResetForm();
    }
    destroyForm = function(vm, id) {
        child_id = id + "_chhotu";
        vm.updateModel(null);
        $('#' + child_id).remove();
        return null;
    }
    getError = function(vm) {
        return vm.getError();
    }

    return {
        tplLoad: tplLoad,
        formLoad: formLoad,
        addVariable: addExtVariable,
        getKoData: getKoData,
        getData: getKoDataKV,
        reset: resetForm,
        getError: getError,
        destroyForm: destroyForm
    }

}();
