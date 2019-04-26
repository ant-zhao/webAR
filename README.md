### Prerequisites:
* a hosted server
* a domain name for the server
* CRS endpoint url
* CRS key and secret

### Setup
```bash
$ npm install
```
```bash
$ cp src/config.example.js src/config.js
```
put host url and app keys into `src/config.js`

### Develop
* put web project files into `public`
* script files in `src` will be bundled into `public/scripts/bundle.js`
    * bundle script files with `$ npm run build`
* check `src/index.js` for a basic usage example

### API

#### `SPAR.VideoDevice`
* `constructor(options)`
    * `options`
        * `width`: default 640
        * `height`: default 480
        * `captureType`: default `image/jpeg`
        * `captureQuality`: default `0.5`
* `width`: DOM element width
* `height`: DOM element height
* `videoWidth`: video frame width
* `videoHeight`: video frame height
* `setVideoSource(src)`
    * `src`: e.g., instance of `SPAR.CameraVideoSource`
* `play()`: promise
* `updateVideoCanvas()`: update the underlying canvas with current video frame
* `videoCanvas`: the underlying canvas
* `videoElement`: the underlying video element
* `captureFrame(type, quality)`
    * `type`: default `options.captureType`
    * `quality`: default `options.captureQuality`

#### `SPAR.CameraVideoSource`
* `constructor(constraints)`
    * `constraints`: [MediaStreamConstraints](https://developer.mozilla.org/en-US/docs/Web/API/MediaStreamConstraints)
* `attachTo(videoElm)`
    * `videoElm`: `<video/>`

#### `SPAR.Recognizer`
* `constructor(videoDevice, options)`
    * `videoDevice`: instace of `SPAR.VideoDevice`
    * `options`
        * `requestInterval`: default `1000`ms
* `start(options, cb)`
    * `options`
        * `host`
        * `appKey`
        * `appSecret`
        * (optional)`requestInterval`: see constructor options
    * `cb`: `function(error, result)`
* `stop()`

#### `SPAR.THREERenderer`
* `constructor(videoDevice, options)`
    * `videoDevice`: instace of `SPAR.VideoDevice`
    * `options`
        * `cameraFOV`: default `40`
        * `cameraNear`: default `0.1`
        * `cameraFar`: default `1000`
        * `cameraPosition`: default `{0, 0, 5}`
* `domElement`: DOM element of Three.js renderer
* `scene`: Three.js scene
* `start(onFrame)`: start rendering
    * `onFrame`: function called on every frame update

#### `SPAR.checkBrowser()`
returns `true` for compatible browser

### Deploy

Note:
* this section is meant to be informative only with no guarantee in production environments
* when in doubt, consult your system administrator
* make sure to run `$ npm run build` before uploading project files

#### Configure Nginx
```bash
# on remove server
$ sudo apt-get install nginx
```

edit `/etc/nginx/sites-enabled/default`, replace `<domain name>` with your domain for the remote server and `<CRS gateway url>` with your CRS endpoint:

```
server_name <domain name>;

location /webar {
    index       index.html;
}

location / {
    proxy_pass  <CRS gateway url>;
}
```

#### Deploy project files
```bash
# on local machine
$ scp -r public <user>@<yourhost>:
# on remove server
$ sudo mv public /var/www/html/webar
```

#### Enable HTTPS
```bash
# on remove server
$ sudo apt-get update
$ sudo apt-get install software-properties-common
$ sudo add-apt-repository ppa:certbot/certbot
$ sudo apt-get update
$ sudo apt-get install python-certbot-nginx
$ sudo certbot --nginx
```
now visit `https://<your domain>/webar`

### Notes
* configured to use babel with webpack
* **Important** use obfuscation to protect auth keys in the source code
    * more obfuscation [options](https://github.com/javascript-obfuscator/javascript-obfuscator#javascript-obfuscator-options)
    * adjust options in `webpack.config.js`
