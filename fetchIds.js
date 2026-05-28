require('dotenv').config();
const fs = require('fs');
const apiKey = process.env.TMDB_API_KEY;

const series = [
      ['Breaking Bad','Drama',5],['The Wire','Drama',5],['The Sopranos','Drama',6],
      ['Game of Thrones','Acción',8],['Succession','Drama',4],['The Last of Us','Terror',1],
      ['Stranger Things','Sci-Fi',4],['Dark','Sci-Fi',3],['Black Mirror','Sci-Fi',6],
      ['Severance','Sci-Fi',1],['The Office','Comedia',9],['Seinfeld','Comedia',9],
      ['Friends','Comedia',10],['Brooklyn Nine-Nine','Comedia',8],['Parks and Recreation','Comedia',7],
      ['Better Call Saul','Drama',6],['Mad Men','Drama',7],['Peaky Blinders','Drama',6],
      ['The Crown','Drama',6],['Chernobyl','Drama',1],['Band of Brothers','Acción',1],
      ['The Mandalorian','Sci-Fi',3],['Andor','Sci-Fi',1],['Loki','Sci-Fi',2],
      ['WandaVision','Sci-Fi',1],['Invincible','Acción',2],['Arcane','Sci-Fi',1],
      ['Cyberpunk: Edgerunners','Sci-Fi',1],['Attack on Titan','Acción',4],['Death Note','Drama',1],
      ['The Haunting of Hill House','Terror',1],['Midnight Mass','Terror',1],
      ['American Horror Story','Terror',12],['The Walking Dead','Terror',11],
      ['Bates Motel','Terror',5],['Fargo','Drama',5],['True Detective','Drama',4],
      ['Mindhunter','Drama',2],['Ozark','Drama',4],['Narcos','Drama',3],
      ['Ted Lasso','Comedia',3],['Arrested Development','Comedia',5],
      ['Curb Your Enthusiasm','Comedia',12],["It's Always Sunny",'Comedia',16],
      ['Fleabag','Comedia',2],['Doctor Who','Sci-Fi',13],['The X-Files','Sci-Fi',11],
      ['Fringe','Sci-Fi',5],['The Expanse','Sci-Fi',6],['Westworld','Sci-Fi',4],
      ['The Bear','Drama',3],
];

async function run() {
  const map = [];
  for (const s of series) {
    const name = s[0];
    try {
      const res = await fetch(`https://api.themoviedb.org/3/search/tv?api_key=${apiKey}&query=${encodeURIComponent(name)}`);
      const data = await res.json();
      if (data.results && data.results.length > 0) {
        let best = data.results[0];
        // Special case to avoid bad matches
        if (name === "The Office") {
           best = data.results.find(r => r.origin_country && r.origin_country.includes('US')) || best;
        }
        if (name === "Doctor Who") {
           best = data.results.find(r => r.first_air_date && r.first_air_date.startsWith('2005')) || best;
        }
        map.push(`      ['${name}','${s[1]}',${s[2]}, ${best.id}],`);
      } else {
        map.push(`      ['${name}','${s[1]}',${s[2]}, null],`);
      }
    } catch (e) {
      console.error(e);
    }
  }
  fs.writeFileSync('c:/Users/jesus/Documents/SERIESBOX/mapped.txt', map.join('\n'));
}

run();
