export const xrmHttpRequest = function () {

    type Headers = string[][]

    interface RequestOptions {
        data?: any
        additionalHeaders?: Record<string, string>
    }

    interface Response<T> {
        data: T
        success: boolean
        status: number
        message: string
        getResponseHeader(name: string): string | null
    }

    const defaultHeaders = {
        'Accept': 'application/json',
        'OData-MaxVersion': '4.0',
        'OData-Version': '4.0',
        'If-None-Match': null,
    }

    return async function<TResponse = void>(method: string, url: string, options?: RequestOptions): Promise<Response<TResponse>> {
        return new Promise<Response<TResponse>>((resolve, reject) => {
            // Build headers
            let headers = Object.assign({}, defaultHeaders)
            if (options && options.additionalHeaders) {
                headers = Object.assign(headers, options.additionalHeaders)
            }

            // Create XHR
            const xhr = new XMLHttpRequest()
            xhr.open(method, url, true)
            Object.entries(headers).forEach(header => {
                const [key, value] = header
                xhr.setRequestHeader(key!, value!)
            })

            xhr.onload = () => {
                if (xhr.readyState === 4) {
                    return resolve({
                        get data() {
                            return <TResponse>JSON.parse(xhr.responseText)
                        },
                        get success() {
                            return xhr.status >= 200 && xhr.status < 300
                        },
                        get message() {
                            return xhr.responseText
                        },
                        get status() {
                            return xhr.status
                        },
                        getResponseHeader(name: string): string | null {
                            return xhr.getResponseHeader(name)
                        }
                    })
                }
            }

            xhr.onerror = () => reject(xhr)

            if (options && options.data) {
                xhr.send(JSON.stringify(options.data))
            } else {
                xhr.send()
            }
        })
    }
}()