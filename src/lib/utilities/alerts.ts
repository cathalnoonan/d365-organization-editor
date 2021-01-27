export class Alerts {
    private readonly xrm: Xrm.XrmStatic

    constructor (options: AlertsOptions) {
        this.xrm = options.xrm
    }

    public openAlertDialog(text: string) {
        return this.xrm.Navigation.openAlertDialog({ text })
    }
    
    public openErrorDialog(options: Xrm.Navigation.ErrorDialogOptions) {
        return this.xrm.Navigation.openErrorDialog(options)
    }
    
    public closeProgressIndicator(): void {
        return this.xrm.Utility.closeProgressIndicator()
    }
    
    public showProgressIndicator(message: string): void {
        return this.xrm.Utility.showProgressIndicator(message)
    }
}

export interface AlertsOptions {
    xrm: Xrm.XrmStatic
}