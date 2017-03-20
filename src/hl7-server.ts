///<reference path="../node_modules/@types/node/index.d.ts"/>

import net = require('net');
import events = require('events');

export const mllpStartBlock: number = 0x0B;
export const mllpEndBlock: number = 0x1C;
export const carriageReturn: number = 0x0D;

class MllpTokenizer extends events.EventEmitter {

  private contents: any[] = [];
  private lastByte: any;

  onData(byte: any) {
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
    console.log(`onClose: ${this.contents}`);
  }

  private onStartBlock() {
    this.contents = [];
  }

  private onEndBlock() {
    this.lastByte = mllpEndBlock;
  }

  private onCarriageReturn() {
    if (this.lastByte === mllpEndBlock) {
      this.emit('message', this.contents);
    } else {
      this.onContents(carriageReturn);
    }
  }

  private onContents(byte: any) {
    this.contents += byte;
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
        console.log(`onData:${data}`);
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

    this.messageTokenizer.on('message', (msg: any) => {
      console.log(`Receive msg: ${msg.toString()}`);
    });

    server.listen(7777, () => {
      console.log('HL7 server started on', server.address());
    });
  }
}

