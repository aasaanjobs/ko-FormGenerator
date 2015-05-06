    ko.bindingHandlers.addressAutocomplete = {
    init: function (element, valueAccessor, allBindingsAccessor) {
        var value = valueAccessor(), allBindings = allBindingsAccessor();
 
        var options = { types: ['geocode'] };
        ko.utils.extend(options, allBindings.autocompleteOptions)
 
        var autocomplete = new google.maps.places.Autocomplete(element, options);
 
        google.maps.event.addListener(autocomplete, 'place_changed', function () {
            result = autocomplete.getPlace();
            //console.log("Hello World",result);
            document.getElementById("pac_location_object").value = JSON.stringify(result);
            value(result.formatted_address);
           
            // The following section poplutes any bindings that match an address component with a first type that is the same name
            // administrative_area_level_1, posatl_code etc. these can be found in the Google Places API documentation
            var components = _(result.address_components).groupBy(function (c) { return c.types[0]; });
            _.each(_.keys(components), function (key) {
                if (allBindings.hasOwnProperty(key))
                    allBindings[key](components[key][0].short_name);
            });
        });
    },
    update: function (element, valueAccessor, allBindingsAccessor) {
        ko.bindingHandlers.value.update(element, valueAccessor);
    }
};


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
                format : 'dd/mm/yyyy'
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
            var tpicker = $(element).timepicker({
                minuteStep: 1,
                appendWidgetTo: 'body',
                showSeconds: false,
                showMeridian: true,
                showInputs:true
            });

            /*tpicker.on('changeTime.timepicker', function(e) {
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
            })*/
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