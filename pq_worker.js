/*!
 * Webogram v0.1.8 - messaging web application for MTProto
 * https://github.com/zhukov/webogram
 * Copyright (C) 2014 Igor Zhukov <igor.beatle@gmail.com>
 * https://github.com/zhukov/webogram/blob/master/LICENSE
 */
 
this.console = this.console || {};
this.console.log = this.console.trace = function () {};

importScripts(
  'bin_utils.js',
  'bigint.js',
  'long.js',
  'jsbn_combined.js'
);

onmessage = function (e) {
  postMessage(pqPrimeFactorization(e.data));
}
