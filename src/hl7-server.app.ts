import * as hl7Server from './hl7-server';
import { Observable } from "rxjs/Rx";

const subject = Observable.of(1,2,3);

const subscription1 = subject.subscribe(
    (data:any) => console.log(`${data}`),
    (error:any) => console.error(`error:${error}`),
    () => console.log('Completed')
); 

subscription1.unsubscribe;

const subscription2 = subject.subscribe(
    (data:any) => console.log(`sub2:${data}`),
    (error:any) => console.error(`error from sub2:${error}`),
    () => console.log('Completed sub2')
); 

subscription2.unsubscribe;

const demoServer = new hl7Server.HL7Server('utf8');
demoServer.listen(4000);
