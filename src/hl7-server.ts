///<reference path="../node_modules/@types/node/index.d.ts"/>
import net = require("net");
import { MLLPMessageTokenizer } from "./mllp-message";

export class HL7Server {

  private messageTokenizer: MLLPMessageTokenizer;

  constructor(private encoding: string) {
    this.messageTokenizer = new MLLPMessageTokenizer();
  }

  public listen(port: number) {
    this.messageTokenizer.init();
    const server = net.createServer((connection: any) => {
      // connection.setEncoding(this.encoding);

      connection.on("data", (data: Buffer) => {
        for (const byte of data.values()) {
          this.messageTokenizer.next(byte);
        }
      });

      connection.on("close", () => {
      });

    }).on("error", (err: any) => {
      throw err;
    });

    server.listen(port, () => {
      console.log("HL7 server started on", server.address());
    });

    server.on("close", () => {
      this.messageTokenizer.unsubscribe();
    });
  }
}
