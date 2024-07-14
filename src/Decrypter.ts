//import Rclone from 'rclone';
import chunker from "stream-chunker";
import from2 from "from2";

class Decrypter{

    async decrypt(file: File, password: string, salt: string){
        var streamFactory = this.getStreamFactory(file);
        var rclone = await this.getRclone(password, salt);
        var decryptedStream = rclone.File.createReadStream(streamFactory);
        var filename = file.name.replace(/\.bin$/, '');
        await this.downloadStream(decryptedStream, filename)
    }

    private getRclone(password: string, salt: string){
        return (<any>window).rclone.Rclone({
            password: password,
            salt: salt
        });
    }

    private getStreamFactory(file: File): (opts: any) => any{
        return (opts: any) => {
            const start = opts.start;
            const end = opts.end || file.size - 1; // Calculate end if not specified
            var finished = false;
            const blob = file.slice(start, end + 1); // Create a blob from the specified range
            var blobPromise = this.blobToUint8Array(blob);
            const readableStream = (<any>from2)((_: any, next: any) => {
                blobPromise.then((arr) => {
                    if (!finished){
                        next(null, arr);
                    }
                    finished = true;
                    next(null, null);
                });
            });
            return readableStream.pipe(chunker(opts.chunkSize, { flush: true }));;
        }
    }

    private blobToUint8Array(blob: Blob): Promise<Uint8Array> {
        return new Promise((resolve, reject) => {
            const reader = new FileReader();
            reader.onload = () => {
                if (reader.result instanceof ArrayBuffer) {
                    const array = new Uint8Array(reader.result);
                    resolve(array);
                } else {
                    reject(new Error('Failed to read blob as ArrayBuffer.'));
                }
            };
            reader.onerror = () => {
                reject(new Error('Error reading blob.'));
            };
            reader.readAsArrayBuffer(blob);
        });
    }

    private async downloadStream(decryptedStream: any, filename: string): Promise<any>{
        const blob = await this.streamToBlob(decryptedStream);
        const url = URL.createObjectURL(blob);
        const link = document.createElement('a');
        link.href = url;
        link.download = filename;
        document.body.appendChild(link);
        link.click();
    
        // Cleanup
        document.body.removeChild(link);
        URL.revokeObjectURL(url);
    }

    private async streamToBlob(decryptedStream: any): Promise<Blob>{
        return new Promise((resolve, reject) => {
            const chunks: any = [];
            decryptedStream.on("data", (chunk: any) => chunks.push(chunk)).once("end", () => {
              resolve(new Blob(chunks));
            }).once("error", reject);
          });
    }
}

export var decrypter = new Decrypter();