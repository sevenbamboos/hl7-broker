import * as Rx from "rxjs/Rx";

const mllpStartBlock: number = 0x0B;
const mllpEndBlock: number = 0x1C;
const carriageReturn: number = 0x0D;

export function wrapInMLLP(msg: string): string{
  const buf = Buffer.alloc(msg.length + 3);
  buf.writeInt8(mllpStartBlock, 0);
  buf.write(msg, 1);
  buf.writeInt8(mllpEndBlock, msg.length + 1);
  buf.writeInt8(carriageReturn, msg.length + 2);
  return buf.toString();
}

export class MLLPMessageTokenizer {

  private byteSubject: Rx.Subject<any>;
  private subscriptions: any;

  public init(): void {
    this.byteSubject = new Rx.Subject();
    this.subscriptions = this.byteSubject.subscribe(
      (data) => { /*console.log(`onNext: ${data}`)*/ },
      (error) => console.log(`onError: ${error}`),
      () => console.log(`onComplete`),
    );

    const msgOpenings$ = this.byteSubject.filter(
      (data) => data === mllpStartBlock,
    );

    const msgEndings$ = this.byteSubject.scan(
      (acc, curr) => {
        if (curr === carriageReturn) {
          return acc === mllpEndBlock;
        } else {
          return curr;
        }
      }, false,
    ).filter((data) => data === true);

    const msgContents$ = this.byteSubject.bufferToggle(msgOpenings$, () => msgEndings$);
    const msgContentsSub = msgContents$.subscribe(
      (data) => console.log(`msgContents:${data.map((x: number) => String.fromCodePoint(x)).join("")}`),
    );

    this.subscriptions.add(msgContentsSub);
  }

  public next(byte: any): void {
    this.byteSubject.next(byte);
  }

  public unsubscribe(): void {
    this.subscriptions.unsubscribe();
  }
}
