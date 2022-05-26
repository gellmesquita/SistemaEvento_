import express from "express";
import route from './Routes'
import cors from 'cors';
import path from 'path';
import bodyParser from "body-parser";
import session from 'express-session'
import flash from 'express-flash'
import convidadoController from './controller/cController'
import eventoController from './controller/eventoController'
import entidadeController from './controller/entController'


const app= express();

app.use(session({
    secret:'ineforLearning',
    cookie:{maxAge: 3000000000}
}))


app.use('/upload', express.static(path.resolve(__dirname, '..','upload')) );
app.use(express.static(path.resolve(__dirname, '..','public')))
app.set('view engine', 'ejs')
app.use(cors());
app.use(flash());
app.use(route);
app.use(bodyParser.json());
app.use(bodyParser.urlencoded( { extended: false}))
//Criando Controller
app.use(convidadoController);
app.use(eventoController);
app.use(entidadeController);


app.use(function (req,res,next){
    res.render("falha")

})
app.listen(1000, () => {
    console.log('Created');
})