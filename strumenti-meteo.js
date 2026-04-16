import axios from "axios";
import React from "react";
import { renderToStaticMarkup } from "react-dom/server";
import puppeteer from "puppeteer";
import path from "path";
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const GOOGLE_API_KEY = `${global.APIKeys.google}`;
const SEARCH_ENGINE_ID = `${global.APIKeys.googleCX}`;
const BROWSERLESS_API_KEY = `${global.APIKeys.browserless}`;
const cache = new Map();

let handler = async (m, { conn, args }) => {
    if (!args[0]) {
        return m.reply(`『 ⁉️ 』- \`Di che citta?\``);
    }

    const city = args.join(" ");
    const loading = await m.reply(`🔍 \`Cerco il meteo di "${city}"...\``);

    const cityKey = city.toLowerCase();
    if (cache.has(cityKey)) {
        const cachedEntry = cache.get(cityKey);
        if (Date.now() - cachedEntry.timestamp < 15 * 60 * 1000) {
            await conn.sendMessage(m.chat, {
                image: cachedEntry.imageBuffer,
                caption: cachedEntry.caption
            }, { quoted: m });
            return;
        }
    }

    try {
        const geoResponse = await axios.get(`https://geocoding-api.open-meteo.com/v1/search?name=${encodeURIComponent(city)}&count=1&language=it`);
        if (!geoResponse.data.results?.[0]) {
            throw new Error("Città non trovata");
        }

        const location = geoResponse.data.results[0];
        const { latitude, longitude } = location;

        const searchQuery = location.name.toLowerCase().includes("province")
            ? location.name.split(" province")[0]
            : location.name;

        const [weatherResponse, googleSearchResponse] = await Promise.all([
            axios.get(`https://api.open-meteo.com/v1/forecast?latitude=${latitude}&longitude=${longitude}&current=temperature_2m,relative_humidity_2m,apparent_temperature,precipitation,weather_code,surface_pressure,wind_speed_10m,wind_direction_10m,is_day&daily=weather_code,temperature_2m_max,temperature_2m_min,precipitation_probability_max&hourly=temperature_2m,weather_code,precipitation_probability&timezone=auto`),
            axios.get(`https://www.googleapis.com/customsearch/v1`, {
                params: {
                    key: GOOGLE_API_KEY,
                    cx: SEARCH_ENGINE_ID,
                    q: `${searchQuery} city wallpaper -shutterstock -istockphoto -gettyimages -depositphotos -freepik -adobe`, 
                    searchType: 'image',
                    imgSize: 'large',
                    safe: 'high'
                }
            }).catch(() => null)
        ]);

        const { current, daily, hourly } = weatherResponse.data;
        let backgroundImageBase64 = null;
        if (googleSearchResponse && googleSearchResponse.data.items && googleSearchResponse.data.items.length > 0) {
            try {
                const imageUrl = googleSearchResponse.data.items[0].link;
                
                const imageResponse = await axios.get(imageUrl, {
                    responseType: 'arraybuffer',
                    timeout: 10000,
                    headers: { 'User-Agent': 'varebot/2.5' }
                });
                
                const buffer = Buffer.from(imageResponse.data);
                const contentType = imageResponse.headers['content-type'] || 'image/jpeg';
                backgroundImageBase64 = `data:${contentType};base64,${buffer.toString('base64')}`;
            } catch (imageError) {
                backgroundImageBase64 = null;
            }
        }

        const weatherData = {
            location: location.name,
            current,
            daily,
            hourly,
            backgroundImageBase64,
            weatherColors: getImprovedWeatherColorScheme(current.weather_code, current.is_day)
        };

        const imageBuffer = await generateWeatherImage(weatherData);
        const caption = `ㅤㅤ⋆｡˚『 🌦️╭ \`METEO\` ╯ 』˚｡⋆\n╭\n│\n├⭓ ⋆⭒─ׄ─ׅ⊱ \`${location.name}\` ⊰\n│\n*│ ➤* 『🌡️』 *${Math.round(current.temperature_2m)}°C* - *${getWeatherText(current.weather_code)}*\n*│ ➤* 『🪁』 \`Vento:\` *${Math.round(current.wind_speed_10m)}* *km/h* *${getWindDirection(current.wind_direction_10m)}*\n*│ ➤* 『💧』 \`Umidità:\` *${current.relative_humidity_2m}%*\n*│ ➤* 『📊』 \`Pressione:\` *${Math.round(current.surface_pressure)}hPa*\n│\n*╰⭒─ׄ─ׅ─ׄ─⭒─ׄ─ׅ─ׄ─*`;

        cache.set(cityKey, { imageBuffer, caption, timestamp: Date.now() });

        await conn.sendMessage(m.chat, { image: imageBuffer, caption: caption }, { quoted: m });
        await conn.sendMessage(m.chat, { delete: loading.key });

    } catch (e) {
        await conn.sendMessage(m.chat, { delete: loading.key });
        const errorMessage = e.message.includes("Città non trovata")
            ? "『 ❌ 』- \`Città non trovata.\` *Prova con un nome più specifico.*"
            : `${global.errore}`;
        m.reply(errorMessage);
    }
}

async function generateWeatherImage(weatherData) {
    let browser;
    try {
        const htmlContent = renderToStaticMarkup(React.createElement(WeatherCard, { weatherData }));
        const fullHtml = createFullHtmlTemplate(htmlContent, weatherData);
        
        const isLocalBrowserAvailable = await checkLocalBrowser();

        if (isLocalBrowserAvailable) {
            browser = await puppeteer.launch({ 
                headless: true,
                args: ['--no-sandbox', '--disable-setuid-sandbox']
            });
        } else if (BROWSERLESS_API_KEY) {
            browser = await puppeteer.connect({
                browserWSEndpoint: `wss://chrome.browserless.io?token=${BROWSERLESS_API_KEY}`,
            });
        } else {
            throw new Error("Nessun browser locale trovato e BROWSERLESS_API_KEY non configurata.");
        }
        
        const page = await browser.newPage();
        await page.setViewport({ width: 800, height: 1200, deviceScaleFactor: 2 });
        await page.setContent(fullHtml, { waitUntil: 'networkidle0' });
        
        const imageBuffer = await page.screenshot({ 
            type: 'png',
            clip: { x: 0, y: 0, width: 800, height: 1200 }
        });
        
        return imageBuffer;
    } catch (error) {
        console.error('Errore durante la generazione dell\'immagine:', error);
        throw error;
    } finally {
        if (browser) {
            await browser.close();
        }
    }
}

async function checkLocalBrowser() {
    try {
        await puppeteer.launch({ headless: true, executablePath: process.env.PUPPETEER_EXECUTABLE_PATH });
        return true;
    } catch (e) {
        return false;
    }
}

function createFullHtmlTemplate(componentHtml, weatherData) {
    const { weatherColors } = weatherData;
    return `
    <!DOCTYPE html>
    <html>
    <head>
        <meta charset="UTF-8">
        <meta name="viewport" content="width=device-width, initial-scale=1.0">
        <style>
            * { margin: 0; padding: 0; box-sizing: border-box; }
            body { font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif; width: 800px; height: 1200px; overflow: hidden; }
            .weather-container { width: 100%; height: 100%; position: relative; background: linear-gradient(to bottom, ${weatherColors.background.primary}, ${weatherColors.background.secondary}); overflow: hidden; }
            .background-image { position: absolute; top: 0; left: 0; width: 100%; height: 100%; background-size: cover; background-position: center; filter: brightness(0.4) blur(2px); z-index: 1; }
            .overlay { position: absolute; top: 0; left: 0; width: 100%; height: 100%; background: linear-gradient(to bottom, ${weatherColors.overlay.primary}, ${weatherColors.overlay.secondary}); z-index: 2; }
            .content { position: relative; z-index: 3; padding: 50px; display: flex; flex-direction: column; color: ${weatherColors.text.primary}; height: 100%; }
            .location-title { font-size: 48px; font-weight: bold; margin-bottom: 20px; text-shadow: 2px 2px 4px rgba(0,0,0,0.7); }
            .current-weather { display: flex; align-items: center; margin-bottom: 30px; }
            .temperature { font-size: 120px; font-weight: bold; color: ${weatherColors.temperature.main}; text-shadow: 3px 3px 6px rgba(0,0,0,0.7); }
            .weather-info { margin-left: 20px; }
            .weather-icon { font-size: 50px; text-shadow: 2px 2px 4px rgba(0,0,0,0.5); }
            .weather-description { font-size: 24px; text-shadow: 1px 1px 2px rgba(0,0,0,0.5); }
            .min-max { font-size: 18px; color: ${weatherColors.text.secondary}; text-shadow: 1px 1px 2px rgba(0,0,0,0.5); }
            .details-grid { background: ${weatherColors.cards.background}; border: 1px solid ${weatherColors.cards.border}; border-radius: 15px; padding: 25px; margin-bottom: 30px; display: grid; grid-template-columns: 1fr 1fr; gap: 20px; backdrop-filter: blur(10px); }
            .detail-item { display: flex; align-items: center; gap: 10px; }
            .detail-icon { font-size: 24px; }
            .detail-label { font-size: 14px; color: ${weatherColors.text.secondary}; }
            .detail-value { font-size: 16px; font-weight: bold; color: ${weatherColors.text.primary}; }
            .forecast-section { background: ${weatherColors.cards.background}; border: 1px solid ${weatherColors.cards.border}; border-radius: 15px; padding: 25px; margin-bottom: 30px; backdrop-filter: blur(10px); }
            .forecast-title { font-size: 22px; font-weight: bold; margin-bottom: 15px; border-bottom: 1px solid ${weatherColors.cards.border}; padding-bottom: 10px; }
            .forecast-grid { display: flex; justify-content: space-between; }
            .forecast-item { text-align: center; flex: 1; }
            .forecast-time { font-size: 16px; font-weight: bold; margin-bottom: 10px; }
            .forecast-icon { font-size: 32px; margin-bottom: 10px; }
            .forecast-temp { font-size: 18px; font-weight: bold; }
            .forecast-prob { font-size: 16px; color: ${weatherColors.text.secondary}; }
        </style>
    </head>
    <body>${componentHtml}</body>
    </html>`;
}

const WeatherCard = ({ weatherData }) => {
    const { location, current, daily, hourly, backgroundImageBase64 } = weatherData;
    
    const now = new Date();
    const currentHour = now.getHours();
    const startIndex = hourly.time.findIndex(time => new Date(time).getHours() >= currentHour + 1);
    const nextFiveHours = hourly.time.slice(startIndex, startIndex + 5).map((time, index) => ({
        time: time,
        temperature: hourly.temperature_2m[startIndex + index],
        weatherCode: hourly.weather_code[startIndex + index],
        precipitationProbability: hourly.precipitation_probability[startIndex + index]
    }));

    return React.createElement('div', {
        className: 'weather-container'
    }, [
        backgroundImageBase64 && React.createElement('div', {
            key: 'background',
            className: 'background-image',
            style: { backgroundImage: `url(${backgroundImageBase64})` }
        }),
        
        React.createElement('div', { key: 'overlay', className: 'overlay' }),
        
        React.createElement('div', { key: 'content', className: 'content' }, [
            React.createElement('h1', { key: 'title', className: 'location-title' }, location),
            
            React.createElement('div', { key: 'current', className: 'current-weather' }, [
                React.createElement('span', { key: 'temp', className: 'temperature' }, `${Math.round(current.temperature_2m)}°`),
                React.createElement('div', { key: 'info', className: 'weather-info' }, [
                    React.createElement('span', { key: 'icon', className: 'weather-icon' }, getWeatherIcon(current.weather_code)),
                    React.createElement('p', { key: 'desc', className: 'weather-description' }, getWeatherText(current.weather_code)),
                    React.createElement('p', { key: 'minmax', className: 'min-max' }, `Max: ${Math.round(daily.temperature_2m_max[0])}° / Min: ${Math.round(daily.temperature_2m_min[0])}°`)
                ])
            ]),
            
            React.createElement('div', { key: 'details', className: 'details-grid' }, [
                createDetailItem('percepita', '🌡️', 'Percepita', `${Math.round(current.apparent_temperature)}°C`),
                createDetailItem('vento', '💨', 'Vento', `${Math.round(current.wind_speed_10m)} km/h (${getWindDirection(current.wind_direction_10m)})`),
                createDetailItem('umidita', '💧', 'Umidità', `${current.relative_humidity_2m}%`),
                createDetailItem('precipitazioni', '🌧️', 'Precipitazioni', `${current.precipitation}mm`),
                createDetailItem('pressione', '📊', 'Pressione', `${Math.round(current.surface_pressure)}hPa`),
                createDetailItem('prob-pioggia', '☔', 'Prob. Pioggia', `${daily.precipitation_probability_max[0]}%`)
            ]),
            
            nextFiveHours.length > 0 && React.createElement('div', { key: 'hourly', className: 'forecast-section' }, [
                React.createElement('h3', { key: 'hourly-title', className: 'forecast-title' }, 'Previsioni prossime ore'),
                React.createElement('div', { key: 'hourly-grid', className: 'forecast-grid' }, 
                    nextFiveHours.map(hourData => 
                        React.createElement('div', { key: hourData.time, className: 'forecast-item' }, [
                            React.createElement('p', { key: 'time', className: 'forecast-time' }, formatHour(hourData.time)),
                            React.createElement('p', { key: 'icon', className: 'forecast-icon' }, getWeatherIcon(hourData.weatherCode)),
                            React.createElement('p', { key: 'temp', className: 'forecast-temp' }, `${Math.round(hourData.temperature)}°`),
                            React.createElement('p', { key: 'prob', className: 'forecast-prob' }, `${hourData.precipitationProbability}%`)
                        ])
                    )
                )
            ]),
            
            React.createElement('div', { key: 'daily', className: 'forecast-section' }, [
                React.createElement('h3', { key: 'daily-title', className: 'forecast-title' }, 'Previsioni prossimi giorni'),
                React.createElement('div', { key: 'daily-grid', className: 'forecast-grid' }, 
                    Array.from({ length: 5 }, (_, i) => {
                        const dayIndex = i + 1;
                        const date = new Date(daily.time[dayIndex]);
                        const dayName = ['Dom', 'Lun', 'Mar', 'Mer', 'Gio', 'Ven', 'Sab'][date.getDay()];
                        const maxTemp = daily.temperature_2m_max[dayIndex] !== undefined ? Math.round(daily.temperature_2m_max[dayIndex]) : 'N/A';
                        const minTemp = daily.temperature_2m_min[dayIndex] !== undefined ? Math.round(daily.temperature_2m_min[dayIndex]) : 'N/A';
                        const weatherCode = daily.weather_code[dayIndex] !== undefined ? daily.weather_code[dayIndex] : 0;

                        return React.createElement('div', { key: daily.time[dayIndex], className: 'forecast-item' }, [
                            React.createElement('p', { key: 'day', className: 'forecast-time' }, dayName),
                            React.createElement('p', { key: 'icon', className: 'forecast-icon' }, getWeatherIcon(weatherCode)),
                            React.createElement('p', { key: 'max', className: 'forecast-temp' }, `${maxTemp}°`),
                            React.createElement('p', { key: 'min', className: 'forecast-prob' }, `${minTemp}°`)
                        ]);
                    })
                )
            ])
        ])
    ]);
};

function createDetailItem(key, icon, label, value) {
    return React.createElement('div', {
        key: key,
        className: 'detail-item'
    }, [
        React.createElement('span', { key: 'icon', className: 'detail-icon' }, icon),
        React.createElement('div', { key: 'info' }, [
            React.createElement('p', { key: 'label', className: 'detail-label' }, label),
            React.createElement('p', { key: 'value', className: 'detail-value' }, value)
        ])
    ]);
}

function getWeatherIcon(code) {
    if (code <= 2) return "☀️";
    if (code === 3) return "☁️";
    if (code >= 45 && code <= 48) return "🌫️";
    if (code >= 51 && code <= 67) return "🌧️";
    if (code >= 71 && code <= 77) return "🌨️";
    if (code >= 80 && code <= 82) return "🌦️";
    if (code >= 85 && code <= 86) return "🌨️";
    if (code >= 95) return "⛈️";
    return "⛅";
}

function formatHour(isoString) {
    const date = new Date(isoString);
    return date.getHours().toString().padStart(2, '0') + ':00';
}

function getImprovedWeatherColorScheme(weatherCode, isDay) {
    const isDayTime = isDay === 1;
    if (weatherCode <= 1) {
        return isDayTime ? {
            background: { primary: '#4A90E2', secondary: '#7BB3F0' },
            overlay: { primary: 'rgba(0, 0, 0, 0.2)', secondary: 'rgba(0, 0, 0, 0.4)' },
            temperature: { main: '#FFFFFF' },
            text: { primary: '#FFFFFF', secondary: '#E8F4FD' },
            cards: { background: 'rgba(255, 255, 255, 0.2)', border: 'rgba(255, 255, 255, 0.3)' }
        } : {
            background: { primary: '#1A237E', secondary: '#303F9F' },
            overlay: { primary: 'rgba(0, 0, 0, 0.3)', secondary: 'rgba(0, 0, 0, 0.5)' },
            temperature: { main: '#FFFFFF' },
            text: { primary: '#FFFFFF', secondary: '#BBDEFB' },
            cards: { background: 'rgba(255, 255, 255, 0.15)', border: 'rgba(255, 255, 255, 0.25)' }
        };
    }
    if (weatherCode <= 48) {
        return {
            background: { primary: '#546E7A', secondary: '#78909C' },
            overlay: { primary: 'rgba(0, 0, 0, 0.3)', secondary: 'rgba(0, 0, 0, 0.5)' },
            temperature: { main: '#FFFFFF' },
            text: { primary: '#FFFFFF', secondary: '#ECEFF1' },
            cards: { background: 'rgba(255, 255, 255, 0.18)', border: 'rgba(255, 255, 255, 0.3)' }
        };
    }
    if (weatherCode <= 67 || (weatherCode >= 80 && weatherCode <= 82)) {
        return {
            background: { primary: '#1976D2', secondary: '#42A5F5' },
            overlay: { primary: 'rgba(0, 0, 0, 0.3)', secondary: 'rgba(0, 0, 0, 0.5)' },
            temperature: { main: '#FFFFFF' },
            text: { primary: '#FFFFFF', secondary: '#E3F2FD' },
            cards: { background: 'rgba(255, 255, 255, 0.2)', border: 'rgba(255, 255, 255, 0.3)' }
        };
    }
    if (weatherCode <= 77 || (weatherCode >= 85 && weatherCode <= 86)) {
        return {
            background: { primary: '#90A4AE', secondary: '#B0BEC5' },
            overlay: { primary: 'rgba(0, 0, 0, 0.2)', secondary: 'rgba(0, 0, 0, 0.4)' },
            temperature: { main: '#FFFFFF' },
            text: { primary: '#FFFFFF', secondary: '#F5F5F5' },
            cards: { background: 'rgba(255, 255, 255, 0.25)', border: 'rgba(255, 255, 255, 0.35)' }
        };
    }
    if (weatherCode >= 95) {
        return {
            background: { primary: '#37474F', secondary: '#546E7A' },
            overlay: { primary: 'rgba(0, 0, 0, 0.5)', secondary: 'rgba(0, 0, 0, 0.7)' },
            temperature: { main: '#FFFFFF' },
            text: { primary: '#FFFFFF', secondary: '#ECEFF1' },
            cards: { background: 'rgba(255, 255, 255, 0.18)', border: 'rgba(255, 255, 255, 0.3)' }
        };
    }
    return getImprovedWeatherColorScheme(3, isDay);
}

function getWindDirection(degrees) {
    const directions = ['N', 'NNE', 'NE', 'ENE', 'E', 'ESE', 'SE', 'SSE', 'S', 'SSW', 'SW', 'WSW', 'W', 'WNW', 'NW', 'NNW'];
    return directions[Math.round(degrees / 22.5) % 16];
}

function getWeatherText(code) {
    const descriptions = {
        0: 'Sereno', 1: 'Prevalentemente sereno', 2: 'Parzialmente nuvoloso', 3: 'Nuvoloso',
        45: 'Nebbia', 48: 'Nebbia con brina', 51: 'Pioggerella debole', 53: 'Pioggerella moderata', 55: 'Pioggerella forte',
        61: 'Pioggia debole', 63: 'Pioggia moderata', 65: 'Pioggia forte', 71: 'Nevicata debole', 73: 'Nevicata moderata', 75: 'Nevicata forte',
        80: 'Rovescio debole', 81: 'Rovescio moderato', 82: 'Rovescio violento', 95: 'Temporale'
    };
    return descriptions[code] || "Misto";
}

handler.help = ['meteo'];
handler.tags = ['strumenti'];
handler.command = ['meteo', 'clima'];
handler.register = true;
export default handler;