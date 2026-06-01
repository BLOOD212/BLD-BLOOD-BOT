import fetch from 'node-fetch';

const handler = async (m, { conn, text, usedPrefix, command }) => {

  const apiKey = `${global.APIKeys.tmdb}`;
  const geminiKey = `${global.APIKeys.gemini}`;
  
  if (!apiKey) {
    return conn.reply(m.chat, `ㅤㅤ⋆｡˚『 ╭ \`ERRORE\` ╯ 』˚｡⋆\n╭\n│ 『 ❌ 』 \`API Key:\` *non configurata*\n│ ➤ *Controlla la configurazione*\n*╰⭒─ׄ─ׅ─ׄ─⭒─ׄ─ׅ─ׄ─*`, m);
  }

  const categorie = {
    popolari: null,
    azione: 28,
    avventura: 12,
    animazione: 16,
    commedia: 35,
    crime: 80,
    documentario: 99,
    dramma: 18,
    famiglia: 10751,
    fantasy: 14,
    storia: 36,
    horror: 27,
    musica: 10402,
    mistero: 9648,
    romantico: 10749,
    fantascienza: 878,
    thriller: 53,
    guerra: 10752,
    western: 37
  };

  if (!text) {
    const helpMessage = `ㅤㅤ⋆｡˚『 ╭ \`RICERCA CONTENUTI\` ╯ 』˚｡⋆
╭
│ 『 🎬 』 \`Film:\` *${usedPrefix}film <titolo>*
│ ➤ *Es: ${usedPrefix}film The Matrix*
│
│ 『 📺 』 \`Serie TV:\` *${usedPrefix}serie <titolo>*
│ ➤ *Es: ${usedPrefix}serie Breaking Bad*
│
│ 『 🎭 』 \`Anime:\` *${usedPrefix}anime <titolo>*
│ ➤ *Es: ${usedPrefix}anime Death Note*
│
│ 『 📚 』 \`Categoria:\` *${usedPrefix}categoria <genere>*
│ ➤ *Es: ${usedPrefix}categoria azione*
│
│ 『 🎯 』 \`Generi disponibili:\`
> ${Object.keys(categorie).join(', ')}
*╰⭒─ׄ─ׅ─ׄ─⭒─ׄ─ׅ─ׄ─*`;

    return conn.reply(m.chat, helpMessage, m);
  }

  await m.react('🔍');

  try {
    let query = text.trim();
    
    switch(command.toLowerCase()) {
      case 'film':
        await handleTMDBSearch(conn, m, query, 'movie', apiKey, geminiKey, usedPrefix);
        break;
      case 'serie':
        await handleTMDBSearch(conn, m, query, 'tv', apiKey, geminiKey, usedPrefix);
        break;
      case 'anime':
        await handleAnimeSearch(conn, m, query, geminiKey, usedPrefix);
        break;
      case 'categoria':
        await handleCategory(conn, m, query, apiKey, categorie, geminiKey, usedPrefix);
        break;
      case 'trama':
        await handleFullPlot(conn, m, text);
        break;
    }

    await m.react('✅');

  } catch (e) {
    console.error('Errore handler:', e);
    await m.react('❌');
    conn.reply(m.chat, `ㅤㅤ⋆｡˚『 ╭ \`ERRORE\` ╯ 』˚｡⋆\n╭\n│ 『 ❌ 』 \`Errore:\` *${e.message}*\n│ ➤ *Riprova più tardi*\n*╰⭒─ׄ─ׅ─ׄ─⭒─ׄ─ׅ─ׄ─*`, m);
  }
};

async function handleFullPlot(conn, m, data) {
  try {
    const plotData = Buffer.from(data, 'base64').toString('utf-8');
    
    const message = `ㅤㅤ⋆｡˚『 ╭ \`TRAMA COMPLETA\` ╯ 』˚｡⋆
╭
│ 『 📖 』 \`Descrizione:\`
│ ➤ _${plotData}_
*╰⭒─ׄ─ׅ─ׄ─⭒─ׄ─ׅ─ׄ─*`;

    return conn.reply(m.chat, message, m);
  } catch (error) {
    console.error('Errore trama completa:', error);
    return conn.reply(m.chat, 'Errore nel caricamento della trama completa.', m);
  }
}

async function translateToItalian(text, geminiKey) {
  if (!geminiKey || !text) return text;
  
  try {
    console.log('Tentativo di traduzione con Gemini...');
    
    const response = await fetch(`https://generativelanguage.googleapis.com/v1beta/models/gemini-1.5-flash:generateContent?key=${geminiKey}`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        contents: [{
          parts: [{
            text: `Traduci questo testo dall'inglese all'italiano in modo naturale e fluido. Mantieni il tono originale. Se il testo è già in italiano, restituiscilo invariato. Non aggiungere commenti o spiegazioni, solo la traduzione:

"${text}"`
          }]
        }],
        generationConfig: {
          temperature: 0.3,
          topK: 1,
          topP: 0.8,
          maxOutputTokens: 1000,
        }
      })
    });

    if (!response.ok) {
      const errorData = await response.json();
      console.error('Errore API Gemini:', errorData);
      return text;
    }

    const data = await response.json();
    
    if (data.candidates && data.candidates[0] && data.candidates[0].content && data.candidates[0].content.parts && data.candidates[0].content.parts[0]) {
      const translatedText = data.candidates[0].content.parts[0].text.trim();
      console.log('Traduzione riuscita');
      return translatedText;
    } else {
      console.error('Struttura risposta Gemini non valida:', data);
      return text;
    }
  } catch (error) {
    console.error('Errore traduzione Gemini:', error);
    return text;
  }
}

function calculatePopularityPercentage(popularity, voteAverage = 0, voteCount = 0) {
  if (!popularity || popularity === 0) return 'N/A';
  
  // Sistema di calcolo più accurato
  let popularityScore = 0;
  
  // Base score dalla popolarità TMDB (logaritmico per gestire valori alti)
  // Film molto popolari possono avere valori 100-2000+
  if (popularity > 0) {
    popularityScore = Math.min(Math.log10(popularity + 1) * 25, 80);
  }
  
  // Bonus per rating alto (fino a +15 punti)
  if (voteAverage >= 7) {
    popularityScore += (voteAverage - 7) * 5;
  } else if (voteAverage >= 6) {
    popularityScore += (voteAverage - 6) * 2;
  }
  
  // Bonus per numero di voti (indica quanto è noto)
  if (voteCount > 0) {
    const voteBonus = Math.min(Math.log10(voteCount + 1) * 3, 15);
    popularityScore += voteBonus;
  }
  
  // Assicuriamoci che rimanga entro 0-100
  popularityScore = Math.max(0, Math.min(Math.round(popularityScore), 100));
  
  // Emoji basate sul punteggio finale
  if (popularityScore >= 85) return `🔥 ${popularityScore}%`;
  if (popularityScore >= 70) return `⭐ ${popularityScore}%`;
  if (popularityScore >= 55) return `📈 ${popularityScore}%`;
  if (popularityScore >= 40) return `👍 ${popularityScore}%`;
  return `📊 ${popularityScore}%`;
}

// Versione alternativa più semplice ma efficace
function calculatePopularityPercentageSimple(popularity, voteAverage = 0, voteCount = 0) {
  if (!popularity || popularity === 0) return 'N/A';
  
  // Normalizzazione più generosa
  let score = Math.min((popularity / 20) + 20, 75); // Base più alta
  
  // Bonus significativo per voto alto
  if (voteAverage >= 8) score += 20;
  else if (voteAverage >= 7) score += 15;
  else if (voteAverage >= 6) score += 10;
  
  // Bonus per popolarità (numero di voti)
  if (voteCount >= 10000) score += 10;
  else if (voteCount >= 5000) score += 8;
  else if (voteCount >= 1000) score += 5;
  
  score = Math.min(Math.round(score), 100);
  
  if (score >= 85) return `🔥 ${score}%`;
  if (score >= 70) return `⭐ ${score}%`;
  if (score >= 55) return `📈 ${score}%`;
  return `📊 ${score}%`;
}

function formatRating(vote) {
  if (!vote || vote === 0) return 'N/A';
  const rating = parseFloat(vote).toFixed(1);
  const numRating = parseFloat(rating);
  
  if (numRating >= 8.5) return `🏆 ${rating}/10`;
  if (numRating >= 7.5) return `⭐ ${rating}/10`;
  if (numRating >= 6.0) return `👍 ${rating}/10`;
  return `📊 ${rating}/10`;
}

async function handleCategory(conn, m, categoria, apiKey, categorie, geminiKey, usedPrefix) {
  if (!categorie.hasOwnProperty(categoria.toLowerCase())) {
    return conn.reply(m.chat, `ㅤㅤ⋆｡˚『 ╭ \`ERRORE\` ╯ 』˚｡⋆\n╭\n│ 『 ❌ 』 \`Categoria:\` *non trovata*\n│ ➤ *Usa il comando senza parametri per vedere le categorie*\n*╰⭒─ׄ─ׅ─ׄ─⭒─ׄ─ׅ─ׄ─*`, m);
  }

  const genreId = categorie[categoria.toLowerCase()];
  const url = genreId
    ? `https://api.themoviedb.org/3/discover/movie?api_key=${apiKey}&with_genres=${genreId}&language=it-IT&sort_by=popularity.desc`
    : `https://api.themoviedb.org/3/movie/popular?api_key=${apiKey}&language=it-IT`;

  try {
    const response = await fetch(url);
    const data = await response.json();

    if (!response.ok) {
      throw new Error(`API Error: ${data.status_message || 'Unknown error'}`);
    }

    if (!data.results || data.results.length === 0) {
      return conn.reply(m.chat, `ㅤㅤ⋆｡˚『 ╭ \`NESSUN RISULTATO\` ╯ 』˚｡⋆\n╭\n│ 『 😔 』 \`Categoria:\` *${categoria}*\n│ ➤ *Nessun film trovato*\n*╰⭒─ׄ─ׅ─ׄ─⭒─ׄ─ׅ─ׄ─*`, m);
    }

    const randomIndex = Math.floor(Math.random() * Math.min(data.results.length, 10));
    const movie = data.results[randomIndex];

    const movieDetailsUrl = `https://api.themoviedb.org/3/movie/${movie.id}?api_key=${apiKey}&language=it-IT&append_to_response=videos,watch/providers`;
    const movieDetailsResponse = await fetch(movieDetailsUrl);
    const movieDetails = await movieDetailsResponse.json();

    let translatedOverview = movie.overview;
    if (!movie.overview || movie.overview.trim() === '') {
      const enUrl = `https://api.themoviedb.org/3/movie/${movie.id}?api_key=${apiKey}&language=en-US`;
      const enResponse = await fetch(enUrl);
      const enData = await enResponse.json();
      if (enData.overview && enData.overview.trim() !== '') {
        translatedOverview = await translateToItalian(enData.overview, geminiKey);
      }
    }

    const trailer = movieDetails.videos?.results.find(video => video.type === 'Trailer' && video.iso_639_1 === 'it') || movieDetails.videos?.results[0];
    const trailerUrl = trailer ? `https://www.youtube.com/watch?v=${trailer.key}` : null;

    const streamingProviders = movieDetails['watch/providers']?.results?.IT?.flatrate || [];
    const streamingText = streamingProviders.length > 0
      ? streamingProviders.map(provider => `│ ➤ *${provider.provider_name}*`).join('\n')
      : '│ ➤ Disponibile al cinema';

    const shortOverview = translatedOverview && translatedOverview.length > 200 
      ? translatedOverview.substring(0, 200) + '...' 
      : translatedOverview || 'Descrizione non disponibile.';

    const message = `ㅤ⋆｡˚『 ╭ \`FILM CONSIGLIATO\` ╯ 』˚｡⋆
╭
│ 『 🎬 』 \`Titolo:\` *${movie.title}*
│ 『 📅 』 \`Anno:\` *${movie.release_date?.split('-')[0] || 'N/A'}*
│ 『 ⭐ 』 \`Voto:\` *${formatRating(movie.vote_average)}*
│ 『 📊 』 \`Popolarità:\` *${calculatePopularityPercentage(movie.popularity, movie.vote_average, movie.vote_count)}*
│ 『 🎭 』 \`Genere:\` *${categoria}*
│
│ 『 📖 』 \`Trama:\`
│ ➤ *${shortOverview}*
│
│ 『 📡 』 \`Dove guardarlo:\`
${streamingText}
*╰⭒─ׄ─ׅ─ׄ─⭒─ׄ─ׅ─ׄ─*`;

    const posterUrl = movie.poster_path 
      ? `https://image.tmdb.org/t/p/w500${movie.poster_path}`
      : 'https://via.placeholder.com/500x750/333/fff?text=No+Image';

    const buttons = [];
    
    if (translatedOverview && translatedOverview.length > 200) {
      const encodedPlot = Buffer.from(translatedOverview).toString('base64');
      buttons.push({
        name: 'quick_reply',
        buttonParamsJson: JSON.stringify({
          display_text: '『 📖 』 Trama Completa',
          id: `${usedPrefix}trama ${encodedPlot}`
        })
      });
    }

    if (trailerUrl) {
      buttons.push({
        name: 'cta_url',
        buttonParamsJson: JSON.stringify({
          display_text: '『 🎥 』 Guarda Trailer',
          url: trailerUrl
        })
      });
    }

    await conn.sendMessage(m.chat, {
      image: { url: posterUrl },
      caption: message.trim(),
      footer: `𝐁𝐋𝐎𝐎𝐃-𝐁𝐎𝐓`,
      interactiveButtons: buttons
    }, { quoted: m });

  } catch (error) {
    console.error('Errore categoria:', error);
    throw error;
  }
}

async function handleAnimeSearch(conn, m, query, geminiKey, usedPrefix) {
  try {
    const response = await fetch(`https://api.jikan.moe/v4/anime?q=${encodeURIComponent(query)}&limit=1&sfw=true`);
    const data = await response.json();

    if (!response.ok) {
      throw new Error(`Anime API Error: ${data.error || 'Unknown error'}`);
    }

    if (!data.data || data.data.length === 0) {
      return conn.reply(m.chat, `ㅤㅤ⋆｡˚『 ╭ \`NESSUN RISULTATO\` ╯ 』˚｡⋆\n╭\n│ 『 😔 』 \`Ricerca:\` *${query}*\n│ ➤ *Nessun anime trovato*\n*╰⭒─ׄ─ׅ─ׄ─⭒─ׄ─ׅ─ׄ─*`, m);
    }

    const anime = data.data[0];
    
    let translatedSynopsis = 'Descrizione non disponibile.';
    if (anime.synopsis && anime.synopsis.trim() !== '') {
      translatedSynopsis = await translateToItalian(anime.synopsis, geminiKey);
    }
    
    const shortSynopsis = translatedSynopsis.length > 200 
      ? translatedSynopsis.substring(0, 200) + '...' 
      : translatedSynopsis;

    const animeMessage = `ㅤㅤ⋆｡˚『 ╭ \`ANIME\` ╯ 』˚｡⋆
╭
│ 『 🎭 』 \`Titolo:\` *${anime.title}*
│ 『 🈯 』 \`Titolo JP:\` *${anime.title_japanese || 'N/A'}*
│ 『 📅 』 \`Anno:\` *${anime.year || 'N/A'}*
│ 『 ⭐ 』 \`Voto:\` *${formatRating(anime.score)}*
│ 『 📺 』 \`Episodi:\` *${anime.episodes || 'In corso'}*
│ 『 📊 』 \`Stato:\` *${anime.status || 'N/A'}*
│
│ 『 🎭 』 \`Generi:\`
│ ➤ *${anime.genres?.map(g => g.name).join(', ') || 'N/A'}*
│
│ 『 📖 』 \`Trama:\`
│ ➤ *${shortSynopsis}*
*╰⭒─ׄ─ׅ─ׄ─⭒─ׄ─ׅ─ׄ─*`;

    const imageUrl = anime.images?.jpg?.large_image_url || 
                     anime.images?.jpg?.image_url || 
                     'https://via.placeholder.com/400x600/333/fff?text=No+Image';

    const buttons = [];
    
    if (translatedSynopsis.length > 200) {
      const encodedPlot = Buffer.from(translatedSynopsis).toString('base64');
      buttons.push({
        name: 'quick_reply',
        buttonParamsJson: JSON.stringify({
          display_text: '『 📖 』 Trama Completa',
          id: `${usedPrefix}trama ${encodedPlot}`
        })
      });
    }

    if (anime.url) {
      buttons.push({
        name: 'cta_url',
        buttonParamsJson: JSON.stringify({
          display_text: '『 🔗 』 Vedi su MAL',
          url: anime.url
        })
      });
    }

    await conn.sendMessage(m.chat, {
      image: { url: imageUrl },
      caption: animeMessage.trim(),
      footer: `𝐁𝐋𝐎𝐎𝐃-𝐁𝐎𝐓`,
      interactiveButtons: buttons
    }, { quoted: m });

  } catch (error) {
    console.error('Errore ricerca anime:', error);
    throw error;
  }
}

async function handleTMDBSearch(conn, m, query, type, apiKey, geminiKey, usedPrefix) {
  try {
    const searchUrl = `https://api.themoviedb.org/3/search/${type}?api_key=${apiKey}&query=${encodeURIComponent(query)}&language=it-IT&include_adult=false`;

    const response = await fetch(searchUrl);
    const data = await response.json();

    if (!response.ok) {
      throw new Error(`TMDB API Error: ${data.status_message || 'Unknown error'}`);
    }

    if (!data.results || data.results.length === 0) {
      const searchUrlEN = `https://api.themoviedb.org/3/search/${type}?api_key=${apiKey}&query=${encodeURIComponent(query)}&language=en-US&include_adult=false`;
      const responseEN = await fetch(searchUrlEN);
      const dataEN = await responseEN.json();
      
      if (!responseEN.ok || !dataEN.results || dataEN.results.length === 0) {
        return conn.reply(m.chat, `ㅤㅤ⋆｡˚『 ╭ \`NESSUN RISULTATO\` ╯ 』˚｡⋆\n╭\n│ 『 😔 』 \`Ricerca:\` *${query}*\n│ ➤ *Nessun ${type === 'movie' ? 'film' : 'serie'} trovato*\n*╰⭒─ׄ─ׅ─ׄ─⭒─ׄ─ׅ─ׄ─*`, m);
      }
      
      data.results = dataEN.results;
    }

    const result = data.results[0];
    const detailsUrl = `https://api.themoviedb.org/3/${type}/${result.id}?api_key=${apiKey}&language=it-IT&append_to_response=videos,watch/providers,translations`;

    const detailsResponse = await fetch(detailsUrl);
    const details = await detailsResponse.json();
    
    if (!detailsResponse.ok) {
      throw new Error(`Details API Error: ${details.status_message || 'Unknown error'}`);
    }
    
    let translatedOverview = result.overview;
    
    if (!translatedOverview || translatedOverview.trim() === '') {
      if (details.translations) {
        const itTranslation = details.translations.translations.find(t => t.iso_639_1 === 'it');
        if (itTranslation && itTranslation.data.overview) {
          translatedOverview = itTranslation.data.overview;
        }
      }
      
      if (!translatedOverview || translatedOverview.trim() === '') {
        const enUrl = `https://api.themoviedb.org/3/${type}/${result.id}?api_key=${apiKey}&language=en-US`;
        const enResponse = await fetch(enUrl);
        const enData = await enResponse.json();
        if (enData.overview && enData.overview.trim() !== '') {
          translatedOverview = await translateToItalian(enData.overview, geminiKey);
        }
      }
    }

    const shortOverview = translatedOverview && translatedOverview.length > 200 
      ? translatedOverview.substring(0, 200) + '...' 
      : translatedOverview || 'Descrizione non disponibile.';

    const trailer = details.videos?.results.find(video => video.type === 'Trailer' && video.iso_639_1 === 'it') || details.videos?.results[0];
    const trailerUrl = trailer ? `https://www.youtube.com/watch?v=${trailer.key}` : null;

    const streamingProviders = details['watch/providers']?.results?.IT?.flatrate || [];
    const streamingText = streamingProviders.length > 0
      ? streamingProviders.map(provider => `│ ➤ *${provider.provider_name}*`).join('\n')
      : type === 'movie' ? '│ ➤ Disponibile al cinema' : '│ ➤ Non disponibile in streaming';

    const typeEmoji = type === 'movie' ? '🎬' : '📺';
    const typeText = type === 'movie' ? 'FILM' : 'SERIE TV';

    const message = `ㅤㅤ⋆｡˚『 ╭ \`${typeText}\` ╯ 』˚｡⋆
╭
│ 『 ${typeEmoji} 』 \`Titolo:\` *${result.title || result.name}*
│ 『 📅 』 \`Anno:\` *${(result.first_air_date || result.release_date)?.split('-')[0] || 'N/A'}*
│ 『 ⭐ 』 \`Voto:\` *${formatRating(result.vote_average)}*
│ 『 📊 』 \`Popolarità:\` *${calculatePopularityPercentage(result.popularity, result.vote_average, result.vote_count)}*
│ 『 🎭 』 \`Generi:\` *${details.genres?.map(g => g.name).join(', ') || 'N/A'}*
│
│ 『 📖 』 \`Trama:\`
│ ➤ _${shortOverview}_
│
│ 『 📡 』 \`Dove guardarlo:\`
${streamingText}
*╰⭒─ׄ─ׅ─ׄ─⭒─ׄ─ׅ─ׄ─*`;

    const posterUrl = result.poster_path 
      ? `https://image.tmdb.org/t/p/w500${result.poster_path}`
      : 'https://via.placeholder.com/500x750/333/fff?text=No+Image';

    const buttons = [];
    
    if (translatedOverview && translatedOverview.length > 200) {
      const encodedPlot = Buffer.from(translatedOverview).toString('base64');
      buttons.push({
        name: 'quick_reply',
        buttonParamsJson: JSON.stringify({
          display_text: '『 📖 』 Trama Completa',
          id: `${usedPrefix}trama ${encodedPlot}`
        })
      });
    }

    if (trailerUrl) {
      buttons.push({
        name: 'cta_url',
        buttonParamsJson: JSON.stringify({
          display_text: '『 🎥 』 Guarda Trailer',
          url: trailerUrl
        })
      });
    }

    await conn.sendMessage(m.chat, {
      image: { url: posterUrl },
      caption: message.trim(),
      footer: `𝐁𝐋𝐎𝐎𝐃-𝐁𝐎𝐓`,
      interactiveButtons: buttons
    }, { quoted: m });

  } catch (error) {
    console.error('Errore TMDB search:', error);
    throw error;
  }
}

handler.help = ['film', 'serie', 'anime', 'categoria', 'trama'];
handler.tags = ['ricerca'];
handler.command = /^(film|serie|anime|categoria|trama)$/i;

export default handler;