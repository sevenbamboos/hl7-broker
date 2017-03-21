///<reference path="../node_modules/@types/node/index.d.ts"/>

import net = require("net");
import events = require("events");
import * as Rx from "rxjs/Rx";

export const mllpStartBlock: number = 0x0B;
export const mllpEndBlock: number = 0x1C;
export const carriageReturn: number = 0x0D;

export class HL7Server {

  constructor(private encoding: string) {}

  public listen(port: number) {
    const byteSubject = new Rx.Subject();
    const subscriptions = byteSubject.subscribe(
      (data) => {}, // console.log(`onNext: ${data}`),
      (error) => console.log(`onError: ${error}`),
      () => console.log(`onComplete`),
    );

    const msgOpenings$ = byteSubject.filter(
      (data) => data === mllpStartBlock,
    );

    const msgEndings$ = byteSubject.scan(
      (acc, curr) => {
        if (curr === carriageReturn) {
          return acc === mllpEndBlock;
        } else {
          return curr;
        }
      }, false,
    ).filter((data) => data === true);

    const msgContents$ = byteSubject.bufferToggle(msgOpenings$, () => msgEndings$);
    const msgContentsSub = msgContents$.subscribe(
      (data) => console.log(`msgContents:${data.map((x: number) => String.fromCodePoint(x)).join("")}`),
    );

    subscriptions.add(msgContentsSub);

    const server = net.createServer((connection: any) => {
      // connection.setEncoding(this.encoding);

      connection.on("data", (data: Buffer) => {
        for (const byte of data.values()) {

          byteSubject.next(byte);
        }
      });

      connection.on("close", () => {
      });

    }).on("error", (err: any) => {
      // handle errors here
      throw err;
    });

    server.listen(7777, () => {
      console.log("HL7 server started on", server.address());
    });

    server.on("close", () => {
      subscriptions.unsubscribe();
    });
  }
}
