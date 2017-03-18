import * as hl7Server from './hl7-server';

const demoServer = new hl7Server.HL7Server(new hl7Server.RawByteTokenizer(), 'utf8');
demoServer.listen(4000);
