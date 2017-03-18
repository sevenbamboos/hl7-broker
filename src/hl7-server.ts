const net = require('net');

export interface MessageTokenizer {
  feed(data: Buffer): void;
  next(): string;
}

export class RawByteTokenizer implements MessageTokenizer {

  feed(data: Buffer): void {
    //TODO
    console.log(data);
  }
  next(): string {
    throw new Error('Method not implemented.');
  }

}

export class HL7Server {

  constructor(
    private msgTokenizer: MessageTokenizer,
    private encoding: string
    ) {
  }

  listen(port: number) {
    const server = net.createServer((socket: any) => {
      socket.setEncoding(this.encoding);

      socket.on('data', (data: Buffer) => {
        this.msgTokenizer.feed(data);
      });

      socket.end('goodbye\n');
    }).on('error', (err: any) => {
      // handle errors here
      throw err;
    });

    server.listen(4000, () => {
      console.log('HL7 server started on', server.address());
    });
  }
}

