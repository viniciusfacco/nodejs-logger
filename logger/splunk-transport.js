const Transport = require('winston-transport');
//const util = require('util');
const http = require('http')

//
// Inherit from `winston-transport` so you can take advantage
// of the base functionality and `.exceptions.handle()`.
//
module.exports = class SplunkTransport extends Transport {
  constructor(opts) {
    super(opts);
    //
    // Consume any custom options here. e.g.:
    // - Connection information for databases
    // - Authentication information for APIs (e.g. loggly, papertrail, 
    //   logentries, etc.).
    //
    this.options = {
        hostname: opts.host,
        port: opts.port,
        path: opts.path,
        method: 'POST',
        headers:{
            'Authorization': opts.auth
        }
    }
  }

  log(info, callback) {
    setImmediate(() => {
      this.emit('logged', info);
    });

    //console.log('doing something')
    //console.log(info[Symbol.for('message')])
    //console.log(this.options)
    // Perform the writing to the remote service 
    const req = http.request(this.options, (res) => {
        //console.log(`statusCode: ${res.statusCode}`)
        if (res.statusCode != 200){
            res.on('data', (d) => {
                process.stdout.write(d+'\n')
            })
        }
        //res.on('data', (d) => {
        //    process.stdout.write(d)
        //})
    })
      
    req.on('error', (error) => {
        console.error('Error logging on Splunk: ' + error)
    })
    
    const payload = info[Symbol.for('message')]
    req.write(payload)
    req.end()

    callback();
  }
};