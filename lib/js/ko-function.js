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

                //AJTODO: Create compare for contains and not contains
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
        if (data.element == "date") {
            if (typeof(data.dateFormat) != "undefined") {
                self.Value(moment(self.eventDate()).format(data.dateFormat.toUpperCase()));
            } else {
                self.Value(moment(self.eventDate()).format('DD/MM/YYYY'))
            }
        }
        if (data.element == "time") {
            self.Value(self.eventDate().toLocaleTimeString(navigator.language, {
                hour: '2-digit',
                minute: '2-digit'
            }));
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
                        err = AJ.koFormBuilder.validations[key](self.Fields()[i].Value(), self.Fields()[i].Validation[key], self);
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

            if (typeof(Eventdata) != "undefined") {
                var index = self.FieldsID().indexOf(Element);
                var currentVal = self.Fields()[index].Value();
                for (var i = 0; i < Eventdata.length; i++) {

                    var compareBool = comparatorFunction(currentVal, Eventdata[i], self); //Comparing CurrentValue to the Value On which event should occur Either True/False
                    var effIndex = self.FieldsID().indexOf(Eventdata[i].depElement); //Retrieve index of the Element Which is affected by that event
                    var actionToCall = Eventdata[i].funct; //For an Event Specifyiing the Action to be called
                    compareBool = compareBool && !(CallBackTrue?true:false);

                    if (typeof(AJ.koFormBuilder.actions[actionToCall]) != "undefined") {
                            self.actioncall = AJ.koFormBuilder.actions[actionToCall](currentVal, effIndex, Eventdata[i].params, compareBool, self); //Action Call
                        if(CallBackTrue)
                           {
                           var reset = self.ResetField(index); //Reset Form Field
                            }
                    } else {
                        //AJTODO: Add condition and callback to external call
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




    ////****************************************** Calling Template File to get All Available Templates*********////
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
            if (type != null && type != undefined && type == 'unform')
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
