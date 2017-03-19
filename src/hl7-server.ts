///<reference path="../node_modules/@types/node/index.d.ts" />
const net = require('net');
const EventEmitter = require('events').EventEmitter;

export const mllpStartBlock: number = 0x0B;
export const mllpEndBlock: number = 0x1C;
export const carriageReturn: number = 0x0D;

class MllpTokenizer {

  private contents: string = '';
  private lastByte: number;
  private eventEmitter: any = new EventEmitter();

  onData(byte: number) {
    if (byte === mllpStartBlock) {
      this.onStartBlock();
    } else if (byte === mllpEndBlock) {
      this.onEndBlock();
    } else if (byte === carriageReturn) {
      this.onCarriageReturn();
    } else {
      this.onContents(byte);
    }
  }

  onClose() {
    console.log(`receive: ${this.contents}`);
  }

  private onStartBlock() {
    this.contents = '';
  }

  private onEndBlock() {
    this.lastByte = mllpEndBlock;
  }

  private onCarriageReturn() {
    if (this.lastByte === mllpEndBlock) {
      this.eventEmitter.emit('message', this.contents);
    } else {
      this.onContents(carriageReturn);
    }
  }

  private onContents(byte: number) {
    this.contents.concat(String.fromCharCode(byte));
  }

}

export class HL7Server {

  private messageTokenizer: MllpTokenizer = new MllpTokenizer();

  constructor(
    private encoding: string
    ) {
  }

  listen(port: number) {
    const server = net.createServer((connection: any) => {
      //connection.setEncoding(this.encoding);

      connection.on('data', (data: Buffer) => {
        for (const byte of data.values()) {
          this.messageTokenizer.onData(byte);
        }
      });

      connection.on('close', () => {
        this.messageTokenizer.onClose();
      });

    }).on('error', (err: any) => {
      // handle errors here
      throw err;
    });

    server.listen(4000, () => {
      console.log('HL7 server started on', server.address());
    });
  }
}

