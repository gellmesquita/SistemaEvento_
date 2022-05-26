import knex from '../database/conection';
import { Response, Request } from "express";
import {Router} from 'express'
import bodyParser from "body-parser";
const Route= Router ();
Route.use(bodyParser.json());
import multer from 'multer';
var urlencodedParser = bodyParser.urlencoded({ extended: false })
Route.use(urlencodedParser)
// import bCryptjs from 'bcryptjs'
import entidadeAuth from '../middlewre/empresaEnt';
import admAuth from '../middlewre/admEnt';
import multerConfig from '../config/multer';
const upload = multer(multerConfig);




Route.get('/eliminarEvento/:id',upload.single('image'),async (req:Request, resp: Response)=>{
        try {
            const {id} = req.params;
            const eventos= await knex('eventos').where('id',id).del()
            resp.redirect('/eventos_')
        } catch (error) {}
})


//Eventos 
Route.get('/buscarEvento/:id',entidadeAuth,async (req:Request, resp: Response)=>{
        try {
            const {id}= req.params;
            var idc = req.session?.user.id;
                const entidades= await knex('entidades').where('id',idc);

            const evento= await knex('eventos').where('id',id)
            const e1= evento[0]
            const convidados= await knex('convidados').where('idEvento', id)
            const quantidade= await knex('convidados').where('idEvento', id).groupBy('idEvento').count('idEvento', {as: 'quantidade'});
            if(quantidade.length==0){
                resp.render('empresa/perfilevento', {evento:e1, entidade:entidades[0], convidados:convidados, q:true})
            }else if(quantidade[0].quantidade<e1.limite){
                resp.render('empresa/perfilevento', {evento:e1, entidade:entidades[0], convidados:convidados, q:true})
            }else{
                resp.render('empresa/perfilevento', {evento:e1, entidade:entidades[0], convidados:convidados, q:false})  
            }
        } catch (error) {}
})


Route.get('/eventosview/:id',admAuth,async (req:Request, resp: Response)=>{
        try {
            const {id}= req.params;
            var idc = req.session?.user.id;
                const entidades= await knex('entidades').where('id',idc);
                const evento= await knex('eventos').where('id',id)
                if(evento.length>0){
                        const e1= evento[0]
                        const convidados= await knex('convidados').where('idEvento', id)
                        resp.render('admin/eventosView', {evento:e1, entidade:entidades[0], convidados:convidados})
                }else{
                        resp.render('falha')
                }
        } catch (error) {}
})
Route.get('/gerarRelatorio',entidadeAuth,async (req:Request, resp: Response)=>{
        try {
    
            var idc = req.session?.user.id;
                const entidades= await knex('entidades').where('id',idc);
        
                resp.render('empresa/gerarrelatorio', { entidade:entidades[0]})
               
        } catch (error) {}
})
Route.post('/gerarRelatorioConv',entidadeAuth,async (req:Request, resp: Response)=>{
        try { 
                
                              
                            const { genero, idadeinicial, idadeFinal} = req.body;  
                            console.log(idadeinicial);
                            console.log(idadeFinal);
                            console.log(genero);   
                            var idc = req.session?.user.id;
                        const entidades= await knex('entidades').where('id',idc); 
                                                     
                            if(genero==''){
                                console.log('1');
                                const convidados= await knex('convidados').whereBetween('idade', [idadeinicial, idadeFinal])
                                const eventos= await knex('eventos').select('*') 
                                resp.render('empresa/relatorioConv', { eventos, convidados, entidade:entidades[0]})   
                            }else{
                                console.log('2');
                                const convidados= await knex('convidados').whereIn('idade', [idadeinicial, idadeFinal]).andWhere('genero', genero)
                                const eventos= await knex('eventos').select('*') 
                                resp.render('empresa/relatorioConv', { eventos, convidados, entidade:entidades[0]})   
                            }                            
        } catch (error) {}
})

Route.get('/eventosPdf',admAuth,async (req:Request, resp: Response)=>{
        try {
            const {id}= req.params;
            var idc = req.session?.user.id;
            const entTotal= await knex('entidades').select("*")
                const convidados= await knex('eventos').select("*")
                resp.render('eventoPdf',{eventos:convidados, entTotal})
    
        } catch (error) {}
})
Route.get('/convidadosPdf',admAuth,async (req:Request, resp: Response)=>{
        try {
            const {id}= req.params;
            var idc = req.session?.user.id;
            
                const convidados= await knex('convidados').select("*")
                resp.render('convidadPdf',{convidados:convidados})
    
        } catch (error) {}
})
Route.get('/deleteevento/:id',admAuth,async (req:Request, resp: Response)=>{
        try {
            const {id}= req.params;
            var idc = req.session?.user.id;
                const entidades= await knex('entidades').where('id',idc);
                const evento= await knex('eventos').where('id',id).del();
                const convidados= await knex('convidados').where('idEvento', id)
                resp.redirect('/eventos')
    
        } catch (error) {}
})
Route.get('/convidadoview/:id',admAuth, async (req:Request, resp: Response)=>{
        const {id}= req.params;
        var c = req.session?.user.id;
        const convidados= await knex('convidados').where('id', id);
        if(convidados.length>0){
                const eventos= await knex('eventos').where('id', convidados[0].idEvento)
                
                const entidades= await knex('entidades').where('id',c);
                
                resp.render(`admin/convidadosView`, {convidado:convidados[0], evento:eventos[0], entidade:entidades[0]})
        }else{
                resp.render('falha')
        }

      })
      Route.get('/deletarconvidado/:id',admAuth, async (req:Request, resp: Response)=>{
        const {id}= req.params;
        var c = req.session?.user.id;
        const convidados= await knex('convidados').where('id', id).del();
        resp.redirect('/convidados')



      })

Route.post('/cadastrarEventos',upload.single('image'),entidadeAuth, async (req:Request, resp: Response)=>{
        const { name,data,tipo,endereco, idEntidade, telefone,acesso, desc, limite}= req.body;
        const estado = "1"
        if(!name.match(/\b[A-Za-zÀ-ú][A-Za-zÀ-ú]+,?\s[A-Za-zÀ-ú][A-Za-zÀ-ú]{2,19}\b/gi) || !( /^[9]{1}[0-9]{8}$/.test(telefone) || limite>=100)){
                req.flash('erroCampo', 'Verifique seus campos de Entrada')  
                resp.redirect('/adiocionarevento_')  
        }else{
                const image= (req.file) ? req.file.filename : 'user.png';
                const verify= await knex('eventos').where('data', data).andWhere('name', name).andWhere('tipo', tipo)
                const date= new Date();
                const mes= date.getMonth()+1;
                if(verify.length===0){
                const img = (req.file) ?req.file.filename:'user.png';
                  const ids = await knex('eventos').insert({image:img, name,data,tipo,endereco,estado, idEntidade,telefone,acesso, desc, mes, limite})
                  const aluno = await knex('eventos').where('id', ids[0])
                  resp.redirect('/buscarEvento/'+aluno[0].id)
                  
                }else{
                        req.flash('contaExiste', 'Já existe uma conta vinculada!')
                        resp.redirect('/adiocionarevento_')
                        // resp.render('/falha')
                }
        }

})
Route.get('/ev/:id',entidadeAuth, async (req:Request, resp: Response)=>{
        const {id}= req.params;
        var idc = req.session?.user.id;
        const entidades= await knex('entidades').where('id',idc);
        const evento= await knex('eventos').where('id',id)
        const e1= evento[0]
        const convidados= await knex('convidados').where('idEvento', id)
        resp.render('empresa/editarevento',{evento:e1, entidade:entidades[0], convidados:convidados})
});



Route.post('/editareventos_/:idEvento',upload.single('image'), entidadeAuth, async (req:Request, resp: Response)=>{
        try {
        const {idEvento}= req.params;    
        const {name,data,tipo,endereco, telefone,acesso, desc} = req.body;
        const eV= await knex('eventos').where('id', idEvento);
        const image= (req.file) ? req.file.filename : eV[0].image;
        
            const eventos = await knex('eventos').where('id', idEvento)
            .update({name,data,tipo,endereco,telefone,acesso, desc,image});
            resp.redirect(`/buscarEvento/${idEvento}`)
      
         } catch (error) {resp.json(error)}
});
Route.get('/listarEventos',async (req:Request, resp: Response)=>{
        try {
            
            const entidades= await knex('eventos').select('*');
            resp.json(entidades)
        } catch (error) {}
})



export default Route;


//image, name, email, whatsaap, username senha


