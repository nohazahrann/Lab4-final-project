export class User {
    public username: string
    public email: string
    private password: string = ""
  
    constructor(username: string, email: string, password: string, passwordHashed: boolean = false) {
      this.username = username
      this.email = email
     
      if (!passwordHashed) {
        this.setPassword(password)
      } else this.password = password
    }
    static fromDb(username: string, value: any): User {
        const [password, email] = value.split(":")
        return new User(username, email, password)
      }
    
      public setPassword(toSet: string): void {
       var crypto = require('crypto');
       var secret  = 'abcdefg';
       var hash = crypto.createHash('md5').update(secret ).digest('hex');
       console.log(hash);

        this.password = toSet
        console.log(this.password, 'setPassword');
      }
    
      public getPassword(): string {
        return this.password
      }
    
      public validatePassword(toValidate: String): boolean {
        if (toValidate === this.password) return true
        else return false
        var crypto = require('crypto');
        var name = 'braitsch';
        var hash = crypto.createHash('md5').update(name).digest('hex');
       console.log(hash); // 9b74c9897bac770ffc029102a200c5de
      }
    }
    import { LevelDB } from "./leveldb"
    import WriteStream from 'level-ws'

export class UserHandler {
  public db: any

  public get(username: string, callback: (err: Error | null, result?: User) => void) {
    console.log(username, "user get");
    this.db.get(`user:${username}`, function (err: Error, data: any) {
      console.log(data);
      if (err) callback(err)
      else if (data === undefined) callback(null, data)
      else callback(null, User.fromDb(username, data))
    })
  }

  public save(user: User, callback: (err: Error | null) => void) {
    this.db.put(`user:${user.username}`, `${user.getPassword()}:${user.email}`, (err: Error | null) => {
      callback(err)
    })
  }


  public delete( username: string, callback: (error: Error | null | string, result?: any) => void ) {
    this.db.get(`user:${username}`,(first_err: Error | null, first_res: any) => {
        if (first_res) this.db.del(`user:${username}`, (err: Error | null) => {
            if (err) callback(err, null)
            else {this.db.get(`user:${username}`, (get_err: Error | null, get_res: any) => {
                  if (get_res) callback("can not delete", null)
                  else callback(null, "successfully deleted")
                }
              )
            }
          })
          else {callback("This user do not exist", null)}
      }
    )
  }

  constructor(path: string) {
    this.db = LevelDB.open(path)
  }
}    

