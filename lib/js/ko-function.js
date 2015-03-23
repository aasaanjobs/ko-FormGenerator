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
    ko.validation.configure({
        registerExtenders: true,
        messagesOnModified: true,
        errorsAsTitle: true, // enables/disables showing of errors as title attribute of the target element.
        errorsAsTitleOnModified: false, // shows the error when hovering the input field (decorateElement must be true)
        messageTemplate: null,
        insertMessages: true, // automatically inserts validation messages as <span></span>
        parseInputAttributes: false, // parses the HTML5 validation attribute from a form element and adds that to the object
        writeInputAttributes: false, // adds HTML5 input validation attributes to form elements that ko observable's are bound to
        decorateInputElement: false, // false to keep backward compatibility
        decorateElementOnModified: true, // true to keep backward compatibility
        errorClass: null, // single class for error message and element
        errorElementClass: 'validationElement', // class to decorate error element
        errorMessageClass: 'validationMessage', // class to decorate error message
        allowHtmlMessages: false, // allows HTML in validation messages
        grouping: {
            deep: false, //by default grouping is shallow
            observable: true, //and using observables
            live: false //react to changes to observableArrays if observable === true
        }
    });

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
        var regex = new RegExp("##(.)*##");
        var res = api.match(regex);
        if (res) {
            var replaceStr = res[0].substring(2, res[0].length - 2);
            api = api.replace(regex, viewmodel.externalVariables[replaceStr]);
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
            var pathToDisplayText =  dataSource.pathToDisplayText.split(".");
            var objects = data;
            
            for (var i = 0; i < pathToArray.length; i++) {
                if (Array.isArray(objects)) {
                    objects = objects[pathToArray[i]][0];
                } else {
                    objects = objects[pathToArray[i]];
                }
            }

            var returnData = new Array();
            for (var i = 0; i < objects.length; i++) {
                var temp_value = objects[i];
                var temp_txt    =   objects[i];
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
                var exist_flag=false;
                for(var e=0;e<returnData.length;e++)
                {
                    if(returnData[e].value===temp_value)
                    {
                        exist_flag = true;
                    }
                }
                if(!exist_flag)
                {
                    var temp_obj = {}
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
            var exist_flag=false;
            for(var e=0;e<dataReturn.length;e++)
            {
                if(dataReturn[e].value===options[i])
                {
                    exist_flag = true;
                }
            }
            if(!exist_flag)
            {
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
                if (typeof(viewmodel.Fields()[index].Events()) != "undefined") {
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
                if (typeof(viewmodel.Fields()[index].Events()) != "undefined") {
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
                if (typeof(viewmodel.Fields()[index].Events()) != "undefined") {
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
                if (typeof(viewmodel.Fields()[index].Events()) != "undefined") {
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
            } 
            else if (typeof(params.options) != "undefined") {
                viewmodel.Fields()[index].Options([]);
                var reset = viewmodel.ResetField(index);
                if (typeof(viewmodel.Fields()[index].Events()) != "undefined") {
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
                    obj[params.key]= currentval[0];
                    viewmodel.addVariable(obj);
                }
                else {
                    obj[params.key]= currentval;
                    viewmodel.addVariable(obj);
                }
            }
        }
    };

    // A compare function which is used to compare the current Value of the Form Field and the Value in params
    comparatorFunction = function(currentVal, params, viewmodel) {
        var currentValue, paramsVal;

        if (Array.isArray(currentVal)) {
            currentValue = currentVal[0];
            for (var i = 1; i < currentVal.length; i++) {
                currentValue = currentValue + currentVal[i];
            }
        } else {
            currentValue = currentVal;
        }

        if (Array.isArray(params.val)) {
            paramsVal = params.val[0];
            for (var i = 1; i < params.val.length; i++) {
                paramsVal = paramsVal + params.val[i];
            }
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
        if(data.Element!="break")
        {
            self.Name = ko.observable(data.name).extend({
                required: true
            }); //Name of the Field
            self.Element = ko.observable(data.element + "-template").extend({
                required: true
            }); //Template Name
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

        if (self.Visibility() === true && self.Editable() === true) {
            self.Value.extend(data.validation);
        }

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
        self.externalVariables = {};

        self.updateModel = function(data) {
            self.Fields([]);
            self.FieldsID([]);
            self.FormID(data.name);
            self.externalVariables = {};
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

        self.updateModel(data);

        self.addVariable = function(abc) {
            for (key in abc) {
                self.externalVariables[key] = abc[key];
            }
            console.log(self.externalVariables);
        }

        self.errors = ko.validation.group(this, {
            deep: true,
            observable: false
        });

        //SaveForm to check if errors don't submit else give the JSON output of Form Data
        self.SaveForm = function() {
            if (self.errors().length > 0) {
                self.errors.showAllMessages();
                console.log("errors");
                return;
            }
            var submitData = [];
            for (var i = 0; i < self.Fields().length; i++) {
                if (!self.Fields()[i].Element().match(/^(label-template|addfield-template|removefield-template|button-template|submit-template)$/))
                    submitData.push(new ToSubmitData(self.Fields()[i]));
            }
            //console.log(ko.toJSON(self.Fields().length));
            console.log(ko.toJSON(submitData));
            return ko.toJSON(submitData);
        };

        self.SaveFormKV = function() {
            if (self.errors().length > 0) {
                self.errors.showAllMessages();
                console.log("errors");
                return;
            }
            var submitData = {};
            for (var i = 0; i < self.Fields().length; i++) {
                if (!self.Fields()[i].Element().match(/^(label-template|addfield-template|removefield-template|button-template|submit-template)$/))
                    submitData[self.Fields()[i].Name()] = self.Fields()[i].Value();
            }
            //console.log(ko.toJSON(self.Fields().length));
            console.log(ko.toJSON(submitData));
            return ko.toJSON(submitData);
        };
        self.ResetForm  =   function(){
            self.updateModel(data);
        }
        

        //Add Field OnClick event 
        self.DupField = function(Element) {
            var index = self.FieldsID().indexOf(Element);
         console.log("I m here");   console.log(index);
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
            if (typeof(Eventdata) != "undefined") {
                var index = self.FieldsID().indexOf(Element);
                var currentVal = self.Fields()[index].Value();
                for (var i = 0; i < Eventdata.length; i++) {
                    //console.log("hello",index, currentVal, Element, Eventdata[i],"i== ",i);
                    var compareBool = comparatorFunction(currentVal, Eventdata[i], self); //Comparing CurrentValue to the Value On which event should occur Either True/False
                    var effIndex = self.FieldsID().indexOf(Eventdata[i].depElement); //Retrieve index of the Element Which is affected by that event
                    var actionToCall = Eventdata[i].funct; //For an Event Specifyiing the Action to be called
                    if(typeof(actions[actionToCall])!="undefined")
                    {
                        if (typeof(CallBackTrue) != "undefined") {
                            self.actioncall = actions[actionToCall](currentVal, effIndex, Eventdata[i].params, compareBool, CallBackTrue, self); //Action Call
                            var reset = self.ResetField(index); //Reset Form Field
                        } else
                            self.actioncall = actions[actionToCall](currentVal, effIndex, Eventdata[i].params, compareBool, true, self); //Action Call
                    }
                    else
                    {
                        console.log("Make External Call");
                        window[actionToCall](self.Fields()[index].idElm());
                    }
                }
            }
        }
    };

    ////********* Calling Template File to get All Available Templates*********////

    tplLoad = function(tplSrc, callback) {
        tplSrc = (!tplSrc) ? "bower_components/ko-form-generator/template/srcAll.html" : tplSrc;
        $.get(tplSrc, function(template) {
            $("body").append(template);
            console.log("loading template");
            return callback();
        });
    }

    formLoad = function(JSONdata, vm, id) {
        var vmtemp = vm;
        if (vmtemp == null) {
            vmtemp = new ViewModel(JSONdata);
            ko.applyBindings(vmtemp, document.getElementById(id));
            return vmtemp;
        } else {
            vmtemp.updateModel(JSONdata);
        }
    }

    addVariable = function(vm, data, callback) {
        var vmtemp = vm;
        if (vmtemp === null) {
            return callback(false);
        } else {
            vm.addVariable(data);
            return callback(true);
        }
    }

    getKoData = function(vm)
    {
        return vm.SaveForm();
    }

    getKoDataKV = function(vm)
    {
        return vm.SaveFormKV();
    } 
    resetForm = function(vm)
    {
        vm.ResetForm();
    }

    return {
        tplLoad: tplLoad,
        formLoad: formLoad,
        addVariable: addVariable,
        getKoData: getKoData,
        getData: getKoDataKV,
        reset:  resetForm
    }

}();
