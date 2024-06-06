const { exec, toSeconds, grabRange } = require("./utils.js")

const createFilename = (name) =>
  name ? name.replace(/\s/g, "-").toLowerCase() : "part"

const VIDEOQUALITY = "bestvideo[height<=1080]+bestaudio[height<=1080]/best"
// const VIDEOQUALITY = 'bv*[ext=mp4]+ba[ext=m4a]/b[ext=mp4] / bv*+ba/b'
// const VIDEOQUALITY = "bv+ba/b"

const getYoutubeDlUrl = async (url) => {
  const command = `yt-dlp -f "${VIDEOQUALITY}" -g "${url}"`
  const { stdout, stderr } = await exec(command)
  if (stderr) {
    throw new Error(stderr)
  }
  return stdout.trim()
}
// const youtubedlUrl = url => `"$(yt-dlp -S size -g '${url}')"`
// const youtubedlUrl = url => `"$(yt-dlp -g '${url}')"`

/**
 * Function that download partial video content from given Youtube URL
 *
 * @param {Object} content
 * @param {String} content.url - Youtube URL
 * @param {String} content.from - time as 00:00:00 or milliseconds
 * @param {String} content.to - time as 00:00:00 or milliseconds
 * @param {String} content.filename
 * @returns {Promise}
 * @example
 * await downloadPart({
 * url: 'https://www.youtube.com/watch?v=dQw4w9WgXcQ',
 * from: '00:00:00',
 * to: '00:00:10',
 * filename: 'video.mp4'
 * })
 */
const downloadPart = async ({ url, from, to, filename }) => {
  const ss = from
  const t = String(to).includes(":") ? toSeconds(from, to) : grabRange(to, from)
  const outputFilename = createFilename(filename)

  try {
    console.log("> Obtaining video URL from yt-dlp")
    const videoUrl = await getYoutubeDlUrl(url)

    console.log("> Downloading and converting")
    const command = `ffmpeg -ss ${ss} -i "${videoUrl}" -t ${t} -c:a aac -c:v libx264 -preset ultrafast -s 1920x1080 ${outputFilename}.mp4`
    console.log(`Executing: ${command}`)
    const { stdout, stderr } = await exec(command)
    if (stderr) {
      console.error(`Error in ffmpeg command: ${stderr}`)
    }
    console.log(`ffmpeg output: ${stdout}`)
    console.log(`> Video ${outputFilename} has been downloaded and converted!`)
  } catch (error) {
    console.error(`Error in downloadPart: ${error.message}`)
    throw new Error(error.message)
  }
}

module.exports = downloadPart
