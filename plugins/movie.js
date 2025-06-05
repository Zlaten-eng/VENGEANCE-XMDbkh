const axios = require('axios');
const { cmd } = require('../command');

cmd({
    pattern: "movie",
    desc: "Fetch detailed information about a movie.",
    category: "utility",
    react: "🎬",
    filename: __filename
},
async (conn, mek, m, { from, reply, sender, args }) => {
    try {
        // Properly extract the movie name from arguments
        const movieName = args.length > 0 ? args.join(' ') : m.text.replace(/^[\.#\$\!]?(movie)\s?/i, '').trim();

        if (!movieName) {
            return reply("📽️ Please provide the name of the movie.\nExample: .movie Iron Man");
        }

        const apiUrl = `https://apis.davidcyriltech.my.id/imdb?query=${encodeURIComponent(movieName)}`;
        const response = await axios.get(apiUrl);

        if (!response.data.status || !response.data.movie) {
            return reply("🚫 Movie not found. Please check the name and try again.");
        }

        const movie = response.data.movie;

        const tomatoRating = Array.isArray(movie.ratings)
            ? (movie.ratings.find(r => r.source === 'Rotten Tomatoes')?.value || 'N/A')
            : 'N/A';

        // Format the caption
        const dec = `
🎬 *${movie.title}* (${movie.year}) ${movie.rated || ''}

⭐ *IMDb:* ${movie.imdbRating || 'N/A'} | 🍅 *Rotten Tomatoes:* ${tomatoRating} | 💰 *Box Office:* ${movie.boxoffice || 'N/A'}

📅 *Released:* ${movie.released ? new Date(movie.released).toLocaleDateString() : 'N/A'}
⏳ *Runtime:* ${movie.runtime || 'N/A'}
🎭 *Genre:* ${movie.genres || 'N/A'}

📝 *Plot:* ${movie.plot || 'N/A'}

🎥 *Director:* ${movie.director || 'N/A'}
✍️ *Writer:* ${movie.writer || 'N/A'}
🌟 *Actors:* ${movie.actors || 'N/A'}

🌍 *Country:* ${movie.country || 'N/A'}
🗣️ *Language:* ${movie.languages || 'N/A'}
🏆 *Awards:* ${movie.awards || 'None'}

${movie.imdbUrl ? `[View on IMDb](${movie.imdbUrl})` : ''}
`;

        // Send message with the requested format
        await conn.sendMessage(
            from,
            {
                image: { 
                    url: movie.poster && movie.poster !== 'N/A' ? movie.poster : 'https://files.catbox.moe/k7cko8.jpg'
                },
                caption: dec,
                contextInfo: {
                    mentionedJid: [sender],
                    forwardingScore: 999,
                    isForwarded: true,
                    forwardedNewsletterMessageInfo: {
                        newsletterJid: '120363400583993139@newsletter',
                        newsletterName: 'VENGEANCE-XMD',
                        serverMessageId: 143
                    }
                }
            },
            { quoted: mek }
        );

    } catch (e) {
        console.error('Movie command error:', e);
        reply(`❌ Error: ${e.message}`);
    }
});
