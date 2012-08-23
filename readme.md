[![build status](https://secure.travis-ci.org/semanticprogrammer/crud-basic.png)](http://travis-ci.org/semanticprogrammer/crud-basic)
# CRUD-Basic
CRUD-Basic show the way to implement CRUD functionality with different kind of databases without help from MVC pattern.

## Routing language
    
    RESOURCE LIST:
      method: GET
      URL: /resource/list/{name}
    
    READ RESOURCE:
      method: GET
      URL: /resource/{entity}/{selector}

    VIEW TO CREATE RESOURCE:
      method: GET
      URL: /view/create/{entity}

    MODEL TO CREATE RESOURCE:
      method: GET
      URL: /resource/model/create/{entity}
    
    CREATE RESOURCE:
      method: POST
      URL: /resource/{entity}

    VIEW TO UPDATE RESOURCE:
      method: GET
      URL: /view/update/{entity}

    MODEL TO UPDATE RESOURCE:
      method: GET
      URL: /resource/model/update/{entity}

    UPDATE RESOURCE:
      method: PUT
      URL: /resource/{entity}
    
    DELETE RESOURCE:
      method: DELETE
      URL: /resource/{entity}
    

## Configuration
For adjusting the application to your environment modify the following file: config/environment.json

#### Licensed under MIT License