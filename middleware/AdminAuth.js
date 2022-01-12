var jwt = require('jsonwebtoken');
var secret = "maoe"

module.exports = function(req, res, next){
    const authToken = req.headers['authorization']

    try {
        if(authToken != undefined){
            const bearer = authToken.split(' ');
            var token = bearer[1];
            var decoded = jwt.verify(token,secret);
            
            if(decoded.role == 1){
                next();
            }else{
                res.status(403);
                res.send("Você não possui permissão");
                return;
            }
        }else{
            res.status(403);
            res.send("Você não está autenticado");
            return;
        }    
    } catch (error) {
        console.log(error);
        res.status(403);
        res.send("Você não está autenticado");
        return;
    }
    
}