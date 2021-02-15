import { OrganizationEditor } from './lib'

(async function () {
    // Get Xrm object
    // Might be in another window
    const xrm = window!.Xrm ?? window!.opener!.Xrm ?? window!.parent!.Xrm

    const organizationEditor = new OrganizationEditor({
        apiVersion: 'v9.0',
        xrm,
    })

    await organizationEditor.init()

    document.getElementById('btn-publish')!.addEventListener('click', async () => {
        await organizationEditor.publishCustomizations()
    }, false)
}())