var knex = require("../database/connection");
var bcrypt = require("bcrypt");
const PasswordToken = require("./PasswordToken");

//Service OR Model
class User{

    async new(email, password, name){
        try {
            var hashPassword = await bcrypt.hash(password, 10);
            await knex.insert({email, password: hashPassword, name,role: 0}).table("users");
        } catch (error) {
            console.log(error);
        }
        
    }

    async findAll(){
        try {
            var result = await knex.select(['id','email','name','role']).table("users");
            return result;
        } catch (error) {
            console.log(error);
            return undefined;
        }
    }

    async findById(id){
        try {
            var result = await knex.select(['id','email','name','role']).where({id:id}).table("users");

            if(result.length > 0){
                return result[0];
            }else{
                return undefined;
            }
        } catch (error) {
            console.log(error);
            return undefined;
        }
    }

    async findByEmail(email){
        try {
            var result = await knex.select(['id','email','password','name','role']).where({email:email}).table("users");

            if(result.length > 0){
                return result[0];
            }else{
                return undefined;
            }
        } catch (error) {
            console.log(error);
            return undefined;
        }
    }

    async findEmail(email){
        try {
            var result = await knex.select("*").from("users").where({email: email});    
            
            if(result.length > 0)
                return true;
            else
                return false;

        } catch (error) {
            console.log(err);
            return false;
        }
    }

    async update(id,email,name,role){
        try {
            var user = await this.findById(id);

            if(user != undefined){
                var editUser = {};

                if(email != undefined){
                    if(email != user.email){
                        var result = await this.findEmail(email);

                        if(!result){
                            editUser.email = email;
                        }else{
                            return {status: false, error: "O e-mail já está cadastrado."};
                        }
                    }
                }

                if(name != undefined){
                    editUser.name = name;
                }

                if(role != undefined){
                    editUser.role = role;
                }

                await knex.update(editUser).where({id: id}).table("users");
                return {status: true};
            }else{
                return {status: false, error: "O usuário não existe."};
            }
        } catch (error) {
            return {status: false, error: error};
        }
    }
    
    async delete(id){
        var user = await this.findById(id);

        if(user != undefined){
            try {
                await knex.delete().where({id: id}).table("users");
                return { status: true };
            } catch (error) {
                return {status: false, error: error};    
            }
        }else{
            return {status: false, error: "O usuário não existe, por tanto não poderá ser deletado."};

        }
    }

    async changePassword(newPassword, id, token){
        var hashPassword = await bcrypt.hash(newPassword, 10);
        await knex.update({password: hashPassword}).where({id: id}).table("users");
        await PasswordToken.setUsed(token);
    }
}

module.exports = new User();