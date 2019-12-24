import {LevelDB} from './leveldb'
import WriteStream from 'level-ws'

export class Metric {
    public timestamp: string
    public value: number
  
    constructor(ts: string, v: number) {
      this.timestamp = ts
      this.value = v
    }
  }
  
  export class MetricsHandler {
    private db: any 

  constructor(dbPath: string) {
    this.db = LevelDB.open(dbPath)
  }
    
    static get(callback: (error: Error | null, result?: Metric[]) => void) {
      
      const result = [
        new Metric('2013-11-04 14:00 UTC', 12),
        new Metric('2013-11-04 14:30 UTC', 15)
      ]
      callback(null, result)
    }
    public save(key: number, metrics: Metric[], callback: (error: Error | null) => void) {
      console.log(key)
      const stream = WriteStream(this.db)
      stream.on('error', callback)
      stream.on('close', callback)
      metrics.forEach((m: Metric) => {
        stream.write({ key: `metric:${key}${m.timestamp}`, value: m.value })
      })
      stream.end()
    }
 

    
  
    public delete(key: string, callback: (error: Error | null, result: any) => void) {
      this.db.del(key, (err: any, res: any) => {
        if (err) callback(err, null);
        else callback(null, res);
      });
    }
  

    public getAllTemp(callback: (error: Error | null, result: any | null) => void) {
      let metrics: Metric [] =[]
      
      this.db.createReadStream()
      .on('data', function (data) {
       

       let timestamp: string = data.key.split(':')[1]
       let metric: Metric = new Metric(timestamp, data.value);
        
        metrics.push(metric)
      })
      .on('error', function (err) {
        callback(err, null);
        console.log('Oh my!', err)
      })
      .on('close', function () {
        console.log('Stream closed')
      })
      .on('end', function () {
        callback(null, metrics);
        console.log('Stream ended')
      })
    
  }
  public getTempId(key:number,callback: (error: Error | null, result: any | null) => void) {
    let metrics: Metric [] =[]
    
    this.db.createReadStream()
    .on('data', function (data) {
     
      if(key == data.value){ 

        let timestamp: string = data.key.split(':')[1]
        let metric: Metric = new Metric(timestamp, data.value);
      
        metrics.push(metric)
      }
     
    })
    .on('error', function (err) {
      callback(err, null);
      console.log('Oh my!', err)
    })
    .on('close', function () {
      console.log('Stream closed')
    })
    .on('end', function () {
      callback(null, metrics);
      console.log('Stream ended')
    })
  
}
  
  
  
  
  }

  