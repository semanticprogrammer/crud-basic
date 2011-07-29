# CRUD-Basic
CRUD-Basic show the way to implement CRUD functionality without help from MVC pattern.

## Requirements
* Node.js 0.5.2+
* MongoDB
* Mutant (https://github.com/semanticprogrammer/mutant not yet registered witn NPM. So make a clone and register module by npm link ./mutant )
* Fork from DustJS (https://github.com/semanticprogrammer/dustjs)


## Routing language

    POST    /resource     create
    GET     /resource/id  read
    PUT     /resource/id  update
    DELETE  /resource/id  destroy
    GET     /resource     list
    
    RESOURCE LIST:
    
    method: GET; URL: /resource/list/{name}
    
    READ RESOURCE:
    method: GET; URL: /resource/{name}/{key}/{id}
    
    CREATE RESOURCE:
    method: POST; URL: /resource/{name}
    
    UPDATE RESOURCE:
    method: PUT; URL: /resource/{name}/{key}/{id}
    
    DELETE RESOURCE:
    method: DELETE; URL: /resource/{name}/{key}/{id}
    

## Configuration
For adjusting the application to your environment update the following file: config/environment.json

#### Licensed under MIT License