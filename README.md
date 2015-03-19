# ko-FormGenerator
ceate a form-JSON in this format


{
	"name" : "form-name",
	"tplSrc" : "templates Source if designed by own",
	"field" : 
	{
		"element1" :
		{
			"element"	: "text",
			"idDiv"		: "element1",
			"idElm"		: "fName",
			"name"		: "firstname"
		}
	}
}


field -> fields/DOM Elements of the form;

key to field and idDiv should be same .

In a field 4 required attributes are : ['idDiv','idElm', 'element', 'name']

Attributes : 1-16;

Required for Each field : {

1.	"name" 		:	corresponds to the DOM property name of the DOM Elements
2.	"element" 	:	specifies which template/DOM element we want
3.	"idElm" 	:	is id of the DOM Element we are creating.
4.	"idDiv" 	:	is the id of the Div that contains the DOM Element/ field.
}

Additional functionality : {
	
5.	"labelName"		:	label Text for your field (String)

6.	"placeholder"	:	placeholder for the elements (String)

7.	"value"			:	value of field's element, Uses given in element-section (Array/String)

8.	"options"		:	an Array of option for select/radio/checkbox

9.	"classDiv" 		:	class to the division containing that field (css-class)
	
10.	"classElement"	:	class to the element of the form-field (css-class)
	
11.	"classLabel"	:	class to the label of fields (String)
	
12.	"enable"		: 	A field can be set enable or disable (true/false)
	
13.	"visibility"	:	sets display of the field (true/false)

14.	"duplicable"	:	set if field duplicable true (true/false)

15.	"componentID"	:	An extra attribute to understand duplicable group of field

16.	"validation"	:	validations for individual fields, applied to it's value (dictionary)

17. "events"		:	Go through events-section

	For Attributes Specific to field read element-section.

}




-->These attributes are required for all element except "break".


"element"- section
Supporting Element are

1.	select			-->		Dropdown								(HTML Element)
2.	multiselect		-->		Dropdown with multiple select allowed	(Jquery select2)
3.	checkbox		-->		checkbox 								(HTML Element)
4.	radio			-->		radio button							(HTML Element)
5.	text			-->		input type text 						(HTML Element)
6.	textarea		-->		textarea 								(HTML Element)
7.	file 			-->		file 									(HTML Element)
8.	label			-->		label									(HTML Element)
9.  button			-->		button									(HTML Element)
10.	date			-->		date-picker								(bootstrap-datepicker)
11.	time			-->		time-picker								(bootstrap-timepicker)
12. submit			-->		button(On click gives filled form data)	(HTML Element)
13. break			-->		div (A blank div that can be used for styling and many more things) 
14.	addfield		-->		addfield (A button used for duplicating one or group of fields for 												example forms using Add more Document type of Functionality)
15. removefield		-->		removefiled (button that can be used with addfield to remove the added 											field)

Description of Attributes for Each Element:

<-------Elemments------->

1. 	"select" 		:

	Description :
		select is the element type used for creating dropdown list.
		it should have these attributes
		HTML <select>

	Attribute-functionality :
		Attributes [1-4] required and additionally required are :
		Other Required {
		
			"value" : [], (Array type)

			"options" : ["--select--","option1","option2"] 
				options have many functionalities described later
		}

		Additional Functionality Attributes [5-17] except 6 are applicable

		"placeholder" is not applied for select-element


		"options" - format
		{
			1. Simple Array - 

				"options" 	: 	["--select--","option1","option2"];

			2. Options with different value and text -
				"options"	:	
				[
					{"value"	:	"",	"displayText"	:	"--select--"},
					{"value"	:	"passport",	"displayText"	:	"Passport"},
					{"value"	:	"panCard",	"displayText"	:	"PAN Card"},
					{"value"	:	"aadaharCard",	"displayText"	:	"Aadhar Card"},
					{"value"	:	"rationCard",	"displayText"	:	"Ration Card"},
					{"value"	:	"DrivingLicense",	"displayText":	"Driving License"},
					{"value"	:	"VoterCard",	"displayText":	"Voter Card"}
				],

			3. Options load from API :

				"options"	:	{ 
					"api"	:	"http://www.abcd.com/get_data/",
					"pathToArray" : "data.employee",
					"pathToValue"	:	"place.address",
					"pathToDisplayText"	:	"place.formatted_address",
					"placeholder"	:	"--select--"
				},

				Here We considered api is returning a JSON and it is in the form
				{
					data : {
						a 	: "",
						b 	: "",
						employee 	: [
							place 	: {
								address 	: "qwerty-sdcj-wnjwb",
								"formatted_address" : "Mumbai"
							}

						],
						c 	:	""
					}
				}

			here (.) separeates used for reaching Nested Value.

			"placeholder" in options is first option of select that is with null value;
		}

2. 	"multiselect" 	:
	
	Description :
		Jquery select2

	Attribute-functionality : 
	 
		All functionality of select applicable, Additionaly It is made up of Jquery select2 to make it multiselect.

		Additional Attribute "selectedValues" : ["option1","option2"] (Array of value of "option") 
			This can be used to get prefilled select2 with some or all value.

3. 	"checkbox" 		:
	
	Description :
		Group of HTML <input type="checkbox"> 
	
	Attribute-functionality : 

		All functionality of select applicable, Additionaly It is made up of Jquery select2 to make it multiselect.

		Here options specifies the checkbox-labels for that group of check-box

4. 	"radio" 		:
	Description :
		Group of HTML <input type="radio">

	Attribute-functionality : 

		All functionality of select applicable, Additionaly It is made up of Jquery select2 to make it multiselect.

		Here options specifies the radio-labels for that group of radio

5. 	"text" 			:
	
	Discription : 
		HTML element <input type=text>

	Attribute-functionality : 
		Attributes [1-4] required and additionally required are :
		Required {
		
			"value" : "", (use String type)
			
		}

		Additional Functionality Attributes [5-17] except 8  all applicable

		"options" are not applied for text-element

6. 	"textarea" 		:
	Discription : 
		HTML element <textare>

	Attribute-functionality : 
		same as "text"

7. 	"file" 			:
	Discription : 
		HTML element <input type="file">

	Attribute-functionality : 
		same as "text"

8. 	"label" 		:
	Discription : 
		HTML element <label>

	Attribute-functionality :
		Attributes [1-4] required and 
		Additional Functionality Attributes 5,9,11,13,14,15 are applicable

9. 	"button" 		:
	
	Discription : 
		HTML element <input type="button">

	Attribute-functionality :
		Attributes [1-4] required and 
		Additional Functionality Attributes 5,9,10,12-17 except 16 are applicable

		"labelName" gives the value of button

10. "date" 			:
	Discription : 
		HTML element <input type="text"> with bootstrap-datepicker

	Attribute-functionality : 
		same as "text"

		More -Additional Attributes are there in date-template
			"dateFormat"	:	"dd/mm/yyyy",
			"daysOfWeekDisabled" :	[0]

			here you can specify the format of date you want other-wise by default it's "yyyy/mm/dd"

			daysOfWeekDisabled is used if you want to disable selection of days like sunday/monday or any other day
			you can specify in the array - sunday-0,mon-1....sat-6
			can give multiple like [0,1]

11. "time" 			:
	Discription : 
		HTML element <input type="text"> with bootstrap-timepicker

	Attribute-functionality : 
		same as "text"
		No-More -Additional Attributes like date

12. "submit" 		:

	Discription : 
		HTML element <input type="button">

	Attribute-functionality :
		Attributes [1-4] required and 
		Additional Functionality Attributes 5,9,10,12-15 are applicable

		"labelName" gives the value of submit-button
		Onclick it gives the data of filled form.

13. "break"			:
	Discription : 
		A blank div

	Attribute-functionality :
		Attributes [2,4] required and 
		Additional Functionality Attributes 9-"classDiv" is applicable
		Note* : Not all attributes even Required are applicable

14. "addfield"		:
	Discription : 
		HTML element <input type="button"> with more functionality gievn below
			A button used for duplicating one or group of fields for 											example forms using Add more Document type of Functionality

	Attribute-functionality : 
		same as "text"

		More -Additional Attributes are there in addfield-template
			"fieldsToDuplicate" : ["element1","element2","element16"],
			"duplicateLimit"	:	4,

			here you can specify the key of the fields which is needs to be duplicated

			duplicateLimit is used if you want to disable button after that many times of duplication
			if not given infinite duplication possible.

15. "removefiled"	:
	Discription : 
		HTML element <input type="button"> with more functionality gievn below
			A button used with duplicated field/group of field and can be used for removing those field/group of field.

	Attribute-functionality : 
		same as "text"

		More -Additional Attributes are there in addfield-template
			"fieldsToRemove" : ["element1","element2"],
			"controlButton"	:	"element15",

			here you can specify the key of the fields which is getting duplicated and needs to be removed after duplication

			controlButton is the key of addfield-element.

<-------Elemments------->

