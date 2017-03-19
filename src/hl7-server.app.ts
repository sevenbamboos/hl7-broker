import * as hl7Server from './hl7-server';

const demoServer = new hl7Server.HL7Server('utf8');
demoServer.listen(4000);
