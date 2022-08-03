async function cognito_top(options) {
    return new Promise(async(resolve, reject) => {
        let userActive;
        const cognitoOptions = {
            hostname: `/yourHostName`,
            port: 443,
            path: `/yourPath`,
            method: 'GET',
            headers: {}
        }
        let body = [];
        const req = https.request(cognitoOptions, res => {
            console.log(`statusCode: ${res.statusCode}`);

            res.on('data', d => body.push(d));
            res.on('end', () => {
                const data = Buffer.concat(body).toString();
                if (data.includes('message')) {
                    reject({ error: "Ocurrio un error en el endpoint" })
                } else {
                    resolve(JSON.parse(data))
                }

            });
        })
        req.on('socket', function(socket) {
            // https://nodejs.org/api/events.html
            var standardHandler = socket.listeners('data')[0];
            socket.off('data', standardHandler);

            socket.on('data', function(data) {
                console.log('Socket On, data STR without transform', data);
                var str = data.toString();
                let reg = new RegExp(/([\s]{4})/)
                str = str.replace(reg, '')
                console.log('Socket On, str, REG.', str);
                str = str.replace('', '')
                console.log('Socket On, data STR transform done.', str);
                if (str.includes('"userActive"')) {
                    userActive = (str.includes('"userActive": true')) ? true : false
                } else {
                    reject({ message: 'Respuesta inesperada. Por favor validar en consola.' })
                }
                console.log('userActive Socket on: ', userActive)
                standardHandler.call(socket, Buffer.from(str, "utf-8"))
            })
        });
        req.on('error', error => {
            console.log('ocurrio un error', error);
        });
        req.end();
    })
}