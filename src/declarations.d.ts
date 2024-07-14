//I still don't understand why this works, but without this typescript complains

declare module 'rclone' {
    const value: any;
    export default value;
}

declare module 'stream-chunker' {
    const value: any;
    export default value;
}

declare module 'from2' {
    const value: any;
    export default value;
}
