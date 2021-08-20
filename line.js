


lr.on('error', function (err) {
    // 'err' contains error object
});

lr.on('line', function (line) {
    var aux = line.split(';');
    var linha = "('" + aux[0] + "'," + "'" + aux[1] + "'," + "'" + aux[2] + "'," +  aux[3] + "," + "'" + aux[4] + "');"
    var script = 'INSERT INTO shapes ([shape_id],[shape_pt_lat],[shape_pt_lon],[shape_pt_sequence],[shape_dist_traveled]) VALUES '
    script = script + linha;


    fs.appendFile('script.sql', script + '\n', function (err) {
        if (err) {
            // append failed
        } else {
            // done
        }
    })

});

lr.on('end', function () {
    //write.sync('script.txt', texto, { newline: false });
});