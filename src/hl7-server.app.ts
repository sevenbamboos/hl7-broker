import * as hl7Server from './hl7-server';
import { Observable } from "rxjs/Rx";

Observable.of(1,2,3)
  .subscribe(
    (data:any) => console.log(`${data}`),
    (error:any) => console.error(`error:${error}`),
    () => console.log('Completed')
  ); 

const demoServer = new hl7Server.HL7Server('utf8');
demoServer.listen(4000);
