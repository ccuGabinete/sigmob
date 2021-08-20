const cnn = require('./db/sqlserver');
const Wkt = require('wicket');
const axios = require('axios');
var LineByLineReader = require('line-by-line'),
    lr = new LineByLineReader('shapes.txt'),
    filename = 'script.txt',
    encoding = 'ANSI';
const fs = require('fs');
require('dotenv').config()
const e = console.log;


var LineByLineReader = require('line-by-line'),
    lr = new LineByLineReader('shapes.txt'),
    filename = 'script.txt',
    encoding = 'ANSI';
const fs = require('fs');
var response = [];

lr.on('error', function (err) {

});

lr.on('line', function (line) {
    var obj = {};
    var length = line.length;
    var texto = line.substring(1, length - 2);
    var arr = texto.split(';');
    response.push(arr);
});

lr.on('end', function () {
    console.log(response);
});

var shapes = [];

cnn.sql.on('error', () => {
    sendJsonResponse(res, 401, {
        msg: 'Falha na obtenção do recurso'
    })
})

cnn.sql.connect(cnn.config)
    .then(pool => {
        let result = pool.request()
            .query("select * from A");
        return result;
    })
    .then(result => {
        for (let i = 0; i < result.rowsAffected; i++) {
            shapes.push(result.recordset[i]);
        }

        var aux = [];
        var wkt = new Wkt.Wkt();
        var coordenates = [];
        var lines = [];
        var urls = [];

        shapes.forEach((a, b) => {
            if (b >= 0 && b <= 200) {
                aux.push(a);
            }
        })

        aux.forEach(x => {
            wkt.read(x.geometry);
            var points = [x.shape_id, wkt.components];
            coordenates.push(points);

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

        lines.forEach(e => {
            var str = 'http://jeap.rio.rj.gov.br/MOB/PostShapes.rule?sys=MOB&shape_id=' + e[0] + '&shape_pt_lat=' + e[1] + '&shape_pt_lon=' + e[2] + '&shape_pt_sequence=' + e[3] + '&shape_dist_traveled=' + e[4];
            urls.push(str);
        })


        async function getTodos() {
            var count = 0;
            for (const [idx, url] of urls.entries()) {
                count++;
                if (count > 15898) {
                    const todo = await axios.get(url);
                }
                e(count);
            }

            e(urls.length);
            e(lines.length);
        }

        getTodos();

        return cnn.sql.close();
    })

    .catch(err => {
        console.log(err);
        return cnn.sql.close();
    })



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