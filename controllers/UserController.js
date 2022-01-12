var User = require("../models/User");
var PasswordToken = require("../models/PasswordToken");
var bcrypt = require("bcrypt");
var jwt = require("jsonwebtoken");

var secret = "maoe";

class UserController{
    async index(req, res){
        try {
            var users = await User.findAll();
            res.json(users)
        } catch (error) {
            console.log(error);
        }
        
    }

    async findUser(req, res){
        var id = req.params.id;
        var user = await User.findById(id);
        if(user == undefined){
            res.status(404);
            res.json({err: "Não encontrado"});
        }else{
            res.json(user);
        }
    }

    async create(req, res){
        var { email, name, password } = req.body;

        if(email == undefined || password == undefined || name == undefined){
            res.status(400);
            res.json({err: "Parâmetros inválido. Verifique se está sendo passado os parâmetros: name, email e/ou password."});
            return;
        }

        if(email == '' || password == '' || name == ''){
            res.status(400);
            res.json({err: "Necessário informar parâmetros válidos. Verifique se há algum parâmetro não está vazio."})
            return;
        }

        if(await User.findEmail(email)){
            res.status(406);
            res.json({err: "E-mail já cadastrado."});
            return;
        }       

        await User.new(email, password, name);

        res.status(200);
        return;
    }

    async edit(req, res){
        var {id, name, role, email} = req.body;
        var result =await User.update(id,email,name,role);
        
        if(result != undefined){
            if(result.status){
                res.status(200);
                res.send("Tudo ok!");
            }else{
                res.status(400);
                res.json(result);
            }
        }else{
            res.status(406);
            res.send("Ocorreu um erro no servidor");
        }

    }

    async remove(req, res){
        var id = req.params.id;

        var result = await User.delete(id);

        if(result.status){
            res.status(200);
            res.send("Usuário deletado com sucesso!");
        }else{
            res.status(406);
            res.send(result.error);
        }
    }

    async recoverPassword(req, res){
        var email = req.body.email;
        var result = await PasswordToken.create(email);

        if(result.status){
            res.status(200);
            res.send("" + result.token);
        }else{
            res.status(406);
            res.send(result.error);
        }
    }

    async changePassword(req, res){
        var token = req.body.token;
        var password = req.body.password;

        var isTokenValid = await PasswordToken.validate(token);

        if(isTokenValid.status){
            await User.changePassword(password, isTokenValid.token.user_id, isTokenValid.token.token);
            res.status(200);
            res.send("Senha alterada");
        }else{
            res.status(406);
            res.send("Token inválido");
        }
    }

    async login(req, res){
        var {email, password} = req.body;

        var user = await User.findByEmail(email);

        if(user != undefined){
            var result = await bcrypt.compare(password, user.password);

            if(result){
                var token = jwt.sign( { email: user.email, role: user.role }, secret);
                res.status(200);
                res.json({token: token});
            }else{
                res.status(406);
                res.send("Senha incorreta");
            }            
        }else{
            res.json({status: false});
        }

    }
}

module.exports = new UserController();