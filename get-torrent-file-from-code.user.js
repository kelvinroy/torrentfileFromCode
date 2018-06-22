// ==UserScript==
// @name        get-torrent-file-from-code
// @grant       none
// @include     /^http://(www.)*javlibrary.com/(cn/)*\?v=.*/
// @downloadURL https://raw.githubusercontent.com/kelvinroy/torrentfileFromCode/master/get-torrent-file-from-code.user.js
// @updateURL 	https://raw.githubusercontent.com/kelvinroy/torrentfileFromCode/master/get-torrent-file-from-code.user.js
// @version     1.0.0
// author       kelvinroy1995@gmail.com
// @require     http://cdn.staticfile.org/jquery/3.3.1/jquery.min.js
// ==/UserScript==

this.$ = this.jQuery = jQuery.noConflict(true);

function getMagnetFromCode(code, cb) {
  // get magnet
  var magnetSource = 'https://www.torrentkitty.tv/search/' + code;
  $.get(magnetSource).done(function(page) {
    var magnetBtns = $(page).find('#archiveResult .action a[href*="magnet"]');
    if (!magnetBtns || !magnetBtns.length) {
      return;
    }

    var magnet = magnetBtns[0].href;
    cb(magnet);
  });
}

var regMagentHash = /^magnet:\?xt=urn:btih:([^&]+)/
function parseHashFromMagnet(magnet) {
  if (!magnet) {
    return;
  }

  var m = regMagentHash.exec(magnet);
  if (m && m.length > 1) {
    return m[1];
  }
}

function getTorrentFromMagnet(magnetHash, cb) {
  if (!magnetHash) {
    return;
  }

  var torrentUrl = 'http://itorrents.org/torrent/' + magnetHash + '.torrent';
  $.get(torrentUrl).done(function(torrentData) {
    if (!torrentData) {
      console.log('[script] Failed to get torrent: ' + torrentUrl);
      return;
    }

    cb(torrentData);
  });
}

function uploadTorrentToYunfile(code, torrentData) {
  var uploadUrl = 'http://up.yunfile.com/view';
  var params = {
    action: 'uploadSave',
    module: 'html2Upload',
  };
  var data = {
    md5: 'ea4836399fe539d9bfa8502e6f8b9320',
    realName: code + '.torrent',
    size: '12122',
    status: 'md5Check',
    uniqueName: 'e937a97e20c659f75a3296e60706e9c7',
  };

  $.post({
    url: uploadUrl,
    qs: params,
    data: data,
  }).done(function(data) {
  });
}

$(function() {
  // get code
  var code = $('#video_id .text').text();
  if (!code) {
    return;
  }

  getMagnetFromCode(code, function(magnet) {
    var magnetHash = parseHashFromMagnet(magnet);

    getTorrentFromMagnet(magnetHash, function(torrentData) {
      uploadTorrentToYunfile(code, torrentData);
    });
  });

});
