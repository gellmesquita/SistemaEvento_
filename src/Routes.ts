import {Router, Request, Response} from 'express';
import knex from './database/conection';
import entidadeAuth from './middlewre/empresaEnt';
import admAuth from './middlewre/admEnt';
const Route= Router ();
import express from "express";
import path from 'path';
//Instancia dos Controller


//Body-parser para adicionar e obter dados apartir das rotas
import bodyParser from "body-parser";
Route.use(bodyParser.json());
var urlencodedParser = bodyParser.urlencoded({ extended: false })
Route.use(urlencodedParser)
//Rotas





//  Rotas Gerais do Sistema
//Login principal
Route.get('/login', (req:Request, resp: Response)=>{
    //resp.render('login', {certo:req.flash('certo') })
    resp.render('login')
})
// Home page do Sistema

Route.get('/',  async (req:Request, resp: Response)=>{
    const eventos= await knex('eventos').where('acesso', 'Publico').where('realizado', '0');;
    const promotores= await knex('entidades').where('role', 1)
    const categoria= await knex('categoria').select('*')
    resp.render('home', {eventos, promotores, categoria})
})

Route.get('/contactar',  async (req:Request, resp: Response)=>{
    const eventos= await knex('eventos').where('acesso', 'Publico').where('realizado', '0');;
    const promotores= await knex('entidades').where('role', 1)
    const categoria= await knex('categoria').select('*')
    resp.render('contactar', {eventos, promotores, categoria})
})
Route.post('/pesquisar',  async (req:Request, resp: Response)=>{
    const {query} = req.body;
    const e= await knex('eventos').where('acesso', 'Publico').where('realizado', '0');;
    const p= await knex('entidades').where('role', 1)
    const eventos= e.filter(x => x.name.toUpperCase().includes(query.toUpperCase()))
    const c= await knex('categoria').select('*');
    const categoria=c.filter(x => x.nomeCategoria.toUpperCase().includes(query.toUpperCase()));
    const promotores=p.filter(x => x.name.toUpperCase().includes(query.toUpperCase()));
    
    resp.render('pesquisa', {eventos, promotores, categoria, query})
})
Route.get('/promotor/:id',  async (req:Request, resp: Response)=>{
    const {id} = req.params;
    const promotores= await knex('entidades').where('id', id)
    const eventos= await knex('eventos').where('idEntidade', promotores[0].id)
    const categoria= await knex('categoria').select('*')
    
    resp.render('promotor', {eventos, promotor:promotores[0], categoria})
})
Route.get('/recuperarsenha',  async (req:Request, resp: Response)=>{
    const codigo = Math.floor(Math.random() * 6) + 578907    
    const email= req.params;
    resp.render('recsenha', {codigo})
})
Route.post('/rec',  async (req:Request, resp: Response)=>{   
    const {codigo, email} = req.body;
    resp.render('recsenha2', {codigo, email})
})
Route.post('/rectotoal',  async (req:Request, resp: Response)=>{
    const {email,codigo , senha}= req.body
    resp.render('recsenha2', {email, codigo, senha})
})
Route.get('/sobre',  async (req:Request, resp: Response)=>{
    const eventos= await knex('eventos').where('acesso', 'Publico').where('realizado', '0');;
    const promotores= await knex('entidades').where('role', 1)
    const categoria= await knex('categoria').select('*')


    resp.render('sobre', {eventos, promotores, categoria})
})
Route.get('/categoria/:nomeCat',  async (req:Request, resp: Response)=>{
    const {nomeCat}= req.params
    const eventos= await knex('eventos').where('tipo', nomeCat).where('acesso', 'Publico');;
    const promotores= await knex('entidades').where('role', 1)
    const categoria= await knex('categoria').where('nomeCategoria', nomeCat)

    
    resp.render('categoria', {eventos, promotores, categoria})
})

Route.get('/viewevento/:id', async (req:Request, resp: Response)=>{
    const {id}= req.params;
    const evento= await knex('eventos').where('id',id)
    const e1= evento[0]
    const ent=await knex('entidades').where('id', e1.idEntidade)
    const convidados= await knex('convidados').where('idEvento', id)
    resp.render('eventos_',{evento:e1, entidade:ent[0], ErroCampo:req.flash('ErroCampo'), contaExiste:req.flash('contaExiste'), sucesso:req.flash('sucesso'), ErroConvidado:req.flash('ErroConvidado')})
});

Route.get('/painelAdm',admAuth, async (req,resp )=>{
    var id = req.session?.user.id;
    const entidades= await knex('entidades').where('id',id);
    const promotores= await knex('entidades').select('*');
     const eventos= await knex('eventos').select('*');
     const convidados= await knex('convidados').select('*');
     const ev= await knex('eventos').groupBy('mes').count('mes', {as:'evento'}).select('*')
     const ev1= await knex('eventos').where('realizado', 0).groupBy('mes').count('mes', {as:'realizado'}).select('*')
     const dados=ev.map(e=>{
         const real=ev1.map(ed=>(ed.mes==e.mes)?ed.realizado:0)
         const v=real.map(r=>parseInt(r.toString())).reduce((prev, curr)=>prev+curr, 0)
        let name;
        switch (e.mes) {
            case '1':
                name="Janeiro"
                break;
                case '2':
                    name="Fevereiro"
                    break;
                    case '3':
                        name="Março"
                        break;
                        case '4':
                            name="Abril"
                            break;
                            case '5':
                                name="Maio"
                                break;
                                case '6':
                                    name="Junho"
                                    break;
                                    case '7':
                                        name="Julho"
                                        break;
        
            default:
                break;
        }
        return {mes:name, realizado:v, naorealizado:e.evento }
     }) 
     const meses= ['Janeiro', 'Fevereiro', 'Março', 'Abril', 'Maio', 'Junho', 'Julho'];
     const naorealizado=meses.map(i=>{
         const e=dados.filter(e=>e.mes==i);
         if(e.length>0){
             return e[0].naorealizado
         }else{
             return 0
         }
         
     })
     const realizado=meses.map(i=>{
         const e=dados.filter(e=>e.mes==i);
         if(e.length>0){
             return e[0].realizado
         }else{
             return 0
         }
         
     })

     

     
     
    resp.render("admin/index", {entidade:entidades[0], eventos, convidados, naorealizado, realizado, promotores});
})
Route.get('/painelEmpresa',entidadeAuth, async (req,res )=>{
    var id = req.session?.user.id;
    const entidades= await knex('entidades').where('id',id);
     const eventos= await knex('eventos').where('idEntidade',id);
     const index=eventos.map(event=>event.id)
     const convidados=  await knex('convidados').whereIn('idEvento',index).andWhere('estado', '0');

     const ev= await knex('eventos').whereIn('id', index).groupBy('mes').count('mes', {as:'evento'}).select('*')
     const ev1= await knex('eventos').whereIn('id', index).where('realizado', 0).groupBy('mes').count('mes', {as:'realizado'}).select('*')
     const dados=ev.map(e=>{
         const real=ev1.map(ed=>(ed.mes==e.mes)?ed.realizado:0)
         const v=real.map(r=>parseInt(r.toString())).reduce((prev, curr)=>prev+curr, 0)
        let name;
        switch (e.mes) {
            case '1':
                name="Janeiro"
                break;
                case '2':
                    name="Fevereiro"
                    break;
                    case '3':
                        name="Março"
                        break;
                        case '4':
                            name="Abril"
                            break;
                            case '5':
                                name="Maio"
                                break;
                                case '6':
                                    name="Junho"
                                    break;
                                    case '7':
                                        name="Julho"
                                        break;
        
            default:
                break;
        }
        return {mes:name, realizado:v, naorealizado:e.evento , eventos}
     }) 
     const naorea= await knex('eventos').where('idEntidade',id).where('realizado', '0');
     const rea= await knex('eventos').where('idEntidade',id).where('realizado', '1');
     
     const meses= ['Janeiro', 'Fevereiro', 'Março', 'Abril', 'Maio', 'Junho', 'Julho'];
     const naorealizado=meses.map(i=>{
         const e=dados.filter(e=>e.mes==i);
         if(e.length>0){
             return e[0].naorealizado
         }else{
             return 0
         }
         
     })
     const realizado=meses.map(i=>{
         const e=dados.filter(e=>e.mes==i);
         if(e.length>0){
             return e[0].realizado
         }else{
             return 0
         }
         
     })
     
     
    res.render("empresa/index", {entidade:entidades[0], eventos, convidados, realizado, naorealizado, meses, rea:rea.length, naorea:naorea.length})   
})

//LOGIN GERAL DO SISTEMA
Route.post('/loginGeral',urlencodedParser, async (req:Request, resp: Response)=>{
    try {
        const {username, senha}= req.body;
        const entidades= await knex('entidades').where('username', username).where('senha',senha );
        if(entidades.length > 0){
        if(entidades[0].role == 0){
            if(req.session){
                req.session.user={
                    id:entidades[0].id,
                    role:entidades[0].role
                }
                req.session.adm=true;
                
                
                resp.redirect('/painelAdm')
              }   

        }else if(entidades[0].role == 1){
            if(req.session){
                req.session.user={
                    id:entidades[0].id,
                    role:entidades[0].role
                }
                req.session.promotor=true;
                resp.redirect('/painelEmpresa')
              } 
        }else{
            resp.json("/login") 
        }
    }else{
        //req.flash('errado','Sessão não iniciada')
        resp.redirect("/login")
    }
        
    } catch (error) {
        console.log(error)
    }
})

Route.get('/logout', (req, res) => {
    if(req.session){
        req.session.adm=undefined;
        req.session.promotor=undefined;
        res.redirect('/')
    }    
})

Route.get('/cadastroPromotor',  (req, res) => {
    res.render('cadastroEmpresa')
})

export default Route;