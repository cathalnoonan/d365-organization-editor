# D365 Organization Editor
Dynamics 365 stores configuration values for the envrionment in the `Organization` entity. These fields are updated when changes are made in the `System > Administration > System Settings` window, although not all settings are present here

Examples of fields that are not available in the System Settings are:
- <u>IsFolderAutoCreatedonSP</u>: Select whether folders should be automatically created on SharePoint.
- <u>AllowLegacyClientExperience</u>: Enable access to legacy web client UI

This solution provides a way to update the fields in the organization entity without writing a console app

The fields shown in the editor are retrieved from the metadata, so any fields that are added to the organization entity will be shown

Some fields cannot be directly edited, and these fields will not be shown, for example `CreatedOn`

<img src="./img/root.png">

## Caution
<b>Changing some of these values could break something, so be careful not to break your Dynamics 😃</b>
(Set the values at your own risk)

## Installation / Usage
- Download the solution from the <a href="https://github.com/cathalnoonan/d365-organization-editor/releases">Releases page</a>
- Install the solution to the environment
- Open the solution and the webresource will be open under the `Configuration` section
- Search for the field to update using CTRL+F, click the `Edit` button
- Update the value and click `Save`
- Changing some values require `Publish All Customizations` to reflect 

<img src="./img/sample-1.png">
<img src="./img/sample-2.png">

## Bugs
- Lookup values doesn't seem to be updating

## Browser compatibilty / Known issues
Tested in:
- Chrome
  - No specific issues
- Firefox
  - No specific issues
- Edge
  - No specific issues
- IE 11
  - No specific issues