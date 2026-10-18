import express from 'express';
import morgan from 'morgan';
import path from 'node:path';
import sharp from 'sharp';
import { PNG } from 'pngjs';
import TGA from 'tga';
// Too lazy to add env file just for this
const cache = true
import { fileURLToPath } from 'node:url';
import fs from 'node:fs/promises'
import { main } from 'FFL.js/examples/nodejs-icon-body-webgpu.js';
import NnidResolver from './utils/NnidResolver.mjs';
process.title = 'MiiRender-server';
const LISTEN_PORT = 7190;
const app = express();
// ESM replacement for __dirname
const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// START APPLICATION
app.set('etag', false);
app.disable('x-powered-by');
app.set('subdomain offset', 1);

// Create router
console.log('Setting up Middleware');
app.use(morgan('dev'));
app.use(express.json());
app.use(express.urlencoded({
    extended: true
}));
async function initialize() {
    console.log('SKibidi')
    


}
async function icon_resize() {

}


async function file_checker(data, expression, format, size, response) {
    const name = await NnidResolver._nameFromMiiDataBase64(data);
    const filePath = `./src/storage/miis/${name}-${data}/${expression}/icon-${size}.${format}`;

    try {
        await initialize();
        let fileBuffer = await fs.readFile(filePath);
        if (format === 'tga') {
            response.setHeader('Content-Type', 'image/x-tga');
             
        } else {
            response.setHeader('Content-Type', `image/${format}`);
        }
        return fileBuffer;


    } catch (err) {
        if (err.code === 'ENOENT') {
            console.log(`File not found: ${filePath}. Will trigger generator.`);
            return false; 
        }
        throw err; 
    }
}


console.log('Creating Clanker handler');
// GET OFF MEH LAWN DIRTY CLANKER!
app.get('/robots.txt', (req, res) => {
    res.type('text/plain');
    const robotsContent = [
        'User-agent: *',
        'Disallow: *',
        '',
    ].join('\n');
    res.send(robotsContent);
});

app.get('/miis/:format', async (request, response) => {
    const data = request.query.mii_data || "AwEAQHIZNQJD5RJi34qIQZTDKo9tTgAAqlpTAE4AXwBTAGEAbQAAAAAAAAAAAGE0EJA+BzBpQxgzNEQQhhIPaA4AOCkAUkhQUwBhAG0AAAAAAAAAAAAAAAAAAAAAAM+F";
    const expression = Number(request.query.expression) || 0;
    const render_type = request.query.type || 'face';
    const pid = request.query.pid || '1408486111'
    const username = request.query.username || 'SN_Sam'
    const width = Number(request.query.width) || 96;
    let format = request.params.format || 'image.png'
    if (format.includes("png")) {
        format = 'png'
    }
    if (format.includes("tga")) {
        format = 'tga'
    }
        if (format.includes("jpeg") || format.includes("jpg")) {
        format = 'jpeg'
    }
    if (!format.includes("png") && !format.includes("tga") && !format.includes("jpeg")) {
        return response.send('Format not valid')
    }
    // Uses Mii Data to get Mii
    if (data) {
        const check = await file_checker(data, expression, format, width, response)
        if (check) return response.send(check)
        if (!check) {
              const name = await NnidResolver._nameFromMiiDataBase64(data)
      const MyMii = await main(data, render_type, expression, format, width, name)
      if (!MyMii) {
    console.log('server error')
    return response.send('Server Error')
}  if (format === 'tga') {
     response.setHeader('Content-Type', `image/x-tga`)} else {
        response.setHeader('Content-Type', `image/${format}`)
     }
            return response.send(MyMii);}

        }

            // Uses account PID (Samtendo Network) to get Mii
               if (pid) {
                const miiDataz = await NnidResolver.miiFromPid(pid);
                if (!miiDataz) {
                    return response.send('Server Error')
                }
                    const check = await file_checker(miiDataz.miiData, expression, format, width, response)
                            if (check) return response.send(check)
                    if (!check) {
                        const name = await NnidResolver._nameFromMiiDataBase64(miiDataz.miiData)
                const MyMii = await main(miiDataz.miiData, render_type, expression, format, width, name)
                                if (!MyMii) {
                    return response.send('Server Error')
                }
                if (format === 'tga') {
                     response.setHeader('Content-Type', `image/x-tga`)} else {
                        response.setHeader('Content-Type', `image/${format}`)}
                            return response.send(MyMii);}
               } 

                // Uses SNID (Samtendo Network ID) to get Mii
                              if (username) {
                const pidz = await NnidResolver.pidFromUserId(username);
                if (!pidz) {
                    return response.send('Server Error')
                }
                const miiDataz = await NnidResolver.miiFromPid(pidz);
                if (!miiDataz) {
                    return response.send('Server Error')
                }
                const check = await file_checker(miiDataz.miiData, expression, format, width, response)
                    if (check) return response.send(check)
                    if (!check) {
                        const name = await NnidResolver._nameFromMiiDataBase64(miiDataz.miiData)
                const MyMii = await main(miiDataz.miiData, render_type, expression, format, width, name)
                                if (!MyMii) {
                    return response.send('Server Error')
                }
                if (format === 'tga') {
                     response.setHeader('Content-Type', `image/x-tga`)} else {
                        response.setHeader('Content-Type', `image/${format}`)}
                            return response.send(MyMii);}
               } 


});
app.get('/miis/:username/:expression/:format', async (request, response) => {
    const expression = Number(request.params.expression) || 0;
    const render_type = request.query.type || 'face';
    const username = request.params.username || 'SN_Sam'
    const width = 96;
    let format = request.params.format || 'image.png'
    if (format.includes("png")) {
        format = 'png'
    }
    if (format.includes("tga")) {
        format = 'tga'
    }
        if (format.includes("jpeg") || format.includes("jpg")) {
        format = 'jpeg'
    }
    if (!format.includes("png") && !format.includes("tga") && !format.includes("jpeg")) {
        return response.send('Format not valid')
    }

                // Uses SNID (Samtendo Network ID) to get Mii
                              if (username) {
                const pidz = await NnidResolver.pidFromUserId(username);
                if (!pidz) {
                    return response.send('Server Error')
                }
                const miiDataz = await NnidResolver.miiFromPid(pidz);
                if (!miiDataz) {
                    return response.send('Server Error')
                }
                const check = await file_checker(miiDataz.miiData, expression, format, width, response)
                    if (check) return response.send(check)
                    if (!check) {
                        const name = await NnidResolver._nameFromMiiDataBase64(miiDataz.miiData)
                const MyMii = await main(miiDataz.miiData, render_type, expression, format, width, name)
                                if (!MyMii) {
                    return response.send('Server Error')
                }
                if (format === 'tga') {
                     response.setHeader('Content-Type', `image/x-tga`)} else {
                        response.setHeader('Content-Type', `image/${format}`)}
                            return response.send(MyMii);}
               }  else {return response.send('no data sent')}


});
app.get('/mii/:pid/:format', async (request, response) => {
    let render_type = 'face';
    const pid = request.params.pid || 1408486111
    const width = 96;
    let formatz = request.params.format || 'image.png'
    let format = formatz
    let expression = 0;
    if (format.includes("png")) {
        format = 'png'
    }
    if (format.includes("tga")) {
        format = 'tga'
    }
        if (format.includes("jpeg") || format.includes("jpg")) {
        format = 'jpeg'
    }
    if (!format.includes("png") && !format.includes("tga") && !format.includes("jpeg")) {
        return response.send('Format not valid')
    }
        if (formatz.includes("frustrated")) {
        expression = 18
    }
    if (formatz.includes("wink")) {
        expression = 13
    }
    if (formatz.includes("normal")) {
        expression = 0
    }
    if (formatz.includes("smile_open_mouth")) {
        expression = 7
    }
    if (formatz.includes("sorrow")) {
        expression = 3
    }
    if (formatz.includes('puzzled')) {
        expression = 18
    }
    if (formatz.includes("surprised_open_mouth")) {
        expression = 10
    }
    if (formatz.includes("body")) {
        expression = 0
        render_type = 'whole_body'
    }
               if (pid) {
                const miiDataz = await NnidResolver.miiFromPid(pid);
                if (!miiDataz) {
                    return response.send('Server Error')
                }
                    const check = await file_checker(miiDataz.miiData, expression, format, width, response)
                            if (check) return response.send(check)
                    if (!check) {
                        const name = await NnidResolver._nameFromMiiDataBase64(miiDataz.miiData)
                const MyMii = await main(miiDataz.miiData, render_type, expression, format, width, name)
                                if (!MyMii) {
                    return response.send('Server Error')
                }
                if (format === 'tga') {
                     response.setHeader('Content-Type', `image/x-tga`)} else {
                        response.setHeader('Content-Type', `image/${format}`)}
                            return response.send(MyMii);}
               }   else {return response.send('no data sent')}


});
// 404 handler
console.log('Creating 404 status handler');
app.use(async (request, response) => {
    return response.status(404).json({
        app: 'api',
        status: 404,
        error: 'Route not found'
    });
});

// non-404 error handler
console.log('Creating non-404 status handler');
app.use((error, request, response, next) => { 
    console.log(error)
    response.status(500);
    return response.json({
        app: 'api',
        status: 500,
        error: 'Internal server error'
    });
});


try {
    app.listen(LISTEN_PORT, '0.0.0.0', () => {
        console.log(`Server started on port ${LISTEN_PORT}.`);
    });
} catch (err) {
    console.error('Initialization error:', err);
    process.exit(1);
}
