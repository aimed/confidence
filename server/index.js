const app = require("express")()
const http = require("http").createServer(app)
const io = require("socket.io")(http)
const path = require("path")

const file = path.resolve(__dirname, "..", "client", "index.html")
const options = {}
const Bundler = require("parcel-bundler")
const bundler = new Bundler(file, options)
app.use(bundler.middleware())

class Poll {
  votes = {}
  hidden = true

  vote(username, confidence) {
    this.votes[username] = confidence
  }

  clear() {
    this.votes = {}
  }

  unset(username) {
    this.votes[username] = undefined
  }
}

const poll = new Poll()

io.on("connection", (socket) => {
  socket.on("ready", () => {
    socket.emit("votes", { votes: poll.votes })
    socket.emit("hidden", { hidden: poll.hidden })
  })

  socket.on("hide", ({ hidden }) => {
    poll.hidden = Boolean(hidden)
    io.emit("hidden", { hidden: poll.hidden })
  })

  socket.on("confidence", ({ confidence, username }) => {
    poll.vote(username, confidence)
    io.emit("votes", { votes: poll.votes })
  })

  socket.on("clear", () => {
    poll.clear()
    io.emit("votes", { votes: poll.votes })
  })

  socket.on("unset", ({ username }) => {
    poll.unset(username)
    io.emit("votes", { votes: poll.votes })
  })
})

http.listen(process.env.PORT || 3000, () => {
  console.log("listening on", process.env.PORT || 3000)
})
