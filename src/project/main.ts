import { OrganizationEditor } from './organizationeditor'

;(async function () {
    // Get Xrm object
    // Might be in another window
    const canReachOtherWindow = (() => {
        try {
            var url = window?.Xrm ?? window.parent?.Xrm ?? window.opener?.Xrm
            return true;
        } catch {
            return false
        }
    })()
    const xrm = (canReachOtherWindow && (window?.Xrm ?? window?.parent?.Xrm ?? window?.opener?.Xrm)) || {
        Navigation: {
            openAlertDialog: async function (alertStrings: Xrm.Navigation.AlertStrings, alertOptions?: Xrm.Navigation.DialogSizeOptions) {
                console.log({ alertStrings, alertOptions })
                alert(alertStrings.text)
            },
            openErrorDialog: async function (errorOptions: Xrm.Navigation.ErrorDialogOptions) {
                console.error({ errorOptions })
                alert(errorOptions.message)
            },
        },
        Utility: {
            getGlobalContext: function () {
                return {
                    getClientUrl: function () {
                        const PATTERN = /http(s?):\/\/([a-z]|[0-9]|\.){0,}(\/(?!webresources)([a-z]|[0-9]){0,})?/gi
                        const match = window.location.href.match(PATTERN)?.[0]
                        if (!match) {
                            alert('Error getting Client URL')
                        }
                        if (match?.endsWith('/')) {
                            return match.substring(0, match.length - 1)
                        } else {
                            return match
                        }
                    }
                }
            },
            showProgressIndicator: function (message: string) {
                // noop
            },
            closeProgressIndicator: function () {
                // noop
            }
        }
    }

    const organizationEditor = new OrganizationEditor({
        apiVersion: 'v9.0',
        // @ts-ignore - This is a workaround for the Xrm object not being there
        xrm,
    })

    await organizationEditor.init()

    document.getElementById('btn-publish')!.addEventListener('click', async () => {
        await organizationEditor.publishCustomizations()
    }, false)
}())