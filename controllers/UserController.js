var User = require("../models/User");

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
}

module.exports = new UserController();