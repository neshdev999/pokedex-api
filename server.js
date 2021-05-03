
require('dotenv').config();
const express = require('express');
const morgan = require('morgan');
const helmet = require('helmet');
const cors = require('cors');
const POKEDEX = require('./pokedex.json');
const morganSetting = process.env.NODE_ENV === 'production' ? 'tiny' : 'common';

const app = express();
//app.use(morgan('dev'));
app.use(morgan(morganSetting));
app.use(helmet());
app.use(cors());

app.use(function validateBearerToken(req, res, next){
    //const bearerToken = req.get('Authorization').split(' ')[1];
    const apiToken = process.env.API_TOKEN;
    const authToken = req.get('Authorization');
    // console.log('validate bearer token middleware');

    // if(bearerToken !== apiToken){
    //     return res.status(401).json({ error: 'Unauthorized request'});
    // }

    if(!authToken || authToken.split(' ')[1] !== apiToken){
        return res.status(401).json({error: 'Unauthorized request'});
    }

    // move to the next middleware
    next();
});

const validTypes = [`Bug`, `Dark`, `Dragon`, `Electric`, `Fairy`, `Fighting`, `Fire`, `Flying`, `Ghost`, `Grass`, `Ground`, `Ice`, `Normal`, `Poison`, `Psychic`, `Rock`, `Steel`, `Water`];

function handleGetTypes(req,res){
    res.json(validTypes);
}

// function handleGetPokemon(req, res){
//     const pokeName = req.query.name;
//     const pokedexLength = POKEDEX.pokemon.length;
//     let answerPokedex = [];
//     for(let i=0; i<pokedexLength; i++){
//         if(pokeName === POKEDEX.pokemon[i].name){
//             answerPokedex.push(POKEDEX.pokemon[i]);
//         }
//     }
//     console.log(answerPokedex);
//     res.send(answerPokedex);
// }

function handleGetPokemon(req, res){
    let response = POKEDEX.pokemon;

    // filter our pokemon by name if name query param is present
    if(req.query.name){
        response = response.filter(pokemon => 
            // case insensitive searching
                pokemon.name.toLowerCase().includes(req.query.name.toLowerCase())
            );
    }

    //filter our pokemon by type if type query param is present

    if(req.query.type){
        response = response.filter(pokemon =>
            pokemon.type.includes(req.query.type)  
            )
    }

    res.json(response);
}

app.get('/pokemon', handleGetPokemon);

app.get('/types', handleGetTypes);

// const PORT = 8000;

app.use((error, req, res, next) => {
    let response;
    if(process.env.NODE_ENV === 'production'){
        response = { error: { message: 'server error'}}
    }else{
        response = {error}
    }
    res.status(500).json(response);
});

const PORT = process.env.PORT || 8000;

app.listen(PORT, () =>{
    console.log('Server is listening at http://localhost:${PORT}');
});
