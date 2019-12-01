# D365 Organization Editor
Enables access to update the fields in the Organization entity without writing a console app

The fields shown in the editor are retrieved from the metadata, so any fields that are added to the Organization entity will be shown

Fields that cannot be updated will not be shown

<img src="./img/root.png">

## Caution
<b>Changing some of these values could break something, so be careful not to break your Dynamics</b>

<b>Set the values at your own risk</b>

## Installation / Usage
- Install the managed solution to the environment
- Open the solution and the webresource will be under the `Configuration` section
- Search for the value to update using CTRL+F, click the `Edit` button
- Update the value and click `Save`
- Changing some values require `Publish All Customizations` to reflect 

<img src="./img/sample-1.png">
<img src="./img/sample-2.png">

## Browser compatibilty / Known issues
Tested in:
- Chrome
- Firefox
- Edge
  - Edge has an issue where the text "null" is appearing above the input
  <img src="./img/edge-null-error.png">