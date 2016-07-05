/* tslint:disable:no-shadowed-variable */
/* tslint:disable:no-unused-variable */
import * as stream from 'stream';
import * as fs from 'fs';
import test = require('blue-tape');
import { TapToHtml, Options, TapToVSError } from './index';

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

const testString2 = `
TAP version 13
# quhnbfleetmake/src/baseconfig_for_spec.spec.ts
# get value
ok 1 has key buildtype
# quhnbfleetmake/src/context.spec.ts
# constructor
ok 2 cloudconfig
ok 3 keyspath
ok 4 workingpath
ok 5 fleetmakefilepath
ok 6 pathWorkingAnsibleHosts
ok 7 pathTmp
ok 8 pathWorkingSshtunnel
ok 9 pathWorkingSsl
ok 10 pathWorkingStoreNpm
ok 11 localhost
not ok 12 correct buildtype
  ---
    operator: equal
    expected: 'developments'
    actual:   'development'
  ...
ok 13 should be equal
ok 14 value.cloudconfig.baseServer
ok 15 awsAccessKeyId
ok 16 awsSecretAccessId
ok 17 codestoreKey
ok 18 codestoreSecret
ok 19 codestoreBucket
ok 20 codestoreRegion
# quhnbfleetmake/src/index.spec.ts
# index
# helloWorld
not ok 21 correct return value
  ---
    operator: equal
    expected: 'quhnbfleetmake Hello Worlda'
    actual:   'quhnbfleetmake Hello World'
  ...
# quhnbfleetmake/src/configuration/cloudconfig.spec.ts
# constructor
ok 22 s3CodeQuobjectIoRegion
ok 23 baseServer
ok 24 consulNumberOfMachines
ok 25 workerDockerImagesUsEast1
ok 26 workerDockerImagesUsEast1[0]
ok 27 workerDockerImagesAllRegions
ok 28 workerDockerImagesAllRegions[0]
ok 29 workerRegionIndices
ok 30 workerVolumeName
ok 31 workerAmazonec2Zone
ok 32 workerAmazonec2InstanceType
ok 33 workerAmazonec2RootSize
ok 34 regions
ok 35 regions[0].id
ok 36 apiVersion
ok 37 sslDomain
ok 38 sslIp
ok 39 sslTypes
ok 40 sslTypes[0]
ok 41 sslServers
ok 42 sslServers[0]
# quhnbfleetmake/src/configuration/cloudconfig_region.spec.ts
# constructor
ok 43 id
ok 44 ami
ok 45 vpc
ok 46 zone
# quhnbfleetmake/src/core/consul_options.spec.ts
# constructor
ok 47 todo
# quhnbfleetmake/src/core/crlf.spec.ts
# convert
ok 48 should convert to LF
# quhnbfleetmake/src/core/docker_file_info.spec.ts
# constructor
ok 49 tag
ok 50 tar
ok 51 ebsVolumeType
ok 52 ebsSize
ok 53 run
# quhnbfleetmake/src/core/docker_machine.spec.ts
# getWorkerMachineName
ok 54 machineName
# quhnbfleetmake/src/core/docker_machine_options.spec.ts
# constructor
ok 55 machineName
ok 56 region
# quhnbfleetmake/src/core/ebs_options.spec.ts
# constructor
ok 57 machineName
ok 58 volumeName
ok 59 region.id
ok 60 device
ok 61 ebsSize
ok 62 ebsVolumeType
# quhnbfleetmake/src/core/vpc_options.spec.ts
# constructor
ok 63 vpcId
ok 64 securityGroupId

1..64
# tests 64
# pass  62
# fail  2

`;

//test('tapToHtml to file', t => {
//  const s = new stream.Readable();
//  s.push(testString);
//  s.push(null);

//  const w = fs.createWriteStream('C:/tools/lint/tap.html');

//  const tapToHtml = new TapToHtml();

//  const teststream = tapToHtml.stream();
//  s.pipe(teststream).pipe(w);

//  w.on('finish', function () {
//    //console.log('writing finished');
//    t.ok(teststream, 'teststream');
//    t.end();
//  });
//});


test('tapToHtml', t => {
  const s = new stream.Readable();
  s.push(testString2);
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
    t.ok(resultString, 'resultString');
    t.end();
  });
});



test('tapToVSError', t => {
  const s = new stream.Readable();
  s.push(testString2);
  s.push(null);

  const w = new stream.Writable();
  let resultString = '';
  w._write = function (chunk, encoding, done) {
    //console.log('+=+' + chunk.toString());
    resultString += chunk.toString();
    done();
  };

  const option = new Options(null, 'c:/base');
  const tapToVSError = new TapToVSError(option);

  const teststream = tapToVSError.stream();
  s.pipe(teststream).pipe(w);

  w.on('finish', function () {
    //console.log('resultString = ' + resultString);
    t.ok(teststream, 'teststream');
    t.ok(resultString, 'resultString');
    t.end();
  });
});

