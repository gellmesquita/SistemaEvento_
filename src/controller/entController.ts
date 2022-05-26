import knex from '../database/conection';
import { Response, Request } from "express";
import {Router} from 'express'
import bodyParser from "body-parser";
const Route= Router ();
import multer from 'multer';
Route.use(bodyParser.json());
var urlencodedParser = bodyParser.urlencoded({ extended: false })
Route.use(urlencodedParser)
// import bCryptjs from 'bcryptjs'
import entidadeAuth from '../middlewre/empresaEnt';
import admAuth from '../middlewre/admEnt';
import multerConfig from '../config/multer';
const upload = multer(multerConfig);


Route.post('/cadastroEntidade',upload.single('image'), async (req:Request, resp: Response)=>{
         
        let {name,username,email,telefone,senha,nif,endereco, empresa, image}= req.body;
        const estado = "1"
        const role ="1"

        
        if(name=="" || username=="" || email=="" || telefone=="" || senha=="" || nif=="" || endereco==""|| empresa==""){
                resp.render('falha')
        }
        const verify= await knex('entidades').where('username', username).orWhere('email', email)
        if(verify.length===0){
        const img = (req.file) ?req.file.filename:'user.png';
          const ids = await knex('entidades').insert({image:img,name,username,email,telefone,role,senha,nif,endereco,estado, empresa })
          const aluno = await knex('entidades').where('id', ids[0])
          resp.redirect('/login')
        }else{
                resp.render('falha')
        }
});

Route.get('/eventos',admAuth, async (req:Request, resp: Response)=>{
            try {
                var id = req.session?.user.id;
                const entidades= await knex('entidades').where('id',id);
                const entTotal= await knex('entidades').select("*")
                const eventos= await knex('eventos').select('*')
                resp.render('admin/eventos', {eventos, entidade:entidades[0], entTotal})
             } catch (error) {resp.json(error)}

})

Route.get('/perfilpromotor',entidadeAuth, async (req:Request, resp: Response)=>{
        try {
            var id = req.session?.user.id;
            const entidades= await knex('entidades').where('id',id);
            const entTotal= await knex('entidades').select("*")
            const eventos= await knex('eventos').select('*')
            resp.render('empresa/perfil', {eventos, entidade:entidades[0], entTotal})
         } catch (error) {resp.json(error)}

})

Route.get('/perfilpromotor/:id',admAuth, async (req:Request, resp: Response)=>{
        try {
            var {id} = req.params;
            const entidades= await knex('entidades').where('id',id);
            const entTotal= await knex('entidades').select("*")
            const eventos= await knex('eventos').select('*')
            resp.render('admin/promotorView', {eventos, entidade:entidades[0], entTotal})
         } catch (error) {resp.json(error)}

})
Route.get('/deletarpromotor/:id',admAuth, async (req:Request, resp: Response)=>{
        try {
            var {id} = req.params;
            const entidades= await knex('entidades').where('id',id).del();
            const eventos= await knex('eventos').where('idEntidade',id).del();
            resp.redirect('/promotor')
      
         } catch (error) {resp.json(error)}

})
Route.get('/editarpromotor',entidadeAuth, async (req:Request, resp: Response)=>{
        try {
            var id = req.session?.user.id;
            const entidades= await knex('entidades').where('id',id);
            const entTotal= await knex('entidades').select("*")
            const eventos= await knex('eventos').select('*')
            resp.render('empresa/editar', {eventos, entidade:entidades[0], entTotal})
         } catch (error) {resp.json(error)}

})

Route.get('/eventos_',entidadeAuth, async (req:Request, resp: Response)=>{
        try {
            var id = req.session?.user.id;
            const entidades= await knex('entidades').where('id',id);
            const eventos= await knex('eventos').where('idEntidade',id);
            const index = eventos.map(event => event.id);
            const convidados=  await knex('convidados').whereIn('idEvento',index);
            resp.render('empresa/eventos', {eventos, entidade:entidades[0],convidados})
         } catch (error) {resp.json(error)}

})
Route.get('/solicitacao',entidadeAuth, async (req:Request, resp: Response)=>{
        try {
            var id = req.session?.user.id;
            const entidades= await knex('entidades').where('id',id);
            const eventos= await knex('eventos').where('idEntidade',id);
            const index = eventos.map(event => event.id);
            const convidados=  await knex('convidados').whereIn('idEvento',index).andWhere('estado', '0');
            resp.render('empresa/solicitacao', {eventos, entidade:entidades[0],convidados,Solicitacao:req.flash('Solicitação') ,Numero:req.flash('Numero')})
        } catch (error) {resp.json(error)}
})
Route.get('/adiocionarevento_',entidadeAuth, async (req:Request, resp: Response)=>{
        try {
            var id = req.session?.user.id;
            const entidades= await knex('entidades').where('id',id);
            const eventos= await knex('eventos').where('idEntidade',id);
            const index = eventos.map(event => event.id);
            const convidados=  await knex('convidados').whereIn('idEvento',index);
            resp.render('empresa/addevento', {eventos, entidade:entidades[0],convidados,erroCampo:req.flash('erroCampo'), sucesso:req.flash('sucesso'), contaExiste:req.flash('contaExiste')})
         } catch (error) {resp.json(error)}

})
Route.get('/convidados',admAuth, async (req:Request, resp: Response)=>{
        try {
            var id = req.session?.user.id;
            const entidades= await knex('entidades').where('id',id);
            const entTotal= await knex('entidades').select("*")
            const eventos= await knex('eventos').select('*')
            const convidados= await knex('convidados').select('*')
            resp.render('admin/convidados', {eventos, entidade:entidades[0], entTotal, convidados})
         } catch (error) {resp.json(error)}

})

Route.get('/promotor',admAuth, async (req:Request, resp: Response)=>{
        try {
            var id = req.session?.user.id;
            const entidades= await knex('entidades').where('id',id);
            const entTotal= await knex('entidades').where('role', 1)
            const eventos= await knex('eventos').select('*')
            resp.render('admin/promotor', {eventos, entidade:entidades[0], entTotal})
        } catch (error) {resp.json(error)}
})
Route.post('/editarEntidade',entidadeAuth,upload.single('image'), async (req:Request, resp: Response)=>{
        try {
        const {name,username,email,telefone,nif,endereco, empresa, descricao} = req.body;
        var id = req.session?.user.id;
        const eV= await knex('entidades').where('id', id);
        const image= (req.file) ? req.file.filename : eV[0].image;      
            const entidades = await knex('entidades').where('id','=', id)
            .update({name,username,email,telefone,nif,endereco, empresa, image,descricao});
            resp.redirect('/perfilpromotor')
      
         } catch (error) {resp.json(error)}

})
Route.get('/rfid',entidadeAuth, async (req:Request, resp: Response)=>{
        try {
                var id = req.session?.user.id;
                const entidades= await knex('entidades').where('id',id);
                const entTotal= await knex('entidades').select("*")
                const eventos= await knex('eventos').select('*')
                const convidados= await knex('convidados').select('*')
                resp.render('empresa/rfid', {eventos, entidade:entidades[0], entTotal, convidados})
             } catch (error) {resp.json(error)}

})


Route.post('/eliminarEntidade', async (req:Request, resp: Response)=>{
            try {
            const {id} = req.body;
            const entidades= await knex('entidades').where('id',id).del()
            resp.json(entidades)
        } catch (error) {}

})

Route.post('listarEntidades', async (req:Request, resp: Response)=>{
            try {
            
            const entidades= await knex('entidades').select('*');
            resp.json(entidades)
        } catch (error) {}

})

Route.post('listarEntidadeEspe/:id', async (req:Request, resp: Response)=>{
        try {
            const id = req.params.id
            const entidades= await knex('entidades').where('id',id);
            const entidade=entidades[0]
            resp.json(entidade)
        } catch (error) {}

})

Route.post('/painelAdm_', async (req:Request, resp: Response)=>{
        try {
            const {id} = req.session?.user.id;
           const entidades= await knex('entidades').where('id',id);
            const eventos= await knex('eventos').select('*');
            const convidados= await knex('convidados').select('*');
            resp.send('entrou');
        } catch (error) {}

})



export default Route;


//image, name, email, whatsaap, username senha

