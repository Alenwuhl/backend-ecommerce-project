# User Role Upgrade Functionality

## Overview
Este proyecto implementa la funcionalidad del backend para demostrar la actualización del rol de un usuario en un sistema, requiriendo la subida de documentos específicos antes de permitir la actualización. Se utiliza para propósitos de demostración para ilustrar cómo se pueden manejar las operaciones de carga y validación de archivos en el backend.

## Pre-requisitos
Para utilizar esta funcionalidad, debes tener [Postman](https://www.postman.com/downloads/) instalado para hacer las solicitudes a la API.

## Autenticación de Usuario
Para realizar operaciones que requieren autenticación, sigue estos pasos:
- Haz login utilizando la ruta `POST` a **localhost:5000/api/users/login** con las siguientes credenciales en el `body` de la solicitud en formato `raw` y `JSON`:

     ```json
     {
       "Email": "user@example.com",
       "Password": "User123"
     }

## Subida de documentos
Para subir los documentos requeridos:

Realiza una solicitud POST a **localhost:5000/api/users/65f99ec85c1d5807f09a6af2/documents**
En Postman, selecciona body y luego elige form-data.
Debes incluir tres archivos con las siguientes keys y tipos de archivo:

- Key 1: Este campo es para la 'Identificación' y debe ser un archivo .pdf, .jpeg o .png.
- Key 2: Este campo es para el 'Comprobante de domicilio' y debe ser un archivo .pdf, .jpeg o .png.
- Key 3: Este campo es para el 'Comprobante de estado de cuenta' y debe ser un archivo .pdf, .jpeg o .png.
  
Asegúrate de adjuntar los archivos correspondientes para cada key.

## Actualización del Rol de Usuario
Para cambiar el rol del usuario a "premium":

Realiza una solicitud POST a **localhost:5000/api/users/premium/65f99ec85c1d5807f09a6af2** con el siguiente body en formato raw y JSON:

     
     {
       "newRole": "premium"
     }

## Notas adicionales
Todos los archivos subidos deben cumplir con los tipos de archivo permitidos y corresponder a los documentos requeridos para una transición exitosa a un rol premium.
