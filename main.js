const cnn = require('./db/sqlserver');
const Wkt = require('wicket');
const axios = require('axios');
require('dotenv').config()
const e = console.log;
const INICIO = 0;



var LineByLineReader = require('line-by-line'),
    lr = new LineByLineReader('shapes18.txt');
var shapes = [];

lr.on('error', function (err) {


});

lr.on('line', function (line) {
    var obj = {};
    var length = line.length;
    var texto = line.substring(1, length - 2);
    var arr = texto.split(';');
    shapes.push(arr);
});

lr.on('end', function () {
    const FIM = shapes.length;
    var aux = [];
    var wkt = new Wkt.Wkt();
    var coordenates = [];
    var lines = [];
    var urls = [];

    shapes.forEach((a, b) => {
        if (b >= 11 && b <= FIM) {
            aux.push(a);
        }
    })

    var countError = 0;

    aux.forEach((x, y) => {
        try {
            var resp = wkt.read(x[1]);
            var points = [x[0], wkt.components];
            coordenates.push(points);
        } catch (err) {
            countError++;
            
        }
        
    });

    coordenates.forEach(l => {
        var aux = [];
        var sum = 0;
        l[1].forEach((t, r, s) => {
            var lon = t.x.toString();
            var lat = t.y.toString();
            var contador = r + 1;
            if (r === 0) {
                sum = 0;
            } else {
                var lat1 = s[r - 1].y;
                var lon1 = s[r - 1].x;
                var lat2 = s[r].y;
                var lon2 = s[r].x;
                var dist = parseInt((calcCrow(lat1, lon1, lat2, lon2) * 1000).toFixed(0));
                sum += dist;
                // e(r, dist, sum);
            }
            lines.push([l[0], lat, lon, contador, sum.toString()]);
        })

    });

    

    var url = 'http://jeap.rio.rj.gov.br/MOB';

    lines.forEach(e => {
        var str = url + '/PostShapes.rule?sys=MOB&shape_id=' + e[0] + '&shape_pt_lat=' + e[1] + '&shape_pt_lon=' + e[2] + '&shape_pt_sequence=' + e[3] + '&shape_dist_traveled=' + e[4];
        urls.push(str);
    })

    e(urls.length);

    var countUrlError = 0;
    async function getTodos() {
        var count = 0;
        for (const [idx, url] of urls.entries()) {
            count++;
            if (count > INICIO)  {
                try  {
                    const todo = await axios.get(url);
                } catch (err) {
                    countUrlError++;
                }
                
            }
            e(count + ' - ' + (count / urls.length) * 100 + '%');
        }

        e(urls.length);
        e(lines.length);
        e(countError);
        e(countUrlError);
    }

    getTodos();
});




function calcCrow(lat1, lon1, lat2, lon2) {
    var R = 6371; // km
    var dLat = toRad(lat2 - lat1);
    var dLon = toRad(lon2 - lon1);
    var lat1 = toRad(lat1);
    var lat2 = toRad(lat2);

    var a = Math.sin(dLat / 2) * Math.sin(dLat / 2) +
        Math.sin(dLon / 2) * Math.sin(dLon / 2) * Math.cos(lat1) * Math.cos(lat2);
    var c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
    var d = R * c;
    return d;
}

// Converts numeric degrees to radians
function toRad(Value) {
    return Value * Math.PI / 180;
}


