/*!
 * Webogram v0.1.8 - messaging web application for MTProto
 * https://github.com/zhukov/webogram
 * Copyright (C) 2014 Igor Zhukov <igor.beatle@gmail.com>
 * https://github.com/zhukov/webogram/blob/master/LICENSE
 */

function bigint (num) {
  return new BigInteger(num.toString(16), 16);
}

function bigStringInt (strNum) {
  return new BigInteger(strNum, 10);
}

function dHexDump (bytes) {
  var arr = [];
  for (var i = 0; i < bytes.length; i++) {
    if (i && !(i % 2)) {
      if (!(i % 16)) {
        arr.push("\n");
      } else if (!(i % 4)) {
        arr.push('  ');
      } else {
        arr.push(' ');
      }
    }
    arr.push((bytes[i] < 16 ? '0' : '') + bytes[i].toString(16));
  }

  console.log(arr.join(''));
}

function bytesToHex (bytes) {
  bytes = bytes || [];
  var arr = [];
  for (var i = 0; i < bytes.length; i++) {
    arr.push((bytes[i] < 16 ? '0' : '') + (bytes[i] || 0).toString(16));
  }
  return arr.join('');
}

function bytesFromHex (hexString) {
  var len = hexString.length,
      i,
      bytes = [];

  for (i = 0; i < len; i += 2) {
    bytes.push(parseInt(hexString.substr(i, 2), 16));
  }

  return bytes;
}

function bytesToBase64 (bytes) {
  var mod3, result = '';

  for (var nLen = bytes.length, nUint24 = 0, nIdx = 0; nIdx < nLen; nIdx++) {
    mod3 = nIdx % 3;
    nUint24 |= bytes[nIdx] << (16 >>> mod3 & 24);
    if (mod3 === 2 || nLen - nIdx === 1) {
      result += String.fromCharCode(
        uint6ToBase64(nUint24 >>> 18 & 63),
        uint6ToBase64(nUint24 >>> 12 & 63),
        uint6ToBase64(nUint24 >>> 6 & 63),
        uint6ToBase64(nUint24 & 63)
      );
      nUint24 = 0;
    }
  }

  return result.replace(/A(?=A$|$)/g, '=');
}

function uint6ToBase64 (nUint6) {
  return nUint6 < 26
    ? nUint6 + 65
    : nUint6 < 52
      ? nUint6 + 71
      : nUint6 < 62
        ? nUint6 - 4
        : nUint6 === 62
          ? 43
          : nUint6 === 63
            ? 47
            : 65;
}

function bytesCmp (bytes1, bytes2) {
  var len = bytes1.length;
  if (len != bytes2.length) {
    return false;
  }

  for (var i = 0; i < len; i++) {
    if (bytes1[i] != bytes2[i]) {
      return false;
    }
  }
  return true;
}

function bytesXor (bytes1, bytes2) {
  var len = bytes1.length,
      bytes = [];

  for (var i = 0; i < len; ++i) {
      bytes[i] = bytes1[i] ^ bytes2[i];
  }

  return bytes;
}

function bytesToWords (bytes) {
  var len = bytes.length,
      words = [];

  for (var i = 0; i < len; i++) {
      words[i >>> 2] |= bytes[i] << (24 - (i % 4) * 8);
  }

  return new CryptoJS.lib.WordArray.init(words, len);
}

function bytesFromWords (wordArray) {
  var words = wordArray.words,
      sigBytes = wordArray.sigBytes,
      bytes = [];

  for (var i = 0; i < sigBytes; i++) {
      bytes.push((words[i >>> 2] >>> (24 - (i % 4) * 8)) & 0xff);
  }

  return bytes;
}

function bytesFromBigInt (bigInt, len) {
  var bytes = bigInt.toByteArray();

  while (!bytes[0] && (!len || bytes.length > len)) {
    bytes = bytes.slice(1);
  }

  return bytes;
}

function bytesFromLeemonBigInt (bigInt, len) {
  var str = bigInt2str(bigInt, 16);
  return bytesFromHex(str);
}


function bytesToArrayBuffer (b) {
  return (new Uint8Array(b)).buffer;
}

function bytesFromArrayBuffer (buffer) {
  var len = buffer.byteLength,
      byteView = new Uint8Array(buffer),
      bytes = [];

  for (var i = 0; i < len; ++i) {
      bytes[i] = byteView[i];
  }

  return bytes;
}

function longToInts (sLong) {
  var divRem = bigStringInt(sLong).divideAndRemainder(bigint(0x100000000));

  return [divRem[0].intValue(), divRem[1].intValue()];
}

function longToBytes (sLong) {
  return bytesFromWords({words: longToInts(sLong), sigBytes: 8}).reverse();
}

function longFromInts (high, low) {
  return bigint(high).shiftLeft(32).add(bigint(low)).toString(10);
}

function intToUint (val) {
  val = parseInt(val);
  if (val < 0) {
    val = val + 4294967296;
  }
  return val;
}

function uintToInt (val) {
  if (val > 2147483647) {
    val = val - 4294967296;
  }
  return val;
}

function sha1Hash (bytes) {
  // console.log('SHA-1 hash start');
  var hashBytes = sha1.hash(bytes, true);
  // console.log('SHA-1 hash finish');

  return hashBytes;
}



function rsaEncrypt (publicKey, bytes) {
  var needPadding = 255 - bytes.length;
  if (needPadding > 0) {
    var padding = new Array(needPadding);
    (new SecureRandom()).nextBytes(padding);

    bytes = bytes.concat(padding);
  }

  // console.log('RSA encrypt start');
  var N = new BigInteger(publicKey.modulus, 16),
      E = new BigInteger(publicKey.exponent, 16),
      X = new BigInteger(bytes),
      encryptedBigInt = X.modPowInt(E, N),
      encryptedBytes  = bytesFromBigInt(encryptedBigInt, 256);

  // console.log('RSA encrypt finish');

  return encryptedBytes;
}

function aesEncrypt (bytes, keyBytes, ivBytes) {
  // console.log('AES encrypt start', bytes.length/*, bytesToHex(keyBytes), bytesToHex(ivBytes)*/);

  var needPadding = 16 - (bytes.length % 16);
  if (needPadding > 0 && needPadding < 16) {
    var padding = new Array(needPadding);
    (new SecureRandom()).nextBytes(padding);

    bytes = bytes.concat(padding);
  }

  var encryptedWords = CryptoJS.AES.encrypt(bytesToWords(bytes), bytesToWords(keyBytes), {
    iv: bytesToWords(ivBytes),
    padding: CryptoJS.pad.NoPadding,
    mode: CryptoJS.mode.IGE
  }).ciphertext;

  var encryptedBytes = bytesFromWords(encryptedWords);

  // console.log('AES encrypt finish');

  return encryptedBytes;
}

function aesDecrypt (encryptedBytes, keyBytes, ivBytes) {
  // console.log('AES decrypt start', encryptedBytes.length/*, bytesToHex(keyBytes), bytesToHex(ivBytes)*/);

  var decryptedWords = CryptoJS.AES.decrypt({ciphertext: bytesToWords(encryptedBytes)}, bytesToWords(keyBytes), {
    iv: bytesToWords(ivBytes),
    padding: CryptoJS.pad.NoPadding,
    mode: CryptoJS.mode.IGE
  });

  var bytes = bytesFromWords(decryptedWords);

  // console.log('AES decrypt finish');

  return bytes;
}

function gzipUncompress (bytes) {
  // console.log('Gzip uncompress start');
  var result = (new Zlib.Gunzip(bytes)).decompress();
  // console.log('Gzip uncompress finish');
  return result;
}

var randoms = [
    0.6780740048270673,
    0.5422933690715581,
    0.30996662518009543,
    0.9001301566604525,
    0.9054833319969475,
    0.9372099668253213,
    0.6134939463809133,
    0.3743047050666064,
    0.720164462691173,
    0.4749144846573472,
    0.03555586002767086,
    0.7920057701412588,
    0.08314720122143626,
    0.5320060723461211,
    0.21680369041860104,
    0.6776383824180812,
    0.34891338529996574,
    0.7751508706714958,
    0.34898894489742815,
    0.19647020567208529,
    0.9544210569001734,
    0.9291022792458534,
    0.571662314934656,
    0.1158677211496979,
    0.2689141083974391,
    0.7450618639122695,
    0.48604283877648413,
    0.5839178354945034,
    0.8878819537349045,
    0.3651400178205222,
    0.22353393607772887,
    0.5924320460762829,
    0.398392042145133,
    0.9771430240944028,
    0.4329377841204405,
    0.34162354469299316,
    0.42912706919014454,
    0.458456116495654,
    0.3822974553331733,
    0.7806365634314716,
    0.4560666654724628,
    0.7049665271770209,
    0.7891417609062046,
    0.12974153365939856,
    0.7804364077746868,
    0.7609384485986084,
    0.6054817030671984,
    0.9426297382451594,
    0.791126542026177,
    0.44311396148987114,
    0.9864380673971027,
    0.24914549198001623,
    0.6320916258264333,
    0.06873075827024877,
    0.9988854473922402,
    0.38619545195251703,
    0.03139998274855316,
    0.6483559960033745,
    0.2342461161315441,
    0.4057386093772948,
    0.9915605948772281,
    0.6447036999743432,
    0.8630581710021943,
    0.7356764012947679,
    0.1750453372951597,
    0.5935452107805759,
    0.739014214836061,
    0.16232014237903059,
    0.055378828663378954,
    0.8970307866111398,
    0.23325247829779983,
    0.35152352252043784,
    0.3301329438108951,
    0.4520612705964595,
    0.5275013262871653,
    0.06662065419368446,
    0.4920310548041016,
    0.6937034328002483,
    0.027172730304300785,
    0.4998889893759042,
    0.2769907242618501,
    0.3499529252294451,
    0.6234606211073697,
    0.5613634991459548,
    0.8245446688961238,
    0.9610400244127959,
    0.11377547355368733,
    0.1786105539649725,
    0.6649315257091075,
    0.07798857660964131,
    0.2541182669810951,
    0.2753731794655323,
    0.7260964524466544,
    0.9097944954410195,
    0.7958247901406139,
    0.31169607769697905,
    0.7567418422549963,
    0.798220542492345,
    0.04436244582757354,
    0.7635175872128457,
    0.5214794962666929,
    0.018040532246232033,
    0.7152074810583144,
    0.7578265292104334,
    0.7072212041821331,
    0.13921484467573464,
    0.907202027272433,
    0.23213761439546943,
    0.0002215476706624031,
    0.9682768350467086,
    0.04643344762735069,
    0.7309616215061396,
    0.7907762078102678,
    0.97113205678761,
    0.6857494255527854,
    0.8935336209833622,
    0.5583525109104812,
    0.9715452678501606,
    0.14918713411316276,
    0.33170966780744493,
    0.11451130057685077,
    0.38668108521960676,
    0.7071701227687299,
    0.1992538038175553,
    0.07904754183255136,
    0.3631267372984439,
    0.19326517707668245,
    0.40534558333456516,
    0.7307040710002184,
    0.15083649358712137,
    0.37753024511039257,
    0.4230033785570413,
    0.3812784585170448,
    0.08954226062633097,
    0.24468524241819978,
    0.9654453464318067,
    0.5321877498645335,
    0.8087001391686499,
    0.2549282240215689,
    0.2567688045091927,
    0.8400530198123306,
    0.16113770054653287,
    0.6141077298671007,
    0.5897052015643567,
    0.59783766977489,
    0.20413847779855132,
    0.2722000319045037,
    0.7167977837380022,
    0.1051818726118654,
    0.1326810831669718,
    0.4027306952048093,
    0.034930562833324075,
    0.34009167994372547,
    0.43577394052408636,
    0.7464077610056847,
    0.06906863558106124,
    0.1648732724133879,
    0.7109983284026384,
    0.8433708692900836,
    0.07138865487650037,
    0.573143531801179,
    0.9226262241136283,
    0.24403949710540473,
    0.4871281301602721,
    0.24070769688114524,
    0.5821026226039976,
    0.6394437169656157,
    0.5546629766467959,
    0.42532561579719186,
    0.09072113153524697,
    0.7264007451012731,
    0.43479082244448364,
    0.009396413806825876,
    0.5979039610829204,
    0.436461792094633,
    0.3653659087140113,
    0.28002127609215677,
    0.7983946853782982,
    0.9785093029495329,
    0.3597910893149674,
    0.6604565805755556,
    0.4331235568970442,
    0.5992027982138097,
    0.2546342604327947,
    0.9006981833372265,
    0.48536466294899583,
    0.08024384966120124,
    0.19115077354945242,
    0.8487708002794534,
    0.6300962842069566,
    0.7099969165865332,
    0.849543810589239,
    0.7159534047823399,
    0.6520298677496612,
    0.6216639834456146,
    0.7443703191820532,
    0.037328516598790884,
    0.21069915359839797,
    0.01016923040151596,
    0.755440307315439
  ],
  randomI = 0;

function nextRandomInt (maxValue) {
  if (randomI >= randoms.length) {
    randomI = 0;
  }
  return Math.floor(randoms[randomI++] * maxValue);
};

function pqPrimeFactorization (pqBytes) {
  var what = new BigInteger(pqBytes), 
      result = false;

  console.log('PQ start', pqBytes, what.bitLength());

  try {
    result = pqPrimeLeemon(str2bigInt(what.toString(16), 16, Math.ceil(64 / bpe) + 1))
  } catch (e) {
    console.error(e);
    console.error('Pq leemon Exception', e);
  }

  if (result === false && what.bitLength() <= 64) {
    // console.time('PQ long');
    try {
      result = pqPrimeLong(goog.math.Long.fromString(what.toString(16), 16));
    } catch (e) {
      console.error('Pq long Exception', e);
    };
    // console.timeEnd('PQ long');
  }
  // console.log(result);

  if (result === false) {
    // console.time('pq BigInt');
    result = pqPrimeBigInteger(what);
    // console.timeEnd('pq BigInt');
  }

  console.log('PQ finish');

  return result;
}

function pqPrimeBigInteger (what) {
  var it = 0,
      g;
  for (var i = 0; i < 3; i++) {
    var q = (nextRandomInt(128) & 15) + 17,
        x = bigint(nextRandomInt(1000000000) + 1),
        y = x.clone(),
        lim = 1 << (i + 18);

    for (var j = 1; j < lim; j++) {
      ++it;
      var a = x.clone(),
          b = x.clone(),
          c = bigint(q);

      while (!b.equals(BigInteger.ZERO)) {
        if (!b.and(BigInteger.ONE).equals(BigInteger.ZERO)) {
          c = c.add(a);
          if (c.compareTo(what) > 0) {
            c = c.subtract(what);
          }
        }
        a = a.add(a);
        if (a.compareTo(what) > 0) {
          a = a.subtract(what);
        }
        b = b.shiftRight(1);
      }

      x = c.clone();
      var z = x.compareTo(y) < 0 ? y.subtract(x) : x.subtract(y);
      g = z.gcd(what);
      if (!g.equals(BigInteger.ONE)) {
        break;
      }
      if ((j & (j - 1)) == 0) {
        y = x.clone();
      }
    }
    if (g.compareTo(BigInteger.ONE) > 0) {
      break;
    }
  }

  var f = what.divide(g), P, Q;

  if (g.compareTo(f) > 0) {
    P = f;
    Q = g;
  } else {
    P = g;
    Q = f;
  }

  return [bytesFromBigInt(P), bytesFromBigInt(Q)];
}

function gcdLong(a, b) {
  while (a.notEquals(goog.math.Long.ZERO) && b.notEquals(goog.math.Long.ZERO)) {
    while (b.and(goog.math.Long.ONE).equals(goog.math.Long.ZERO)) {
      b = b.shiftRight(1);
    }
    while (a.and(goog.math.Long.ONE).equals(goog.math.Long.ZERO)) {
      a = a.shiftRight(1);
    }
    if (a.compare(b) > 0) {
      a = a.subtract(b);
    } else {
      b = b.subtract(a);
    }
  }
  return b.equals(goog.math.Long.ZERO) ? a : b;
}

function pqPrimeLong(what) {
  var it = 0,
      g;
  for (var i = 0; i < 3; i++) {
    var q = goog.math.Long.fromInt((nextRandomInt(128) & 15) + 17),
        x = goog.math.Long.fromInt(nextRandomInt(1000000000) + 1),
        y = x,
        lim = 1 << (i + 18);

    for (var j = 1; j < lim; j++) {
      ++it;
      var a = x,
          b = x,
          c = q;

      while (b.notEquals(goog.math.Long.ZERO)) {
        if (b.and(goog.math.Long.ONE).notEquals(goog.math.Long.ZERO)) {
          c = c.add(a);
          if (c.compare(what) > 0) {
            c = c.subtract(what);
          }
        }
        a = a.add(a);
        if (a.compare(what) > 0) {
          a = a.subtract(what);
        }
        b = b.shiftRight(1);
      }

      x = c;
      var z = x.compare(y) < 0 ? y.subtract(x) : x.subtract(y);
      g = gcdLong(z, what);
      if (g.notEquals(goog.math.Long.ONE)) {
        break;
      }
      if ((j & (j - 1)) == 0) {
        y = x;
      }
    }
    if (g.compare(goog.math.Long.ONE) > 0) {
      break;
    }
  }

  var f = what.div(g), P, Q;

  if (g.compare(f) > 0) {
    P = f;
    Q = g;
  } else {
    P = g;
    Q = f;
  }

  return [bytesFromHex(P.toString(16)), bytesFromHex(Q.toString(16))];
}


function pqPrimeLeemon (what) {
  var minBits = 64,
      minLen = Math.ceil(minBits / bpe) + 1,
      it = 0, i, q, j, lim, g, P, Q,
      a = new Array(minLen),
      b = new Array(minLen),
      c = new Array(minLen),
      g = new Array(minLen),
      z = new Array(minLen),
      x = new Array(minLen),
      y = new Array(minLen);

  for (i = 0; i < 3; i++) {
    q = (nextRandomInt(128) & 15) + 17;
    copyInt_(x, nextRandomInt(1000000000) + 1);
    copy_(y, x);
    lim = 1 << (i + 18);

    for (j = 1; j < lim; j++) {
      ++it;
      copy_(a, x);
      copy_(b, x);
      copyInt_(c, q);

      while (!isZero(b)) {
        if (b[0] & 1) {
          add_(c, a);
          if (greater(c, what)) {
            sub_(c, what);
          }
        }
        add_(a, a);
        if (greater(a, what)) {
          sub_(a, what);
        }
        rightShift_(b, 1);
      }

      copy_(x, c);
      if (greater(x,y)) {
        copy_(z, x);
        sub_(z, y);
      } else {
        copy_(z, y);
        sub_(z, x);
      }
      eGCD_(z, what, g, a, b);
      if (!equalsInt(g, 1)) {
        break;
      }
      if ((j & (j - 1)) == 0) {
        copy_(y, x);
      }
    }
    if (greater(g, one)) {
      break;
    }
  }

  divide_(what, g, x, y);

  if (greater(g, x)) {
    P = x;
    Q = g;
  } else {
    P = g;
    Q = x;
  }

  // console.log(dT(), 'done', bigInt2str(what, 10), bigInt2str(P, 10), bigInt2str(Q, 10));

  return [bytesFromLeemonBigInt(P), bytesFromLeemonBigInt(Q)];
}