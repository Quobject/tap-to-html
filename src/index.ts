/* tslint:disable:no-string-literal */
import * as through from 'through2';

let result = [];
let options2;

const transform = function (chunk, encoding, callback) {

  result = chunk.toString().split('\n');
  callback();

};

const flush = function (callback) {
  // ...
  console.log('flush result = ', result);

  const content = result.reduce((previusValue, currentValue) => {
    let html = `<p class="ok">${currentValue}<\p>`;
    if (currentValue.startsWith('#')) {
      html = `<h3>${currentValue.substring(2)}<\h3>`;
    } else if (currentValue.startsWith('not ok')) {
      html = `<p class="error">${currentValue}<\p>`;
    }
    previusValue.push(html);
    return previusValue;
  }, []);

  console.log('flush content = ', content);

  let totalHtml = options2.html.replace('@content@', content.join('\n'));

  this.push(totalHtml);
  callback();

};




export class TapToHtml {

  constructor(private options: IOptions = new Options()) { }

  public stream() {
    console.log('start TapToHtml stream');
    options2 = this.options;
    return through.obj(transform, flush);
  }

}


export interface IOptions {
  html?: string;
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
            background-color: #f7a0a0;
        }
        .ok {
            background-color: #71eb3d;
        }
        h1 {
            color: orange;
            text-align: center;
        }
        p {
            font-family: "Times New Roman";
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

        <div class="row">
           @content@
        </div>
    </div>
</body>
</html>
`;

export class Options implements IOptions {
  public constructor(
    public html: string = htmlForm) { }
}

