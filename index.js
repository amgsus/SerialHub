const SerialPort = require('serialport');
const Net = require('net');

const serverPort    = 10000;
const portName      = 'COM1';
const baudRate      = 115200;

let serialPort = new SerialPort(portName, { baudRate }, (err) => {
    if (err) {
        console.error(err);
        console.log(`Could not open ${portName}!`);
        process.exit();
    }

    console.log(`Serial port ${portName} has been opened.`);

    let clients = [];

    let server = Net.createServer((c) => {
        c.setEncoding('ascii');
        c.on('data', (chunk) => {
            serialPort.write(chunk, (err) => {
                if (err) {
                    console.error(err);
                    console.log(`Failed to write ${chunk.length} bytes to the serial port from client at ${c.remoteAddress}:${c.remotePort}`);
                }
            });
        });
        c.on('close', () => {
            let index = clients.indexOf(c);
            if (index !== -1) {
                clients.splice(index, 1);
            }
            console.log(`Client from ${c.remoteAddress}:${c.remotePort} has disconnected`);
        });
        clients.push(c); // Store client socket in the array.
        console.log(`Accepted connection from ${c.remoteAddress}:${c.remotePort}`);
    });

    server.listen(serverPort, () => {
        console.log(`TCP server is listening on ${serverPort} port...`);
    });

    serialPort.on('data', (chunk) => {
        for ( let c of clients ) { c.write(chunk); }
    });
});