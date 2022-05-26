//import jwt  from 'jsonwebtoken';
import knex from '../database/conection';


async function authenticate(email:string, senha:string) {
    try {
        const aluno=await knex('aluno').where('email', email).where('senha', senha)
        if(aluno.length!==0){
            const al= aluno[0]
            return {al, p:'aluno'}
        }else if(aluno.length===0){
            const professor= await knex('professor').where('email', email).where('senha',senha )
            if(professor.length!==0){
                const prof= professor[0];
                console.log(prof)
                if(prof.adm===1){
                    console.log("adm")
                    const PROFESSORAdm= {prof, p:'adm'}
                    return PROFESSORAdm
                }else if(prof.adm===0){
                    console.log("professor")
                    const PROFESSOR= {prof, p:'professor'}
                    return PROFESSOR
                }
            }else{
                return '-1'  
            }
        }else{
            return '-1'
        }
    } catch (error) {
        console.log(error)
    }

}

export {authenticate};
