const axios = require('axios');
const cheerio = require("cheerio");

function stylesText(teks) {
    return new Promise((resolve, reject) => {
        axios.get('http://qaz.wtf/u/convert.cgi?text=' + encodeURIComponent(teks))
            .then(({ data }) => {
                let $ = cheerio.load(data);
                let hasil = [];
                $('table > tbody > tr').each(function (a, b) {
                    hasil.push({ name: $(b).find('td:nth-child(1) > span').text(), result: $(b).find('td:nth-child(2)').text().trim() });
                });
                resolve(hasil);
            })
            .catch(err => reject(err));
    });
}

module.exports = { stylesText };
