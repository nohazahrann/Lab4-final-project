import express = require('express')
const app = express()

import path = require('path');
app.use(express.static(path.join(__dirname, '/public')))
import bodyparser = require('body-parser');
let ejs = require('ejs');
import {MetricsHandler} from './metrics';
import { ok } from 'assert';
app.set('views', __dirname + "/views")
app.set('view engine', 'ejs');
app.use(bodyparser.json())
app.use(bodyparser.urlencoded( { extended: true}))

const port: string = process.env.PORT || '8080'

import session = require('express-session')
import levelSession = require('level-session-store')

const LevelStore = levelSession(session)

app.use(session({
  secret: 'my very secret phrase',
  store: new LevelStore('./db/sessions'),
  resave: true,
  saveUninitialized: true
}))
import { UserHandler, User } from './user'
const dbUser: UserHandler = new UserHandler('./db/users')
const authRouter = express.Router()

authRouter.get('/login', (req: any, res: any) => {
  res.render('login')
})

authRouter.get('/signup', (req: any, res: any) => {
  res.render('signup')
})

authRouter.get('/logout', (req: any, res: any) => {
  delete req.session.loggedIn
  delete req.session.user
  res.redirect('/login')
})
authRouter.post('/login', (req: any, res: any, next: any) => {
  console.log("Login post");
  console.log(req.body);

  dbUser.get(req.body.username, (err: Error | null, result?: User) => {
    console.log(result, "Console");
    if (err) next(err)
    if (result === undefined || !result.validatePassword(req.body.password)) {
      res.redirect('/login')
    } else {
      req.session.loggedIn = true
      req.session.user = result
      res.redirect('/')
    }
  })
})

app.use(authRouter)
const userRouter = express.Router()

userRouter.post('/', (req: any, res: any, next: any) => {
  dbUser.get(req.body.username, function (err: Error | null, result?: User) {
    if (!err || result !== undefined) {
     res.status(409).send("user already exists")
    } else {
      let user = new User(req.body.username, req.body.email, req.body.password, false);
      dbUser.save(user, function (err: Error | null) {
        if (err) next(err)
        else res.status(201).send("user persisted")
      })
    }
  })
})

userRouter.get('/:username', (req: any, res: any, next: any) => {
  dbUser.get(req.params.username, function (err: Error | null, result?: User) {
    if (err || result === undefined) {
      res.status(404).send("user not found")
    } else res.status(200).json(result)
  })
})
userRouter.delete("/:username", (req: any, res: any, next: any) => {
  if (req.params.username === req.session.user.username) {
    dbUser.delete(`${req.params.username}`, function( err: Error | null | string, result?: User ) {
      if (err) { res.status(404).send(err)
      } else res.status(200).json(result)
    })
  } else res.status(401).send("This user do not exist")
})

app.use('/user', userRouter)
const authCheck = function (req: any, res: any, next: any) {
  if (req.session.loggedIn) {
    next()
  } else res.redirect('/login')
}

app.get('/', authCheck, (req: any, res: any) => {
  res.render('index', { name: req.session.username })
})
app.get('/', (req: any, res: any) => {
  res.write('Hello world')
  res.end()
})
const dbMet: MetricsHandler = new MetricsHandler('./db/metrics')

app.post('/metrics/:id', (req: any, res: any) => {
  dbMet.save(req.params.id, req.body, (err: Error | null) => {
    if (err) throw err
    res.status(200).send('ok')
  })
})
app.get('/metrics/', (req: any, res: any) => {
  dbMet.getAllTemp((err: Error | null, result: any | null) => {
    if (err) throw err
    res.status(200).send( result)
  })
})

app.get('/metrics/:id', (req: any, res: any) => {
  dbMet.getTempId(req.params.id,(err: Error | null, result: any | null) => {
    if (err) throw err
    res.status(200).send( result)
  })
})

app.get(
    '/hello/:name', 
    (req, res) => res.render('yellow.ejs', {name: req.params.name})
)
app.get('/test', (req: any, res: any) => {
  res.render('test.ejs')
  res.end()
})


app.get('/metrics.json', (req: any, res: any) => {
    MetricsHandler.get((err, data)=>{
        if(err) throw err
        res.status(200).json(data)
    });
})


app.use(authRouter)
app.use("/user", userRouter)

app.listen(port, (err: Error) => {
  if (err) {
    throw err
  }
  console.log(`server is listening on port ${port}`)
})

app.get('/logout', (req: any, res: any) => {
  delete req.session.loggedIn
  delete req.session.user
  res.redirect("/login")
})
