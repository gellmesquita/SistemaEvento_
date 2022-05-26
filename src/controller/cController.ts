import knex from '../database/conection';
import { Response, Request } from "express";
import {Router} from 'express'
import bodyParser from "body-parser";
const Route= Router ();
Route.use(bodyParser.json());
var urlencodedParser = bodyParser.urlencoded({ extended: false })
Route.use(urlencodedParser)
// import bCryptjs from 'bcryptjs'
import entidadeAuth from '../middlewre/empresaEnt';
import admAuth from '../middlewre/admEnt';
const sid='AC2c54f2430b2e585129a58d6e4c911ac2';
const auth_token='27d76bf7c614e1717d642db8f2104f4a'
import { Twilio } from "twilio";

Route.post('/CriarConvidado', async (req:Request, resp: Response)=>{
        const { email,telefone,name,endereco,idEvento, genero, idade}= req.body;        
        const estado = "0";
        const eventos= await knex('convidados').where('idEvento',idEvento).groupBy('idEvento').count('idEvento', {as: 'quantidade'})
        const eventoMaior= await knex('eventos').where('id', idEvento);
        const cv= await knex('convidados').where('email',email).where('name', name).where('idEvento',idEvento );
        if(!name.match(/\b[A-Za-zÀ-ú][A-Za-zÀ-ú]+,?\s[A-Za-zÀ-ú][A-Za-zÀ-ú]{2,19}\b/gi) || !( /^[9]{1}[0-9]{8}$/.test(telefone)) || !( /^[^ ]+@[^ ]+\.[a-z]{2,3}$/.test(email)) || idade==undefined || !idade){
            req.flash('ErroCampo', 'Verifique seus campos de entrada!')
            
            resp.redirect('viewevento/'+idEvento)
        }else{
          if(cv.length > 0){
          
            
            req.flash('contaExiste', 'Já Existe uma conta vinculada!')
            resp.redirect('viewevento/'+idEvento)
          }else{
            if(eventos.length==0){
              const ids = await knex('convidados').insert({email,telefone,name,endereco,idEvento,estado, idade, genero})
              const aluno = await knex('convidados').where('id', ids[0])
              req.flash('sucesso', 'Pedido Enviado, Esperar Confirmação!')
              resp.redirect('viewevento/'+idEvento)
             
            }else
            if(eventos[0].quantidade<eventoMaior[0].limite){
              const ids = await knex('convidados').insert({email,telefone,name,endereco,idEvento,estado})
              const aluno = await knex('convidados').where('id', ids[0])
              req.flash('sucesso', 'Pedido Enviado, Esperar Confirmação!')
              resp.redirect('viewevento/'+idEvento)
           
            }else{
              req.flash('ErroConvidado', 'O Limite de Conviado já foi esgotado');
              resp.redirect('viewevento/'+idEvento)
          
            }
          }
        }
})

Route.post('/CriarConvidadopriv',entidadeAuth, async (req:Request, resp: Response)=>{
  const { email,telefone,name,endereco,idEvento}= req.body;        
  const estado = "1"
  const eventos= await knex('convidados').where('idEvento',idEvento).groupBy('idEvento').count('idEvento', {as: 'quantidade'})
  const eventoMaior= await knex('eventos').where('id', idEvento);
  // console.log(eventos[0]);
  // console.log(eventos[0].quantidade<eventoMaior[0].limite);
  if(eventos[0].quantidade<eventoMaior[0].limite){
    const ids = await knex('convidados').insert({email,telefone,name,endereco,idEvento,estado})
    const aluno = await knex('convidados').where('id', ids[0])
    resp.redirect(`/buscarEvento/${idEvento}`)
  }else{
    req.flash('ErroConvidado', 'O Limite de Conviado já foi esgotado');
    resp.redirect(`/convidadopriv/${idEvento}`)
  }
})

Route.get('/recusarpedido/:id',entidadeAuth, async (req:Request, resp: Response)=>{
  const { id}= req.params;        
  const estado = "1"
  const dd= await knex('convidados').where('id',id)
  const eventos= await knex('convidados').where('id',id).del()
  resp.redirect(`/buscarEvento/${dd[0].idEvento}`)
  // console.log(eventos[0]);
})
Route.get('/convidadopriv/:id',entidadeAuth, async (req:Request, resp: Response)=>{
  var c = req.session?.user.id;
  const entidades= await knex('entidades').where('id',c);
    const {id}= req.params;
    const eventos= await knex('eventos').where('id', id)    
    resp.render('empresa/convidadopriv', {idEvento:id, entidade:entidades[0], evento:eventos[0], erroConvidado:req.flash('ErroConvidado')})
})

Route.get('/aceitarconvidado/:id', async (req:Request, resp: Response)=>{
  const {id}= req.params;
  const estado= await knex('convidados').where('id', id).update({estado:"1"})
  const convidado=await knex('convidados').where('id', id)
  const eventos=await knex('eventos').where('id', convidado[0].idEvento)
  const c=convidado[0]
  const SMS =new Twilio(sid,auth_token )
  const message=`${c.name} a sua solicitação foi aceite para o evento ${eventos[0].name}!`
  SMS.messages.create({
      from: '+19706155674',
      to: `+244${c.telefone}`,
      body: message
    }).then((m) =>{
      req.flash('Solicitação', "A solicitação foi aceite!")
      resp.redirect('/solicitacao')
    } ).catch((e) => {
        req.flash('Numero', "Esse numero não está registrado na Twilio gratuito");
        console.log(e);
        resp.redirect('/solicitacao')
    });
    
})
Route.get('/recusarconvidado/:id', async (req:Request, resp: Response)=>{
  const {id}= req.params;
  const estado= await knex('convidados').where('id', id).del()
  resp.redirect(`/solicitacao`)
})

Route.get('/dadosconvidado/:id',entidadeAuth, async (req:Request, resp: Response)=>{
  const {id}= req.params;
  var c = req.session?.user.id;
  const convidados= await knex('convidados').where('id', id);
  const eventos= await knex('eventos').where('id', convidados[0].idEvento)
  const entidades= await knex('entidades').where('id',c);
  
  resp.render(`empresa/dadosConvidado`, {convidado:convidados[0], evento:eventos[0], entidade:entidades[0]})
})

Route.get('/enviarDados/:id', async (req:Request, resp: Response)=>{
  const {id} = req.params;
  const convidados= await knex('convidados').where('id', id)
  resp.json({dados:convidados[0]})

})

Route.post('/CriarConvidadoPriv',entidadeAuth, async (req:Request, resp: Response)=>{
  const { email,telefone,name,endereco,idEvento}= req.body;
  const estado = "1"
  const verify= await knex('convidados').where('name', name).orWhere('telefone', telefone)
  if(verify.length===0){
    const ids = await knex('convidados').insert({email,telefone,name,endereco,idEvento,estado})
    const aluno = await knex('convidados').where('id', ids[0])
    resp.json(aluno)
  }else{
    resp.render('falha')
  }
})

export default Route;

//image, name, email, whatsaap, username senha

//   if(!( /^[^ ]+@[^ ]+\.[a-z]{2,3}$/.test(email)) || !username.match(/^[a-z0-9_.]+$/) || !name.match(/[A-Z][a-z]* [A-Z][a-z]*/) || !( /^[9]{1}[0-9]{8}$/.test(whatsaap))  || !( /^[9]{1}[0-9]{8}$/.test(contacto))|| !( /^[5]{1}[0-9]{7}$/.test(nif))){
//     resp.json({verify:'error'})  
// }else{