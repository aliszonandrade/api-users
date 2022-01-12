var knex = require("../database/connection");
var User = require("./User");

class PasswordToken{
    async create(email){
        try {
            var user = await User.findByEmail(email);

            if(user != undefined){
                var token =  Date.now();

                await knex.insert({
                    
                    user_id: user.id,
                    used: 0,
                    token: token //UUID or GUID maybe a better option to use
                }).table("passwordtokens")

                return { status: true, token: token };

            }else{
                return {status: false, error: "O e-mail passado não existe na base de dados."};
            }    
        } catch (error) {
            console.log(error);
            return {status: false, error: error};
        }
        
        
    }

    async validate(token){
        try {
            var result = await knex.select().where({token: token}).table("passwordtokens");
            
            if(result.length > 0){
                var tk = result[0]
                
                if(tk.used){
                    return {status: false};
                }else{
                    return {status: true, token: tk};
                }
            }else{
                return {status: false};
            }
            
        } catch (error) {
            console.log(error);
            return {status: false};
        }
    }

    async setUsed(token){
        await knex.update({used: 1}).where({token: token}).table("passwordtokens");
    }
}

module.exports = new PasswordToken();