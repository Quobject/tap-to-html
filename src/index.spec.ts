/* tslint:disable:no-shadowed-variable */
import * as stream from 'stream';
import test = require('blue-tape');
import { TapToHtml } from './index';

const testString = `
TAP version 13
# testling.baseconfig_for_spec.ts
# get value
ok 1 has key buildtype
# testling.context.ts
# constructor
ok 2 cloudconfig
ok 3 keyspath
ok 4 workingpath
ok 60 device
ok 61 ebsSize
ok 62 ebsVolumeType
# testling.core.quhnb_docker.ts
# constructor
# testling.core.vpc_options.ts
# constructor
ok 63 vpcId
ok 64 securityGroupId

1..64
# tests 64
# pass  64

# ok
`;

//const testString2 = `
//TAP version 13
//# testling.core.ebs_options.ts
//# constructor
//ok 57 machineName
//ok 62 ebsVolumeType
//# testling.core.quhnb_docker.ts
//# constructor
//# testling.core.vpc_options.ts
//# constructor
//not ok 63 vpcId
//  ---
//    operator: equal
//    expected: 'vpc id2'
//    actual:   'vpc id'
//  ...
//ok 64 securityGroupId

//1..64
//# tests 64
//# pass  63
//# fail  1
//`;

test('tapToHtml', t => {
  const s = new stream.Readable();
  s.push(testString);
  s.push(null);

  const w = new stream.Writable();
  let resultString = '';
  w._write = function (chunk, encoding, done) {
    //console.log('+=+' + chunk.toString());
    resultString += chunk.toString();
    done();
  };

  const tapToHtml = new TapToHtml();

  const teststream = tapToHtml.stream();
  s.pipe(teststream).pipe(w);

  w.on('finish', function () {
    console.log('resultString = ' + resultString);
    t.ok(teststream, 'teststream');
    t.end();
  });
});

