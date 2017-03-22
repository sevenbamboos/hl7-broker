///<reference path="../node_modules/@types/node/index.d.ts"/>
import net = require("net");
import fs = require("fs");
import * as Rx from "rxjs/Rx";
import { wrapInMLLP } from "./mllp-message";

const client = net.connect({port: 7777}, () => {
  // 'connect' listener
  console.log("connected to server!");

  const fn = __dirname + "/index.d.ts";
  const fsstat = Rx.Observable.bindNodeCallback(fs.stat);
  fsstat(fn).subscribe(
    (stat) => { 
      if (stat.isFile()) {
        const fsReadFile = Rx.Observable.bindNodeCallback(fs.readFile);
        fsReadFile(fn)
          .subscribe(
            (data) => {
              client.write(wrapInMLLP(data.toString()));
            },
            (err) => console.error(err),
        );
      }
    },
    (error) => console.error("onError:" + error),
  );

});

client.on("data", (data) => {
  console.log(data.toString());
  client.end();
});

client.on("end", () => {
  console.log("disconnected from server");
});