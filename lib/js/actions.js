////Actions Defined in Variable Format
var AJ.koFormBuilder.actions = {
    hide: function(index, params, ConditionCheck, viewmodel) {
        if (typeof(params.visibility) != "undefined" && ConditionCheck ) {
            viewmodel.Fields()[index].Visibility(params.visibility);
        } else if (typeof(params.visibility) != "undefined") {
            viewmodel.Fields()[index].Visibility(!params.visibility);
            //var reset = viewmodel.ResetField(index);
            if (typeof(viewmodel.Fields()[index].Events()) != "undefined") {
                this.callBack = CallbackFormDataChange(viewmodel.Fields()[index], viewmodel);
            }
        }
    },
    show: function(currentval, index, params, ConditionCheck, viewmodel) {
        if (typeof(params.visibility) != "undefined" && ConditionCheck ) {
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
    enable: function(currentval, index, params, ConditionCheck, viewmodel) {
        if (typeof(params.enable) != "undefined" && ConditionCheck ) {
            viewmodel.Fields()[index].Editable(params.enable);
        } else if (typeof(params.enable) != "undefined") {
            viewmodel.Fields()[index].Value(!params.enable);
            //var reset = viewmodel.ResetField(index);
            if (typeof(viewmodel.Fields()[index].Events()) != "undefined") {
                this.callBack = CallbackFormDataChange(viewmodel.Fields()[index], viewmodel);
            }
        }
    },
    disable: function(currentval, index, params, ConditionCheck, viewmodel) {
        if (typeof(params.enable) != "undefined" && ConditionCheck ) {
            viewmodel.Fields()[index].Editable(params.enable);
        } else if (typeof(params.enable) != "undefined") {
            viewmodel.Fields()[index].Editable(!params.enable);
            //var reset = viewmodel.ResetField(index);
            if (typeof(viewmodel.Fields()[index].Events()) != "undefined") {
                this.callBack = CallbackFormDataChange(viewmodel.Fields()[index], viewmodel);
            }
        }
    },
    loadOption: function(currentval, index, params, ConditionCheck, viewmodel) {
        if (typeof(params.options) != "undefined" && ConditionCheck ) {

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
            if (typeof(viewmodel.Fields()[index].Events()) != "undefined") {
                this.callBack = CallbackFormDataChange(viewmodel.Fields()[index], viewmodel);
            }
        }
    },
    valueChange: function(currentval, index, params, ConditionCheck, viewmodel) {
        if (typeof(params.value) != "undefined" && ConditionCheck ) {
            viewmodel.Fields()[index].Value(params.value);
        }
    },
    addClass: function(currentval, index, params, ConditionCheck, viewmodel) {
        if (typeof(params.class) != "undefined" && ConditionCheck ) {
            viewmodel.Fields()[index].Class(params.class);
        }
    },
    addVariable: function(currentval, index, params, ConditionCheck, viewmodel) {
        if (typeof(params.key) != "undefined" && ConditionCheck ) {
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
