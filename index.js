#!/usr/bin/env node

/*
  bluprnt <https://github.com/akileez/bluprnt>
  Copyright © 2016 Keith Williams. (ISC)

  adopted from: node-boil <https://github.com/marcooliveira/node-boil>
  Copyright Marco Oliveira (MIT)
*/

'use strict'

// requires
const tmpdir      = require('os').tmpdir
const join        = require('path').join
const writeStream = require('fs').createWriteStream
const argv        = require('toolz/src/process/argh').argv
const move        = require('toolz/src/file/move')
const request     = require('toolz/src/http/simple-get-stream')
const Extract     = require('toolz/src/archive/decompress-zip')

// config
const user        = argv.user || 'akileez'
const repo        = argv.repo || 'playground'
const conf        = require('toolz/src/util/rc')('blueprnt', {
  repository: `https://github.com/${user}/${repo}/archive/master.zip`,
  success: 'Project Printed!'
})

// vars
let tmpFile = join(tmpdir(), `${repo}.zip`)
let req     = request(conf.repository)
let extractor

// setup
req.on('end', function () {
  extractor = new Extract(tmpFile)
  extractor.extract({
    filter: function (file) {
      return file.type !== 'SymbolicLink'
    }
  })

  extractor.on('error', function (err) {
    console.error('Error blueprnting:', err)
  })

  extractor.on('extract', function (log) {
    move(`${repo}-master`, './', function (err) {
      if (err) console.log(err)
      console.log(conf.success)
    })
  })
})

// process
req.pipe(writeStream(tmpFile))
