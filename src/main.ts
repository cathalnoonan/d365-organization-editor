import { OrganizationEditor } from './organizationeditor'

;(async function () {
    // Get Xrm object
    // Might be in another window
    const xrm = window?.Xrm ?? window?.parent?.Xrm ?? window?.opener?.Xrm

    const organizationEditor = new OrganizationEditor({
        apiVersion: 'v9.0',
        xrm,
    })

    await organizationEditor.init()

    document.getElementById('btn-publish')!.addEventListener('click', async () => {
        await organizationEditor.publishCustomizations()
    }, false)
}())