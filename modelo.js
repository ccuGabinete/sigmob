const cnn = require('./db/sqlserver');
require('dotenv').config()

cnn.sql.on('error', () => {
    sendJsonResponse(res, 401, {
        msg: 'Falha na obtenção do recurso'
    })
})

cnn.sql.connect(cnn.config)
    .then(pool => {
        return pool.request()
            .input('NomeInscrito', cnn.sql.VarChar(255), req.body.NomeInscrito)
            .input('DataNascimento', cnn.sql.VarChar(20), req.body.DataNascimento)
            .input('NickName', cnn.sql.VarChar(255), req.body.NickName)
            .input('Email', cnn.sql.VarChar(255), req.body.Email)
            .input('IDEquipe', cnn.sql.Int, parseInt(req.body.IDEquipe))
            .input('CPF', cnn.sql.VarChar(25), req.body.CPF)
            .input('CEP', cnn.sql.VarChar(25), req.body.CEP)
            .query("insert into Inscritos(NomeInscrito, DataNascimento, NickName, Email, IDEquipe, CPF, CEP) values (@NomeInscrito, @DataNascimento, @NickName, @Email, @IDEquipe, @CPF, @CEP)");
    })
    .then(result => {
        sendJsonResponse(res, 200, result);
        return cnn.sql.close();
    })
    .catch(err => {
        sendJsonResponse(res, 404, err);
        console.log(err);
        return cnn.sql.close();
    })