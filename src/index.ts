/* tslint:disable:no-string-literal */
import * as through from 'through2';
import * as path from 'path';

export class TapToHtml {

  constructor(private options: IOptions = new Options()) { }

  public stream() {

    let result = [];
    let options2 = this.options;

    const transform = function (chunk, encoding, callback) {
      result = result.concat(chunk.toString().split('\n'));
      callback();
    };

    const flush = function (callback) {
      // ...
      //console.log('flush result = ', result);
      let bodyclass = 'okbody';

      let html, line;
      let content = [];
      let summary = [];
      let yamlTitle = '';
      let title = '';
      let yaml = [];
      let inYaml = false;
      let numberTests = 0;
      let numberPass = 0;
      let numberFail = 0;
      let outsideTitle = true;

      const resetYaml = function () {
        if (inYaml) {
          content.push(yamlTitle);
          content.push('<pre class="yaml">');
          content.push(yaml.join('\n'));
          content.push('</pre>');
          summary.push(yamlTitle);
          summary.push('<pre class="yaml">');
          summary.push(yaml.join('\n'));
          summary.push('</pre>');
        }

        inYaml = false;
        yaml = [];
        yamlTitle = '';
      };

      for (let i = 0; i < result.length; i++) {
        line = result[i];

        html = null;
        if (line.length === 0) {
          //do nothing
        } else if (line.startsWith('ok')) {
          html = `<p class="ok">${line}</p>`;
          resetYaml();
          outsideTitle = true;
        } else if (line.startsWith('TAP version')) {
          resetYaml();
          outsideTitle = true;
        } else if (line.startsWith('# tests')) {
          html = `<p>${line}</p>`;
          numberTests = parseInt(line.substring(7), 10);
          resetYaml();
          outsideTitle = true;
        } else if (line.startsWith('# pass')) {
          html = `<p>${line}</p>`;
          numberPass = parseInt(line.substring(6), 10);
          resetYaml();
          outsideTitle = true;
        } else if (line.startsWith('# fail')) {
          html = `<p>${line}</p>`;
          numberFail = parseInt(line.substring(6), 10);
          resetYaml();
          outsideTitle = true;
        } else if (line.startsWith('#')) {
          html = `<p>${line}</p>`;
          resetYaml();
          if (outsideTitle) {
            title = '';
          }
          title = title + `${line}`;
          outsideTitle = false;
        } else if (line.startsWith('not ok')) {
          bodyclass = 'errorbody';
          yamlTitle = `<p class="error">${title}</p><p class="error">${line}</p>`;
          inYaml = true;
          outsideTitle = true;
        } else if (inYaml) {
          yaml.push(line);
        }

        if (html) {
          content.push(html);
        }


      }



      console.log('numberTests = ', numberTests);
      console.log('numberPass = ', numberPass);
      console.log('numberFail = ', numberFail);

      if (numberTests !== numberPass || numberFail > 0) {
        bodyclass = 'errorbody';
      }

      let totalHtml = options2.html.replace('@content@', content.join('\n'));
      totalHtml = totalHtml.replace('@bodyclass@', bodyclass);
      totalHtml = totalHtml.replace('@numberTests@', numberTests.toString());
      totalHtml = totalHtml.replace('@numberPass@', numberPass.toString());
      totalHtml = totalHtml.replace('@numberFail@', numberFail.toString());
      totalHtml = totalHtml.replace('@summary@', summary.join('\n'));

      const d = new Date();
      const time = d.toLocaleTimeString();
      totalHtml = totalHtml.replace('@time@', time);

      this.push(totalHtml);
      callback();
    };

    console.log('start TapToHtml stream');
    return through.obj(transform, flush);
  }

}



const htmlForm = `
<!DOCTYPE html>
<html>
<head>
    <title>Tap To Html</title>
    <link rel="stylesheet" href="bootstrap.min.css">
    <script src="jquery.min.js"></script>
    <script src="bootstrap.min.js"></script>
    <style>
        .error {
            background-color: #ff0000;
            color: #ffffff;
            font-size: 24px;
            font-weight: bold;
        }
        .ok {
            background-color: #71eb3d;
        }
        .errorbody {
            background-color: #ff0000;
        }
        .okbody {
            background-color: #00ff00;
        }
        .container {
            background-color: #ffffff;
            margin-top: 40px;
        }
        h3 {
            font-family: "Times New Roman";
            font-size: 20px;
        }
        p {
            font-family: "Courier New";
            font-size: 20px;
        }
        .yaml {
            background-color: #f8dada;
            font-size: 20px;
        }  
        .toprow {
            height: 10px;
        }  
        .summary {
            margin: 20px;            
        }  
        span.label {
             font-size: 20px;             
        }   
    </style>
    <script>
        $(document).ready(function () {
            setInterval(function () {
                location.reload();
            }, 4000);
        });
    </script>
</head>
<body class="@bodyclass@">
    <div class="container">
        <div class="row toprow">
        </div>
        <div class="row">
            <div class="col-md-2">
                <span class="label label-default">Tests @numberTests@</span>  
            </div>
            <div class="col-md-2">
                <span class="label label-success">Pass @numberPass@</span>                        
            </div>
            <div class="col-md-2">
                <span class="label label-danger">Fail @numberFail@</span>
            </div>
            <div class="col-md-6">@time@
            </div>
        </div>
        <div class="row summary">
           @summary@
        </div>
        <div class="row">
           @content@
        </div>
    </div>
</body>
</html>
`;


export interface IOptions {
  html?: string;
  basePath?: string;
}

export class Options implements IOptions {
  public constructor(
    public html: string = htmlForm, public basePath = '') { }
}


export class TapToVSError {

  constructor(private options: IOptions = new Options()) { }

  public stream() {

    let result = [];
    let options2 = this.options;

    const transform = function (chunk, encoding, callback) {
      result = result.concat(chunk.toString().split('\n'));
      callback();
    };

    const flush = function (callback) {

      //console.log('result = ', result);

      let html, line;
      let content = [];
      let yamlTitle = '';
      let title = '';
      let yaml = [];
      let inYaml = false;
      let outsideTitle = true;
      let tsFilePath: any = '';
      let tsFileRow = '0';
      let tsFileColumn = '0';
      let tsFileMessage = '0';

      const resetYaml = function () {
        //console.log('title = ', title);

        if (inYaml) {

          if (tsFilePath.startsWith('# @')) {
            const re = /# @([^\(]*)\((\d*),(\d*)\)\: (.*)/;
            const str = tsFilePath;
              //'# @quhnbfleetmake/src/core/consul_options.spec.ts(11,234): message';
            let m;

            if ((m = re.exec(str)) !== null) {
              if (m.index === re.lastIndex) {
                re.lastIndex++;
              }
              // View your result using the m-variable.
              // eg m[0] etc.
            }
            if (m) {
              tsFilePath = m[1];
              tsFileRow = m[2];
              tsFileColumn = m[3];
              tsFileMessage = m[4];
            }

          }

          console.log('tsFilePath = ', tsFilePath);

          const filePath = path.resolve(options2.basePath, tsFilePath.trim());
          const msg = [
            `${filePath}(${tsFileRow},${tsFileColumn}): ${tsFileMessage} `,
            `${yamlTitle} : `,
            yaml.join(''),
            ` : ${title}`,

          ];
          content.push(msg.join(''));
        }

        inYaml = false;
        yaml = [];
        yamlTitle = '';

      };

      for (let i = 0; i < result.length; i++) {
        line = result[i];

        html = null;
        if (line.length === 0) {
          //do nothing
        } else if (line.startsWith('ok')) {
          resetYaml();
          outsideTitle = true;
        } else if (line.startsWith('TAP version')) {
          resetYaml();
          title = '';
          outsideTitle = true;
        } else if (line.startsWith('#@') || line.startsWith('# @')) {
          resetYaml();
          tsFilePath = line;
          title = '';
          outsideTitle = false;
        } else if (line.startsWith('#')) {
          resetYaml();
          if (outsideTitle) {
            title = '';
          }
          title = title + `${line}`;
          outsideTitle = false;
        } else if (line.startsWith('not ok')) {
          yamlTitle = line;
          inYaml = true;
          outsideTitle = true;
        } else if (inYaml) {
          yaml.push(line);
        }


      }

      let total =  content.join('\n');

      this.push(total);
      callback();
    };

    return through.obj(transform, flush);
  }

}

export class LogFileHeader {
  constructor(public moduleName: string) {
  }

  public log(message = ''): string {
    let stackLine = (new Error).stack.split('\n')[2];
    //at Test.<anonymous> (core/fm.spec.ts:340:5)

    const re = /\(([^\:]*):(\d*):(\d*)/;
    const str = stackLine;
    let m;

    if ((m = re.exec(str)) !== null) {
      if (m.index === re.lastIndex) {
        re.lastIndex++;
      }
      // View your result using the m-variable.
      // eg m[0] etc.
    }
    const file = m[1];
    const line = m[2];
    const column = m[3];
    const result = `@${this.moduleName}/${file}(${line},${column}) ${message}`;
    //console.log('result', result);
    //console.log('stackLine', stackLine);
    return result;
  };
}
