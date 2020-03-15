//#4: invoked dotenv's config method to read the .env file 
//do this early in the application 
require('dotenv').config()
const express = require('express')
const morgan = require('morgan')
const POKEDEX = require('./pokedex.json') //#10: requiring JSON pokemon data

//console.log(process.env.API_TOKEN) 

const app = express()

const morganSetting = process.env.NODE_ENV === 'production' ? 'tiny' : 'common'
app.use(morgan(morganSetting))

app.use((error, req, res, next) => {
    let response

    if (process.env.NODE_ENV === 'production') {
        response = { error: { message: 'server error '}}
    } else {
        response = { error }
    }
    res.status(500).json(response)
})

//#6: (composing validation middleware) 
//added app.use above both app.gets 
//so we can add a middleware to the line before 
//invoked next() at end of middleware => to move to next middleware
//Note: Check Postman for both types => should see log outputs in terminal for every request
app.use(function validateBearerToken(req, res, next) {
    //console.log('validate bearer token middleware')
    //#7A: reading the request header in express (Validate bearer token)
    //Reading Authorization => value = Bearer string 
    //console.log(req.get('Authorization'))

    //#7B: only care about the token for this header 
    //Splitting the value over empty space 
    //console.log(req.get('Authorization').split(' '))

    //#7C: Now we have an array w. token in 2nd position
    //So we can get the token: 
    //console.log(req.get('Authorization').split(' ')[1]) //returns just API_TOKEN

    //#8: Updating code to store these 2 values (Validate beaer token)
    //We should be able to compare the above code w. process.env.API_TOKEN
    //We should see the same value for req.get('Authorization').split(' ')[1]
    //const bearerToken = req.get('Authorization').split(' ')[1] => change from step 10
    const authToken = req.get('Authorization')
    const apiToken = process.env.API_TOKEN

    //#9: When tokens don't match (validate bearer token)
    //we should send response w. unauthorized status & error message
    //Note: Test in Postman => invalid Auth. header scenario
    /*
    if(bearerToken !== apiToken) {
        return res.status(401).json({ error: 'Unauthorized request' })
    }
    */

    //#10: When tokens don't match & when there's no Auth. header (validate bearer token)
    //Step 9 =>  received error when there was no Auth. header at all
    //We need to check for presence of token header before we split it
    //Responding w. same error when token is present but invalid
    if (!authToken || authToken.split(' ')[1] !== apiToken) {
        return res.status(401).json({ error: 'Unauthorized request' }) //now both tabs w. invalid request in Postman will work
      }

    //move to the next middleware
    next() 
})

//#3: hardcoding array of valid types into app 
//and sending it back to JSON within request handler for GET /types
const validTypes =  [`Bug`, `Dark`, `Dragon`, `Electric`, `Fairy`, `Fighting`, `Fire`, `Flying`, `Ghost`, `Grass`, `Ground`, `Ice`, `Normal`, `Poison`, `Psychic`, `Rock`, `Steel`, `Water`]

// #1: separating the callback out into a named function => modularity & resusability 
function handleGetTypes(req, res) {
    //invoked validTypes => make GET request /types in Postman 
    //To mak sure this endpoint is working while express server is running
    res.json(validTypes)
}


//#2: responds with a list of Pokemon types 
//this constructs our endpoint & creates a separate middleware to handle the request
app.get('/types', handleGetTypes)

//#5:creating handle request for Pokemon
function handleGetPokemon(req, res) {
    //#11: Implementing handleGetPokemon middleware
    //Note: Check endpoints working w. Postman w. valid Auth. header
    let response = POKEDEX.pokemon; 

    //filter our pokemon by name if name query param is present
    if (req.query.name) {
        response = response.filter(pokemon =>
            //case insensitive searching
            pokemon.name.toLowerCase().includes(req.query.name)    
        )
    }

    //filter our pokemon by type if query param is present
    if (req.query.type) {
        response = response.filter(pokemon => 
            pokemon.type.includes(req.query.type)    
        )
    }
    res.json(response)
}

//#5: constructing endpoint & creating separate middleware to handle Pokemon request
app.get('/pokemon', handleGetPokemon) 

const PORT = process.env.PORT || 8000

app.listen(PORT, () => {
  //console.log(`Server listening at http://localhost:${PORT}`)
})